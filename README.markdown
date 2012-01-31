#  Feedparser - Robust RSS, Atom, and RDF feed parsing in Node.js

This module adds methods for RSS, Atom, and RDF feed parsing in node.js using
Isaac Schlueter's [sax](https://github.com/isaacs/sax-js) parser.

## Requirements

- [sax](https://github.com/isaacs/sax-js) -
[request](https://github.com/mikeal/request)

## Installation

npm install feedparser

## Example

```javascript var FeedParser = require('feedparser') , parser

parser = new FeedParser();

parser.on('article', function(article){ console.log('Got article: %s',
JSON.stringify(article)); });

parser.parseFile('./feed'); ```

## What is the parsed output produced by feedparser?

Feedparser parses each feed into a `meta` portion and one or more `articles`.

Regardless of the format of the feed, both `meta` and each `article` contain a
uniform set of generic properties patterned (although not identical to) the RSS
2.0 format, as well as all of the properties originally contained in the feed.
So, for example, an Atom feed may have a `meta.description` property, but it
will also have a `meta['atom:subtitle']` property.

The purpose of the generic properties is to provide the user a uniform interface
for accessing a feed's information without needing to know the feed's format
(i.e., RSS versus Atom) or having to worry about handling the differences
between the formats. However, the original information is also there, in case
you need it. In addition, Feedparser supports some popular namespace extensions
(or portions of them), such as portions of the `itunes`, `media`, `feedburner`
and `pheedo` extensions. So, for example, if a feed article contains either an
`itunes:image` or `media:thumbnail`, the url for that image will be contained in
the article's `image.url` property.

All properties are "pre-initialized" to `null` (or empty arrays or objects for
certain properties). This should save you from having to do a lot of checking
for `undefined`, such as, for example, when you are using jade templates.

### List of meta propreties

* title
* description
* link (website link)
* xmlUrl (the canonical link to the feed, as specified by the feed)
* date (most recent update)
* pubDate (original published date)
* author
* language
* image (an Object containing `url` and `title` properties)
* favicon (a link to the favicon -- only provided by Atom feeds)
* copyright
* generator
* categories (an Array of Strings)

### List of article propreties

* title
* description (frequently, the full article content)
* summary (frequently, an excerpt of the article content)
* link
* origlink (when FeedBurner or Pheedo puts a special tracking url in the `link` property, `origlink` contains the original link)
* date (most recent update)
* pubDate (original published date)
* author
* guid (a unique identifier for the article)
* comments (a link to the article's comments section)
* image (an Object containing `url` and `title` properties)
* categories (an Array of Strings)
* source (an Object containing `url` and `title` properties pointing to the original source for an article; see the [RSS Spec](http://cyber.law.harvard.edu/rss/rss.html#ltsourcegtSubelementOfLtitemgt) for an explanation of this element)
* enclosures (an Array of Objects, each representing a podcast or other enclosure and having a `url` property and possibly `type` and `length` properties)
* meta (an Object containing all the feed meta properties; especially handy when using the EventEmitter interface to listen to `article` emissions)

## Contributors

The following are the major contributors of `node-feedparser` (in no specific
order).

* Dan MacTough ([danmactough](http://github.com/danmactough))

Although `node-feedparser` no longer shares any code with `node-easyrss`, it was
the original inspiration and a starting point.

## License

(The MIT License)

Copyright (c) 2011 Dan MacTough &lt;danmactough@gmail.com&gt;

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
