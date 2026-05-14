var utils = require('../lib/utils');

describe('utils', function () {

  describe('get', function () {

    it('returns value at "#" key by default', function () {
      assert.strictEqual(utils.get({ '#': 'foo' }), 'foo');
    });

    it('returns value at specified subkey', function () {
      assert.strictEqual(utils.get({ bar: 'baz' }, 'bar'), 'baz');
    });

    it('returns null by default when key is missing', function () {
      assert.strictEqual(utils.get({ bar: 'baz' }), null);
    });

    it('returns custom defaultValue when key is missing', function () {
      assert.strictEqual(utils.get({}, 'missing', 'fallback'), 'fallback');
    });

    it('uses "#" subkey on first element when obj is an array', function () {
      assert.strictEqual(utils.get([{ '#': 'first' }, { '#': 'second' }]), 'first');
    });

    it('uses specified subkey on first element when obj is an array', function () {
      assert.strictEqual(utils.get([{ foo: 'bar' }], 'foo'), 'bar');
    });

    it('returns null when array element is missing the key', function () {
      assert.strictEqual(utils.get([{}]), null);
    });

  });

  describe('safeTrim', function () {

    it('trims whitespace from strings', function () {
      assert.strictEqual(utils.safeTrim('  hello  '), 'hello');
    });

    it('trims only leading whitespace', function () {
      assert.strictEqual(utils.safeTrim('  hello'), 'hello');
    });

    it('trims only trailing whitespace', function () {
      assert.strictEqual(utils.safeTrim('hello  '), 'hello');
    });

    it('returns an empty string unchanged', function () {
      assert.strictEqual(utils.safeTrim(''), '');
    });

    it('passes through numbers without throwing', function () {
      assert.strictEqual(utils.safeTrim(42), 42);
    });

    it('passes through null without throwing', function () {
      assert.strictEqual(utils.safeTrim(null), null);
    });

    it('passes through undefined without throwing', function () {
      assert.strictEqual(utils.safeTrim(undefined), undefined);
    });

    it('passes through objects without throwing', function () {
      var obj = { a: 1 };
      assert.strictEqual(utils.safeTrim(obj), obj);
    });

  });

  describe('resolve', function () {

    it('resolves a relative path using "../" against a base URL', function () {
      assert.strictEqual(
        utils.resolve('http://example.com/foo/bar', '../baz'),
        'http://example.com/baz'
      );
    });

    it('resolves a relative path using "./" against a base URL', function () {
      assert.strictEqual(
        utils.resolve('http://example.com/foo/bar', './baz'),
        'http://example.com/foo/baz'
      );
    });

    it('resolves a relative path without path prefix against a base URL', function () {
      assert.strictEqual(
        utils.resolve('http://example.com/foo/bar', 'baz'),
        'http://example.com/foo/baz'
      );
    });

    it('resolves an absolute path URL against a base URL', function () {
      assert.strictEqual(
        utils.resolve('http://example.com/foo/', '/images/pic.png'),
        'http://example.com/images/pic.png'
      );
    });

    it('returns an absolute URL unchanged', function () {
      assert.strictEqual(
        utils.resolve('http://example.com/', 'http://other.com/img.png'),
        'http://other.com/img.png'
      );
    });

    it('returns pathUrl when baseUrl is falsy', function () {
      assert.strictEqual(utils.resolve(null, '/path'), '/path');
      assert.strictEqual(utils.resolve('', '/path'), '/path');
      assert.strictEqual(utils.resolve(undefined, '/path'), '/path');
    });

    it('returns pathUrl when pathUrl is falsy', function () {
      assert.strictEqual(utils.resolve('http://example.com/', null), null);
      assert.strictEqual(utils.resolve('http://example.com/', ''), '');
      assert.strictEqual(utils.resolve('http://example.com/', undefined), undefined);
    });

    it('returns pathUrl for tag: URIs that the URL constructor rejects', function () {
      var tagUri = 'tag:example.com,2003:posts/1';
      assert.strictEqual(utils.resolve('http://example.com/', tagUri), tagUri);
    });

    it('returns pathUrl for other non-http schemes', function () {
      var urn = 'urn:isbn:0451450523';
      assert.strictEqual(utils.resolve('http://example.com/', urn), urn);
    });

  });

  describe('isAbsoluteUrl', function () {

    it('returns true for http URLs', function () {
      assert.strictEqual(utils.isAbsoluteUrl('http://example.com/'), true);
    });

    it('returns true for https URLs', function () {
      assert.strictEqual(utils.isAbsoluteUrl('https://example.com/path'), true);
    });

    it('returns false for relative URLs', function () {
      assert.strictEqual(utils.isAbsoluteUrl('/relative/path'), false);
    });

    it('returns false for relative paths without leading slash', function () {
      assert.strictEqual(utils.isAbsoluteUrl('relative/path'), false);
    });

    it('returns false for tag: URIs (no host)', function () {
      assert.strictEqual(utils.isAbsoluteUrl('tag:example.com,2003:posts/1'), false);
    });

    it('returns false for empty string', function () {
      assert.strictEqual(utils.isAbsoluteUrl(''), false);
    });

    it('returns false for null', function () {
      assert.strictEqual(utils.isAbsoluteUrl(null), false);
    });

    it('returns false for undefined', function () {
      assert.strictEqual(utils.isAbsoluteUrl(undefined), false);
    });

    it('returns false for non-string values', function () {
      assert.strictEqual(utils.isAbsoluteUrl(42), false);
      assert.strictEqual(utils.isAbsoluteUrl({}), false);
    });

  });

  describe('nslookup', function () {

    it('returns true when URI matches the given default namespace', function () {
      assert.strictEqual(utils.nslookup('http://www.w3.org/2005/Atom', 'atom'), true);
    });

    it('returns true for atom v0.3 URI', function () {
      assert.strictEqual(utils.nslookup('http://purl.org/atom/ns#', 'atom'), true);
    });

    it('returns false when URI does not match the given default', function () {
      assert.strictEqual(utils.nslookup('http://www.w3.org/2005/Atom', 'rdf'), false);
    });

    it('returns false for unknown URI', function () {
      assert.strictEqual(utils.nslookup('http://unknown.example.com/', 'atom'), false);
    });

    it('returns false for undefined URI', function () {
      assert.strictEqual(utils.nslookup(undefined, 'atom'), false);
    });

  });

  describe('nsprefix', function () {

    it('returns the namespace prefix for a known URI', function () {
      assert.strictEqual(utils.nsprefix('http://www.w3.org/2005/Atom'), 'atom');
    });

    it('returns "dc" for Dublin Core URI', function () {
      assert.strictEqual(utils.nsprefix('http://purl.org/dc/elements/1.1/'), 'dc');
    });

    it('returns "media" for Yahoo media RSS URI', function () {
      assert.strictEqual(utils.nsprefix('http://search.yahoo.com/mrss/'), 'media');
    });

    it('returns undefined for unknown URI', function () {
      assert.strictEqual(utils.nsprefix('http://unknown.example.com/'), undefined);
    });

  });

  describe('reresolve', function () {

    it('returns false when node is falsy', function () {
      assert.strictEqual(utils.reresolve(null, 'http://example.com/'), false);
      assert.strictEqual(utils.reresolve(undefined, 'http://example.com/'), false);
    });

    it('returns false when baseurl is falsy', function () {
      assert.strictEqual(utils.reresolve({ link: { '#': '/foo' } }, null), false);
      assert.strictEqual(utils.reresolve({ link: { '#': '/foo' } }, ''), false);
    });

    it('resolves "#" on link elements', function () {
      var node = { link: { '#': '/foo' } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.link['#'], 'http://example.com/foo');
    });

    it('resolves "#" on logo elements', function () {
      var node = { logo: { '#': '/logo.png' } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.logo['#'], 'http://example.com/logo.png');
    });

    it('resolves "#" on icon elements', function () {
      var node = { icon: { '#': '/favicon.ico' } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.icon['#'], 'http://example.com/favicon.ico');
    });

    it('resolves image.url["#"]', function () {
      var node = { image: { url: { '#': '/img.png' } } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.image.url['#'], 'http://example.com/img.png');
    });

    it('resolves image.link["#"]', function () {
      var node = { image: { link: { '#': '/target' } } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.image.link['#'], 'http://example.com/target');
    });

    it('resolves href attributes', function () {
      var node = { entry: { '@': { href: '/page' } } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.entry['@'].href, 'http://example.com/page');
    });

    it('resolves src attributes', function () {
      var node = { img: { '@': { src: '/image.png' } } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.img['@'].src, 'http://example.com/image.png');
    });

    it('resolves uri attributes', function () {
      var node = { el: { '@': { uri: '/resource' } } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.el['@'].uri, 'http://example.com/resource');
    });

    it('handles array of element items', function () {
      var node = {
        link: [
          { '#': '/first' },
          { '#': '/second' }
        ]
      };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.link[0]['#'], 'http://example.com/first');
      assert.strictEqual(node.link[1]['#'], 'http://example.com/second');
    });

    it('does not modify non-url attributes', function () {
      var node = { el: { '@': { type: 'text/html' } } };
      utils.reresolve(node, 'http://example.com/');
      assert.strictEqual(node.el['@'].type, 'text/html');
    });

    it('does not attempt to resolve non-string href values', function () {
      var node = { el: { '@': { href: 42 } } };
      assert.doesNotThrow(function () {
        utils.reresolve(node, 'http://example.com/');
      });
      assert.strictEqual(node.el['@'].href, 42);
    });

  });

  describe('stripHtml', function () {

    it('returns the string unchanged when there are no tags', function () {
      assert.strictEqual(utils.stripHtml('plain text'), 'plain text');
    });

    it('returns an empty string for an empty string', function () {
      assert.strictEqual(utils.stripHtml(''), '');
    });

    it('removes simple HTML tags', function () {
      assert.strictEqual(utils.stripHtml('<b>bold</b>'), 'bold');
    });

    it('removes multiple tags', function () {
      assert.strictEqual(utils.stripHtml('<p>Hello <strong>world</strong></p>'), 'Hello world');
    });

    it('removes self-closing tags', function () {
      assert.strictEqual(utils.stripHtml('before<br/>after'), 'beforeafter');
    });

    it('removes tags with attributes', function () {
      assert.strictEqual(utils.stripHtml('<a href="http://example.com">link</a>'), 'link');
    });

    it('strips nested tags leaving inner text', function () {
      assert.strictEqual(utils.stripHtml('<div>You <strong>MUST</strong> remove tags</div>'), 'You MUST remove tags');
    });

    it('strips a self-closing tag without trailing slash', function () {
      assert.strictEqual(utils.stripHtml('before<hr>after'), 'beforeafter');
    });

    it('strips a self-closing tag with trailing slash', function () {
      assert.strictEqual(utils.stripHtml('before<br/>after'), 'beforeafter');
    });

    it('strips a self-closing tag with attributes', function () {
      assert.strictEqual(utils.stripHtml('before<img src="x.png" alt="x">after'), 'beforeafter');
    });

    it('strips img with self-closing slash and attributes', function () {
      assert.strictEqual(utils.stripHtml('before<img src="x.png" />after'), 'beforeafter');
    });

    it('strips closing tags', function () {
      assert.strictEqual(utils.stripHtml('text</p>'), 'text');
    });

    it('strips tags with multiple attributes', function () {
      assert.strictEqual(utils.stripHtml('<div class="foo" id="bar">content</div>'), 'content');
    });

    // --- edge cases: non-HTML angle brackets must be preserved ---

    it('preserves literal angle brackets that are not HTML tags', function () {
      assert.strictEqual(utils.stripHtml('1 < 2'), '1 < 2');
    });

    it('preserves less-than followed by a number', function () {
      assert.strictEqual(utils.stripHtml('x<3'), 'x<3');
    });

    it('preserves triple left angle brackets', function () {
      assert.strictEqual(utils.stripHtml('<<<'), '<<<');
    });

    it('preserves triple right angle brackets', function () {
      assert.strictEqual(utils.stripHtml('>>>'), '>>>');
    });

    it('preserves encoded angle brackets decoded by XML parser', function () {
      assert.strictEqual(utils.stripHtml('RSS <<<Tutorial>>>'), 'RSS <<<Tutorial>>>');
    });

    it('does not treat unknown tag names as HTML', function () {
      assert.strictEqual(utils.stripHtml('a <foo> b'), 'a <foo> b');
    });

    it('does not treat a closing tag with unknown name as HTML', function () {
      assert.strictEqual(utils.stripHtml('</foo>'), '</foo>');
    });

    it('preserves bare angle brackets adjacent to real HTML tags', function () {
      assert.strictEqual(utils.stripHtml('<<b>bold</b>>'), '<bold>');
    });

    it('strips real HTML but preserves non-HTML angle brackets in the same string', function () {
      assert.strictEqual(utils.stripHtml('if a < b then <em>yes</em> else x<y>z'), 'if a < b then yes else x<y>z');
    });

    it('strips non-void elements written as self-closing like <div />', function () {
      assert.strictEqual(utils.stripHtml('<div />text</div>'), 'text');
    });

    it('strips multiline tags spanning several lines', function () {
      assert.strictEqual(
        utils.stripHtml('<img \n  src="logo.png" \n  alt="Company Logo" \n  width="200" \n  height="100"\n>'),
        ''
      );
    });

    it('strips HTML comments', function () {
      assert.strictEqual(utils.stripHtml('before<!-- comment -->after'), 'beforeafter');
    });

    it('strips multi-line HTML comments', function () {
      assert.strictEqual(utils.stripHtml('before<!-- a\ncomment -->after'), 'beforeafter');
    });

    it('strips doctype declarations', function () {
      assert.strictEqual(utils.stripHtml('<!DOCTYPE html>Title'), 'Title');
    });

    it('strips XML processing instructions', function () {
      assert.strictEqual(utils.stripHtml('<?xml version="1.0"?>text'), 'text');
    });

    it('strips xml-stylesheet processing instructions', function () {
      assert.strictEqual(utils.stripHtml('<?xml-stylesheet href="style.xsl" type="text/xsl"?>text'), 'text');
    });

    it('strips mixed HTML tags, comments, and processing instructions in one string', function () {
      assert.strictEqual(
        utils.stripHtml('<?xml version="1.0"?><p><!-- intro -->Hello <em>world</em></p>'),
        'Hello world'
      );
    });

    it('strips tags with double-quoted attribute values containing >', function () {
      assert.strictEqual(utils.stripHtml('<a title="1 > 0">link</a>'), 'link');
    });

    it('strips tags with single-quoted attribute values containing >', function () {
      assert.strictEqual(utils.stripHtml('<a title=\'1 > 0\'>link</a>'), 'link');
    });

    utils.HTML_TAGS.forEach(function (tag) {
      it(`strips ${tag} HTML tag opening and closing and self-closing`, function () {
        assert.strictEqual(utils.stripHtml('<' + tag + '>content</' + tag + '> and <' + tag + ' />more'), 'content and more', 'expected <' + tag + '> to be stripped');
      });
    });

  });

});
