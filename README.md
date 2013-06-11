[![Build Status](https://secure.travis-ci.org/danmactough/node-feedparser.png?branch=master)](https://travis-ci.org/danmactough/node-feedparser)
#  Feedparser - Robust RSS, Atom, and RDF feed parsing in Node.js

This module adds methods for RSS, Atom, and RDF feed parsing in node.js using
Isaac Schlueter's [sax](https://github.com/isaacs/sax-js) parser.

Feedparser has a couple features you don't usually see:

1. It resolves relative URLs (such as those seen in Tim Bray's "ongoing" [feed](http://www.tbray.org/ongoing/ongoing.atom)).
2. It properly handles XML namespaces (including those in sadistic feeds
that define a non-default namespace for the main feed elements).

## Requirements

- [sax](https://github.com/isaacs/sax-js)
- [addressparser](https://github.com/andris9/addressparser)
- [resanitize](https://github.com/danmactough/node-resanitize)
- [array-indexofobject](https://github.com/danmactough/node-array-indexofobject)
- [readable-stream](https://github.com/isaacs/readable-stream) (only if using Node <= v0.8.x)

## Installation

```bash
npm install feedparser
```

## Changes since v0.15.x

- The libxml-like helper methods have been removed. There is now just one input
interface: the stream interface.

- Events:

    - `304`, `response` - removed, as Feedparser no longer fetches urls
    - `article`, `complete` - removed; use the stream interface
    - `data` - all readable streams will emit a `data` event, but this puts the
      stream into "old" v0.8-style push streams
    - `end` - stream behavior dictates that the `end` event will never fire if
      you don't read any data from the stream; you can kick the Feedparser stream
      to work like an "old" v0.8-style push stream (and get the old `end` event
      behavior) by calling `.resume()`.

- `SAXErrors` are emitted as `error` events. By default, they are automatically
resumed. Pass `{ resume_saxerrors: false }` as an option if you want to manually
handle `SAXErrors` (abort parsing, perhaps).

## Usage

The easiest way to use feedparser is to just give it a [readable stream](http://nodejs.org/api/stream.html#stream_readable_stream). 
It will then return a readable object stream.

```js

var FeedParser = require('feedparser')
  , request = require('request');

request('http://somefeedurl.xml')
  .pipe(new FeedParser([options]))
  .on('error', function(error) {
    // always handle errors
  })
  .on('meta', function (meta) {
    // do something
  })
  .on('readable', function () {
    // do something else, then do the next thing
  })
```

Or:

```js

var FeedParser = require('feedparser')
  , request = require('request');

request('http://somefeedurl.xml')
  .pipe(new FeedParser([options]))
  .pipe([some other stream])
```

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

See the `examples` directory.

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
- You can drop by IRC, too: [#node-feedparser on freenode](http://webchat.freenode.net/?channels=node-feedparser&uio=d4).

## Contributors

View all the [contributors](https://github.com/danmactough/node-feedparser/graphs/contributors).

Although `node-feedparser` no longer shares any code with `node-easyrss`, it was
the original inspiration and a starting point.

## License

(The MIT License)

Copyright (c) 2011, 2012, 2013 Dan MacTough and contributors

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
