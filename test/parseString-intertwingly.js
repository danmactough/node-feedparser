describe('feedparser', function(){

  var feedparser = new FeedParser({silent: true})
    , str = require('fs').readFileSync(__dirname + '/feeds/intertwingly.atom')
    , meta = {}
    , articles = []
    ;

  describe('Feed uses relative URIs but no root xml:base', function () {
    describe('#parseString', function(){
      before(function(done){
        feedparser.parseString(str, function (err, _meta, _articles){
          assert.ifError(err);
          meta = _meta;
          articles = _articles;
          done();
        });
      });
      it('can infer the URI base', function(){
        assert.equal('http://intertwingly.net/blog/', meta.link);
      });
    });
    describe('.parseString', function(){
      before(function(done){
        FeedParser.parseString(str, function (err, _meta, _articles){
          assert.ifError(err);
          meta = _meta;
          articles = _articles;
          done();
        });
      });
      it('can infer the URI base', function(){
        assert.equal('http://intertwingly.net/blog/', meta.link);
      });
    });
  });
});
