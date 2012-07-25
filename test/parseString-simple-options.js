var assert = require('assert')
  , fs = require('fs')
  , str = fs.readFileSync(__dirname + '/rss2sample.xml')
  , meta = {}
  , articles = []
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  ;

describe('feedparser', function(){
  describe('#parseString with options { normalize: false, addmeta: false }', function(){
    before(function(done){
      feedparser.parseString(str, { normalize: false, addmeta: false }, function (err, _meta, _articles){
        assert.ifError(err);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('meta', function(){
      it('should not have a title', function (){
        assert.equal(false, !!meta.title);
      });
      it('should have the rss:title "Liftoff News"', function(){
        assert.equal('Liftoff News', meta['rss:title']['#']);
      });
    });
    /*
    describe('articles', function(){
      it('should have 4 articles', function(){
        assert.deepEqual(4, articles.length);
      });
      it('the first article should have the title "Star City"', function(){
        assert.equal('Star City', articles[0].title);
      });
      it('the second article should have no title', function (){
        assert.deepEqual(null, articles[1].title);
      });
      it('the third article should have the title "The Engine That Does More"', function(){
        assert.equal('The Engine That Does More', articles[2].title);
      });
      it('the fourth article should have the title "Astronauts\' Dirty Laundry"', function(){
        assert.equal('Astronauts\' Dirty Laundry', articles[3].title);
      });
      it('the first article should have the link "http://liftoff.msfc.nasa.gov/news/2003/news-starcity.asp"', function(){
        assert.equal('http://liftoff.msfc.nasa.gov/news/2003/news-starcity.asp', articles[0].link);
      });
      it('the second article should have no link', function (){
        assert.deepEqual(null, articles[1].link);
      });
      it('the third article should have the link "http://liftoff.msfc.nasa.gov/news/2003/news-VASIMR.asp"', function(){
        assert.equal('http://liftoff.msfc.nasa.gov/news/2003/news-VASIMR.asp', articles[2].link);
      });
      it('the fourth article should have the link "http://liftoff.msfc.nasa.gov/news/2003/news-laundry.asp"', function(){
        assert.equal('http://liftoff.msfc.nasa.gov/news/2003/news-laundry.asp', articles[3].link);
      });
    });
    */
  });
});

