const { Readable } = require('stream');
describe('angle brackets in title', function () {

  var feeds = [
    `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>W3Schools Home Page</title>
<link>http://www.w3schools.com</link>
<description>Free web building tutorials</description>
<item>
<title>RSS &#x3C;&#x3C;&#x3C;Tutorial&#x3E;&#x3E;&#x3E;</title>
<link>http://www.w3schools.com/xml/xml_rss.asp</link>
<description>New RSS tutorial on W3Schools</description>
</item>
</channel>
</rss>
`, `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>W3Schools Home Page</title>
<link>http://www.w3schools.com</link>
<description>Free web building tutorials</description>
<item>
<title>RSS &lt;&lt;&lt;Tutorial&gt;&gt;&gt;</title>
<link>http://www.w3schools.com/xml/xml_rss.asp</link>
<description>New RSS tutorial on W3Schools</description>
</item>
</channel>
</rss>
`];

  feeds.forEach(function (feed) {
    it('should be properly decoded', function (done) {
      var feedparser = new FeedParser();
      var titles = [];
      Readable.from(feed).pipe(feedparser);
      feedparser.on('readable', function () {
        var item;
        while ((item = this.read())) {
          titles.push(item.title);
        }
      })
    .on('error', function (err) {
      assert.ifError(err);
      done(err);
    })
    .on('end', function () {
      assert.equal(titles[0], 'RSS <<<Tutorial>>>');
      done();
    });
    });
  });

});
