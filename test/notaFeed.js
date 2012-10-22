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
  describe('.parseUrl', function(){
    it('should call back with an error and no meta or articles', function(done) {
      FeedParser.parseUrl('http://lifehacker.com', function (error, meta, articles) {
        assert.notEqual(error, null);
        assert.equal(meta, null);
        assert.equal(articles, null);
        done();
      });
    });
  });
});
