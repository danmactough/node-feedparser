const { URL: WHATWGURL } = require('url');
const { NAMESPACES, HTML_URI_ATTRS, HTML_TAGS } = require('./constants');

const _get = require('lodash.get');
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
function get (obj, subkey, defaultValue) {
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
  if (typeof pathUrl !== 'string') return pathUrl;
  try {
    return new WHATWGURL(pathUrl, baseUrl).href;
  } catch (e) {
    return pathUrl;
  }
}

/*
 * Resolve the URLs in a srcset attribute value against a base URL.
 * @param {string} baseUrl
 * @param {string} candidate
 * @returns {string}
 * @private
 */
function resolveSrcsetCandidate (baseUrl, candidate) {
  var match = candidate.match(/^(\s*)(\S+)([\s\S]*)$/);
  if (!match) return candidate;
  return match[1] + resolve(baseUrl, match[2]) + match[3];
}

function resolveSrcset (baseUrl, srcset) {
  if (!baseUrl || !srcset || typeof srcset !== 'string') return srcset;

  var out = '';
  var start = 0;
  var depth = 0;
  var i;
  for (i = 0; i < srcset.length; i++) {
    if (srcset[i] === '(') {
      depth++;
    } else if (srcset[i] === ')' && depth) {
      depth--;
    } else if (srcset[i] === ',' && depth === 0) {
      // Do not split commas that are part of functional URL notation.
      out += resolveSrcsetCandidate(baseUrl, srcset.slice(start, i)) + ',';
      start = i + 1;
    }
  }

  return out + resolveSrcsetCandidate(baseUrl, srcset.slice(start));
}

function resolveHtmlAttributeValue (baseUrl, name, value) {
  var attrName = name.toLowerCase();
  if (attrName === 'srcset') return resolveSrcset(baseUrl, value);
  if (HTML_URI_ATTRS.has(attrName)) return resolve(baseUrl, value);
  return value;
}

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

/*
 * Check whether a given namespace URI matches the given default
 *
 * @param {string} uri
 * @param {string} def - e.g., 'atom'
 * @returns {boolean}
 * @private
 */
function nslookup (uri, def) {
  return NAMESPACES[uri] === def;
}

/*
 * Return the "default" namespace prefix for a given namespace URI
 *
 * @param {string} uri
 * @returns {string}
 * @private
 */
function nsprefix (uri) {
  return NAMESPACES[uri];
}

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
    els.forEach(function (el) {
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
              if (HTML_URI_ATTRS.has(name)) {
                if ('string' === typeof level[el]['@'][name]) {
                  level[el]['@'][name] = resolveHtmlAttributeValue(baseurl, name, level[el]['@'][name]);
                }
              }
            });
          }
          if (mayHaveEmbeddedHtml(el, level[el])) {
            level[el]['#'] = resolveHtmlUris(level[el]['#'], baseurl);
          }
        }
      }
    });
    return level;
  }

  return resolveLevel(node);
}

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
      return { tagName: tagName, isClosing: isClosing, len: j + 1 - i };
    }
    j++;
  }
  return null; // unclosed tag
}

function rewriteHtmlTagUris (tag, baseUrl) {
  var i = 1;
  var out = '';
  var last = 0;

  if (tag[i] === '/') return tag;
  while (i < tag.length && !/[\s/>]/.test(tag[i])) i++;

  while (i < tag.length) {
    while (i < tag.length && /\s/.test(tag[i])) i++;
    if (i >= tag.length || tag[i] === '>' || tag[i] === '/') break;

    var nameStart = i;
    while (i < tag.length && !/[\s=/>]/.test(tag[i])) i++;
    var name = tag.slice(nameStart, i);

    while (i < tag.length && /\s/.test(tag[i])) i++;
    if (tag[i] !== '=') continue;
    i++;
    while (i < tag.length && /\s/.test(tag[i])) i++;

    var quote = null;
    if (tag[i] === '"' || tag[i] === '\'') {
      quote = tag[i];
      i++;
    }

    var valueStart = i;
    if (quote) {
      while (i < tag.length && tag[i] !== quote) i++;
    } else {
      while (i < tag.length && !/[\s/>]/.test(tag[i])) i++;
    }
    var valueEnd = i;
    var value = tag.slice(valueStart, valueEnd);
    var resolved = resolveHtmlAttributeValue(baseUrl, name, value);
    if (resolved !== value) {
      out += tag.slice(last, valueStart) + resolved;
      last = valueEnd;
    }
    if (quote && tag[i] === quote) i++;
  }

  return out ? out + tag.slice(last) : tag;
}

function resolveHtmlUris (html, baseUrl) {
  if (!baseUrl || !html || typeof html !== 'string') return html;

  var out = '';
  var i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      var markup = readMarkupAt(html, i);
      if (markup && !markup.alwaysStrip && !markup.isClosing && HTML_TAGS.has(markup.tagName)) {
        out += rewriteHtmlTagUris(html.slice(i, i + markup.len), baseUrl);
        i += markup.len;
        continue;
      }
    }
    out += html[i];
    i++;
  }
  return out;
}

function mayHaveEmbeddedHtml (name, el) {
  if (!el || typeof el['#'] !== 'string') return false;

  var type = get(el['@'], 'type');

  if (name === 'content:encoded') return true;
  if (name === 'description' || name === 'summary' || name === 'tagline') return true;

  if (name === 'content' || name === 'title' || name === 'subtitle' || name === 'rights') {
    return type === 'html' || type === 'xhtml';
  }

  return false;
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

module.exports = {
  get,
  safeTrim,
  resolve,
  resolveSrcset,
  resolveHtmlAttributeValue,
  isAbsoluteUrl,
  nslookup,
  nsprefix,
  reresolve,
  resolveHtmlUris,
  mayHaveEmbeddedHtml,
  stripHtml
};
