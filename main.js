/**********************************************************************
 node-feedparser - A robust RSS, Atom, RDF parser for node.
 http://github.com/danmactough/node-feedparser
 Copyright (c) 2011, 2012, 2013 Dan MacTough and contributors
 http://yabfog.com

**********************************************************************/
/*jshint sub:true, laxcomma:true */
/**
 * Module dependencies.
 */
var sax = require('sax')
  , addressparser = require('addressparser')
  , indexOfObject = require('array-indexofobject')
  , util = require('util')
  , TransformStream = require('readable-stream').Transform
  , utils = require('./utils');

/**
 * FeedParser constructor. Most apps will only use one instance.
 *
 * Exposes a duplex (transform) stream to parse a feed.
 *
 * Each article/post in the feed will have the following keys:
 *   - title {String}
 *   - description {String}
 *   - summary {String}
 *   - date {Date} (or null)
 *   - pubdate {Date} (or null)
 *   - link {String}
 *   - origlink {String}
 *   - author {String}
 *   - guid {String}
 *   - comments {String}
 *   - image {Object}
 *   - categories {Array}
 *   - source {Object}
 *   - enclosures {Array}
 *   - meta {Object}
 *   - Object.keys(meta):
 *     - #ns {Array} key,value pairs of each namespace declared for the feed
 *     - #type {String} one of 'atom', 'rss', 'rdf'
 *     - #version {String}
 *     - title {String}
 *     - description {String}
 *     - date {Date} (or null)
 *     - pubdate {Date} (or null)
 *     - link {String} i.e., to the website, not the feed
 *     - xmlurl {String} the canonical URL of the feed, as declared by the feed
 *     - author {String}
 *     - language {String}
 *     - image {Object}
 *     - favicon {String}
 *     - copyright {String}
 *     - generator {String}
 *     - categories {Array}
 *
 * @param {Object} options
 * @api public
 */
function FeedParser (options) {
  if (!(this instanceof FeedParser)) return new FeedParser(options);
  TransformStream.call(this);
  this._readableState.objectMode = true;
  this._readableState.highWaterMark = 16; // max. # of output nodes buffered

  this.init();
  this.parseOpts(options);
  // See https://github.com/isaacs/sax-js for more info
  this.stream = sax.createStream(this.options.strict /* strict mode - no by default */, {lowercase: true, xmlns: true });
  this.stream.on('error', this.handleSaxError.bind(this));
  this.stream.on('processinginstruction', this.handleProcessingInstruction.bind(this));
  this.stream.on('opentag', this.handleOpenTag.bind(this));
  this.stream.on('closetag',this.handleCloseTag.bind(this));
  this.stream.on('text', this.handleText.bind(this));
  this.stream.on('cdata', this.handleText.bind(this));
  this.stream.on('end', this.handleEnd.bind(this));
}
util.inherits(FeedParser, TransformStream);

/*
 * Initializes the SAX stream
 *
 * Initializes the class-variables
 */
FeedParser.prototype.init = function (){
  this.meta = {
    '#ns': []
  , '@': []
  , '#xml': {}
  };
  this._emitted_meta = false;
  this.stack = [];
  this.xmlbase = [];
  this.in_xhtml = false;
  this.xhtml = {}; /* Where to store xhtml elements as associative
                      array with keys: '#' (containing the text)
                      and '#name' (containing the XML element name) */
  this.errors = [];
};

/*
 * Parse options
 */
FeedParser.prototype.parseOpts = function (options) {
  this.options = options || {};
  if (!('strict' in this.options)) this.options.strict = false;
  if (!('normalize' in this.options)) this.options.normalize = true;
  if (!('addmeta' in this.options)) this.options.addmeta = true;
  if (!('resume_saxerror' in this.options)) this.options.resume_saxerror = true;
  if ('MAX_BUFFER_LENGTH' in this.options) {
    sax.MAX_BUFFER_LENGTH = this.options.MAX_BUFFER_LENGTH; // set to Infinity to have unlimited buffers
  } else {
    sax.MAX_BUFFER_LENGTH = 16 * 1024 * 1024; // 16M versus the 64K default
  }
  if (this.options.feedurl) this.xmlbase.unshift({ '#name': 'xml', '#': this.options.feedurl});
};

FeedParser.prototype.handleEnd = function (){
  // We made it to the end without throwing, but let's make sure we were actually
  // parsing a feed
  if (!(this.meta && this.meta['#type'])) {
    var e = new Error('Not a feed');
    return this.handleError(e);
  }
  this.push(null);
};

FeedParser.prototype.handleSaxError = function (e) {
  this.emit('error', e);
  if (this.options.resume_saxerror) {
    this.resumeSaxError();
  }
};

FeedParser.prototype.resumeSaxError = function () {
  if (this.stream._parser) {
    this.stream._parser.error = null;
    this.stream._parser.resume();
  }
};

FeedParser.prototype.handleError = function (e){
  this.emit('error', e);
};

FeedParser.prototype.handleProcessingInstruction = function (node) {
  if (node.name !== 'xml') return;
  this.meta['#xml'] = node.body.trim().split(' ').reduce(function (map, attr) {
    var parts = attr.split('=');
    map[parts[0]] = parts[1] && parts[1].length > 2 && parts[1].match(/^.(.*?).$/)[1];
    return map;
  }, {});
};

