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
      if (self.xmlbase.length && (name == 'href' || name == 'src')) {
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
      // Set all the meta keys to null
      self.meta.title = self.meta.description = self.meta.pubDate = self.meta.link = self.meta.xmlUrl 
        = null;
      switch(self.meta['#type']){
      case 'atom':
        self.meta.title = getValue(self.stack[0].title)
        self.meta.description = getValue(self.stack[0].subtitle);
        self.meta.pubDate = getValue(self.stack[0].updated) ? new Date(self.stack[0].updated['#']) : null;
        if ( self.stack[0].link && self.stack[0].link.length ) {
          self.stack[0].link.forEach(function(link){
            if (link['@'] && link['@']['rel'] && link['@']['href'])
            switch(link['@']['rel']){
              case('alternate'):
                self.meta.link = link['@']['href'];
                break;
              case('self'):
                self.meta.xmlUrl = link['@']['href'];
                break;
            };
          });
        }
        break;
      case 'rss':
        if (self.stack[0].title) {
          Object.keys(self.stack[0]).forEach(function(el){
            switch(el){
            case('title'):
              self.meta.title = getValue(self.stack[0][el]);
              break;
            case('description'):
              self.meta.description = getValue(self.stack[0][el]);
              break;
            case('pubdate'):
            case('lastbuilddate'):
              if (self.meta.pubDate === null || el == 'pubdate')
                self.meta.pubDate = getValue(self.stack[0][el]) ? new Date(self.stack[0][el]['#']) : null;
              break;
            case('link'):
              self.meta.link = getValue(self.stack[0][el]);
              break;
            case('atom:link'):
              if (Array.isArray(self.stack[0][el])) {
                self.stack[0][el].forEach(function(link){
                  if(link['@'] && getValue(link['@'], 'rel') == 'self')
                    self.meta.xmlUrl = getValue(link['@'], 'href');
                });
              } else if (self.stack[0][el].constructor.name == 'Object' 
                         && self.stack[0][el]['@']
                         && getValue(self.stack[0][el]['@'], 'rel') == 'self') {
                self.meta.xmlUrl = getValue(self.stack[0][el]['@'], 'href');
              }
              break;
            }
          });
        }
        break;
      case 'rdf':
        if (self.stack[0].channel) {
          Object.keys(self.stack[0].channel).forEach(function(el){
            switch(el){
              case('title'):
                self.meta.title = getValue(self.stack[0].channel[el]);
                break;
              case('description'):
                self.meta.description = getValue(self.stack[0].channel[el]);
                break;
              case('dc:date'):
                self.meta.pubDate = getValue(self.stack[0].channel[el]) ? new Date(self.stack[0].channel[el]['#']) : null;
                break;
              case('link'):
                self.meta.link = getValue(self.stack[0].channel[el]);
                break;
              case('atom:link'):
                if (Array.isArray(self.stack[0].channel[el])) {
                  self.stack[0].channel[el].forEach(function(link){
                    if(link['@'] && getValue(link['@'], 'rel') == 'self')
                      self.meta.xmlUrl = getValue(link['@'], 'href');
                  });
                } else if (self.stack[0].channel[el].constructor.name == 'Object' 
                           && self.stack[0].channel[el]['@']
                           && getValue(self.stack[0].channel[el]['@'], 'rel') == 'self') {
                  self.meta.xmlUrl = getValue(self.stack[0].channel[el]['@'], 'href');
                }
                break;
            }
          });
        }
        break;
      }
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
            if(link['@'] && getValue(link['@'], 'rel') == 'alternate')
              item.link = getValue(link['@'], 'href');
          });
        } else if (n.link['@'] && getValue(n.link['@'], 'rel') == 'alternate') {
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
    // Set all the meta keys to null
    self.meta.title = self.meta.description = self.meta.pubDate = self.meta.link = self.meta.xmlUrl 
      = null;
    switch(self.meta['#type']){
    case 'atom':
      self.meta.title = getValue(n.title)
      self.meta.description = getValue(n.subtitle);
      self.meta.pubDate = getValue(n.updated) ? new Date(n.updated['#']) : null;
      if ( n.link && n.link.length ) {
        n.link.forEach(function(link){
          if (link['@'] && link['@']['rel'] && link['@']['href'])
          switch(link['@']['rel']){
            case('alternate'):
              self.meta.link = link['@']['href'];
              break;
            case('self'):
              self.meta.xmlUrl = link['@']['href'];
              break;
          };
        });
      }
      break;
    case 'rss':
      if (n.title) {
        Object.keys(n).forEach(function(el){
          switch(el){
          case('title'):
            self.meta.title = getValue(n[el]);
            break;
          case('description'):
            self.meta.description = getValue(n[el]);
            break;
          case('pubdate'):
          case('lastbuilddate'):
            if (self.meta.pubDate === null || el == 'pubdate')
              self.meta.pubDate = getValue(n[el]) ? new Date(n[el]['#']) : null;
            break;
          case('link'):
            self.meta.link = getValue(n[el]);
            break;
          case('atom:link'):
            if (Array.isArray(n[el])) {
              n[el].forEach(function(link){
                if(link['@'] && getValue(link['@'], 'rel') == 'self')
                  self.meta.xmlUrl = getValue(link['@'], 'href');
              });
            } else if (n[el].constructor.name == 'Object' 
                       && n[el]['@']
                       && getValue(n[el]['@'], 'rel') == 'self') {
              self.meta.xmlUrl = getValue(n[el]['@'], 'href');
            }
            break;
          }
        });
      }
      break;
    case 'rdf':
      if (n.title) {
        Object.keys(n).forEach(function(el){
          switch(el){
            case('title'):
              self.meta.title = getValue(n[el]);
              break;
            case('description'):
              self.meta.description = getValue(n[el]);
              break;
            case('dc:date'):
              self.meta.pubDate = getValue(n[el]) ? new Date(n[el]['#']) : null;
              break;
            case('link'):
              self.meta.link = getValue(n[el]);
              break;
            case('atom:link'):
              if (Array.isArray(n[el])) {
                n[el].forEach(function(link){
                  if(link['@'] && getValue(link['@'], 'rel') == 'self')
                    self.meta.xmlUrl = getValue(link['@'], 'href');
                });
              } else if (n[el].constructor.name == 'Object' 
                         && n[el]['@']
                         && getValue(n[el]['@'], 'rel') == 'self') {
                self.meta.xmlUrl = getValue(n[el]['@'], 'href');
              }
              break;
          }
        });
      }
      break;
    }
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