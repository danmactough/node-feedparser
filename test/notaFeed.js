var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  ;

describe('feedparser', function(){
  describe('#parseUrl', function(){
    it('should not throw', function(done) {
      this.timeout(10000);
      feedparser.parseUrl('http://lifehacker.com', function (error, meta, articles) {
        assert.ifError(error);
        assert.equal(articles.length, 0);
        done();
      });
    });
  });
});