FeedParser.prototype.handleOpenTag = function (node){
  var n = {};
  n['#name'] = node.name; // Avoid namespace collissions later...
  n['#prefix'] = node.prefix; // The current ns prefix
  n['#local'] = node.local; // The current element name, sans prefix
  n['#uri'] = node.uri; // The current ns uri
  n['@'] = {};
  n['#'] = '';

  if (Object.keys(node.attributes).length) {
    n['@'] = this.handleAttributes(node.attributes, n['#name']);
  }

  if (this.in_xhtml && this.xhtml['#name'] != n['#name']) { // We are in an xhtml node
    // This builds the opening tag, e.g., <div id='foo' class='bar'>
    this.xhtml['#'] += '<'+n['#name'];
    Object.keys(n['@']).forEach(function(name){
      this.xhtml['#'] += ' '+ name +'="'+ n['@'][name] + '"';
    }, this);
    this.xhtml['#'] += '>';
  } else if ( this.stack.length === 0 &&
              (n['#name'] === 'rss' ||
              (n['#local'] === 'rdf' && utils.nslookup([n['#uri']], 'rdf')) ||
              (n['#local'] === 'feed'&& utils.nslookup([n['#uri']], 'atom')) ) ) {
    Object.keys(n['@']).forEach(function(name) {
      var o = {};
      if (name != 'version') {
        o[name] = n['@'][name];
        this.meta['@'].push(o);
      }
    }, this);
    switch(n['#local']) {
    case 'rss':
      this.meta['#type'] = 'rss';
      this.meta['#version'] = n['@']['version'];
      break;
    case 'rdf':
      this.meta['#type'] = 'rdf';
      this.meta['#version'] = n['@']['version'] || '1.0';
      break;
    case 'feed':
      this.meta['#type'] = 'atom';
      this.meta['#version'] = n['@']['version'] || '1.0';
      break;
    }
  }
  this.stack.unshift(n);
};

FeedParser.prototype.handleCloseTag = function (el){
  var node = { '#name' : el
             , '#prefix' : ''
             , '#local' : '' }
    , stdEl
    , item
    , baseurl
    ;
  var n = this.stack.shift();
  el = el.split(':');

  if (el.length > 1 && el[0] === n['#prefix']) {
    if (utils.nslookup(n['#uri'], 'atom')) {
      node['#prefix'] = el[0];
      node['#local'] = el.slice(1).join(':');
      node['#type'] = 'atom';
    } else if (utils.nslookup(n['#uri'], 'rdf')) {
      node['#prefix'] = el[0];
      node['#local'] = el.slice(1).join(':');
      node['#type'] = 'rdf';
    } else {
      node['#prefix'] = utils.nsprefix(n['#uri']) || n['#prefix'];
      node['#local'] = el.slice(1).join(':');
    }
  } else {
    node['#local'] = node['#name'];
    node['#type'] = utils.nsprefix(n['#uri']) || n['#prefix'];
  }
  delete n['#name'];
  delete n['#local'];
  delete n['#prefix'];
  delete n['#uri'];

  if (this.xmlbase && this.xmlbase.length) {
    baseurl = this.xmlbase[0]['#'];
  }

  if (baseurl && (node['#local'] === 'logo' || node['#local'] === 'icon') && node['#type'] === 'atom') {
    // Apply xml:base to these elements as they appear
    // rather than leaving it to the ultimate parser
    n['#'] = utils.resolve(baseurl, n['#']);
  }

  if (this.xmlbase.length && (el == this.xmlbase[0]['#name'])) {
    void this.xmlbase.shift();
  }

  if (this.in_xhtml) {
    if (node['#name'] == this.xhtml['#name']) { // The end of the XHTML

      // Add xhtml data to the container element
      n['#'] += this.xhtml['#'].trim();
        // Clear xhtml nodes from the tree
        for (var key in n) {
          if (key != '@' && key != '#') {
            delete n[key];
          }
        }
      this.xhtml = {};
      this.in_xhtml = false;
    } else { // Somewhere in the middle of the XHTML
      this.xhtml['#'] += '</' + node['#name'] + '>';
    }
  }

  if ('#' in n) {
    if (n['#'].match(/^\s*$/)) {
      // Delete text nodes with nothing by whitespace
      delete n['#'];
    } else {
      n['#'] = n['#'].trim();
      if (Object.keys(n).length === 1) {
        // If there is only one text node, hoist it
        n = n['#'];
      }
    }
  }

  if (node['#name'] === 'item' ||
      node['#name'] === 'entry' ||
      (node['#local'] === 'item' && (node['#prefix'] === '' || node['#type'] === 'rdf')) ||
      (node['#local'] == 'entry' && (node['#prefix'] === '' || node['#type'] === 'atom'))) { // We have an article!

    if (!this.meta.title) { // We haven't yet parsed all the metadata
      utils.merge(this.meta, this.handleMeta(this.stack[0], this.meta['#type'], this.options));
      if (!this._emitted_meta) {
        this.emit('meta', this.meta);
        this._emitted_meta = true;
      }
    }
    if (!baseurl && this.xmlbase && this.xmlbase.length) { // handleMeta was able to infer a baseurl without xml:base or options.feedurl
      n = utils.reresolve(n, this.xmlbase[0]['#']);
    }
    item = this.handleItem(n, this.meta['#type'], this.options);
    if (this.options.addmeta) {
      item.meta = this.meta;
    }
    if (this.meta.author && !item.author) item.author = this.meta.author;
    this.push(item);
  } else if (!this.meta.title && // We haven't yet parsed all the metadata
              (node['#name'] === 'channel' ||
               node['#name'] === 'feed' ||
               (node['#local'] === 'channel' && (node['#prefix'] === '' || node['#type'] === 'rdf')) ||
               (node['#local'] === 'feed' && (node['#prefix'] === '' || node['#type'] === 'atom')) ) ) {
    utils.merge(this.meta, this.handleMeta(n, this.meta['#type'], this.options));
    if (!this._emitted_meta) {
      this.emit('meta', this.meta);
      this._emitted_meta = true;
    }
  }

  if (this.stack.length > 0) {
    if (node['#prefix'] && node['#local'] && !node['#type']) {
      stdEl = node['#prefix'] + ':' + node['#local'];
    } else if (node['#name'] && node['#type'] && node['#type'] !== this.meta['#type']) {
      stdEl = node['#name'];
    } else {
      stdEl = node['#local'] || node['#name'];
    }
    if (!this.stack[0].hasOwnProperty(stdEl)) {
      this.stack[0][stdEl] = n;
    } else if (this.stack[0][stdEl] instanceof Array) {
      this.stack[0][stdEl].push(n);
    } else {
      this.stack[0][stdEl] = [this.stack[0][stdEl], n];
    }
  }
};

