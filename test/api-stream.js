describe('Writeable Stream Input API', function () {

  var feedPath = __dirname + '/feeds/rss2sample.xml';

  var events = [];

  beforeEach(function () {
    events = [];
  })

  afterEach(function () {
    assert.equal(events.indexOf('error'), -1);
    assert.ok(~events.indexOf('meta'));
    assert.ok(~events.indexOf('article'));
    assert.ok(~events.indexOf('complete'));
  });

  describe('.pipe()', function () {
    it('works', function (done) {
      require('fs').createReadStream(feedPath).pipe(FeedParser())
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