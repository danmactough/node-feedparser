describe('duplicate enclosures', function(){

  var feed = __dirname + '/feeds/mediacontent-dupes.xml';

  it('should not have duplicate enclosures from different elements', function (done){
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        var enclosures = stream.read().enclosures;
        assert.strictEqual(enclosures.length, 3);
        assert.deepEqual(enclosures, [{
          url: 'http://i.mol.im/i/pix/2013/02/03/article-2272640-174FCEE2000005DC-697_154x115.jpg',
          type: 'image/jpeg',
          length: '4114',
          height: '115',
          width: '154'
        }, {
          url: 'http://i.mol.im/i/pix/2013/02/03/article-2272640-174FCEE2000005DC-697_154x115.mp4',
          type: 'video/mp4',
          length: '4114'
        }, {
          url: 'http://i.mol.im/i/pix/2013/02/03/article-2272640-174FCEE2000005DC-697.mp4',
          type: 'video/mp4',
          length: null,
          bitrate: '3000',
          height: '115',
          width: '154'
        }]);
        done();
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});

