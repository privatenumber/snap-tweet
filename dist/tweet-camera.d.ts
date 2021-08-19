import { LaunchedChrome } from 'chrome-launcher';

interface Options {
    width?: number;
    darkMode?: boolean;
    showThread?: boolean;
    locale?: string;
}
declare class TweetCamera {
    chrome: LaunchedChrome;
    initializingChrome: Promise<any>;
    constructor();
    initializeChrome(): Promise<any>;
    static parseTweetUrl(tweetUrl: string): {
        username: string;
        tweetId: string;
    };
    static getRecommendedFileName(username: string, tweetId: string, options?: Options): string;
    snapTweet(tweetId: string, options?: Options): Promise<Buffer>;
    close(): Promise<void>;
}

export default TweetCamera;
