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

// **************************************************************************
// Copyright 2007 - 2009 Tavs Dokkedahl
// Contact: http://www.jslab.dk/contact.php
//
// This file is part of the JSLab Standard Library (JSL) Program.
//
// JSL is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or
// any later version.
//
// JSL is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.
// ***************************************************************************

// Return new array with duplicate values removed
Array.prototype.unique =
  function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
          j = ++i;
      }
      a.push(this[i]);
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
