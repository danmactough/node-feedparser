describe('feedparser', function(){

  var feedparser = new FeedParser({silent: true})
    , str = require('fs').readFileSync(__dirname + '/feeds/rss2sample.xml')
    , meta = {}
    , articles = []
    ;

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
  describe('parseString with custom date format', function() {
    before(function(done){
      var str = require('fs').readFileSync(__dirname + '/feeds/rss2sample-odddatetime.xml');
      FeedParser.parseString(str, {dateformat: 'DD/MM/YYYY HH:mm:ss'}, function (err, _meta, _articles){
        assert.ifError(err);
        meta = _meta;
        articles = _articles;
        done();
      });
    });
    describe('meta', function(){
      it('should have a last build date of feb 9th 2013', function() {
        assert.equal(new Date('Feb 9 2013').getTime(), meta.date.getTime());
      });
    });
    describe('article 1', function(){
      it('should have a pubdate time of feb 8 2013, 12:00', function(){
        assert.equal(new Date('Feb 8 2013, 12:00:00').getTime(), articles[0].pubdate.getTime());
      });
    });
  });
});

