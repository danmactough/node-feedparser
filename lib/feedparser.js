/**********************************************************************
 node-feedparser - Really Simple RSS, a robust RSS, Atom, RDF parser for node.
 http://github.com/danmactough/node-feedparser
 Copyright (c) 2011 Dan MacTough
  http://yabfog.com

**********************************************************************/

/**
 * Module dependencies.
 */
var sax = require('sax')
  , request = require('request')
  , fs = require('fs')
  , url = require('url')
  , util = require('util')
  , events = require('events');

// Ensures we have .trim() to strip leading and trailing whitespace from any string
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    var str = this.replace(/^\s\s*/, '');
    var ws = /\s/
      , i = str.length;
    while (ws.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  };
}

// Utility function to test for and extract a subkey
function getValue(obj, subkey) {
  if (!subkey)
    subkey = '#';
  if (obj && obj[subkey])
    return obj[subkey];
  else
    return null;
}

/**
 * FeedParser constructor. Most apps will only use one instance.
 *
 * @api public
 */
function FeedParser () {
  var self = this;
  self.saxStream = require('sax').createStream(false, {lowercasetags: true}); // https://github.com/isaacs/sax-js
  self.saxStream.on('error', function (e){ self.handleError(e, self) });
  self.saxStream.on('opentag', function (n){ self.handleOpenTag(n, self) });
  self.saxStream.on('closetag', function (el){ self.handleCloseTag(el, self) });
  self.saxStream.on('text', function (text){ self.handleText(text, self) });
  self.saxStream.on('cdata', function (text){ self.handleText(text, self) });
  self.saxStream.on('end', function (){ self.handleEnd(self) });
  events.EventEmitter.call(this);
}

util.inherits(FeedParser, events.EventEmitter);

/**
 * Parses a feed contained in a string.
 *
 * For each article/post in a feed, emits an 'article' event 
 * with an object with the following keys:
 *   title {String}
 *   description {String}
 *   summary {String}
 *   pubDate {Date} (or null)
 *   link {String}
 *   guid {String}
 *   meta {Object}
 *   Object.keys(meta):
 *     #ns {Array} key,value pairs of each namespace declared for the feed
 *     #type {String} one of 'atom', 'rss', 'rdf'
 *     #version {String}
 *     title {String}
 *     description {String}
 *     pubDate {Date} (or null)
 *     link {String} i.e., to the homepage, not the feed
 *     xmlUrl {String} the canonical URL of the feed, as declared by the feed
 *
 * Emits a 'warning' event on each XML parser warning
 *
 * Emits an 'error' event on each XML parser error
 *
 * @param {String} string of XML representing the feed
 * @param {Function} callback
 * @api public
 */

FeedParser.prototype.parseString = function(string, callback) {
  var self = this;
  self._reset(callback);
  self.saxStream.end(string, 'utf8');
};

/**
 * Parses a feed from a file or (for compatability with libxml) a url.
 * See parseString for more info.
 *
 * @param {String} path to the feed file or a fully qualified uri or parsed url object from url.parse()
 * @param {Function} callback
 * @api public
 */

FeedParser.prototype.parseFile = function(file, callback) {
  var self = this;
  if (/^https?:/.test(file) || (typeof file == 'object' && 'protocol' in file)) {
    self.parseUrl(file, callback);
  } else {
    self._reset(callback);
    fs.createReadStream(file).pipe(self.saxStream);
  }
};

/**
 * Parses a feed from a url.
 *
 * Please consider whether it would be better to perform conditional GETs 
 * and pass in the results instead.
 *
 * See parseString for more info.
 *
 * @param {String} fully qualified uri or a parsed url object from url.parse()
 * @param {Function} callback
 * @api public
 */

FeedParser.prototype.parseUrl = function(url, callback) {
  var self = this;
  self._reset(callback);
  request(url).pipe(self.saxStream);
};

