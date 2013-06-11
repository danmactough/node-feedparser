/*global assert:true, FeedParser:true, server:true*/
var URL = require('url');

assert = require('assert');
var path = require('path')
  , zlib = require('zlib')
  , gzip = zlib.createGzip();

fs = require('fs');
FeedParser = require('../');
server = function (done) {
  var app = require('http').createServer();
  app.on('request', function (req, res) {
    var url = URL.parse(req.url, true)
      , file = path.resolve(__dirname, 'feeds', url.pathname.replace(/^\//, ''));
    if (url.query['notModified'] === 'true') {
      res.writeHead('304', 'Not modified');
      res.end();
    }
    else {
      fs.exists(file, function (exists) {
        if (!exists) {
          res.writeHead('404', 'Not found');
          return res.end();
        }
        // gzip the response unless the Accept-Encoding header says otherwise - issue #36
        if (url.query['gzip'] === 'true' && !req.headers['accept-encoding'].match(/identity/i)) {
          fs.createReadStream(file).pipe(gzip).pipe(res);
        }
        else {
          fs.createReadStream(file).pipe(res);
        }
      });
    }
  });
  app.listen(21337, function () {
    done && done();
  });
  server.app = app;
  server.close = function (done) {
    app.close.call(app, function (){
      delete server.app;
      done && done();
    });
  };
};
