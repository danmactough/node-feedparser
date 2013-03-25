describe('Event API', function () {

  var feedUrl = 'http://localhost:21337/rss2sample.xml'
    , feedPath = __dirname + '/feeds/rss2sample.xml'
    , feedStr = require('fs').readFileSync(feedPath);

  var events = [];

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('Good Feed', function () {

    beforeEach(function () {
      events = [];
    })

    afterEach(function () {
      assert.equal(events.indexOf('error'), -1);
      assert.ok(~events.indexOf('meta'));
      assert.ok(~events.indexOf('article'));
      assert.ok(~events.indexOf('complete'));
    });

    describe('.parseString', function () {
      it('works', function (done) {
        FeedParser.parseString(feedStr)
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
            done();
          });
      });
    });

    describe('.parseUrl', function () {
      it('works', function (done) {
        FeedParser.parseUrl(feedUrl)
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
          .on('end', done);
      });
    });

    describe('.parseStream', function () {
      it('works', function (done) {
        FeedParser.parseStream(require('fs').createReadStream(feedPath))
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
          .on('end', done);

      });
    });

  });

  describe('Bad Feed', function () {
    it('can handle an error', function (done) {
      FeedParser.parseUrl('http://localhost:21337/notafeed.html')
        .on('error', function (err) {
          assert.ok(err instanceof Error);
        })
        .on('end', done);
    });
  });
});