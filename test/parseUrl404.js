var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  ;

describe('feedparser', function(){
  describe('#parseUrl', function(){
    it('should return http error: getaddrinfo ENOENT', function(done) {
      this.timeout(10000);
      feedparser.parseUrl('http://nonexistingdomaincausinganerror.com/feed.rss', function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        assert.equal(error.message, 'getaddrinfo ENOENT');
        done();
      });
    });
  });
  describe('.parseUrl', function(){
    it('should return http error: getaddrinfo ENOENT', function(done) {
      this.timeout(10000);
      FeedParser.parseUrl('http://nonexistingdomaincausinganerror.com/feed.rss', function (error, meta, articles) {
        assert(error instanceof Error, error.message);
        assert.equal(error.message, 'getaddrinfo ENOENT');
        done();
      });
    });
  });
});
