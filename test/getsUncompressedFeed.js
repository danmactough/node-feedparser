describe('feedparser', function(){

  var feedparser = new FeedParser({silent: true})
    , feed = 'http://localhost:21337/rss2sample.xml?gzip=true';

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('servers that return a compressed response unless requested not to', function () {
    describe('#parseUrl (old API)', function(){
      it('will cause an error', function(done) {
        feedparser.parseUrl(feed, function (error) {
          assert.ok(error instanceof Error);
          done();
        });
      });
    });
    describe('.parseUrl (new API)', function(){
      it('can ask servers to return an uncompressed response', function(done) {
        FeedParser.parseUrl(feed, function (error, meta, articles) {
          assert.ifError(error);
          assert.notStrictEqual(meta, null);
          assert.notStrictEqual(articles, null);
          done();
        });
      });
    });
  });
});