/**
 * Parses a feed from a Stream.
 *
 * Example:
 *    fp = new FeedParser();
 *    fp.on('article', function (article){ // do something });
 *    fp.parseStream(fs.createReadStream('file.xml')[, callback]);
 *
 *
 * See parseString for more info.
 *
 * @param {String} fully qualified uri or a parsed url object from url.parse()
 * @param {Function} callback
 * @api public
 */

FeedParser.prototype.parseStream = function(stream, callback) {
  var self = this;
  self._reset(callback);
  stream.pipe(self.saxStream);
};

FeedParser.prototype.handleEnd = function (scope){
  var self = scope;
  var meta = self.meta
    , articles = self.articles;

  self.emit('end', articles);

  if ('function' == typeof self.callback) {
    if (self.errors.length) {
      var error = self.errors.pop();
      if (self.errors.length) {
        error.errors = self.errors;
      }
      self.callback(error);
    } else {
      self.callback(null, meta, articles);
    }
  }
  
};

FeedParser.prototype.handleError = function (e, scope){
  var self = scope;
  self.emit('error', e);
  self.errors.push(e);
  self._parser.error = null;
  self._parser.resume();
};

FeedParser.prototype.handleOpenTag = function (node, scope){
  var self = scope;
  var n = {};
  n['#name'] = node.name; // Avoid namespace collissions later...
  n['@'] = {};
  n['#'] = '';

  function handleAttributes (attrs, el) {
    Object.keys(attrs).forEach(function(name){
      if (self.xmlbase.length && (name == 'href' || name == 'src' || name == 'uri')) {
        // Apply xml:base to these elements as they appear
        // rather than leaving it to the ultimate parser
        attrs[name] = url.resolve(self.xmlbase[0]['#'], attrs[name]);
      } else if (name == 'xml:base') {
        if (self.xmlbase.length) {
          attrs[name] = url.resolve(self.xmlbase[0]['#'], attrs[name]);
        }
        self.xmlbase.unshift({ '#name': el, '#': attrs[name]});
      } else if (name == 'type' && attrs['type'] == 'xhtml') {
        self.in_xhtml = true;
        self.xhtml = {'#name': el, '#': ''};
      }
      attrs[name] = attrs[name].trim();
    });
    return attrs;
  };

  if (Object.keys(node.attributes).length) {
    n['@'] = handleAttributes(node.attributes, n['#name']);
  }

  if (self.in_xhtml) { // We are in an xhtml node
    // This builds the opening tag, e.g., <div id='foo' class='bar'>
    self.xhtml['#'] += '<'+n['#name'];
    Object.keys(n['@']).forEach(function(name){
      self.xhtml['#'] += ' '+ name +'="'+ n['@'][name] + '"';
    });
    self.xhtml['#'] += '>';
  } else if (self.stack.length == 0 && 
            (n['#name'] == 'rss' || n['#name'] == 'rdf:rdf' || n['#name'] == 'feed')) {
    self.meta['#ns'] = [];
    Object.keys(n['@']).forEach(function(name) {
      if (name.indexOf('xmlns') == 0) {
        var o = new Object;
        o[name] = n['@'][name];
        self.meta['#ns'].push(o);
      }
    });
    switch(n['#name']) {
    case 'rss':
      self.meta['#type'] = 'rss';
      self.meta['#version'] = n['@']['version'];
      break;
    case 'rdf:rdf':
      self.meta['#type'] = 'rdf';
      self.meta['#version'] = n['@']['version'] || '1.0';
      break;
    case 'feed':
      self.meta['#type'] = 'atom';
      self.meta['#version'] = n['@']['version'] || '1.0';
      break;
    }
  }
  self.stack.unshift(n);
};

