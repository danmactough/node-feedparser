describe('feedparser', function(){

  var str = require('fs').readFileSync(__dirname + '/feeds/intertwingly.atom')
    , meta = {}
    , articles = []
    ;

  describe('Feed uses relative URIs but no root xml:base', function () {
    describe('.parseString', function(){
      before(function(done){
        FeedParser.parseString(str, { feedurl: 'http://intertwingly.net/blog/index.atom' }, function (err, _meta, _articles){
          assert.ifError(err);
          meta = _meta;
          articles = _articles;
          done();
        });
      });
      it('can determine the link when passed the feedurl option', function(){
        assert.equal('http://intertwingly.net/blog/', meta.link);
      });
    });
  });
});

