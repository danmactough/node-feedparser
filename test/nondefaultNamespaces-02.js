var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  , feed = __dirname + '/feeds/nondefaultnamespace-baseline.atom'
  , meta = {}
  , articles = {}
  ;

describe('feedparser', function(){
  describe('nondefaultnamespace-baseline', function(){
    before(function(done){
      feedparser.parseFile(feed, function (error, _meta, _articles) {
        assert.ifError(error);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('article', function(){
      it('should have the expected title', function() {
        assert.ok(articles[0].title.match(/^If you can read/));
      });
      it('should have the expected description', function(){
        assert.ok(articles[0].description.match(/^<div xmlns="http:\/\/www.w3.org\/1999\/xhtml">/));
      });
    });
  });
});
