describe('feedparser', function(){

  var feedparser = new FeedParser({silent: true})
    , feed = 'http://localhost:21337/notafeed.html';

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('URL is not a feed', function(){
    describe('#parseUrl (old API)', function(){
      it('should call back with an error and no meta or articles', function(done) {
        feedparser.parseUrl(feed, function (error, meta, articles) {
          assert.ok(error instanceof Error);
          assert.equal(error.message, 'Remote server did not respond with a feed');
          assert.equal(meta, null);
          assert.equal(articles, null);
          done();
        });
      });
    });
    describe('.parseUrl (new API)', function(){
      it('should call back with an error and no meta or articles', function(done) {
        FeedParser.parseUrl(feed, function (error, meta, articles) {
          assert.ok(error instanceof Error);
          assert.equal(error.message, 'Remote server did not respond with a feed');
          assert.equal(meta, null);
          assert.equal(articles, null);
          done();
        });
      });
    });
  });
});
