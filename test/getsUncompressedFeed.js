var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  , feed = 'http://happygiraffe.net/blog/feed/'
  ;

describe('feedparser', function(){
  describe('#parseUrl', function(){
    it.skip('old API should return an error', function(done) {
      feedparser.parseUrl(feed, function (error, meta, articles) {
        assert.ok(error instanceof Error);
        done();
      });
    });
  });
  describe('.parseUrl', function(){
    it('new API should work just fine', function(done) {
      FeedParser.parseUrl(feed, function (error, meta, articles) {
        assert.ifError(error);
        assert.notStrictEqual(meta, null);
        assert.notStrictEqual(articles, null);
        done();
      });
    });
  });
});
