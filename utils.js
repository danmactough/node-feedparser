
/**
 * Module dependencies.
 */
var URL = require('url')
  , NS = require('./namespaces')
  ;


/**
 * Safe hasOwnProperty
 * See: http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/
 */
function has (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
exports.has = has;

/**
 * Merge object b with object a.
 *
 * var a = { foo: 'bar' }
 *   , b = { foo: 'quux', bar: 'baz' };
 *
 * merge(a, b);
 * // => { foo: 'quux', bar: 'baz' }
 *
 * merge(a, b, true);
 * // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @param {Boolean} [noforce] Optionally, don't overwrite any existing keys in a found in b
 * @return {Object}
 */
function merge (a, b, noforce) {
  if (a && b && a === Object(a) && b === Object(b)) {
    for (var key in b) {
      if (has(b, key)) {
        if (noforce) {
          if (!a.hasOwnProperty(key)) a[key] = b[key];
        } else {
          a[key] = b[key];
        }
      }
    }
  }
  return a;
}
exports.merge = merge;

/**
 * Create an array containing the unique members of an array.
 *
 * var array = ['a', 'b', 1, 2, 'a', 3 ];
 *
 * unique(array);
 * // => ['b', 1, 2, 'a', 3 ]
 *
 * @param {Array} array
 * @return {Array}
 */
function unique (array) {
  var a = [];
  var l = array.length;
  for (var i=0; i<l; i++) {
    for (var j=i+1; j<l; j++) {
      // If array[i] is found later in the array
      if (array[i] === array[j])
        j = ++i;
    }
    a.push(array[i]);
  }
  return a;
}
exports.unique = unique;

/**
 * Utility function to test for and extract a subkey.
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
 */
function get(obj, subkey) {
  if (!subkey)
    subkey = '#';

  if (Array.isArray(obj))
    obj = obj[0];

  if (obj && obj[subkey])
    return obj[subkey];
  else
    return null;
}
exports.get = get;

/**
 * Safely trim a value if it's a String
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
 */
function nslookup (uri, def) {
  return NS[uri] === def;
}
exports.nslookup = nslookup;

/*
 * Return the "default" namespace prefix for a given namespace URI
 *
 * @param {String} URI
 * @return {String}
 */
function nsprefix (uri) {
  return NS[uri];
}
exports.nsprefix = nsprefix;

/*
 * Walk a node and re-resolve the urls using the given baseurl
 *
 * @param {Object} node
 * @param {String} baseurl
 * @return {Object} modified node
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
*/

function stripHtml (str) {
    return str.replace(/<.*?>/g, '');
}

exports.stripHtml = stripHtml;
