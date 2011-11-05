#  Feedparser - Robust RSS, Atom, and RDF feed parsing in Node.js 
      
This module adds methods for RSS, Atom, and RDF feed parsing in node.js using Isaac Schlueter's [sax](https://github.com/isaacs/sax-js) parser.

## Requirements

- [sax](https://github.com/isaacs/sax-js)
- [request](https://github.com/mikeal/request)

## Installation

    npm install feedparser

## Example

```javascript
var FeedParser = require('feedparser')
  , parser

parser = new FeedParser();

parser.on('article', function(article){
    console.log('Got article: %s', JSON.stringify(article));
});

parser.parseFile('./feed');
```

## Contributors

The following are the major contributors of `node-feedparser` (in no specific order).

  * Dan MacTough ([danmactough](http://github.com/danmactough))

Although `node-feedparser` no longer shares any code with `node-easyrss`, it was an inspiration. 
The following are the major contributors of `node-easyrss` (in no specific order).

  * Nicholas Penree ([drudge](http://github.com/drudge))
  * Rob Searles ([ibrow](http://github.com/ibrow))
  * Jeremy Knope ([jfro](http://github.com/jfro))
  * Hannah Fouasnon ([fouasnon](http://github.com/fouasnon))

## License 

(The MIT License)

Copyright (c) 2011 Dan MacTough &lt;danmactough@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
