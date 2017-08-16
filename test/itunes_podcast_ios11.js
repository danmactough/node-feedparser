describe('itunes podcast ios11', function(){

  var feed = __dirname + '/feeds/itunes_podcast_ios11.xml';

  function getItems(feed, callback) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        var items = [];
        var item;
        while (item = stream.read()) {
          items.push(item);
        }
        callback(null, items)
      })
      .on('error', function (err) {
        assert.ifError(err);
        callback(err);
      });
  }

  it('items should have a valid season number', function (done) {
    getItems(feed, function(err, items) {
      if (err) {
        return done(err)
      }

      items.forEach(function(item) {
        if (!item.season || !Number.isFinite(item.season) || item.season <= 0) {
          throw new Error(`item is missing season number: ${item.season}`);
        }
      });
      done();
    });
  });

  it('items should have a valid episode number', function (done) {
    getItems(feed, function(err, items) {
      if (err) {
        return done(err)
      }

      items.forEach(function(item) {
        if (!item.episode || !Number.isFinite(item.episode) || item.episode <= 0) {
          throw new Error(`item is missing episode number: ${item.episode}`);
        }
      });
      done();
    });
  });

  it('items should have a valid episodeType value', function (done) {
    getItems(feed, function(err, items) {
      if (err) {
        return done(err)
      }

      var allowed = ['full', 'trailer', 'bonus'];
      items.forEach(function(item) {
        if (allowed.indexOf(item.episodeType) === -1) {
          throw new Error(`item has invalid episodeType value: ${item.episodeType}`);
        }
      });
      done();
    });
  });

  it('meta should have a type', function (done) {
    fs.createReadStream(feed).pipe(new FeedParser())
      .once('readable', function () {
        var stream = this;
        var meta = this.meta;
        if (!meta.type) {
          throw new Error('meta is missing a type');
        }
        done()
      })
      .on('error', function (err) {
        assert.ifError(err);
        done(err);
      });
  });

});
