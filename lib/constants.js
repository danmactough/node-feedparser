/*
* Default namespaces
*
* Lookup by URI
*/
/* eslint-disable key-spacing */
var NAMESPACES = {
  'http://www.w3.org/2005/Atom'                                    :'atom', // v1.0
  'http://purl.org/atom/ns#'                                       :'atom', // v0.3
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#'                    :'rdf',
  'http://purl.org/rss/1.0/'                                       :'rdf', // rss v1.0
  'http://my.netscape.com/rdf/simple/0.9/'                         :'rdf', // rss v0.90
  'http://webns.net/mvcb/'                                         :'admin',
  'http://creativecommons.org/ns#'                                 :'cc',
  'http://web.resource.org/cc/'                                    :'cc',
  'http://purl.org/rss/1.0/modules/content/'                       :'content',
  'http://backend.userland.com/creativeCommonsRSSModule'           :'creativecommons',
  'http://cyber.law.harvard.edu/rss/creativeCommonsRssModule.html' :'creativecommons',
  'http://purl.org/dc/elements/1.1/'                               :'dc',
  'http://purl.org/dc/elements/1.0/'                               :'dc',
  'http://purl.oclc.org/net/rss_2.0/enc#'                          :'enc',
  'http://rssnamespace.org/feedburner/ext/1.0'                     :'feedburner',
  'http://www.bradsoft.com/feeddemon/xmlns/1.0/'                   :'fd', // FeedDemon
  'http://www.itunes.com/dtds/podcast-1.0.dtd'                     :'itunes',
  'http://www.w3.org/2003/01/geo/wgs84_pos#'                       :'geo',
  'http://www.georss.org/georss'                                   :'georss',
  'http://search.yahoo.com/mrss/'                                  :'media',
  'http://search.yahoo.com/mrss'                                   :'media', // commonly-used but wrong
  'http://newsgator.com/schema/extensions'                         :'ng', // NewsGator
  'http://opml.org/spec2'                                          :'opml', // OPML 2.0
  'http://www.pheedo.com/namespace/pheedo'                         :'pheedo',
  'http://purl.org/rss/1.0/modules/syndication/'                   :'syn',
  'http://feedsync.org/2007/feedsync'                              :'sx', // feedsync (Simple Sharing Extensions) http://feedsyncsamples.codeplex.com/
  'http://purl.org/rss/1.0/modules/taxonomy/'                      :'taxo',
  'http://purl.org/syndication/thread/1.0'                         :'thr',
  'http://www.w3.org/1999/xhtml'                                   :'xhtml',
  'http://www.w3.org/XML/1998/namespace'                           :'xml'
};
/* eslint-enable key-spacing */

var HTML_URI_ATTRS = new Set([
  'href',
  'src',
  'uri',
  'srcset',
  'cite',
  'longdesc',
  'action',
  'background',
  'data',
  'poster'
]);

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

module.exports = {
  NAMESPACES,
  HTML_URI_ATTRS,
  HTML_TAGS
};
