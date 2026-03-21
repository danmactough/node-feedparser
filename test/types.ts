import FeedParser = require('../index');

// Constructor with no options
const fp1 = new FeedParser();

// Constructor with all options
const fp2 = new FeedParser({
  strict: false,
  normalize: true,
  addmeta: true,
  feedurl: 'https://example.com/feed',
  resume_saxerror: true,
  MAX_BUFFER_LENGTH: 1024 * 1024,
});

// meta event
fp2.on('meta', (meta: FeedParser.Meta) => {
  const title: string = meta.title;
  const description: string = meta.description;
  const type: FeedParser.Type = meta['#type'];
  const version: string = meta['#version'];
  const ns: Array<{ [key: string]: string }> = meta['#ns'];
  const attrs: { [key: string]: any } = meta['@'];
  const date: Date | null = meta.date;
  const pubdate: Date | null = meta.pubdate;
  const link: string = meta.link;
  const xmlurl: string = meta.xmlurl;
  const author: string = meta.author;
  const language: string = meta.language;
  const image: FeedParser.Image = meta.image;
  const imageUrl: string = image.url;
  const favicon: string = meta.favicon;
  const copyright: string = meta.copyright;
  const generator: string = meta.generator;
  const categories: string[] = meta.categories;
  // namespace-prefixed properties via index signature
  const itunesAuthor = meta['itunes:author'];
});

// error event
fp2.on('error', (err: Error) => {
  err.message;
});

// readable event + read()
fp2.on('readable', () => {
  let item: FeedParser.Item | null;
  while ((item = fp2.read()) !== null) {
    const title: string = item.title;
    const description: string = item.description;
    const summary: string = item.summary;
    const date: Date | null = item.date;
    const pubdate: Date | null = item.pubdate;
    const link: string = item.link;
    const origlink: string = item.origlink;
    const author: string = item.author;
    const guid: string = item.guid;
    const comments: string = item.comments;
    const image: { url: string } = item.image;
    const categories: string[] = item.categories;
    const source: FeedParser.Source = item.source;
    const sourceTitle: string = source.title;
    const sourceUrl: string = source.url;
    const enclosures: FeedParser.Enclosure[] = item.enclosures;
    const enc: FeedParser.Enclosure = enclosures[0];
    const encUrl: string = enc.url;
    const meta: FeedParser.Meta = item.meta;
    // namespace-prefixed properties via index signature
    const mediaContent = item['media:content'];
  }
});

// once and addListener overloads
fp2.once('meta', (_meta: FeedParser.Meta) => {});
fp2.addListener('error', (_err: Error) => {});

fp2.resumeSaxError();
