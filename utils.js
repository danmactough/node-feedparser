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
      if (noforce) {
        if (!a.hasOwnProperty(key)) a[key] = b[key];
      } else {
        a[key] = b[key]
      }
    }
  }
  return a;
};
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
};
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
