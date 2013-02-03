describe('feedparser', function(){

  var feedparser = new FeedParser({silent: true})
    , feed = 'http://nonexistingdomaincausinganerror.com/feed.rss'
    ;

  describe('#parseUrl', function(){
    it('should return http error: getaddrinfo ENOENT', function(done) {
      this.timeout(10000);
      feedparser.parseUrl(feed, function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        // Exact error code seems to differ -- maybe by os
        assert.ok(error.message === 'getaddrinfo ENOENT' || error.message === 'getaddrinfo ENOTFOUND');
        done();
      });
    });
  });
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
});