FeedParser.prototype.handleCloseTag = function (el, scope){
  var self = scope;
  var n = self.stack.shift();
  delete n['#name'];

  if (self.xmlbase.length && (el == 'logo' || el == 'icon')) { // Via atom
    // Apply xml:base to these elements as they appear
    // rather than leaving it to the ultimate parser
    n['#'] = url.resolve(self.xmlbase[0]['#'], n['#']);
  }

  function handleMeta (node, type) {
    if (!type || !node) return self.meta;
    var meta = {};
    meta.title = meta.description = meta.date = meta.pubDate = meta.link = meta.xmlUrl
    = meta.author = meta.copyright = meta.generator = meta.image = meta.favicon = meta.language
    = null;
    meta.categories = [];
    switch(type){
    case 'atom':
      meta.title = getValue(node.title)
      meta.description = getValue(node.subtitle);
      if (getValue(node.published))
        meta.date = meta.pubDate = new Date(node.published['#']);
      if (getValue(node.updated)) {
        meta.date = new Date(node.updated['#']);
        if (!meta.pubDate) meta.pubDate = new Date(node.updated['#']);
      } else if (getValue(node.modified)) {
        meta.date = new Date(node.modified['#']);
        if (!meta.pubDate) meta.pubDate = new Date(node.modified['#']);
      }
      ;['link', 'atom:link', 'atom10:link'].forEach(function (linkEl){
        if ( node[linkEl] ) {
          if ( node[linkEl].length ) {
            node[linkEl].forEach(function(link){
              if (link['@'] && link['@']['href']) {
                if (link['@']['rel']) {
                  switch(link['@']['rel']){
                    case('alternate'):
                      meta.link = link['@']['href'];
                      break;
                    case('self'):
                      meta.xmlUrl = link['@']['href'];
                      break;
                  };
                } else {
                  meta.link = link['@']['href'];
                }
              }
            });
          } else {
            if (node[linkEl]['@'] && node[linkEl]['@']['href']) {
              if (node[linkEl]['@']['rel']) {
                switch(node[linkEl]['@']['rel']){
                case('alternate'):
                  meta.link = node[linkEl]['@']['href'];
                  break;
                case('self'):
                  meta.xmlUrl = node[linkEl]['@']['href'];
                  break;
                };
              } else {
                meta.link = node[linkEl]['@']['href']
              }
            }
          }
        }
      });
      if (node.author)
        meta.author = getValue(node.author.name) || getValue(node.author.email) || getValue(node.author.uri);
      meta.image = getValue(node.logo);
      meta.favicon = getValue(node.icon);
      meta.copyright = getValue(node.rights);
      meta.generator = getValue(node.generator);
      if (node.generator && node.generator['@'].uri)
        meta.generator += meta.generator ? ' (' + node.generator['@'].uri + ')' : node.generator['@'].uri;
      if (Array.isArray(node.category)) {
        node.category.forEach(function (category){
          if (category['@'] && getValue(category['@'], 'term')) meta.categories.push(getValue(category['@'], 'term').trim());
        });
      } else {
        if (node.category['@'] && getValue(node.category['@'], 'term')) meta.categories.push(getValue(node.category['@'], 'term').trim());
      }
      break;
    case 'rss':
      if (node.title) {
        Object.keys(node).forEach(function(el){
          switch(el){
          case('title'):
            meta.title = getValue(node[el]);
            break;
          case('description'):
            meta.description = getValue(node[el]);
            break;
          case('pubdate'):
          case('lastbuilddate'):
            var date = getValue(node[el]) ? new Date(node[el]['#']) : null;
            if (!date) break;
            if (meta.pubDate === null || el == 'pubdate')
              meta.pubDate = date;
            if (meta.date === null || el == 'lastbuilddate')
              meta.date = date;
            break;
          case('link'):
            if (Array.isArray(node[el])) { // How anyone thinks this is valid is beyond me...
              node[el].forEach(function(link){
                  if(!meta.link && Object.keys(link['@']).length === 0)
                    meta.link = getValue(link);
              });
            } else {
              meta.link = getValue(node[el]);
            }
            break;
          case('atom:link'):
          case('atom10:link'):
            if (Array.isArray(node[el])) {
              node[el].forEach(function(link){
                if(link['@'] && getValue(link['@'], 'rel') == 'self')
                  meta.xmlUrl = getValue(link['@'], 'href');
              });
            } else if (node[el].constructor.name == 'Object' 
                       && node[el]['@']
                       && getValue(node[el]['@'], 'rel') == 'self') {
              meta.xmlUrl = getValue(node[el]['@'], 'href');
            }
            break;
          case('managingeditor'):
          case('webmaster'):
            if(meta.author === null || el == 'managingeditor')
              meta.author = getValue(node[el]);
            break;
          case('language'):
            meta.language = getValue(node[el]);
            break;
          case('image'):
            if (node[el] && node[el].url)
              meta.image = getValue(node[el].url);
            break;
          case('copyright'):
            meta.copyright = getValue(node[el]);
            break;
          case('generator'):
            meta.generator = getValue(node[el]);
            break;
          case('category'):
            if (Array.isArray(node[el])) {
              node[el].forEach(function (category){
                var categories = getValue(category).trim().split(',').map(function (cat){ return cat.trim(); });
                if (categories.length) meta.categories.concat(categories);
              });
            } else {
              var categories = getValue(node[el]).trim().split(',').map(function (cat){ return cat.trim(); });
              if (categories.length) meta.categories.concat(categories);
            }
          }
        });
      }
      break;
    case 'rdf':
      if (node) {
        Object.keys(node).forEach(function(el){
          switch(el){
            case('title'):
              meta.title = getValue(node[el]);
              break;
            case('description'):
              meta.description = getValue(node[el]);
              break;
            case('link'):
              meta.link = getValue(node[el]);
              break;
            case('atom:link'):
            case('atom10:link'):
              if (Array.isArray(node[el])) {
                node[el].forEach(function(link){
                  if(link['@'] && getValue(link['@'], 'rel') == 'self')
                    meta.xmlUrl = getValue(link['@'], 'href');
                });
              } else if (node[el].constructor.name == 'Object' 
                         && node[el]['@']
                         && getValue(node[el]['@'], 'rel') == 'self') {
                meta.xmlUrl = getValue(node[el]['@'], 'href');
              }
              break;
          }
        });
      }
      break;
    }
    if (!meta.description) {
      if (node['itunes:summary']) meta.description = getValue(node['itunes:summary']);
      else if (node['tagline']) meta.description = getValue(node['tagline']);
    }
    if (getValue(node['dc:date'])) {
      var dc_date = new Date(node['dc:date']['#']);
      if (!meta.date) meta.date = dc_date;
      if (!meta.pubDate) meta.pubDate = dc_date;
    }
    if (!meta.author) {
      if (node['itunes:author']) meta.author = getValue(node['itunes:author']);
      else if (node['itunes:owner'] && node['itunes:owner']['itunes:name']) meta.author = getValue(node['itunes:owner']['itunes:name']);
      else if (node['dc:creator']) meta.author = getValue(node['dc:creator']);
      else if (node['dc:publisher']) meta.author = getValue(node['dc:publisher']);
    }
    if (!meta.language) {
      if (node['@']['xml:lang']) meta.language = getValue(node['@'], 'xml:lang');
      else if (node['dc:language']) meta.language = getValue(node['dc:language']);
    }
    if (!meta.image) {
      if (node['itunes:image']) meta.image = getValue(node['itunes:image'], 'href');
      else if (node['media:thumbnail']) meta.image = getValue(node['media:thumbnail'], 'url');
    }
    if (!meta.copyright) {
      if (node['media:copyright']) meta.copyright = getValue(node['media:copyright']);
      else if (node['dc:rights']) meta.copyright = getValue(node['dc:rights']);
      else if (node['creativecommons:license']) meta.copyright = getValue(node['creativecommons:license']);
      else if (node['cc:license'] && node['cc:license']['@']['rdf:resource']) meta.copyright = getValue(node['cc:license']['@'], 'rdf:resource');
    }
    if (!meta.generator) {
      if (node['admin:generatoragent'] && node['admin:generatoragent']['@']['rdf:resource']) meta.generator = getValue(node['admin:generatoragent']['@'], 'rdf:resource');
    }
    if (node['dc:subject']) {
      if (Array.isArray(node['dc:subject'])) {
        node['dc:subject'].forEach(function (category){
          var categories = getValue(category).trim().split(' ').map(function (cat){ return cat.trim(); });
          if (categories.length) meta.categories.concat(categories);
        });
      } else {
        var categories = getValue(node['dc:subject']).trim().split(' ').map(function (cat){ return cat.trim(); });
        if (categories.length) meta.categories.concat(categories);
      }
    }
    if (node['itunes:category']) {
      if (Array.isArray(node['itunes:category'])) {
        node['itunes:category'].forEach(function (category){
          var cat;
          if (category['@'] && getValue(category['@'], 'text')) cat = getValue(category['@'], 'text').trim();
          if (category['itunes:category']) {
            if (Array.isArray(category['itunes:category'])) {
              category['itunes:category'].forEach(function (subcategory){
                if (subcategory['@'] && getValue(subcategory['@'], 'text')) meta.categories.push(cat + '/' + getValue(subcategory['@'], 'text').trim());
              });
            } else {
              if (category['itunes:category']['@'] && getValue(category['itunes:category']['@'], 'text'))
                meta.categories.push(cat + '/' + getValue(category['itunes:category']['@'], 'text').trim());
            }
          } else {
            meta.categories.push(cat);
          }
        });
      } else {
        var cat;
        if (node['itunes:category']['@'] && getValue(node['itunes:category']['@'], 'text')) cat = getValue(node['itunes:category']['@'], 'text').trim();
        if (node['itunes:category']['itunes:category']) {
          if (Array.isArray(node['itunes:category']['itunes:category'])) {
            node['itunes:category']['itunes:category'].forEach(function (subcategory){
              if (subcategory['@'] && getValue(subcategory['@'], 'text')) meta.categories.push(cat + '/' + getValue(subcategory['@'], 'text').trim());
            });
          } else {
            if (node['itunes:category']['itunes:category']['@'] && getValue(node['itunes:category']['itunes:category']['@'], 'text'))
              meta.categories.push(cat + '/' + getValue(node['itunes:category']['itunes:category']['@'], 'text').trim());
          }
        } else {
          meta.categories.push(cat);
        }
      }
    } else if (node['media:category']) {
      if (Array.isArray(node['media:category'])) {
        node['media:category'].forEach(function (category){
          meta.categories.push(getValue(categories));
        });
      } else {
        meta.categories.push(getValue(node['media:category']));
      }
    }
    Object.keys(node).forEach(function (prop){
      if (prop.indexOf('#') !== 0) {
        if (~prop.indexOf(':')) meta[prop] = node[prop];
        else meta[type + ':' + prop] = node[prop];
      }
    });
    return meta;
  }
  
  if (self.xmlbase.length && (el == self.xmlbase[0]['#name'])) {
    void self.xmlbase.shift();
  }

  if (self.in_xhtml) {
    if (el == self.xhtml['#name']) { // The end of the XHTML
      // Add xhtml data to the container element
      n['#'] += self.xhtml['#'].trim();
        // Clear xhtml nodes from the tree
        for (var key in n) {
          if (key != 'attributes' && key != '#') {
            delete n[key];
          }
        }
      self.xhtml = {};
      self.in_xhtml = false;
    } else { // Somewhere in the middle of the XHTML
      self.xhtml['#'] += '</' + el + '>';
    }
  }

  if ('#' in n) {
    if (n['#'].match(/^\s*$/)) {
      delete n['#'];
    } else {
      n['#'] = n['#'].trim();
      if (Object.keys(n).length === 1) {
        n = n['#'];
      }
    }
  }
  
  if (el == 'item' || el == 'entry') { // We have an article!
    if (!self.meta.title) { // We haven't yet parsed all the metadata
      self.meta = handleMeta(self.stack[0], self.meta['#type']);
      self.emit('meta', self.meta);
    }
    switch(self.meta['#type']){
    case 'atom':
      var item = {};
      item.title = getValue(n.title);
      if (getValue(n.content))
        item.description = n.content['#'];
      else
        item.description = getValue(n.summary);
      item.summary = getValue(n.summary);
      if (getValue(n.updated))
        item.pubDate = new Date(n.updated['#']);
      else
        item.pubDate = getValue(n.published) ? new Date(n.published['#']) : null;
      item.link = null;
      if ( n.link ) {
        if ( n.link.length ) {
          n.link.forEach(function(link){
            if(link['@'] && (getValue(link['@'], 'rel') == 'alternate' || getValue(link['@'], 'rel') == null))
              item.link = getValue(link['@'], 'href');
          });
        } else if (n.link['@'] && (getValue(n.link['@'], 'rel') == 'alternate' || getValue(n.link['@'], 'rel') == null)) {
          item.link = getValue(n.link['@'], 'href');
        }
      }
      item.guid = getValue(n.id);
      item.meta = self.meta;
      self.emit('article', item);
      self.articles.push(item);
      break;
    case 'rss':
      var item = {};
      item.title = getValue(n.title);
      item.description = item.summary = null;
      if (getValue(n.description))
        item.description = item.summary = n.description['#'];
      if (getValue(n['content:encoded']))
        item.description = n['content:encoded']['#'];
      item.pubDate = getValue(n.pubdate) ? new Date(n.pubdate['#']) : null;
      item.link = getValue(n.link);
      item.guid = getValue(n.guid);
      item.meta = self.meta;
      self.emit('article', item);
      self.articles.push(item);
      break;
    case 'rdf':
      var item = {};
      item.title = getValue(n.title);
      item.description = item.summary = null;
      if (getValue(n.description))
        item.description = item.summary = n.description['#'];
      if (getValue(n['content:encoded']))
        item.description = n['content:encoded']['#'];
      item.pubDate = getValue(n['dc:date']) ? new Date(n['dc:date']['#']) : null;
      item.link = item.guid = getValue(n.link);
      if ( n['@'] )
        item.guid = getValue(n['@'], 'rdf:about');
      item.meta = self.meta;
      self.emit('article', item);
      self.articles.push(item);
      break;
    }
  } else if ((el == 'channel' || el == 'feed') && !self.meta.title) { // We haven't yet parsed all the metadata
    self.meta = handleMeta(n, self.meta['#type']);
    self.emit('meta', self.meta);
  }

  if (self.stack.length > 0) {
    if (!self.stack[0].hasOwnProperty(el)) {
      self.stack[0][el] = n;
    } else if (self.stack[0][el] instanceof Array) {
      self.stack[0][el].push(n);
    } else {
      self.stack[0][el] = [self.stack[0][el], n];
    }
  } else {
    self.nodes = n;
  }
};

FeedParser.prototype.handleText = function (text, scope){
  var self = scope;
  if (self.in_xhtml) {
    self.xhtml['#'] += text;
  } else {
    if (self.stack.length) {
      if ('#' in self.stack[0]) {
        self.stack[0]['#'] += text;
      } else {
        self.stack[0]['#'] = text;
      }
    }
  }
};

FeedParser.prototype._reset = function (callback) {
  this.meta = {};
  this.articles = [];
  this.stack = [];
  this.nodes = {};
  this.xmlbase = [];
  this.in_xhtml = false;
  this.xhtml = {}; /* Where to store xhtml elements as associative 
                      array with keys: '#' (containing the text)
                      and '#name' (containing the XML element name) */
  this.errors = [];
  this.callback = ('function' == typeof callback) ? callback : undefined;
}

exports = module.exports = FeedParser;