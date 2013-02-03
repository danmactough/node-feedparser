describe('feedparser', function(){

  var str = require('fs').readFileSync(__dirname + '/feeds/mediacontent-dupes.xml')
    , meta = {}
    , articles = []
    ;

  describe('feed with the same enclosure in the enclosure and media:content elements', function(){
    before(function(done){
      FeedParser.parseString(str, function (err, _meta, _articles){
        assert.ifError(err);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('enclosures', function(){
      it('should not have duplicates', function (){
        assert.ok(articles[0].enclosures.length === 1);
      });
    });
  });
});

