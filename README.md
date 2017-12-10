#  Feedparser - Robust RSS, Atom, and RDF feed parsing in Node.js

[![Greenkeeper badge](https://badges.greenkeeper.io/danmactough/node-feedparser.svg)](https://greenkeeper.io/)

[![Join the chat at https://gitter.im/danmactough/node-feedparser](https://badges.gitter.im/danmactough/node-feedparser.svg)](https://gitter.im/danmactough/node-feedparser?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://secure.travis-ci.org/danmactough/node-feedparser.png?branch=master)](https://travis-ci.org/danmactough/node-feedparser)

[![NPM](https://nodei.co/npm/feedparser.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/feedparser/)

Feedparser is for parsing RSS, Atom, and RDF feeds in node.js.

It has a couple features you don't usually see in other feed parsers:

1. It resolves relative URLs (such as those seen in Tim Bray's "ongoing" [feed](http://www.tbray.org/ongoing/ongoing.atom)).
2. It properly handles XML namespaces (including those in unusual feeds
that define a non-default namespace for the main feed elements).

## Installation

```bash
npm install feedparser
```

## Usage

This example is just to briefly demonstrate basic concepts.

**Please** also review the [compressed example](examples/compressed.js) for a
thorough working example that is a suitable starting point for your app.

```js

var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var req = request('http://somefeedurl.xml')
var feedparser = new FeedParser([options]);

req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // always handle errors
});

feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;

  while (item = stream.read()) {
    console.log(item);
  }
});

```

You can also check out this nice [working demo](https://github.com/scripting/feedParserDemo).

### options

- `normalize` - Set to `false` to override Feedparser's default behavior,
  which is to parse feeds into an object that contains the generic properties
  patterned after (although not identical to) the RSS 2.0 format, regardless
  of the feed's format.

- `addmeta` - Set to `false` to override Feedparser's default behavior, which
  is to add the feed's `meta` information to each article.

- `feedurl` - The url (string) of the feed. FeedParser is very good at
  resolving relative urls in feeds. But some feeds use relative urls without
  declaring the `xml:base` attribute any place in the feed. This is perfectly
  valid, but we don't know know the feed's url before we start parsing the feed
  and trying to resolve those relative urls. If we discover the feed's url, we
  will go back and resolve the relative urls we've already seen, but this takes
  a little time (not much). If you want to be sure we never have to re-resolve
  relative urls (or if FeedParser is failing to properly resolve relative urls),
  you should set the `feedurl` option. Otherwise, feel free to ignore this option.

- `resume_saxerror` - Set to `false` to override Feedparser's default behavior, which
  is to emit any `SAXError` on `error` and then automatically resume parsing. In
  my experience, `SAXErrors` are not usually fatal, so this is usually helpful
  behavior. If you want total control over handling these errors and optionally
  aborting parsing the feed, use this option.

## Examples

See the [`examples`](examples/) directory.

## API

### Transform Stream

Feedparser is a [transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform) operating in "object mode": XML in -> Javascript objects out.
Each readable chunk is an object representing an article in the feed.

### Events Emitted

* `meta` - called with feed `meta` when it has been parsed
* `error` - called with `error` whenever there is a Feedparser error of any kind (SAXError, Feedparser error, etc.)

## What is the parsed output produced by feedparser?

Feedparser parses each feed into a `meta` (emitted on the `meta` event) portion
and one or more `articles` (emited on the `data` event or readable after the `readable`
is emitted).

Regardless of the format of the feed, the `meta` and each `article` contain a
uniform set of generic properties patterned after (although not identical to)
the RSS 2.0 format, as well as all of the properties originally contained in the
feed. So, for example, an Atom feed may have a `meta.description` property, but
it will also have a `meta['atom:subtitle']` property.

The purpose of the generic properties is to provide the user a uniform interface
for accessing a feed's information without needing to know the feed's format
(i.e., RSS versus Atom) or having to worry about handling the differences
between the formats. However, the original information is also there, in case
you need it. In addition, Feedparser supports some popular namespace extensions
(or portions of them), such as portions of the `itunes`, `media`, `feedburner`
and `pheedo` extensions. So, for example, if a feed article contains either an
`itunes:image` or `media:thumbnail`, the url for that image will be contained in
the article's `image.url` property.

All generic properties are "pre-initialized" to `null` (or empty arrays or
objects for certain properties). This should save you from having to do a lot of
checking for `undefined`, such as, for example, when you are using jade
templates.

In addition, all properties (and namespace prefixes) use only lowercase letters,
regardless of how they were capitalized in the original feed. ("xmlUrl" and
"pubDate" also are still used to provide backwards compatibility.) This decision
places ease-of-use over purity -- hopefully, you will never need to think about
whether you should camelCase "pubDate" ever again.

The `title` and `description` properties of `meta` and the `title` property of
each `article` have any HTML stripped if you let feedparser normalize the output.
If you really need the HTML in those elements, there are always the originals:
e.g., `meta['atom:subtitle']['#']`.

### List of meta properties

* title
* description
* link (website link)
* xmlurl (the canonical link to the feed, as specified by the feed)
* date (most recent update)
* pubdate (original published date)
* author
* language
* image (an Object containing `url` and `title` properties)
* favicon (a link to the favicon -- only provided by Atom feeds)
* copyright
* generator
* categories (an Array of Strings)

### List of article properties

* title
* description (frequently, the full article content)
* summary (frequently, an excerpt of the article content)
* link
* origlink (when FeedBurner or Pheedo puts a special tracking url in the `link` property, `origlink` contains the original link)
* permalink (when an RSS feed has a `guid` field and the `isPermalink` attribute is not set to `false`, `permalink` contains the value of `guid`)
* date (most recent update)
* pubdate (original published date)
* author
* guid (a unique identifier for the article)
* comments (a link to the article's comments section)
* image (an Object containing `url` and `title` properties)
* categories (an Array of Strings)
* source (an Object containing `url` and `title` properties pointing to the original source for an article; see the [RSS Spec](http://cyber.law.harvard.edu/rss/rss.html#ltsourcegtSubelementOfLtitemgt) for an explanation of this element)
* enclosures (an Array of Objects, each representing a podcast or other enclosure and having a `url` property and possibly `type` and `length` properties)
* meta (an Object containing all the feed meta properties; especially handy when using the EventEmitter interface to listen to `article` emissions)

## Help

- Don't be afraid to report an [issue](https://github.com/danmactough/node-feedparser/issues).
- You can drop by [Gitter](https://gitter.im/danmactough/node-feedparser?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge), too.

## Contributors

View all the [contributors](https://github.com/danmactough/node-feedparser/graphs/contributors).

Although `node-feedparser` no longer shares any code with `node-easyrss`, it was
the original inspiration and a starting point.

## License

(The MIT License)

Copyright (c) 2011-2016 Dan MacTough and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
