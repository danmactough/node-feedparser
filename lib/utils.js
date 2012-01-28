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

/**
 * Adapted from
 * Connect - utils
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 * 
 * Merge object b with object a.
 *
 * var a = { foo: 'bar' }
 * , b = { foo: 'quux', bar: 'baz' };
 *
 * Object.merge(a, b);
 * // => { foo: 'bar', bar: 'baz' }
 *
 * Object.merge(a, b, true);
 * // => { foo: 'quux', bar: 'baz' }
 * 
 * @param {Object} a
 * @param {Object} b
 * @param {Boolean} [force] Optionally, overwrite any existing keys in a found in b
 * @return {Object}
 */
if(!Object.merge) Object.merge = function(a, b, force){
  if (a && b) {
    if (a !== Object(a) || b !== Object(b)) {
      throw new TypeError('Object.merge called on non-object');
    }
    for (var key in b) {
      if(force || !a.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
};

// Utility function to test for and extract a subkey
function getValue(obj, subkey) {
  if (!subkey)
    subkey = '#';
  if (obj && obj[subkey])
    return obj[subkey];
  else
    return null;
}
exports.getValue = getValue;
