describe('Callback API', function () {

  var feedUrl = 'http://localhost:21337/rss2sample.xml'
    , feedPath = __dirname + '/feeds/rss2sample.xml'
    , feedStr = require('fs').readFileSync(feedPath);

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('.parseString', function () {
    it('works', function (done) {
      FeedParser.parseString(feedStr, function (err, meta, articles) {
        assert.ifError(err);
        assert.notEqual(meta, null);
        assert.notEqual(articles, null);
        assert.ok(articles.length);
        done();
      });
    });
  });

  describe('.parseUrl', function () {
    it('works', function (done) {
      FeedParser.parseUrl(feedUrl, function (err, meta, articles) {
        assert.ifError(err);
        assert.notEqual(meta, null);
        assert.notEqual(articles, null);
        assert.ok(articles.length);
        done();
      });
    });
  });

  describe('.parseStream', function () {
    it('works', function (done) {
      FeedParser.parseStream(require('fs').createReadStream(feedPath), function (err, meta, articles) {
        assert.ifError(err);
        assert.notEqual(meta, null);
        assert.notEqual(articles, null);
        assert.ok(articles.length);
        done();
      });
    });
  });

});