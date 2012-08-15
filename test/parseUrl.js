var assert = require('assert')
  , meta = {}
  , articles = []
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  ;

describe('feedparser', function(){
  describe('#parseUrl', function(){
    it('should return http errors', function(done) {
      feedparser.parseUrl('http://nonexistingdomaincausinganerror.com/feed.rss', function (error, meta, articles) {
        assert.ifError(!error);
        done();
      });
    });
  });
});