FeedParser.prototype.handleText = function (text){
  if (this.in_xhtml) {
    this.xhtml['#'] += text;
  } else {
    if (this.stack.length) {
      if (this.stack[0] && '#' in this.stack[0]) {
        this.stack[0]['#'] += text;
      } else {
        this.stack[0]['#'] = text;
      }
    }
  }
};

FeedParser.prototype.handleAttributes = function handleAttributes (attrs, el) {
  /*
   * Using the sax.js option { xmlns: true }
   * attrs is an array of objects (not strings) having the following properties
   * name - e.g., xmlns:dc or href
   * value
   * prefix - the first part of the name of the attribute (before the colon)
   * local - the second part of the name of the attribute (after the colon)
   * uri - the uri of the namespace
   *
   */

  var basepath = ''
    , simplifiedAttributes = {}
    ;

  if (this.xmlbase && this.xmlbase.length) {
    basepath = this.xmlbase[0]['#'];
  }

  Object.keys(attrs).forEach(function(key){
    var attr = attrs[key]
      , ns = {}
      , prefix = ''
      ;
    if (attr.prefix === 'xmlns') {
      ns[attr.name] = attr.value;
      this.meta['#ns'].push(ns);
    }
    // If the feed is using a non-default prefix, we'll use it, too
    // But we force the use of the 'xml' prefix
    if (attr.uri && attr.prefix && !utils.nslookup(attr.uri, attr.prefix) || utils.nslookup(attr.uri, 'xml')) {
      prefix = ( utils.nsprefix(attr.uri) || attr.prefix ) + ( attr.local ? ':' : '' );
    }
    if (basepath && (attr.local == 'href' || attr.local == 'src' || attr.local == 'uri')) {
      // Apply xml:base to these elements as they appear
      // rather than leaving it to the ultimate parser
      attr.value = utils.resolve(basepath, attr.value);
    } else if (attr.local === 'base' && utils.nslookup(attr.uri, 'xml')) {
      // Keep track of the xml:base for the current node
      if (basepath) {
        attr.value = utils.resolve(basepath, attr.value);
      }
      this.xmlbase.unshift({ '#name': el, '#': attr.value});
    } else if (attr.name === 'type' && attr.value === 'xhtml') {
      this.in_xhtml = true;
      this.xhtml = {'#name': el, '#': ''};
    }
    simplifiedAttributes[prefix + attr.local] = attr.value ? attr.value.trim() : '';
  }, this);
  return simplifiedAttributes;
};

