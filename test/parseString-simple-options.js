var assert = require('assert')
  , fs = require('fs')
  , str = fs.readFileSync(__dirname + '/feeds/rss2sample.xml')
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
  });
  describe('.parseString with options { normalize: false, addmeta: false }', function(){
    before(function(done){
      FeedParser.parseString(str, { normalize: false, addmeta: false }, function (err, _meta, _articles){
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
  });
});

