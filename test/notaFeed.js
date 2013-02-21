describe('feedparser', function(){

  var feed = 'http://localhost:21337/notafeed.html';

  before(function (done) {
    server(done);
  });

  after(function (done) {
    server.close(done);
  });

  describe('URL is not a feed', function(){
    describe('.parseUrl', function(){
      it('should call back with an error and no meta or articles', function(done) {
        FeedParser.parseUrl(feed, function (error, meta, articles) {
          assert.ok(error instanceof Error);
          assert.equal(error.message, 'Not a feed');
          assert.equal(error.url, feed);
          assert.equal(meta, null);
          assert.equal(articles, null);
          done();
        });
      });
    });
  });
});