FeedParser.prototype.handleMeta = function handleMeta (node, type, options) {
  if (!type || !node) return {};

  var meta = {}
    , normalize = !options || (options && options.normalize)
    ;

  if (normalize) {
    ['title','description','date', 'pubdate', 'pubDate','link', 'xmlurl', 'xmlUrl','author','language','favicon','copyright','generator'].forEach(function (property){
      meta[property] = null;
    });
    meta.cloud = {};
    meta.image = {};
    meta.categories = [];
  }

  Object.keys(node).forEach(function(name){
    var el = node[name];

    if (normalize) {
      switch(name){
      case('title'):
        meta.title = utils.get(el);
        break;
      case('description'):
      case('subtitle'):
        meta.description = utils.get(el);
        break;
      case('pubdate'):
      case('lastbuilddate'):
      case('published'):
      case('modified'):
      case('updated'):
      case('dc:date'):
        var date = utils.get(el) ? new Date(utils.get(el)) : null;
        if (!date) break;
        if (meta.pubdate === null || name == 'pubdate' || name == 'published')
          meta.pubdate = meta.pubDate = date;
        if (meta.date === null || name == 'lastbuilddate' || name == 'modified' || name == 'updated')
          meta.date = date;
        break;
      case('link'):
      case('atom:link'):
      case('atom10:link'):
        if (Array.isArray(el)) {
          el.forEach(function (link){
            if (link['@']['href']) { // Atom
              if (utils.get(link['@'], 'rel')) {
                if (link['@']['rel'] == 'alternate') {
                  if (!meta.link) meta.link = link['@']['href'];
                }
                else if (link['@']['rel'] == 'self') {
                  meta.xmlurl = meta.xmlUrl = link['@']['href'];
                  if (this.xmlbase && this.xmlbase.length === 0) {
                    this.xmlbase.unshift({ '#name': 'xml', '#': meta.xmlurl});
                    this.stack[0] = utils.reresolve(this.stack[0], meta.xmlurl);
                  }
                }
                else if (link['@']['rel'] == 'hub' && !(meta.cloud.href || meta.cloud.domain)) {
                  meta.cloud.type = 'hub';
                  meta.cloud.href = link['@']['href'];
                }
              } else {
                if (!meta.link) meta.link = link['@']['href'];
              }
            } else if (Object.keys(link['@']).length === 0) { // RSS
              meta.link = utils.get(link);
            }
            if (meta.link && this.xmlbase && this.xmlbase.length === 0) {
              this.xmlbase.unshift({ '#name': 'xml', '#': meta.link});
              this.stack[0] = utils.reresolve(this.stack[0], meta.link);
            }
          }, this);
        } else {
          if (el['@']['href']) { // Atom
            if (utils.get(el['@'], 'rel')) {
              if (el['@']['rel'] == 'alternate') {
                if (!meta.link) meta.link = el['@']['href'];
              }
              else if (el['@']['rel'] == 'self') {
                meta.xmlurl = meta.xmlUrl = el['@']['href'];
                if (this.xmlbase && this.xmlbase.length === 0) {
                  this.xmlbase.unshift({ '#name': 'xml', '#': meta.xmlurl});
                  this.stack[0] = utils.reresolve(this.stack[0], meta.xmlurl);
                }
              }
              else if (el['@']['rel'] == 'hub' && !(meta.cloud.href || meta.cloud.domain)) {
                meta.cloud.type = 'hub';
                meta.cloud.href = el['@']['href'];
              }
            } else {
              meta.link = el['@']['href'];
            }
          } else if (Object.keys(el['@']).length === 0) { // RSS
            if (!meta.link) meta.link = utils.get(el);
          }
          if (meta.link && this.xmlbase && this.xmlbase.length === 0) {
            this.xmlbase.unshift({ '#name': 'xml', '#': meta.link});
            this.stack[0] = utils.reresolve(this.stack[0], meta.link);
          }
        }
        break;
      case('managingeditor'):
      case('webmaster'):
      case('author'):
        var author = {};
        if (name == 'author') {
          meta.author = utils.get(el.name) || utils.get(el.email) || utils.get(el.uri);
        }
        else if (utils.get(el)) {
          author = addressparser(utils.get(el))[0];
          if (author) {
            el['name'] = author.name;
            el['email'] = author.address;
          }
          if (meta.author === null || name == 'managingeditor') {
            meta.author = author.name || author.address || utils.get(el);
          }
        }
        break;
      case('cloud'):
        // I can't believe someone actually would put two cloud elements in their channel
        // but it happened
        // Nevertheless, there can be only one
        meta.cloud = {}; // This will ensure that rssCloud "wins" here,
                         // If pubsubhubbub is also declared, it's still available
                         // in the link elements
        if (Array.isArray(el)) {
          Object.keys(el[0]['@']).forEach(function (attr) {
            if (utils.has(el[0]['@'], attr)) {
              meta.cloud[attr] = el[0]['@'][attr];
            }
          });
        }
        else {
          Object.keys(el['@']).forEach(function (attr) {
            if (utils.has(el['@'], attr)) {
              meta.cloud[attr] = el['@'][attr];
            }
          });
        }
        meta.cloud.type = 'rsscloud';
        break;
      case('language'):
        meta.language = utils.get(el);
        break;
      case('image'):
      case('logo'):
        if (el.url)
          meta.image.url = utils.get(el.url);
        if (el.title)
          meta.image.title = utils.get(el.title);
        if (!meta.image.url && utils.get(el))
          meta.image.url = utils.get(el);
        break;
      case('icon'):
        meta.favicon = utils.get(el);
        break;
      case('copyright'):
      case('rights'):
      case('dc:rights'):
        meta.copyright = utils.get(el);
        break;
      case('generator'):
        meta.generator = utils.get(el);
        if (utils.get(el['@'], 'version'))
          meta.generator += (meta.generator ? ' ' : '') + 'v' + el['@'].version;
        if (utils.get(el['@'], 'uri'))
          meta.generator += meta.generator ? ' (' + el['@'].uri + ')' : el['@'].uri;
        break;
      case('category'):
      case('dc:subject'):
      case('itunes:category'):
      case('media:category'):
        /* We handle all the kinds of categories within the switch loop because meta.categories
         * is an array, unlike the other properties, and therefore can handle multiple values
         */
        var _category = ''
          , _categories = []
          ;
        if (Array.isArray(el)) {
          el.forEach(function (category){
            var _categoryValue;
            if ('category' == name && 'atom' == type) {
              if (category['@'] && (_categoryValue = utils.safeTrim(utils.get(category['@'], 'term')))) {
                meta.categories.push(_categoryValue);
              }
            }
            else if ('category' == name && 'rss' == type){
              if ((_categoryValue = utils.safeTrim(utils.get(category)))) {
                meta.categories.push(_categoryValue);
              }
            }
            else if ('dc:subject' == name && (_categoryValue = utils.safeTrim(utils.get(category)))) {
              _categories = _categoryValue.split(' ').map(function (cat){ return cat.trim(); });
              if (_categories.length) {
                meta.categories = meta.categories.concat(_categories);
              }
            }
            else if ('itunes:category' == name) {
              if (category['@'] && utils.safeTrim(utils.get(category['@'], 'text'))) _category = utils.safeTrim(utils.get(category['@'], 'text'));
              if (category[name]) {
                if (Array.isArray(category[name])) {
                  category[name].forEach(function (subcategory){
                    var _subcategoryValue;
                    if (subcategory['@'] && (_subcategoryValue = utils.safeTrim(utils.get(subcategory['@'], 'text')))) {
                      meta.categories.push(_category + '/' + _subcategoryValue);
                    }
                  });
                }
                else if (category[name]['@'] && (_categoryValue = utils.safeTrim(utils.get(category[name]['@'], 'text')))) {
                    meta.categories.push(_category + '/' + _categoryValue);
                }
              }
              else if (_category) {
                meta.categories.push(_category);
              }
            }
            else if ('media:category' == name && (_categoryValue = utils.safeTrim(utils.get(category)))) {
              meta.categories.push(_categoryValue);
            }
          });
        } else {
          if ('category' == name && 'atom' == type) {
            if ((_category = utils.safeTrim(utils.get(el['@'], 'term')))) {
              meta.categories.push(_category);
            }
          }
          else if ('category' == name && 'rss' == type) {
            if ((_category = utils.safeTrim(utils.get(el)))) {
              meta.categories.push(_category);
            }
          }
          else if ('dc:subject' == name && (_category = utils.safeTrim(utils.get(el)))) {
            _categories = _category.split(' ').map(function (cat){ return cat.trim(); });
            if (_categories.length) {
              meta.categories = meta.categories.concat(_categories);
            }
          }
          else if ('itunes:category' == name) {
            if (el['@'] && utils.safeTrim(utils.get(el['@'], 'text'))) _category = utils.safeTrim(utils.get(el['@'], 'text'));
            if (el[name]) {
              if (Array.isArray(el[name])) {
                el[name].forEach(function (subcategory){
                  var _subcategoryValue;
                  if (subcategory['@'] && (_subcategoryValue = utils.safeTrim(utils.get(subcategory['@'], 'text')))) {
                    meta.categories.push(_category + '/' + _subcategoryValue);
                  }
                });
              }
              else if (el[name]['@'] && (_category = utils.safeTrim(utils.get(el[name]['@'], 'text')))) {
                meta.categories.push(_category + '/' + _category);
              }
            }
            else if (_category) {
              meta.categories.push(_category);
            }
          }
          else if ('media:category' == name && (_category = utils.safeTrim(utils.get(el)))) {
            meta.categories.push(utils.get(el));
          }
        }
        break;
      } // switch end
    }
    // Fill with all native other namespaced properties
    if (name.indexOf('#') !== 0) {
      if (~name.indexOf(':')) meta[name] = el;
      else meta[type + ':' + name] = el;
    }
  }, this); // forEach end

  if (normalize) {
    if (!meta.description) {
      if (node['itunes:summary']) meta.description = utils.get(node['itunes:summary']);
      else if (node['tagline']) meta.description = utils.get(node['tagline']);
    }
    if (!meta.author) {
      if (node['itunes:author']) meta.author = utils.get(node['itunes:author']);
      else if (node['itunes:owner'] && node['itunes:owner']['itunes:name']) meta.author = utils.get(node['itunes:owner']['itunes:name']);
      else if (node['dc:creator']) meta.author = utils.get(node['dc:creator']);
      else if (node['dc:publisher']) meta.author = utils.get(node['dc:publisher']);
    }
    if (!meta.language) {
      if (node['@'] && node['@']['xml:lang']) meta.language = utils.get(node['@'], 'xml:lang');
      else if (node['dc:language']) meta.language = utils.get(node['dc:language']);
    }
    if (!meta.image.url) {
      if (node['itunes:image']) meta.image.url = utils.get(node['itunes:image']['@'], 'href');
      else if (node['media:thumbnail']) {
        if (Array.isArray(node['media:thumbnail'])) {
          node['media:thumbnail'] = node['media:thumbnail'][0];
        }
        meta.image.url = utils.get(node['media:thumbnail']['@'], 'url');
      }
    }
    if (!meta.copyright) {
      if (node['media:copyright']) meta.copyright = utils.get(node['media:copyright']);
      else if (node['dc:rights']) meta.copyright = utils.get(node['dc:rights']);
      else if (node['creativecommons:license']) meta.copyright = utils.get(node['creativecommons:license']);
      else if (node['cc:license']) {
        if (Array.isArray(node['cc:license']) && node['cc:license'][0]['@'] && node['cc:license'][0]['@']['rdf:resource']) {
          meta.copyright = utils.get(node['cc:license'][0]['@'], 'rdf:resource');
        } else if (node['cc:license']['@'] && node['cc:license']['@']['rdf:resource']) {
          meta.copyright = utils.get(node['cc:license']['@'], 'rdf:resource');
        }
      }
    }
    if (!meta.generator) {
      if (node['admin:generatoragent']) {
        if (Array.isArray(node['admin:generatoragent']) && node['admin:generatoragent'][0]['@'] && node['admin:generatoragent'][0]['@']['rdf:resource']) {
          meta.generator = utils.get(node['admin:generatoragent'][0]['@'], 'rdf:resource');
        } else if (node['admin:generatoragent']['@'] && node['admin:generatoragent']['@']['rdf:resource']) {
          meta.generator = utils.get(node['admin:generatoragent']['@'], 'rdf:resource');
        }
      }
    }
    if (meta.categories.length) {
      meta.categories = utils.unique(meta.categories);
    }
    if (!meta.link) {
      if (meta['atom:id'] && utils.get(meta['atom:id']) && /^https?:/.test(utils.get(meta['atom:id']))) {
        meta.link = utils.get(meta['atom:id']);
      }
    }
    if (!meta.xmlurl && this.options.feedurl) {
      meta.xmlurl = meta.xmlUrl = this.options.feedurl;
    }
    meta.title = meta.title && utils.stripHtml(meta.title);
    meta.description = meta.description && utils.stripHtml(meta.description);
  }

  return meta;
};

