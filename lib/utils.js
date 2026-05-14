var WHATWGURL = require('url').URL
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
 * @param {string} [subkey="#"] By default, use the '#' key, but you may pass any key you like
 * @param {*} [defaultValue=null]
 * @returns {*} The value of the selected key, or null if undefined.
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
 * @param {*} val
 * @returns {*}
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
 * Resolve a URL against a base URL, returning the original pathUrl if
 * either parameter isn't provided or if the URL is not resolvable (e.g.
 * tag: URIs and other non-http schemes that the URL constructor rejects).
 * @param {string} baseUrl
 * @param {string} pathUrl
 * @returns {string}
 * @private
 */
function resolve (baseUrl, pathUrl) {
  if (!baseUrl || !pathUrl) return pathUrl;
  try {
    return new WHATWGURL(pathUrl, baseUrl).href;
  } catch (e) {
    return pathUrl;
  }
}
exports.resolve = resolve;

/*
 * Check whether a given uri is an absolute URL
 * @param {string} uri
 * @returns {boolean}
 * @private
 */
function isAbsoluteUrl (uri) {
  if (!uri || typeof uri !== 'string') return false;
  try {
    return Boolean(new WHATWGURL(uri).host);
  } catch (e) {
    return false;
  }
}
exports.isAbsoluteUrl = isAbsoluteUrl;

/*
 * Check whether a given namespace URI matches the given default
 *
 * @param {string} uri
 * @param {string} def - e.g., 'atom'
 * @returns {boolean}
 * @private
 */
function nslookup (uri, def) {
  return namespaces[uri] === def;
}
exports.nslookup = nslookup;

/*
 * Return the "default" namespace prefix for a given namespace URI
 *
 * @param {string} uri
 * @returns {string}
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
 * @param {string} baseurl
 * @returns {Object|false} modified node, or false if no node or baseurl
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
        // The shape of the array of element items is different than if the element is not an array.
        // We need it to be the same shape to enable using the same function for recursion.
        var levelFromArray = {};
        level[el].forEach(function (attrs) {
          levelFromArray[el] = attrs;
          resolveLevel(levelFromArray);
        });
      } else {
        if (level[el].constructor.name === 'Object') {
          if (el == 'logo' || el == 'icon' || el == 'link') {
            if ('#' in level[el]) {
              level[el]['#'] = resolve(baseurl, level[el]['#']);
            }
          } else if (el == 'image') {
            if ('url' in level[el] && level[el]['url'].constructor.name === 'Object' && '#' in level[el]['url']) {
              level[el]['url']['#'] = resolve(baseurl, level[el]['url']['#']);
            }
            if ('link' in level[el] && level[el]['link'].constructor.name === 'Object' && '#' in level[el]['link']) {
              level[el]['link']['#'] = resolve(baseurl, level[el]['link']['#']);
            }
          }
          if ('@' in level[el]) {
            var attrs = Object.keys(level[el]['@']);
            attrs.forEach(function (name) {
              if (name == 'href' || name == 'src' || name == 'uri') {
                if ('string' === typeof level[el]['@'][name]) {
                  level[el]['@'][name] = resolve(baseurl, level[el]['@'][name]);
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

var HTML_TAGS = new Set([
  'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio',
  'b', 'base', 'basefont', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button',
  'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
  'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt',
  'em', 'embed',
  'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
  'i', 'iframe', 'img', 'input', 'ins', 'isindex',
  'kbd',
  'label', 'legend', 'li', 'link', 'listing',
  'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'multicol',
  'nav', 'nextid', 'nobr', 'noembed', 'noframes', 'noscript',
  'object', 'ol', 'optgroup', 'option', 'output',
  'p', 'param', 'picture', 'plaintext', 'pre', 'progress',
  'q',
  'rb', 'rp', 'rt', 'rtc', 'ruby',
  's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th',
  'thead', 'time', 'title', 'tr', 'track', 'tt',
  'u', 'ul',
  'var', 'video',
  'wbr',
  'xmp'
]);

/*
 * Scan markup starting at str[i] (which must be '<') and return its length
 * and type if it is recognized markup, or null if it isn't.
 * Recognized types:
 *   { alwaysStrip: true, len }  - comments, doctypes, PIs
 *   { tagName, len }            - opening or closing HTML tags
 *
 * Respects quoted attribute values so that an attribute like title="1 > 0"
 * doesn't cause a premature close.
 *
 * @param {string} str
 * @param {number} i
 * @returns {Object|null}
 * @private
 */
function readMarkupAt (str, i) {
  // HTML comment: <!-- ... -->
  if (str.slice(i, i + 4) === '<!--') {
    var commentEnd = str.indexOf('-->', i + 4);
    return commentEnd !== -1 ? { alwaysStrip: true, len: commentEnd + 3 - i } : null;
  }

  // Processing instruction: <? ... ?>
  if (str[i + 1] === '?') {
    var piEnd = str.indexOf('?>', i + 2);
    return piEnd !== -1 ? { alwaysStrip: true, len: piEnd + 2 - i } : null;
  }

  // Doctype / other <! declarations: <! ... >
  if (str[i + 1] === '!') {
    var declEnd = str.indexOf('>', i + 2);
    return declEnd !== -1 ? { alwaysStrip: true, len: declEnd + 1 - i } : null;
  }

  // Closing tag or opening tag: </tagName ...> or <tagName ...>
  var isClosing = str[i + 1] === '/';
  var j = isClosing ? i + 2 : i + 1;
  var nameStart = j;
  while (j < str.length) {
    var code = str.charCodeAt(j);
    var isLetter = (code >= 97 && code <= 122) || (code >= 65 && code <= 90);
    var isDigit = code >= 48 && code <= 57;
    if (j === nameStart ? !isLetter : !(isLetter || isDigit)) break;
    j++;
  }
  var tagName = str.slice(nameStart, j).toLowerCase();
  if (!tagName) return null;

  // Scan for >, respecting quoted attribute values
  var quote = null;
  while (j < str.length) {
    var ch = str[j];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === '\'') {
      quote = ch;
    } else if (ch === '>') {
      return { tagName: tagName, len: j + 1 - i };
    }
    j++;
  }
  return null; // unclosed tag
}

/*
 * Strip HTML tags, leaving bare text content.
 * Scans the string for markup - HTML tags, comments, doctypes, and processing
 * instructions - and removes them. Only tags with known HTML element names
 * are stripped; unknown angle-bracket content like <<<NotHTML>>> is preserved.
 *
 * @param {string} str
 * @returns {string}
 * @private
 */
function stripHtml (str) {
  var out = '';
  var i = 0;
  while (i < str.length) {
    if (str[i] === '<') {
      var markup = readMarkupAt(str, i);
      if (markup && (markup.alwaysStrip || HTML_TAGS.has(markup.tagName))) {
        i += markup.len;
        continue;
      }
    }
    out += str[i];
    i++;
  }
  return out;
}

exports.HTML_TAGS = HTML_TAGS;
exports.stripHtml = stripHtml;
