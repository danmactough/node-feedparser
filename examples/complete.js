/**
 * Tip
 * ====
 * - Set `user-agent` and `accept` headers when sending requests. Some services will not respond as expected without them.
 */

var fetch = require('node-fetch')
  , FeedParser = require(__dirname+'/..')
  , iconv = require('iconv-lite');

function get(feed) {
  // Get a response stream
  fetch(feed, { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36', 'accept': 'text/html,application/xhtml+xml' }).then(function (res) {

    // Setup feedparser stream
    var feedparser = new FeedParser();
    feedparser.on('error', done);
    feedparser.on('end', done);
    feedparser.on('readable', function() {
      var post;
      while (post = this.read()) {
        console.log(JSON.stringify(post, ' ', 4));
      }
    });

    // Handle our response and pipe it to feedparser
    if (res.status != 200) throw new Error('Bad status code');
    var charset = getParams(res.headers.get('content-type') || '').charset;
    var responseStream = res.body;
    responseStream = maybeTranslate(responseStream, charset);
    // And boom goes the dynamite
    responseStream.pipe(feedparser);

  }).catch(done);
}

function maybeTranslate (res, charset) {
  var iconvStream;
  // Decode using iconv-lite if its not utf8 already.
  if (!iconvStream && charset && !/utf-*8/i.test(charset)) {
    try {
      iconvStream = iconv.decodeStream(charset);
      console.log('Converting from charset %s to utf-8', charset);
      iconvStream.on('error', done);
      // If we're using iconvStream, stream will be the output of iconvStream
      // otherwise it will remain the output of request
      res = res.pipe(iconvStream);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

function done(err) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }
  server.close();
  process.exit();
}

// Don't worry about this. It's just a localhost file server so you can be
// certain the "remote" feed is available when you run this example.
var server = require('http').createServer(function (req, res) {
  var stream = require('fs').createReadStream(require('path').resolve(__dirname, '../test/feeds' + req.url));
  res.setHeader('Content-Type', 'text/xml; charset=Windows-1251');
  res.setHeader('Content-Encoding', 'gzip');
  stream.pipe(res);
});
server.listen(0, function () {
  get('http://localhost:' + this.address().port + '/compressed.xml');
});