FeedParser.prototype.handleItem = function handleItem (node, type, options){
  if (!type || !node) return {};

  var item = {}
    , normalize = !options || (options && options.normalize)
    ;

  if (normalize) {
    ['title','description','summary','date','pubdate','pubDate','link','guid','author','comments', 'origlink'].forEach(function (property){
      item[property] = null;
    });
    item.image = {};
    item.source = {};
    item.categories = [];
    item.enclosures = [];
  }

  Object.keys(node).forEach(function(name){
    var el = node[name]
      , attrs = utils.get(el, '@')
      , enclosure;
    if (normalize) {
      switch(name){
      case('title'):
        item.title = utils.get(el);
        break;
      case('description'):
      case('summary'):
        item.summary = utils.get(el);
        if (!item.description) item.description = utils.get(el);
        break;
      case('content'):
      case('content:encoded'):
        item.description = utils.get(el);
        break;
      case('pubdate'):
      case('published'):
      case('issued'):
      case('modified'):
      case('updated'):
      case('dc:date'):
        var date = utils.get(el) ? new Date(utils.get(el)) : null;
        if (!date) break;
        if (item.pubdate === null || name == 'pubdate' || name == 'published' || name == 'issued')
          item.pubdate = item.pubDate = date;
        if (item.date === null || name == 'modified' || name == 'updated')
          item.date = date;
        break;
      case('link'):
        if (Array.isArray(el)) {
          el.forEach(function (link){
            if (link['@']['href']) { // Atom
              if (utils.get(link['@'], 'rel')) {
                if (link['@']['rel'] == 'canonical') item.origlink = link['@']['href'];
                if (link['@']['rel'] == 'alternate' && (!link['@']['type'] || link['@']['type'] == 'text/html') && !item.link) item.link = link['@']['href'];
                if (link['@']['rel'] == 'self' && (!link['@']['type'] || link['@']['type'] == 'text/html') && !item.link) item.link = link['@']['href'];
                if (link['@']['rel'] == 'replies') item.comments = link['@']['href'];
                if (link['@']['rel'] == 'enclosure') {
                  enclosure = {};
                  enclosure.url = link['@']['href'];
                  enclosure.type = utils.get(link['@'], 'type');
                  enclosure.length = utils.get(link['@'], 'length');
                  if (indexOfObject(item.enclosures, enclosure, ['url', 'type']) === -1) {
                    item.enclosures.push(enclosure);
                  }
                }
              } else {
                item.link = link['@']['href'];
              }
            } else if (Object.keys(link['@']).length === 0) { // RSS
              if (!item.link) item.link = utils.get(link);
            }
          });
        } else {
          if (el['@']['href']) { // Atom
            if (utils.get(el['@'], 'rel')) {
              if (el['@']['rel'] == 'canonical') item.origlink = el['@']['href'];
              if (el['@']['rel'] == 'alternate' && (!el['@']['type'] || el['@']['type'] == 'text/html') && !item.link) item.link = el['@']['href'];
              if (el['@']['rel'] == 'self' && (!el['@']['type'] || el['@']['type'] == 'text/html') && !item.link) item.link = el['@']['href'];
              if (el['@']['rel'] == 'replies') item.comments = el['@']['href'];
              if (el['@']['rel'] == 'enclosure') {
                enclosure = {};
                enclosure.url = el['@']['href'];
                enclosure.type = utils.get(el['@'], 'type');
                enclosure.length = utils.get(el['@'], 'length');
                if (indexOfObject(item.enclosures, enclosure, ['url', 'type']) === -1) {
                  item.enclosures.push(enclosure);
                }
              }
            } else {
              item.link = el['@']['href'];
            }
          } else if (Object.keys(el['@']).length === 0) { // RSS
            if (!item.link) item.link = utils.get(el);
          }
        }
        if (!item.guid) item.guid = item.link;
        break;
      case('guid'):
      case('id'):
        item.guid = utils.get(el);
        // http://cyber.law.harvard.edu/rss/rss.html#ltguidgtSubelementOfLtitemgt
        // If the guid element has an attribute named "isPermaLink" with a value
        // of true, the reader may assume that it is a permalink to the item,
        // that is, a url that can be opened in a Web browser, that points to
        // the full item described by the <item> element.
        // isPermaLink is optional, its default value is true. If its value is
        // false, the guid may not be assumed to be a url, or a url to anything
        // in particular.
        if (item.guid && type == 'rss' && name == 'guid' && !(attrs.ispermalink && attrs.ispermalink.match(/false/i))) {
          item.permalink = item.guid;
        }
        break;
      case('author'):
        var author = {};
        if (utils.get(el)) { // RSS
          author = addressparser(utils.get(el))[0];
          if (author) {
            el['name'] = author.name;
            el['email'] = author.address;
            item.author = author.name || author.address;
          }
          // addressparser failed
          else {
            item.author = utils.get(el);
          }
        } else {
          item.author = utils.get(el.name) || utils.get(el.email) || utils.get(el.uri);
        }
        break;
      case('dc:creator'):
        item.author = utils.get(el);
        break;
      case('comments'):
        item.comments = utils.get(el);
        break;
      case('source'):
        if ('rss' == type) {
          item.source['title'] = utils.get(el);
          item.source['url'] = utils.get(el['@'], 'url');
        } else if ('atom' == type) {
          if (el.title && utils.get(el.title))
            item.source['title'] = utils.get(el.title);
          if (el.link && utils.get(el.link['@'], 'href'))
          item.source['url'] = utils.get(el.link['@'], 'href');
        }
        if (item.source['url'] && !this.meta.xmlurl) {
          this.meta.xmlurl = this.meta.xmlUrl = item.source['url'];
          if (this.xmlbase && this.xmlbase.length === 0) {
            this.xmlbase.unshift({ '#name': 'xml', '#': item.source['url']});
            this.stack[0] = utils.reresolve(this.stack[0], item.source['url']);
          }
        }
        break;
      case('enclosure'):
        if (Array.isArray(el)) {
          el.forEach(function (enc){
            enclosure = {};
            enclosure.url = utils.get(enc['@'], 'url');
            enclosure.type = utils.get(enc['@'], 'type');
            enclosure.length = utils.get(enc['@'], 'length');
            if (~indexOfObject(item.enclosures, enclosure, ['url', 'type'])) {
              item.enclosures.splice(indexOfObject(item.enclosures, enclosure, ['url', 'type']), 1, enclosure);
            } else {
              item.enclosures.push(enclosure);
            }
          });
        } else {
          enclosure = {};
          enclosure.url = utils.get(el['@'], 'url');
          enclosure.type = utils.get(el['@'], 'type');
          enclosure.length = utils.get(el['@'], 'length');
          if (~indexOfObject(item.enclosures, enclosure, ['url', 'type'])) {
            item.enclosures.splice(indexOfObject(item.enclosures, enclosure, ['url', 'type']), 1, enclosure);
          } else {
            item.enclosures.push(enclosure);
          }
        }
        break;
      case('media:content'):
        if (Array.isArray(el)) {
          el.forEach(function (enc){
            enclosure = {};
            enclosure.url = utils.get(enc['@'], 'url');
            enclosure.type = utils.get(enc['@'], 'type') || utils.get(enc['@'], 'medium');
            enclosure.length = utils.get(enc['@'], 'filesize');
            if (indexOfObject(item.enclosures, enclosure, ['url', 'type']) === -1) {
              item.enclosures.push(enclosure);
            }
          });
        } else {
          enclosure = {};
          enclosure.url = utils.get(el['@'], 'url');
          enclosure.type = utils.get(el['@'], 'type') || utils.get(el['@'], 'medium');
          enclosure.length = utils.get(el['@'], 'filesize');
          if (indexOfObject(item.enclosures, enclosure, ['url', 'type']) === -1) {
            item.enclosures.push(enclosure);
          }
        }
        break;
      case('enc:enclosure'): // Can't find this in use for an example to debug. Only example found does not comply with the spec -- can't code THAT!
        break;
      case('category'):
      case('dc:subject'):
      case('itunes:category'):
      case('media:category'):
        /* We handle all the kinds of categories within the switch loop because item.categories
         * is an array, unlike the other properties, and therefore can handle multiple values
         */
        var _category = ''
          , _categories = []
          ;
        if (Array.isArray(el)) {
          el.forEach(function (category){
            if ('category' == name && 'atom' == type) {
              if (category['@'] && utils.get(category['@'], 'term')) item.categories.push(utils.get(category['@'], 'term'));
            } else if ('category' == name && utils.get(category) && 'rss' == type) {
              item.categories.push(utils.get(category).trim());
            } else if ('dc:subject' == name && utils.get(category)) {
              _categories = utils.get(category).split(' ').map(function (cat){ return cat.trim(); });
              if (_categories.length) item.categories = item.categories.concat(_categories);
            } else if ('itunes:category' == name) {
              if (category['@'] && utils.get(category['@'], 'text')) _category = utils.get(category['@'], 'text');
              if (category[name]) {
                if (Array.isArray(category[name])) {
                  category[name].forEach(function (subcategory){
                    if (subcategory['@'] && utils.get(subcategory['@'], 'text')) item.categories.push(_category + '/' + utils.get(subcategory['@'], 'text'));
                  });
                } else {
                  if (category[name]['@'] && utils.get(category[name]['@'], 'text'))
                    item.categories.push(_category + '/' + utils.get(category[name]['@'], 'text'));
                }
              } else {
                item.categories.push(_category);
              }
            } else if ('media:category' == name) {
              item.categories.push(utils.get(category));
            }
          });
        } else {
          if ('category' == name && 'atom' == type) {
            if (utils.get(el['@'], 'term')) item.categories.push(utils.get(el['@'], 'term'));
          } else if ('category' == name && utils.get(el) && 'rss' == type) {
            item.categories.push(utils.get(el).trim());
          } else if ('dc:subject' == name && utils.get(el)) {
            _categories = utils.get(el).split(' ').map(function (cat){ return cat.trim(); });
            if (_categories.length) item.categories = item.categories.concat(_categories);
          } else if ('itunes:category' == name) {
            if (el['@'] && utils.get(el['@'], 'text')) _category = utils.get(el['@'], 'text');
            if (el[name]) {
              if (Array.isArray(el[name])) {
                el[name].forEach(function (subcategory){
                  if (subcategory['@'] && utils.get(subcategory['@'], 'text')) item.categories.push(_category + '/' + utils.get(subcategory['@'], 'text'));
                });
              } else {
                if (el[name]['@'] && utils.get(el[name]['@'], 'text'))
                  item.categories.push(_category + '/' + utils.get(el[name]['@'], 'text'));
              }
            } else {
              item.categories.push(_category);
            }
          } else if ('media:category' == name) {
            item.categories.push(utils.get(el));
          }
        }
        break;
      case('feedburner:origlink'):
      case('pheedo:origlink'):
        if (!item.origlink) {
          item.origlink = utils.get(el);
        }
        break;
      } // switch end
    }
    // Fill with all native other namespaced properties
    if (name.indexOf('#') !== 0) {
      if (~name.indexOf(':')) item[name] = el;
      else item[type + ':' + name] = el;
    }
  }, this); // forEach end

  if (normalize) {
    if (!item.description) {
      if (node['itunes:summary']) item.description = utils.get(node['itunes:summary']);
    }
    if (!item.author) {
      if (node['itunes:author']) item.author = utils.get(node['itunes:author']);
      else if (node['itunes:owner'] && node['itunes:owner']['itunes:name']) item.author = utils.get(node['itunes:owner']['itunes:name']);
      else if (node['dc:publisher']) item.author = utils.get(node['dc:publisher']);
    }
    if (!item.image.url) {
      if (node['itunes:image']) item.image.url = utils.get(node['itunes:image']['@'], 'href');
      else if (node['media:thumbnail']) {
        if (Array.isArray(node['media:thumbnail'])) {
          item.image.url = utils.get(node['media:thumbnail'][0]['@'], 'url');
        } else {
          item.image.url = utils.get(node['media:thumbnail']['@'], 'url');
        }
      }
      else if (node['media:content'] && node['media:content']['media:thumbnail']) item.image.url = utils.get(node['media:content']['media:thumbnail']['@'], 'url');
      else if (node['media:group'] && node['media:group']['media:thumbnail']) item.image.url = utils.get(node['media:group']['media:thumbnail']['@'], 'url');
      else if (node['media:group'] && node['media:group']['media:content'] && node['media:group']['media:content']['media:thumbnail']) item.image.url = utils.get(node['media:group']['media:content']['media:thumbnail']['@'], 'url');
    }
    if (item.categories.length) {
      item.categories = utils.unique(item.categories);
    }
    if (!item.link) {
      if (item.guid && /^https?:/.test(item.guid)) {
        item.link = item.guid;
      }
    }
    item.title = item.title && utils.stripHtml(item.title);
  }
  return item;
};

// Naive Stream API
FeedParser.prototype._transform = function (data, encoding, done) {
  try {
    this.stream.write(data);
    done();
  }
  catch (e) {
    done(e);
    this.push(null); // Manually trigger and end, since we can't reliably do any more parsing
  }
};

FeedParser.prototype._flush = function (done) {
  try {
    this.stream.end();
    done();
  }
  catch (e) {
    done(e);
  }
};

exports = module.exports = FeedParser;
