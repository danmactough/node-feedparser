var assert = require('assert')
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  , feed = __dirname + '/feeds/wapowellness-altns.xml'
  , meta = {}
  , articles = {}
  ;

describe('feedparser', function(){
  describe('namespaced elements with nondefault prefixes', function(){
    before(function(done){
      feedparser.parseFile(feed, function (error, _meta, _articles) {
        assert.ifError(error);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('article', function(){
      it('should have the expected author via dc:creator', function() {
        assert.equal(articles[0].author, 'Lenny Bernstein');
      });
      it('should have the expected origlink via pheedo:origlink', function(){
        assert.equal(articles[0].origlink, 'http://www.washingtonpost.com/lifestyle/wellness/schools-minister-to-kids-fitness-and-nutrition-needs/2012/08/21/0ca90d46-e6eb-11e1-936a-b801f1abab19_story.html?wprss=rss_wellness');
      });
    });
  });
  describe('namespaced elements with nondefault prefixes using static methods', function(){
    before(function(done){
      FeedParser.parseFile(feed, function (error, _meta, _articles) {
        assert.ifError(error);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('article', function(){
      it('should have the expected author via dc:creator', function() {
        assert.equal(articles[0].author, 'Lenny Bernstein');
      });
      it('should have the expected origlink via pheedo:origlink', function(){
        assert.equal(articles[0].origlink, 'http://www.washingtonpost.com/lifestyle/wellness/schools-minister-to-kids-fitness-and-nutrition-needs/2012/08/21/0ca90d46-e6eb-11e1-936a-b801f1abab19_story.html?wprss=rss_wellness');
      });
    });
  });
});
