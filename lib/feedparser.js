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

var meta = {}
  , articles = []
  , stack = []
  , nodes = {}
  , xmlbase = []
  , in_xhtml = false
  , xhtml = {};
                /* Where to store xhtml elements as associative 
                   array with keys: '#' (containing the text)
                   and '#name' (containing the XML element name) */

/**
 * FeedParser constructor. Most apps will only use one instance.
 *
 * @api public
 */
function FeedParser () {
  var self = this;
  this.saxStream = require('sax').createStream(false, {lowercasetags: true}); // https://github.com/isaacs/sax-js
  this.saxStream.on('error', function (e) { self.handleError(e, self) });
  this.saxStream.on('opentag', function (n) { self.handleOpenTag(n, self) });
  this.saxStream.on('closetag', function (el) { self.handleCloseTag(el, self) });
  this.saxStream.on('text', function (text) { self.handleText(text, self) });
  this.saxStream.on('cdata', function (text) { self.handleText(text, self) });
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
  this.saxStream.on('end', function () { 
    if (articles.length) {
      self.emit('end', articles);
      self.emit('done', articles); // deprecated
    }
    if ('function' == typeof callback) {
      callback(meta, articles);
    }
  });
  this.saxStream.end(string, 'utf8');
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
  self.saxStream.on('end', function () { 
    if (articles.length) {
      self.emit('end', articles);
      self.emit('done', articles); // deprecated
    }
    if ('function' == typeof callback) {
      callback(meta, articles);
    }
  });
  if (/^https?:/.test(file) || (typeof file == 'object' && 'protocol' in file)) {
    self.parseUrl(file, callback);
  } else {
    fs.createReadStream(file).pipe(this.saxStream);
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
  self.saxStream.on('end', function () { 
    if (articles.length) {
      self.emit('end', articles);
      self.emit('done', articles); // deprecated
    }
    if ('function' == typeof callback) {
      callback(meta, articles);
    }
  });
  request(url).pipe(this.saxStream);
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
  self.saxStream.on('end', function () { 
    if (articles.length) {
      self.emit('end', articles);
      self.emit('done', articles); // deprecated
    }
    if ('function' == typeof callback) {
      callback(meta, articles);
    }
  });
  stream.pipe(this.saxStream);
};

FeedParser.prototype.handleError = function (e, scope){
  var self = scope;
  self.emit('error', e);
  self._parser.error = null;
  self._parser.resume();
};

FeedParser.prototype.handleOpenTag = function (node, scope){
  var n = {};
  n['#name'] = node.name; // Avoid namespace collissions later...
  n['@'] = {};
  n['#'] = '';

  function handleAttributes (attrs, el) {
    Object.keys(attrs).forEach(function(name){
      if (xmlbase.length && (name == 'href' || name == 'src')) {
        // Apply xml:base to these elements as they appear
        // rather than leaving it to the ultimate parser
        attrs[name] = url.resolve(xmlbase[0]['#'], attrs[name]);
      } else if (name == 'xml:base') {
        if (xmlbase.length) {
          attrs[name] = url.resolve(xmlbase[0]['#'], attrs[name]);
        }
        xmlbase.unshift({ '#name': el, '#': attrs[name]});
      } else if (name == 'type' && attrs['type'] == 'xhtml') {
        in_xhtml = true;
        xhtml = {'#name': el, '#': ''};
      }
      attrs[name] = attrs[name].trim();
    });
    return attrs;
  };

  if (Object.keys(node.attributes).length) {
    n['@'] = handleAttributes(node.attributes, n['#name']);
  }

  if (in_xhtml) { // We are in an xhtml node
    // This builds the opening tag, e.g., <div id='foo' class='bar'>
    xhtml['#'] += '<'+n['#name'];
    Object.keys(n['@']).forEach(function(name){
      xhtml['#'] += ' '+ name +'="'+ n['@'][name] + '"';
    });
    xhtml['#'] += '>';
  } else if (stack.length == 0 && 
            (n['#name'] == 'rss' || n['#name'] == 'rdf:rdf' || n['#name'] == 'feed')) {
    meta['#ns'] = [];
    Object.keys(n['@']).forEach(function(name) {
      if (name.indexOf('xmlns') == 0) {
        var o = new Object;
        o[name] = n['@'][name];
        meta['#ns'].push(o);
      }
    });
    switch(n['#name']) {
    case 'rss':
      meta['#type'] = 'rss';
      meta['#version'] = n['@']['version'];
      break;
    case 'rdf:rdf':
      meta['#type'] = 'rdf';
      meta['#version'] = n['@']['version'] || '1.0';
      break;
    case 'feed':
      meta['#type'] = 'atom';
      meta['#version'] = n['@']['version'] || '1.0';
      break;
    }
  }
  stack.unshift(n);
};

FeedParser.prototype.handleCloseTag = function (el, scope){
  var self = scope;
  var n = stack.shift();
  delete n['#name'];

  if (xmlbase.length && (el == xmlbase[0]['#name'])) {
    void xmlbase.shift();
  }

  if (in_xhtml) {
    if (el == xhtml['#name']) { // The end of the XHTML
      // Add xhtml data to the container element
      n['#'] += xhtml['#'].trim();
        // Clear xhtml nodes from the tree
        for (var key in n) {
          if (key != 'attributes' && key != '#') {
            delete n[key];
          }
        }
      xhtml = {};
      in_xhtml = false;
    } else { // Somewhere in the middle of the XHTML
      xhtml['#'] += '</' + el + '>';
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
    if (!meta.title) { // We haven't yet parsed all the metadata
      // Set all the meta keys to null
      meta.title = meta.description = meta.pubDate = meta.link = meta.xmlUrl 
        = null;
      switch(meta['#type']){
      case 'atom':
        meta.title = getValue(stack[0].title)
        meta.description = getValue(stack[0].subtitle);
        meta.pubDate = getValue(stack[0].updated) ? new Date(stack[0].updated['#']) : null;
        if ( stack[0].link && stack[0].link.length ) {
          stack[0].link.forEach(function(link){
            if (link['@'] && link['@']['rel'] && link['@']['href'])
            switch(link['@']['rel']){
              case('alternate'):
                meta.link = link['@']['href'];
                break;
              case('self'):
                meta.xmlUrl = link['@']['href'];
                break;
            };
          });
        }
        break;
      case 'rss':
        if (stack[0].title) {
          Object.keys(stack[0]).forEach(function(el){
            switch(el){
            case('title'):
              meta.title = getValue(stack[0][el]);
              break;
            case('description'):
              meta.description = getValue(stack[0][el]);
              break;
            case('pubdate'):
            case('lastbuilddate'):
              if (meta.pubDate === null || el == 'pubdate')
                meta.pubDate = getValue(stack[0][el]) ? new Date(stack[0][el]['#']) : null;
              break;
            case('link'):
              meta.link = getValue(stack[0][el]);
              break;
            case('atom:link'):
              if (Array.isArray(stack[0][el])) {
                stack[0][el].forEach(function(link){
                  if(link['@'] && getValue(link['@'], 'rel') == 'self')
                    meta.xmlUrl = getValue(link['@'], 'href');
                });
              } else if (stack[0][el].constructor.name == 'Object' 
                         && stack[0][el]['@']
                         && getValue(stack[0][el]['@'], 'rel') == 'self') {
                meta.xmlUrl = getValue(stack[0][el]['@'], 'href');
              }
              break;
            }
          });
        }
        break;
      case 'rdf':
        if (stack[0].channel) {
          Object.keys(stack[0].channel).forEach(function(el){
            switch(el){
              case('title'):
                meta.title = getValue(stack[0].channel[el]);
                break;
              case('description'):
                meta.description = getValue(stack[0].channel[el]);
                break;
              case('dc:date'):
                meta.pubDate = getValue(stack[0].channel[el]) ? new Date(stack[0].channel[el]['#']) : null;
                break;
              case('link'):
                meta.link = getValue(stack[0].channel[el]);
                break;
              case('atom:link'):
                if (Array.isArray(stack[0].channel[el])) {
                  stack[0].channel[el].forEach(function(link){
                    if(link['@'] && getValue(link['@'], 'rel') == 'self')
                      meta.xmlUrl = getValue(link['@'], 'href');
                  });
                } else if (stack[0].channel[el].constructor.name == 'Object' 
                           && stack[0].channel[el]['@']
                           && getValue(stack[0].channel[el]['@'], 'rel') == 'self') {
                  meta.xmlUrl = getValue(stack[0].channel[el]['@'], 'href');
                }
                break;
            }
          });
        }
        break;
      }
      self.emit('meta', meta);
    }
    switch(meta['#type']){
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
            if(link['@'] && getValue(link['@'], 'rel') == 'alternate')
              item.link = getValue(link['@'], 'href');
          });
        } else if (n.link['@'] && getValue(n.link['@'], 'rel') == 'alternate') {
          item.link = getValue(n.link['@'], 'href');
        }
      }
      item.guid = getValue(n.id);
      item.meta = meta;
      self.emit('article', item);
      articles.push(item);
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
      item.meta = meta;
      self.emit('article', item);
      articles.push(item);
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
      item.meta = meta;
      self.emit('article', item);
      articles.push(item);
      break;
    }
  }

  if (stack.length > 0) {
    if (!stack[0].hasOwnProperty(el)) {
      stack[0][el] = n;
    } else if (stack[0][el] instanceof Array) {
      stack[0][el].push(n);
    } else {
      stack[0][el] = [stack[0][el], n];
    }
  } else {
    nodes = n;
  }
};

FeedParser.prototype.handleText = function (text, scope){
  var self = scope;
  if (in_xhtml) {
    xhtml['#'] += text;
  } else {
    if (stack.length) {
      if ('#' in stack[0]) {
        stack[0]['#'] += text;
      } else {
        stack[0]['#'] = text;
      }
    }
  }
};

exports = module.exports = FeedParser;