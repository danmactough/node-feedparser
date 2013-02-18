describe('feedparser', function(){

  var feed = 'http://localhost:21337/rss2sample.xml?gzip=true';

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('servers that return a compressed response unless requested not to', function () {
    describe('.parseUrl', function(){
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
