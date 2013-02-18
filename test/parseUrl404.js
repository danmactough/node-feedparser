describe('feedparser', function(){

  var feed = 'http://nonexistingdomaincausinganerror.com/feed.rss';

  describe('.parseUrl', function(){
    it('should return http error: getaddrinfo ENOENT', function(done) {
      this.timeout(10000);
      FeedParser.parseUrl(feed, function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        // Exact error code seems to differ -- maybe by os
        assert.ok(error.message === 'getaddrinfo ENOENT' || error.message === 'getaddrinfo ENOTFOUND');
        done();
      });
    });
  });

  describe('.parseUrl', function () {

    before(function (done) {
      server(done);
    });

    after(function (done) {
      server.close(done);
    });

    it('should return a 404 error', function (done) {
      FeedParser.parseUrl('http://localhost:21337/nosuchfeed.xml', function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        assert.equal(error.code, 404);
        done();
      });
    });
  })
});
