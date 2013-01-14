describe('feedparser', function(){

  var feedparser = new FeedParser({silent: true})
    , feed = 'http://nonexistingdomaincausinganerror.com/feed.rss'
    ;

  describe('#parseUrl', function(){
    it('should return http error: getaddrinfo ENOENT', function(done) {
      this.timeout(10000);
      feedparser.parseUrl(feed, function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        assert.equal(error.message, 'getaddrinfo ENOENT');
        done();
      });
    });
  });
  describe('.parseUrl', function(){
    it('should return http error: getaddrinfo ENOENT', function(done) {
      this.timeout(10000);
      FeedParser.parseUrl(feed, function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        assert.equal(error.message, 'getaddrinfo ENOENT');
        done();
      });
    });
  });
});
