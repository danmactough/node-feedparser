/// <reference types="node" />

import stream = require("stream");

export = FeedParser;

declare class FeedParser extends stream.Transform {
    constructor(options?: FeedParser.Options);
    meta: FeedParser.Meta;
    options: FeedParser.Options;

    read(): FeedParser.Item | null;
    [Symbol.asyncIterator](): AsyncGenerator<FeedParser.Item>;
    resumeSaxError(): void;

    on(event: 'meta', listener: (meta: FeedParser.Meta) => void): this;
    on(event: 'readable', listener: (this: FeedParser) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;

    addListener(event: 'meta', listener: (meta: FeedParser.Meta) => void): this;
    addListener(event: 'readable', listener: (this: FeedParser) => void): this;
    addListener(event: 'error', listener: (error: Error) => void): this;
    addListener(event: string, listener: (...args: any[]) => void): this;

    once(event: 'meta', listener: (meta: FeedParser.Meta) => void): this;
    once(event: 'readable', listener: (this: FeedParser) => void): this;
    once(event: 'error', listener: (error: Error) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
}

declare namespace FeedParser {
    type Type = "atom" | "rss" | "rdf";

    interface Options {
        strict?: boolean;
        normalize?: boolean;
        addmeta?: boolean;
        feedurl?: string;
        resume_saxerror?: boolean;
        MAX_BUFFER_LENGTH?: number;
    }

    interface Image {
        url: string;
        title: string;
    }

    interface Meta {
        "#ns": Array<{ [key: string]: string }>;
        "#type": Type;
        "#version": string;
        "@": { [key: string]: any };
        title: string;
        description: string;
        date: Date | null;
        pubdate: Date | null;
        link: string;
        xmlurl: string;
        author: string;
        language: string;
        image: Image;
        favicon: string;
        copyright: string;
        generator: string;
        categories: string[];
        [key: string]: any;
    }

    interface Enclosure {
        url: string;
        type?: string;
        length?: string;
    }

    interface Source {
        title: string;
        url: string;
    }

    interface Item {
        title: string;
        description: string;
        summary: string;
        date: Date | null;
        pubdate: Date | null;
        link: string;
        origlink: string;
        author: string;
        guid: string;
        comments: string;
        image: { url: string };
        categories: string[];
        source: Source;
        enclosures: Enclosure[];
        meta: Meta;
        [key: string]: any;
    }
}
