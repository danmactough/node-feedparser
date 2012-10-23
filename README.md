[![build status](https://secure.travis-ci.org/danmactough/node-feedparser.png)](http://travis-ci.org/danmactough/node-feedparser)
#  Feedparser - Robust RSS, Atom, and RDF feed parsing in Node.js

This module adds methods for RSS, Atom, and RDF feed parsing in node.js using
Isaac Schlueter's [sax](https://github.com/isaacs/sax-js) parser.

## Requirements

- [sax](https://github.com/isaacs/sax-js)
- [request](https://github.com/mikeal/request)

## Installation

npm install feedparser

## Changes since v0.9.13

Instantiating the parser or calling one of the parser methods now may be
called with an optional [options object](#options).

## Usage

### Create a new instance

```javascript

    var FeedParser = require('feedparser')
      , parser = new FeedParser() // optionally called with an options object
      ;
```
### parser.parseString(string, [options], [callback])

- `string` - the contents of the feed

### parser.parseFile(filename, [options], [callback])

- `filename` - a local filename or remote url

### parser.parseUrl(url, [options], [callback])

- `url` - fully qualified uri or a parsed url object from url.parse()

### parser.parseStream(readableStream, [options], [callback])

- `readableStream` - a [Readable Stream](http://nodejs.org/api/stream.html#stream_readable_stream)

### options

- `normalize` - Set to `false` to override Feedparser's default behavior,
  which is to parse feeds into an object that contains the generic properties
  patterned after (although not identical to) the RSS 2.0 format, regardless
  of the feed's format.

- `addmeta` - Set to `false` to override Feedparser's default behavior, which
  is to add the feed's `meta` information to each `article`.

- `feedurl` - The url (string) of the feed. FeedParser is very good at
  resolving relative urls in feeds. But some feeds use relative urls without
  declaring the `xml:base` attribute any place in the feed. This is perfectly
  valid, but if we are parsing the feed with the `parseString`, `parseFile`,
  or `parseStream` method, we don't know know the feed's url before we start
  parsing the feed and trying to resolve those relative urls. If we discover
  the feed's url, we will go back and resolve the relative urls we've already
  seen, but this takes a little time (not much). If you want to be sure we
  never have to re-resolve relative urls (or if FeedParser is failing to
  properly resolve relative urls), you should set `feedurl`.

## Examples

```javascript

    var FeedParser = require('feedparser')
      , parser = new FeedParser()
      // The following modules are used in the examples below
      , fs = require('fs')
      , request = require('request')
      ;
```

### Use as an EventEmitter

```javascript

    parser.on('article', function (article){
      console.log('Got article: %s', JSON.stringify(article));
    });

    // You can give a local file path to parseFile()
    parser.parseFile('./feed');

    // For libxml compatibility, you can also give a URL to parseFile()
    parser.parseFile('http://cyber.law.harvard.edu/rss/examples/rss2sample.xml');

    // Or, you can give that URL to parseUrl()
    parser.parseUrl('http://cyber.law.harvard.edu/rss/examples/rss2sample.xml');

    // But you should probably be using conditional GETs and passing the results to
    // parseString() or piping it right into the stream, if possible

    var reqObj = {'uri': 'http://cyber.law.harvard.edu/rss/examples/rss2sample.xml',
                  'headers': {'If-Modified-Since' : <your cached 'lastModified' value>,
                              'If-None-Match' : <your cached 'etag' value>}};

    // parseString()
    request(reqObj, function (err, response, body){
      parser.parseString(body);
    });

    // Stream piping -- very sexy
    request(reqObj).pipe(parser.stream);
    
    // Using the stream interface with a file (or string)
    // A good alternative to parseFile() or parseString() when you have a large local file
    parser.parseStream(fs.createReadStream('./feed'));
    // Or
    fs.createReadStream('./feed').pipe(parser.stream);
```

### Use with a callback

When the feed is finished being parsed, if you provide a callback, it gets
called with three parameters: error, meta, and articles.

```javascript

    function myCallback (error, meta, articles){
      if (error) console.error(error);
      else {
        console.log('Feed info');
        console.log('%s - %s - %s', meta.title, meta.link, meta.xmlUrl);
        console.log('Articles');
        articles.forEach(function (article){
          console.log('%s - %s (%s)', article.date, article.title, article.link);
        });
      }
    }

    parser.parseFile('./feed', myCallback);

    // To use the stream interface with a callback, you *MUST* use parseStream(), not piping
    parser.parseStream(fs.createReadStream('./feed'), myCallback);
```

## What is the parsed output produced by feedparser?

Feedparser parses each feed into a `meta` portion and one or more `articles`.

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

### List of meta propreties

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

### List of article propreties

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
