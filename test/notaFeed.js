var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  ;

describe('feedparser', function(){
  describe('#parseUrl', function(){
    it('should call back with an error and no meta or articles', function(done) {
      feedparser.parseUrl('http://lifehacker.com', function (error, meta, articles) {
        assert.notEqual(error, null);
        assert.equal(meta, null);
        assert.equal(articles, null);
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
