var URL = require('url')
  , namespaces = require('./namespaces')
  ;

exports.has = require('lodash.has');
exports.assign = require('lodash.assign');
exports.uniq = require('lodash.uniq');

var _get = require('lodash.get');
/**
 * lodash.get, but wrapped to provide a default subkey (a/k/a path) of "#"
 * and defaultValue of "null"
 *
 * var obj = { '#': 'foo', 'bar': 'baz' };
 *
 * get(obj);
 * // => 'foo'
 *
 * get(obj, 'bar');
 * // => 'baz'
 *
 * @param {Object} obj
 * @param {String} [subkey="#"] By default, use the '#' key, but you may pass any key you like
 * @return Returns the value of the selected key or 'null' if undefined.
 * @private
 */
function get(obj, subkey, defaultValue) {
  if (!subkey) {
    subkey = '#';
  }

  if (!defaultValue) {
    defaultValue = null;
  }

  if (Array.isArray(obj)) {
    return _get(obj[0], subkey, defaultValue);
  }
  else {
    return _get(obj, subkey, defaultValue);
  }
}
exports.get = get;

/**
 * Safely trim a value if it's a String
 * @private
 */
function safeTrim (val) {
  if (typeof val === 'string') {
    return val.trim();
  }
  return val;
}
exports.safeTrim = safeTrim;

/*
 * Expose require('url').resolve
 * @private
 */
function resolve (baseUrl, pathUrl) {
  return URL.resolve(baseUrl, pathUrl);
}
exports.resolve = resolve;

/*
 * Check whether a given namespace URI matches the given default
 *
 * @param {String} URI
 * @param {String} default, e.g., 'atom'
 * @return {Boolean}
 * @private
 */
function nslookup (uri, def) {
  return namespaces[uri] === def;
}
exports.nslookup = nslookup;

/*
 * Return the "default" namespace prefix for a given namespace URI
 *
 * @param {String} URI
 * @return {String}
 * @private
 */
function nsprefix (uri) {
  return namespaces[uri];
}
exports.nsprefix = nsprefix;

/*
 * Walk a node and re-resolve the urls using the given baseurl
 *
 * @param {Object} node
 * @param {String} baseurl
 * @return {Object} modified node
 * @private
 */
function reresolve (node, baseurl) {
  if (!node || !baseurl) {
    return false; // Nothing to do.
  }

  function resolveLevel (level) {
    var els = Object.keys(level);
    els.forEach(function(el){
      if (Array.isArray(level[el])) {
        level[el].forEach(resolveLevel);
      } else {
        if (level[el].constructor.name === 'Object') {
          if (el == 'logo' || el == 'icon') {
            if ('#' in level[el]) {
              level[el]['#'] = URL.resolve(baseurl, level[el]['#']);
            }
          } else {
            var attrs = Object.keys(level[el]);
            attrs.forEach(function(name){
              if (name == 'href' || name == 'src' || name == 'uri') {
                if ('string' === typeof level[el][name]) {
                  level[el][name] = URL.resolve(baseurl, level[el][name]);
                }
                else if ('#' in level[el][name]) {
                  level[el][name]['#'] = URL.resolve(baseurl, level[el][name]['#']);
                }
              }
            });
          }
        }
      }
    });
    return level;
  }

  return resolveLevel(node);
}
exports.reresolve = reresolve;

/*
 * Aggressivly strip HTML tags
 * Pulled out of node-resanitize because it was all that was being used
 * and it's way lighter...
 *
 * @param {String} str
 * @private
 */
function stripHtml (str) {
  return str.replace(/<.*?>/g, '');
}

exports.stripHtml = stripHtml;
