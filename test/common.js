/*global assert: true, FeedParser: true, server: true*/
var URL = require('url');

assert = require('assert');
FeedParser = require('../');
server = function (done) {
  var app = require('http').createServer();
  var buffet = require('buffet')({ root: __dirname + '/feeds', indexes: false, watch: false });
  app.on('request', function (req, res) {
    var url = URL.parse(req.url, true);
    // gzip the response unless the Accept-Encoding header says otherwise - issue #36
    if (url.query['gzip'] === 'true') {
      req.headers['accept-encoding'] = req.headers['accept-encoding'] || 'deflate, gzip';
    }
    if (url.query['notModified'] === 'true') {
      res.writeHead('304', 'Not modified');
      res.end();
    }
  });
  app.on('request', buffet);
  app.on('request', buffet.notFound);
  app.listen(21337, function () {
    done && done();
  });
  server.app = app;
  server.close = function (done) {
    app.close.call(app, function (){
      delete server.app;
      delete require.cache.buffet;
      done && done();
    });
  };
};
