import assert from 'assert';
import { launch, LaunchedChrome } from 'chrome-launcher';
import CDP from 'chrome-remote-interface';
import exitHook from 'exit-hook';
import {
	querySelector,
	xpath,
	waitForNetworkIdle,
	hideNode,
	screenshotNode,
} from './cdp-utils';

interface Options {
	width?: number;
	darkMode?: boolean;
	showThread?: boolean;
	locale?: string;
}

const getEmbeddableTweetUrl = (tweetId: string, options: Options) => {
	const embeddableTweetUrl = new URL('https://platform.twitter.com/embed/Tweet.html');
	const searchParameters = {
		id: tweetId,
		theme: options.darkMode ? 'dark' : 'light',
		hideThread: options.showThread ? 'false' : 'true',
		lang: options.locale ?? 'en',

		// Not sure what these do but pass them in anyway (Reference: https://publish.twitter.com/)
		embedId: 'twitter-widget-0',
		features: 'eyJ0ZndfZXhwZXJpbWVudHNfY29va2llX2V4cGlyYXRpb24iOnsiYnVja2V0IjoxMjA5NjAwLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2hvcml6b25fdHdlZXRfZW1iZWRfOTU1NSI6eyJidWNrZXQiOiJodGUiLCJ2ZXJzaW9uIjpudWxsfX0=',
		frame: 'false',
		hideCard: 'false',
		sessionId: '4ee57c34a8bc3f4118cee97a9904f889f35e29b4',
		widgetsVersion: '82e1070:1619632193066',
	};

	// eslint-disable-next-line guard-for-in
	for (const key in searchParameters) {
		embeddableTweetUrl.searchParams.set(key, searchParameters[key]);
	}

	return embeddableTweetUrl.toString();
};

const waitForTweetLoad = Network => new Promise<void>((resolve, reject) => {
	Network.responseReceived(({ type, response }) => {
		if (
			type === 'XHR'
			&& response.url.startsWith('https://cdn.syndication.twimg.com/tweet')
		) {
			if (response.status === 200) {
				return resolve();
			}

			if (response.status === 404) {
				return reject(new Error('Tweet not found'));
			}

			reject(new Error(`Failed to fetch tweet: ${response.status}`));
		}
	});
});

class TweetCamera {
	chrome: LaunchedChrome;

	initializingChrome: Promise<any>;

	constructor() {
		this.initializingChrome = this.initializeChrome();
	}

	async initializeChrome() {
		const chrome = await launch({
			chromeFlags: [
				'--headless',
				'--disable-gpu',
			],
		});

		exitHook(() => {
			chrome.kill();
		});

		this.chrome = chrome;

		const browserClient = await CDP({
			port: chrome.port,
		});

		return browserClient;
	}

	static parseTweetUrl(tweetUrl: string) {
		assert(tweetUrl, 'Tweet URL must be passed in');
		const [, username, tweetId] = tweetUrl.match(/twitter.com\/(\w{1,15})\/status\/(\d+)/) ?? [];

		assert(
			username && tweetId,
			`Invalid Tweet URL: ${tweetUrl}`,
		);

		return {
			username,
			tweetId,
		};
	}

	static getRecommendedFileName(
		username: string,
		tweetId: string,
		options: Options = {},
	) {
		const nameComponents = [username, tweetId];

		if (options.width !== 550) {
			nameComponents.push(`w${options.width}`);
		}

		if (options.showThread) {
			nameComponents.push('thread');
		}

		if (options.darkMode) {
			nameComponents.push('dark');
		}

		if (options.locale !== 'en') {
			nameComponents.push(options.locale);
		}

		return `${nameComponents.join('-')}.png`;
	}

	async snapTweet(
		tweetId: string,
		options: Options = {},
	) {
		const browserClient = await this.initializingChrome;
		const { targetId } = await browserClient.Target.createTarget({
			url: getEmbeddableTweetUrl(tweetId, options),
			width: options.width ?? 550,
			height: 1000,
		});

		const client = await CDP({
			port: this.chrome.port,
			target: targetId,
		});

		await client.Network.enable();

		await waitForTweetLoad(client.Network);

		await waitForNetworkIdle(client.Network, 200);

		const { root } = await client.DOM.getDocument();
		const tweetContainerNodeId = await querySelector(client.DOM, root.nodeId, '#app > div > div > div:last-child');

		const [tweetLinkNodeId] = await xpath(client.DOM, '//a[starts-with(@href, "https://twitter.com/intent/tweet")]/..');

		await Promise.all([
			// "Copy link to Tweet" button
			hideNode(client.DOM, await querySelector(client.DOM, tweetContainerNodeId, '[role="button"]')),

			// Info button - can't use aria-label because of i18n
			hideNode(client.DOM, await querySelector(client.DOM, tweetContainerNodeId, 'a[href$="twitter-for-websites-ads-info-and-privacy"]')),

			client.DOM.removeNode({ nodeId: tweetLinkNodeId }),

			// Unset max-width to fill window width
			client.DOM.setAttributeValue({
				nodeId: tweetContainerNodeId,
				name: 'style',
				value: 'max-width: unset',
			}),

			// Set transparent bg for screenshot
			client.Emulation.setDefaultBackgroundColorOverride({
				color: {
					r: 0, g: 0, b: 0, a: 0,
				},
			}),
		]);

		// If the width is larger than default, a larger image might get requested
		if (options.width > 550) {
			await waitForNetworkIdle(client.Network, 200);
		}

		// Screenshot only the tweet
		const snapshot = await screenshotNode(client.Page, client.DOM, tweetContainerNodeId);

		client.Target.closeTarget({
			targetId,
		});

		return snapshot;
	}

	async close() {
		const browserClient = await this.initializingChrome;
		await browserClient.close();
		await this.chrome.kill();
	}
}

export default TweetCamera;
