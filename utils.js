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

Array.unique = function (array){
  var a = [];
  var l = array.length;
  for(var i=0; i<l; i++) {
    for(var j=i+1; j<l; j++) {
      // If this[i] is found later in the array
      if (array[i] === array[j])
        j = ++i;
    }
    a.push(array[i]);
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
