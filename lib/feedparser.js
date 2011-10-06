/**********************************************************************
 node-feedparser - Really Simple RSS, a robust RSS, Atom, RDF parser for node.
 http://github.com/danmactough/node-feedparser
 Copyright (c) 2011 Dan MacTough
  http://yabfog.com

**********************************************************************/

/**
 * Module dependencies.
 */
var xml = require('libxmljs')
  , fs = require('fs')
  , url = require('url')
  , util = require('util')
  , events = require('events')

// Ensures we have .trim() to strip leading and trailing whitespace from any string
if (!String.prototype.trim) {
  String.prototype.trim = function() {
    str = this.replace(/^\s\s*/, '');
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
FeedParser.prototype.parseString = function _parseString (string, callback) {
  var self = this;
  function cb(meta, articles) {
    if (articles.length) {
      articles.forEach(function(article){
        self.emit('article', article);
      });
      self.emit('done', articles);
    }
    // @TODO handle errors and warnings
    if ('function' == typeof callback) {
      callback(meta, articles);
    }
  }
  _SaxParser(self, cb).parseString(string);
};

/**
 * Parses a feed from a file.
 * See parseString for more info.
 *
 * @param {String} path to the feed file
 * @param {Function} callback
 * @api public
 */

FeedParser.prototype.parseFile = function _parseFile (file, callback) {
  var self = this;
  fs.readFile(file, 'utf8', function(err, data){
    if (err) {
      self.emit('error', err);
    } else {
      _parseString(data, callback);
    }
  });

exports = module.exports = FeedParser;

/**
 * Invokes libxmljs.SaxParser and parses a feed from a file or string.
 *
 * @param {Function} parser callback
 * @api private
 */
var _SaxParser = function(scope, callback) {
  var parent = scope;
  var parser = new xml.SaxParser(function(cb) {
    var meta = {};
    var articles = Array();
    var stack = Array();
    var nodes = {};
    var xmlbase = Array();
    var in_xhtml = false;
    var xhtml = {}; /* Where to store xhtml elements as associative 
                       array with keys: '#' (containing the text)
                       and '#name' (containing the XML element name) */
    
    function processAttributes(attrs) {
      var out = {};
      for(var i = 0, length = attrs.length; i < length; i++) {
        // key, prefix, uri, value
        var attr = attrs[i];
        if ( xmlbase.length && (attr[0] == 'href' || attr[0] == 'src') ) {
          // Apply xml:base to these elements as they appear
          // rather than leaving it to the ultimate parser
          attr[3] = url.resolve( xmlbase[0]['#'], attr[3] );
        }
        out[ ( attr[1] ? attr[1].toLowerCase() + ':' : '' ) + attr[0]] = attr[3].trim();
      }
      return out;
    }

    cb.onStartDocument(function() { });

    // when finished parsing the RSS feed, trigger the callback
    cb.onEndDocument(function() {
      // Set all the meta keys to null
      meta.title = meta.description = meta.pubDate = meta.link = meta.xmlUrl 
        = null;
      switch(meta['#type']){
      case 'atom':
        meta.title = getValue(nodes.title)
        meta.description = getValue(nodes.subtitle);
        meta.pubDate = getValue(nodes.updated) ? new Date(nodes.updated['#']) : null;
        if ( nodes.link.length ) {
          nodes.link.forEach(function(link){
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
        if ( nodes.entry && nodes.entry.length ) {
          nodes.entry.forEach(function(entry){
            var item = {};
            item.title = getValue(entry.title);
            if (getValue(entry.content))
              item.description = entry.content['#'];
            else
              item.description = getValue(entry.summary);
            item.summary = getValue(entry.summary);
            if (getValue(entry.updated))
              item.pubDate = new Date(entry.updated['#']);
            else
              item.pubDate = getValue(entry.published) ? new Date(entry.published['#']) : null;
            item.link = null;
            if ( entry.link ) {
              if ( entry.link.length ) {
                entry.link.forEach(function(link){
                  if(link['@'] && getValue(link['@'], 'rel') == 'alternate')
                    item.link = getValue(link['@'], 'href');
                });
              } else if (entry.link['@'] && getValue(entry.link['@'], 'rel') == 'alternate') {
                item.link = getValue(entry.link['@'], 'href');
              }
            }
            item.guid = getValue(entry.id);
            item.meta = meta;
            articles.push(item);
          });
        }
        break;
      case 'rss':
        if ( nodes.channel ) {
          Object.keys(nodes.channel).forEach(function(el){
            switch(el){
              case('title'):
                meta.title = getValue(nodes.channel[el]);
                break;
              case('description'):
                meta.description = getValue(nodes.channel[el]);
                break;
              case('pubdate'):
              case('lastbuilddate'):
                if (meta.pubDate === null || el == 'pubdate')
                  meta.pubDate = getValue(nodes.channel[el]) ? new Date(nodes.channel[el]['#']) : null;
                break;
              case('link'):
                meta.link = getValue(nodes.channel[el]);
                break;
              case('atom:link'):
                if (Array.isArray(nodes.channel[el])) {
                  nodes.channel[el].forEach(function(link){
                    if(link['@'] && getValue(link['@'], 'rel') == 'self')
                      meta.xmlUrl = getValue(link['@'], 'href');
                  });
                } else if (nodes.channel[el].constructor.name == 'Object' 
                           && nodes.channel[el]['@']
                           && getValue(nodes.channel[el]['@'], 'rel') == 'self') {
                  meta.xmlUrl = getValue(nodes.channel[el]['@'], 'href');
                }
                break;
            }
          });
        }
        if ( nodes.channel && nodes.channel.item && nodes.channel.item.length ) {
          nodes.channel.item.forEach(function(entry){
            var item = {};
            item.title = getValue(entry.title);
            item.description = item.summary = null;
            if (getValue(entry.description))
              item.description = item.summary = entry.description['#'];
            if (getValue(entry['content:encoded']))
              item.description = entry['content:encoded']['#'];
            item.pubDate = getValue(entry.pubdate) ? new Date(entry.pubdate['#']) : null;
            item.link = getValue(entry.link);
            item.guid = getValue(entry.guid);
            item.meta = meta;
            articles.push(item);
          });
        }
        break;
      case 'rdf':
        if ( nodes.channel ) {
          Object.keys(nodes.channel).forEach(function(el){
            switch(el){
              case('title'):
                meta.title = getValue(nodes.channel[el]);
                break;
              case('description'):
                meta.description = getValue(nodes.channel[el]);
                break;
              case('dc:date'):
                meta.pubDate = getValue(nodes.channel[el]) ? new Date(nodes.channel[el]['#']) : null;
                break;
              case('link'):
                meta.link = getValue(nodes.channel[el]);
                break;
              case('atom:link'):
                if (Array.isArray(nodes.channel[el])) {
                  nodes.channel[el].forEach(function(link){
                    if(link['@'] && getValue(link['@'], 'rel') == 'self')
                      meta.xmlUrl = getValue(link['@'], 'href');
                  });
                } else if (nodes.channel[el].constructor.name == 'Object' 
                           && nodes.channel[el]['@']
                           && getValue(nodes.channel[el]['@'], 'rel') == 'self') {
                  meta.xmlUrl = getValue(nodes.channel[el]['@'], 'href');
                }
                break;
            }
          });
        }
        if ( nodes.item && nodes.item.length ) {
          nodes.item.forEach(function(entry){
            var item = {};
            item.title = getValue(entry.title);
            item.description = item.summary = null;
            if (getValue(entry.description))
              item.description = item.summary = entry.description['#'];
            if (getValue(entry['content:encoded']))
              item.description = entry['content:encoded']['#'];
            item.pubDate = getValue(entry['dc:date']) ? new Date(entry['dc:date']['#']) : null;
            item.link = item.guid = getValue(entry.link);
            if ( entry['@'] )
              item.guid = getValue(entry['@'], 'rdf:about');
            item.meta = meta;
            articles.push(item);
          });
        }
        break;
      };
      callback(meta, articles);
    });

    //track what element we are currently in. If it is an <item> this is
    // an article, add container array to the list of articles
    cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
      var el = ( prefix ? prefix.toLowerCase() + ':' : '' ) + elem.toLowerCase()
        , attrs = processAttributes(attrs)
        , node = {};
      if (in_xhtml) {
        xhtml['#'] += '<'+el;
        if (Object.keys(attrs).length) {
          for (var name in attrs) {
            xhtml['#'] += ' '+ name +'="'+ attrs[name] + '"';
          }
        }
        xhtml['#'] += '>';
      }
      node['#'] = ''; // text
      node['@'] = attrs; // attributes
      node['#name'] = el; // element name
        
      if (stack.length == 0 && (el == 'rss' || el == 'rdf:rdf' || el == 'feed')) {
        meta['#ns'] = namespaces.map(function(ns) {
          var o = new Object;
          o[ns[0]] = ns[1];
          return o;
        });
        switch(el) {
        case 'rss':
          meta['#type'] = 'rss';
          meta['#version'] = attrs['version'];
          break;
        case 'rdf:rdf':
          meta['#type'] = 'rdf';
          meta['#version'] = attrs['version'] || '1.0';
          break;
        case 'feed':
          meta['#type'] = 'atom';
          meta['#version'] = attrs['version'] || '1.0';
          break;
      }
      }
      for (var name in attrs) {
        var value;
        if (name == 'xml:base') {
          if (xmlbase.length) {
            value = url.resolve( xmlbase[0]['#'], attrs[name] );
          }
          xmlbase.unshift({ '#name': el, '#': ( value || attrs[name] ) });
        }
      }
      if (attrs['type'] == 'xhtml' || attrs['type'] == 'html') {
        in_xhtml = true;
        xhtml['#name'] = el;
        xhtml['#'] = '';
      }
      stack.push(node);
    });
    
    // when we are at the end of an element, save its related content
    cb.onEndElementNS(function(elem, prefix, uri) {
      var node, old, nodeName, s;
      node = stack.pop();
      nodeName = node['#name'];
      delete node['#name'];
      s = stack[stack.length - 1];
      if (xmlbase.length && nodeName == xmlbase[0]['#name']) {
        void xmlbase.shift();
      }
      if (in_xhtml) {
        if (nodeName == xhtml['#name']) { // The end of the XHTML
        // Add xhtml data to the container element
        node['#'] += xhtml['#'].trim();
        // Clear xhtml nodes from the tree
        for (var name in node) {
          if (name != '@' && name != '#') {
            delete node[name];
          }
        }
        xhtml = {};
        in_xhtml = false;
        } else { // Somewhere in the middle of the XHTML
        xhtml['#'] += '</' + nodeName + '>';
        }
      }
      if (node['#'].match(/^\s*$/)) {
        delete node['#'];
      } else {
        node['#'] = node['#'].trim();
        if (Object.keys(node).length === 1 && node.hasOwnProperty('#')) {
          node = node['#'];
        }
      }
      if (stack.length > 0) {
        if (!s.hasOwnProperty(nodeName)) {
          s[nodeName] = node;
          stack.pop()
          stack.push(s);
        } else if (s[nodeName] instanceof Array) {
          s[nodeName].push(node);
          stack.pop()
          stack.push(s)
        } else {
          old = s[nodeName];
          s[nodeName] = [old];
            s[nodeName].push(node);
            stack.pop();
            stack.push(s);
        }
      } else {
        nodes = node;
      }
    });

    cb.onCharacters(addContent);
    cb.onCdata(addContent);
    
    function addContent(chars) {
      if (in_xhtml) {
        xhtml['#'] += chars;
      } else {
        stack[stack.length - 1]['#'] += chars;
      }
    };

    cb.onWarning(function(msg) {
      parent.emit('warning', msg);
    });

    cb.onError(function(msg) {
      parent.emit('error', msg);
    });
  });

  return parser;
}

