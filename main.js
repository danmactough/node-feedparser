/**********************************************************************
 node-feedparser - A robust RSS, Atom, RDF parser for node.
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
  , EventEmitter = require('events').EventEmitter
  , utils = require('./utils')
  ;

function handleMeta (node, type) {
  if (!type || !node) return {};

  var meta = {};
  ['title','description','date', 'pubdate', 'pubDate','link', 'xmlurl', 'xmlUrl','author','language','favicon','copyright','generator'].forEach(function (property){
    meta[property] = null;
  });
  meta.image = {};
  meta.categories = [];

  Object.keys(node).forEach(function(name){
    var el = node[name];
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
      var date = utils.get(el) ? new Date(el['#']) : null;
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
              if (link['@']['rel'] == 'alternate') meta.link = link['@']['href'];
              else if (link['@']['rel'] == 'self') meta.xmlurl = meta.xmlUrl = link['@']['href'];
            } else {
              meta.link = link['@']['href'];
            }
          } else if (Object.keys(link['@']).length === 0) { // RSS
            if (!meta.link) meta.link = utils.get(link);
          }
        });
      } else {
        if (el['@']['href']) { // Atom
          if (utils.get(el['@'], 'rel')) {
            if (el['@']['rel'] == 'alternate') meta.link = el['@']['href'];
            else if (el['@']['rel'] == 'self') meta.xmlurl = meta.xmlUrl = el['@']['href'];
          } else {
            meta.link = el['@']['href'];
          }
        } else if (Object.keys(el['@']).length === 0) { // RSS
          if (!meta.link) meta.link = utils.get(el);
        }
      }
      break;
    case('managingeditor'):
    case('webmaster'):
    case('author'):
      if (meta.author === null || name == 'managingeditor')
        meta.author = utils.get(el);
      if (name == 'author')
        meta.author = utils.get(el.name) || utils.get(el.email) || utils.get(el.uri);
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
      else meta.image.url = utils.get(el);
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
      if (Array.isArray(el)) {
        el.forEach(function (category){
          if ('category' == name && 'atom' == type) {
            if (category['@'] && utils.get(category['@'], 'term')) meta.categories.push(utils.get(category['@'], 'term'));
          } else if ('category' == name && utils.get(category) && 'rss' == type) {
            var categories = utils.get(category).split(',').map(function (cat){ return cat.trim(); });
            if (categories.length) meta.categories = meta.categories.concat(categories);
          } else if ('dc:subject' == name && utils.get(category)) {
            var categories = utils.get(category).split(' ').map(function (cat){ return cat.trim(); });
            if (categories.length) meta.categories = meta.categories.concat(categories);
          } else if ('itunes:category' == name) {
            var cat;
            if (category['@'] && utils.get(category['@'], 'text')) cat = utils.get(category['@'], 'text');
            if (category[name]) {
              if (Array.isArray(category[name])) {
                category[name].forEach(function (subcategory){
                  if (subcategory['@'] && utils.get(subcategory['@'], 'text')) meta.categories.push(cat + '/' + utils.get(subcategory['@'], 'text'));
                });
              } else {
                if (category[name]['@'] && utils.get(category[name]['@'], 'text'))
                  meta.categories.push(cat + '/' + utils.get(category[name]['@'], 'text'));
              }
            } else {
              meta.categories.push(cat);
            }
          } else if ('media:category' == name) {
            meta.categories.push(utils.get(category));
          }
        });
      } else {
        if ('category' == name && 'atom' == type) {
          if (utils.get(el['@'], 'term')) meta.categories.push(utils.get(el['@'], 'term'));
        } else if ('category' == name && utils.get(el) && 'rss' == type) {
          var categories = utils.get(el).split(',').map(function (cat){ return cat.trim(); });
          if (categories.length) meta.categories = meta.categories.concat(categories);
        } else if ('dc:subject' == name && utils.get(el)) {
          var categories = utils.get(el).split(' ').map(function (cat){ return cat.trim(); });
          if (categories.length) meta.categories = meta.categories.concat(categories);
        } else if ('itunes:category' == name) {
          var cat;
          if (el['@'] && utils.get(el['@'], 'text')) cat = utils.get(el['@'], 'text');
          if (el[name]) {
            if (Array.isArray(el[name])) {
              el[name].forEach(function (subcategory){
                if (subcategory['@'] && utils.get(subcategory['@'], 'text')) meta.categories.push(cat + '/' + utils.get(subcategory['@'], 'text'));
              });
            } else {
              if (el[name]['@'] && utils.get(el[name]['@'], 'text'))
                meta.categories.push(cat + '/' + utils.get(el[name]['@'], 'text'));
            }
          } else {
            meta.categories.push(cat);
          }
        } else if ('media:category' == name) {
          meta.categories.push(utils.get(el));
        }
      }
      break;
    } // switch end
    // Fill with all native other namespaced properties
    if (name.indexOf('#') !== 0) {
      if (~name.indexOf(':')) meta[name] = el;
      else meta[type + ':' + name] = el;
    }
  }); // forEach end
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
    else if (node['media:thumbnail']) meta.image.url = utils.get(node['media:thumbnail']['@'], 'url');
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
  if (meta.categories.length)
    meta.categories = utils.unique(meta.categories);
  return meta;
}

function handleItem (node, type){
  if (!type || !node) return {};

  var item = {};
  ['title','description','summary','date','pubdate','pubDate','link','guid','author','comments', 'origlink'].forEach(function (property){
    item[property] = null;
  });
  item.image = {};
  item.source = {};
  item.categories = [];
  item.enclosures = [];

  Object.keys(node).forEach(function(name){
    var el = node[name];
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
      var date = utils.get(el) ? new Date(el['#']) : null;
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
              if (link['@']['rel'] == 'alternate') item.link = link['@']['href'];
              if (link['@']['rel'] == 'replies') item.comments = link['@']['href'];
              if (link['@']['rel'] == 'enclosure') {
                var enclosure = {};
                enclosure.url = link['@']['href'];
                enclosure.type = utils.get(link['@'], 'type');
                enclosure.length = utils.get(link['@'], 'length');
                item.enclosures.push(enclosure);
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
            if (el['@']['rel'] == 'alternate') item.link = el['@']['href'];
            if (el['@']['rel'] == 'replies') item.comments = el['@']['href'];
            if (el['@']['rel'] == 'enclosure') {
              var enclosure = {};
              enclosure.url = el['@']['href'];
              enclosure.type = utils.get(el['@'], 'type');
              enclosure.length = utils.get(el['@'], 'length');
              item.enclosures.push(enclosure);
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
      break;
    case('author'):
      item.author = utils.get(el.name) || utils.get(el.email) || utils.get(el.uri);
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
      break;
    case('enclosure'):
    case('media:content'):
      if (Array.isArray(el)) {
        el.forEach(function (enc){
          var enclosure = {};
          enclosure.url = utils.get(enc['@'], 'url');
          enclosure.type = utils.get(enc['@'], 'type') || utils.get(enc['@'], 'medium');
          enclosure.length = utils.get(enc['@'], 'length') || utils.get(enc['@'], 'filesize');
          item.enclosures.push(enclosure);
        });
      } else {
        var enclosure = {};
        enclosure.url = utils.get(el['@'], 'url');
        enclosure.type = utils.get(el['@'], 'type') || utils.get(el['@'], 'medium');
        enclosure.length = utils.get(el['@'], 'length') || utils.get(el['@'], 'filesize');
        item.enclosures.push(enclosure);
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
      if (Array.isArray(el)) {
        el.forEach(function (category){
          if ('category' == name && 'atom' == type) {
            if (category['@'] && utils.get(category['@'], 'term')) item.categories.push(utils.get(category['@'], 'term'));
          } else if ('category' == name && utils.get(category) && 'rss' == type) {
            var categories = utils.get(category).split(',').map(function (cat){ return cat.trim(); });
            if (categories.length) item.categories = item.categories.concat(categories);
          } else if ('dc:subject' == name && utils.get(category)) {
            var categories = utils.get(category).split(' ').map(function (cat){ return cat.trim(); });
            if (categories.length) item.categories = item.categories.concat(categories);
          } else if ('itunes:category' == name) {
            var cat;
            if (category['@'] && utils.get(category['@'], 'text')) cat = utils.get(category['@'], 'text');
            if (category[name]) {
              if (Array.isArray(category[name])) {
                category[name].forEach(function (subcategory){
                  if (subcategory['@'] && utils.get(subcategory['@'], 'text')) item.categories.push(cat + '/' + utils.get(subcategory['@'], 'text'));
                });
              } else {
                if (category[name]['@'] && utils.get(category[name]['@'], 'text'))
                  item.categories.push(cat + '/' + utils.get(category[name]['@'], 'text'));
              }
            } else {
              item.categories.push(cat);
            }
          } else if ('media:category' == name) {
            item.categories.push(utils.get(category));
          }
        });
      } else {
        if ('category' == name && 'atom' == type) {
          if (utils.get(el['@'], 'term')) item.categories.push(utils.get(el['@'], 'term'));
        } else if ('category' == name && utils.get(el) && 'rss' == type) {
          var categories = utils.get(el).split(',').map(function (cat){ return cat.trim(); });
          if (categories.length) item.categories = item.categories.concat(categories);
        } else if ('dc:subject' == name && utils.get(el)) {
          var categories = utils.get(el).split(' ').map(function (cat){ return cat.trim(); });
          if (categories.length) item.categories = item.categories.concat(categories);
        } else if ('itunes:category' == name) {
          var cat;
          if (el['@'] && utils.get(el['@'], 'text')) cat = utils.get(el['@'], 'text');
          if (el[name]) {
            if (Array.isArray(el[name])) {
              el[name].forEach(function (subcategory){
                if (subcategory['@'] && utils.get(subcategory['@'], 'text')) item.categories.push(cat + '/' + utils.get(subcategory['@'], 'text'));
              });
            } else {
              if (el[name]['@'] && utils.get(el[name]['@'], 'text'))
                item.categories.push(cat + '/' + utils.get(el[name]['@'], 'text'));
            }
          } else {
            item.categories.push(cat);
          }
        } else if ('media:category' == name) {
          item.categories.push(utils.get(el));
        }
      }
      break;
    case('feedburner:origlink'):
    case('pheedo:origlink'):
      item.origlink = utils.get(el);
      break;
    } // switch end
    // Fill with all native other namespaced properties
    if (name.indexOf('#') !== 0) {
      if (~name.indexOf(':')) item[name] = el;
      else item[type + ':' + name] = el;
    }
  }); // forEach end
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
    else if (node['media:thumbnail']) item.image.url = utils.get(node['media:thumbnail']['@'], 'url');
    else if (node['media:content'] && node['media:content']['media:thumbnail']) item.image.url = utils.get(node['media:content']['media:thumbnail']['@'], 'url');
    else if (node['media:group'] && node['media:group']['media:thumbnail']) item.image.url = utils.get(node['media:group']['media:thumbnail']['@'], 'url');
    else if (node['media:group'] && node['media:group']['media:content'] && node['media:group']['media:content']['media:thumbnail']) item.image.url = utils.get(node['media:group']['media:content']['media:thumbnail']['@'], 'url');
  }
  if (item.categories.length)
    item.categories = utils.unique(item.categories);
  return item;
}

/**
 * FeedParser constructor. Most apps will only use one instance.
 *
 * @api public
 */
