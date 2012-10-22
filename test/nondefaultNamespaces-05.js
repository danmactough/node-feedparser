var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  , feed = __dirname + '/feeds/unknown-namespace.atom'
  , meta = {}
  , articles = {}
  ;

describe('feedparser', function(){
  describe('nondefaultnamespace Test case 3: default namespace Atom; XHTML namespace mapped to a prefix; FooML namespace default in the namespace DIV', function(){
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
        assert.equal(articles[0].title, 'This entry contains XHTML-looking markup that is not XHTML');
      });
      it('should have the expected description', function(){
        assert.ok(articles[0].description.match(/^<h:div xmlns="http:\/\/hsivonen.iki.fi\/FooML">/));
        assert.ok(articles[0].description.match(/<h:li>This is an XHTML list item./));
        assert.ok(articles[0].description.match(/<li>This is not an XHTML list item./));
      });
    });
  });
  describe('nondefaultnamespace using static methods Test case 3: default namespace Atom; XHTML namespace mapped to a prefix; FooML namespace default in the namespace DIV', function(){
    before(function(done){
      FeedParser.parseFile(feed, function (error, _meta, _articles) {
        assert.ifError(error);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('article', function(){
      it('should have the expected title', function() {
        assert.equal(articles[0].title, 'This entry contains XHTML-looking markup that is not XHTML');
      });
      it('should have the expected description', function(){
        assert.ok(articles[0].description.match(/^<h:div xmlns="http:\/\/hsivonen.iki.fi\/FooML">/));
        assert.ok(articles[0].description.match(/<h:li>This is an XHTML list item./));
        assert.ok(articles[0].description.match(/<li>This is not an XHTML list item./));
      });
    });
  });
});
