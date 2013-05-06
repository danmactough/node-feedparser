var fs = require('fs');
var endpoint = require('endpoint');

describe('Writeable Stream Input API', function () {

  var feedPath = __dirname + '/feeds/rss2sample.xml';

  describe('.pipe()', function () {
    it('works', function (done) {
      var events = [];

      fs.createReadStream(feedPath).pipe(FeedParser())
        .on('error', function (err) {
          assert.ifError(err);
          events.push('error');
        })
        .on('meta', function (meta) {
          assert.notEqual(meta, null);
          events.push('meta');
        })
        .on('article', function (article) {
          assert.notEqual(article, null);
          events.push('article');
        })
        .on('complete', function (meta, articles) {
          assert.notEqual(meta, null);
          assert.ok(articles.length);
          events.push('complete');
        })
        .on('end', function () {
          assert.equal(events.indexOf('error'), -1);
          assert.ok(~events.indexOf('meta'));
          assert.ok(~events.indexOf('article'));
          assert.ok(~events.indexOf('complete'));
          done();
        })
        .resume();
    });
  });

  describe('.pipe()', function () {
    it('works', function (done) {
      fs.createReadStream(feedPath)
        .pipe(FeedParser())
        .pipe(endpoint({objectMode: true}, function (err, articles) {
          assert.equal(err, null);
          assert.ok(articles.length);
          done();
        }));
    });
  });

});