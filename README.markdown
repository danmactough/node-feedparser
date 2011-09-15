#  Feedparser - Robust RSS, Atom, and RDF feed parsing in Node.js 
      
This module adds methods for RSS, Atom, and RDF feed parsing in node.js using libxmljs.

## Requirements

Feedparser uses libxmljs to parse XML. libxmljs requires `scons` to be installed prior to installing through [npm](http://npmjs.org).

### Installing `scons` through APT/yum

On Debian based Linux distributions like Ubuntu, simply install using `apt-get` like this:

    sudo apt-get install scons

On RedHat based Linux distributions like Fedora or CentOS, simply install using `yum` like this:

    sudo yum install scons

### Installing `scons` through Homebrew

On Mac OS X, the easiest way to install `scons` is using [Homebrew](http://mxcl.github.com/homebrew/), a great package manager for OS X. With `brew` installed, simply open Terminal and type:

    brew install scons

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
