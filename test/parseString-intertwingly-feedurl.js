var assert = require('assert')
  , fs = require('fs')
  , str = fs.readFileSync(__dirname + '/feeds/intertwingly.atom')
  , meta = {}
  , articles = []
  , FeedParser = require('../')
  , feedparser = new FeedParser()
  ;

describe('feedparser', function(){
  describe('#parseString', function(){
    before(function(done){
      feedparser.parseString(str, { feedurl: 'http://intertwingly.net/blog/index.atom' }, function (err, _meta, _articles){
        assert.ifError(err);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('meta', function(){
      it('should have the link "http://intertwingly.net/blog/"', function(){
        assert.equal('http://intertwingly.net/blog/', meta.link);
      });
    });
  });
  describe('.parseString', function(){
    before(function(done){
      FeedParser.parseString(str, { feedurl: 'http://intertwingly.net/blog/index.atom' }, function (err, _meta, _articles){
        assert.ifError(err);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('meta', function(){
      it('should have the link "http://intertwingly.net/blog/"', function(){
        assert.equal('http://intertwingly.net/blog/', meta.link);
      });
    });
  });
});