function FeedParser () {
  var parser = this;
  parser._reset();
  parser.stream = sax.createStream(false /* strict mode - no */, {lowercase: true}); // https://github.com/isaacs/sax-js
  parser.stream.on('error', function (e){ parser.handleSaxError(e, parser) });
  parser.stream.on('opentag', function (n){ parser.handleOpenTag(n, parser) });
  parser.stream.on('closetag', function (el){ parser.handleCloseTag(el, parser) });
  parser.stream.on('text', function (text){ parser.handleText(text, parser) });
  parser.stream.on('cdata', function (text){ parser.handleText(text, parser) });
  parser.stream.on('end', function (){ parser.handleEnd(parser) });
  EventEmitter.call(parser);
}
util.inherits(FeedParser, EventEmitter);

/**
 * Parses a feed contained in a string.
 *
 * For each article/post in a feed, emits an 'article' event
 * with an object with the following keys:
 *   title {String}
 *   description {String}
 *   summary {String}
 *   date {Date} (or null)
 *   pubdate {Date} (or null)
 *   link {String}
 *   origlink {String}
 *   author {String}
 *   guid {String}
 *   comments {String}
 *   image {Object}
 *   categories {Array}
 *   source {Object}
 *   enclosures {Array}
 *   meta {Object}
 *   Object.keys(meta):
 *     #ns {Array} key,value pairs of each namespace declared for the feed
 *     #type {String} one of 'atom', 'rss', 'rdf'
 *     #version {String}
 *     title {String}
 *     description {String}
 *     date {Date} (or null)
 *     pubdate {Date} (or null)
 *     link {String} i.e., to the website, not the feed
 *     xmlurl {String} the canonical URL of the feed, as declared by the feed
 *     author {String}
 *     language {String}
 *     image {Object}
 *     favicon {String}
 *     copyright {String}
 *     generator {String}
 *     categories {Array}
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
  var parser = this;
  parser._setCallback(callback);
  parser.stream
    .end(string, 'utf8');
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
  var parser = this;
  if (/^https?:/.test(file) || (typeof file == 'object' && 'protocol' in file)) {
    parser.parseUrl(file, callback);
  } else {
    parser._setCallback(callback);
    fs.createReadStream(file)
      .on('error', function (e){ parser.handleError(e, parser); })
      .pipe(parser.stream);
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
  var parser = this;
  parser._setCallback(callback);
  request(url)
    .on('error', function (e){ parser.handleError(e, parser); })
    .pipe(parser.stream);
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
  var parser = this;
  parser._setCallback(callback);
  stream
    .on('error', function (e){ parser.handleError(e, parser); })
    .pipe(parser.stream);
};

FeedParser.prototype.handleEnd = function (scope){
  var parser = scope;

  parser.emit('end', parser.articles);

  if ('function' == typeof parser.callback) {
    if (parser.errors.length) {
      var error = parser.errors.pop();
      if (parser.errors.length) {
        error.errors = parser.errors;
      }
      parser.callback(error);
    } else {
      parser.callback(null, parser.meta, parser.articles);
    }
  }
  parser._reset();
};

FeedParser.prototype.handleSaxError = function (e, scope){
  var parser = scope;
  parser.handleError(e, parser);
  if (parser._parser) {
    parser._parser.error = null;
    parser._parser.resume();
  }
};

FeedParser.prototype.handleError = function (e, scope){
  var parser = scope;
  parser.emit('error', e);
  parser.errors.push(e);
};

FeedParser.prototype.handleOpenTag = function (node, scope){
  var parser = scope;
  var n = {};
  n['#name'] = node.name; // Avoid namespace collissions later...
  n['@'] = {};
  n['#'] = '';

  function handleAttributes (attrs, el) {
    Object.keys(attrs).forEach(function(name){
      if (parser.xmlbase.length && (name == 'href' || name == 'src' || name == 'uri')) {
        // Apply xml:base to these elements as they appear
        // rather than leaving it to the ultimate parser
        attrs[name] = url.resolve(parser.xmlbase[0]['#'], attrs[name]);
      } else if (name == 'xml:base') {
        if (parser.xmlbase.length) {
          attrs[name] = url.resolve(parser.xmlbase[0]['#'], attrs[name]);
        }
        parser.xmlbase.unshift({ '#name': el, '#': attrs[name]});
      } else if (name == 'type' && attrs['type'] == 'xhtml') {
        parser.in_xhtml = true;
        parser.xhtml = {'#name': el, '#': ''};
      }
      attrs[name] = attrs[name].trim();
    });
    return attrs;
  };

  if (Object.keys(node.attributes).length) {
    n['@'] = handleAttributes(node.attributes, n['#name']);
  }

  if (parser.in_xhtml && parser.xhtml['#name'] != n['#name']) { // We are in an xhtml node
    // This builds the opening tag, e.g., <div id='foo' class='bar'>
    parser.xhtml['#'] += '<'+n['#name'];
    Object.keys(n['@']).forEach(function(name){
      parser.xhtml['#'] += ' '+ name +'="'+ n['@'][name] + '"';
    });
    parser.xhtml['#'] += '>';
  } else if (parser.stack.length == 0 &&
            (n['#name'] == 'rss' || n['#name'] == 'rdf:rdf' || n['#name'] == 'feed')) {
    parser.meta['#ns'] = [];
    parser.meta['@'] = [];
    Object.keys(n['@']).forEach(function(name) {
      var o = {};
      o[name] = n['@'][name];
      if (name.indexOf('xmlns') == 0) {
        parser.meta['#ns'].push(o);
      } else if (name != 'version') {
        parser.meta['@'].push(o);
      }
    });
    switch(n['#name']) {
    case 'rss':
      parser.meta['#type'] = 'rss';
      parser.meta['#version'] = n['@']['version'];
      break;
    case 'rdf:rdf':
      parser.meta['#type'] = 'rdf';
      parser.meta['#version'] = n['@']['version'] || '1.0';
      break;
    case 'feed':
      parser.meta['#type'] = 'atom';
      parser.meta['#version'] = n['@']['version'] || '1.0';
      break;
    }
  }
  parser.stack.unshift(n);
};

FeedParser.prototype.handleCloseTag = function (el, scope){
  var parser = scope;
  var item;
  var n = parser.stack.shift();
  delete n['#name'];

  if (parser.xmlbase.length && (el == 'logo' || el == 'icon')) { // Via atom
    // Apply xml:base to these elements as they appear
    // rather than leaving it to the ultimate parser
    n['#'] = url.resolve(parser.xmlbase[0]['#'], n['#']);
  }

  if (parser.xmlbase.length && (el == parser.xmlbase[0]['#name'])) {
    void parser.xmlbase.shift();
  }

  if (parser.in_xhtml) {
    if (el == parser.xhtml['#name']) { // The end of the XHTML

      // Add xhtml data to the container element
      n['#'] += parser.xhtml['#'].trim();
        // Clear xhtml nodes from the tree
        for (var key in n) {
          if (key != '@' && key != '#') {
            delete n[key];
          }
        }
      parser.xhtml = {};
      parser.in_xhtml = false;
    } else { // Somewhere in the middle of the XHTML
      parser.xhtml['#'] += '</' + el + '>';
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
    if (!parser.meta.title) { // We haven't yet parsed all the metadata
      utils.merge(parser.meta, handleMeta(parser.stack[0], parser.meta['#type']));
      parser.emit('meta', parser.meta);
    }
    item = handleItem(n, parser.meta['#type']);
    item.meta = parser.meta;
    if (parser.meta.author && !item.author) item.author = parser.meta.author;
    parser.emit('article', item);
    parser.articles.push(item);
  } else if ((el == 'channel' || el == 'feed') && !parser.meta.title) { // We haven't yet parsed all the metadata
    utils.merge(parser.meta, handleMeta(n, parser.meta['#type']));
    parser.emit('meta', parser.meta);
  }

  if (parser.stack.length > 0) {
    if (!parser.stack[0].hasOwnProperty(el)) {
      parser.stack[0][el] = n;
    } else if (parser.stack[0][el] instanceof Array) {
      parser.stack[0][el].push(n);
    } else {
      parser.stack[0][el] = [parser.stack[0][el], n];
    }
  } else {
    parser.nodes = n;
  }
};

FeedParser.prototype.handleText = function (text, scope){
  var parser = scope;
  if (parser.in_xhtml) {
    parser.xhtml['#'] += text;
  } else {
    if (parser.stack.length) {
      if ('#' in parser.stack[0]) {
        parser.stack[0]['#'] += text;
      } else {
        parser.stack[0]['#'] = text;
      }
    }
  }
};

FeedParser.prototype._reset = function (){
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
  this.callback = undefined;
}

FeedParser.prototype._setCallback = function (callback){
  this.callback = ('function' == typeof callback) ? callback : undefined;
}

exports = module.exports = FeedParser;
