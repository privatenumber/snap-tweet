import fs from 'fs';
import path from 'path';
import { unusedFilename } from 'unused-filename';
import tempy from 'tempy';
import open from 'open';
import { cli } from 'cleye';
import renderTaskRunner from './render-task-runner';
import TweetCamera from './tweet-camera';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

const argv = cli({
	name: 'snap-tweet',

	version,

	parameters: ['<tweet urls...>'],

	flags: {
		outputDir: {
			type: String,
			alias: 'o',
			description: 'Tweet screenshot output directory',
			placeholder: '<path>',
		},
		outputFilename: {
			type: String,
			alias: 'f',
			description: 'Tweet screenshot output filename',
		},
		width: {
			type: Number,
			alias: 'w',
			description: 'Width of tweet',
			default: 550,
			placeholder: '<width>',
		},
		showThread: {
			type: Boolean,
			alias: 't',
			description: 'Show tweet thread',
		},
		darkMode: {
			type: Boolean,
			alias: 'd',
			description: 'Show tweet in dark mode',
		},
		locale: {
			type: String,
			description: 'Locale',
			default: 'en',
			placeholder: '<locale>',
		},
		showComments: {
			type: Boolean,
			alias: 's',
			description: 'Show comments',
			default: false,
		},
		fillLikeButton: {
			type: Boolean,
			alias: 'l',
			description: 'Fill the like button',
			default: false,
		},
		fillCommentButton: {
			type: Boolean,
			alias: 'c',
			description: 'Fill the comment button',
			default: false,
		},
		hideFollowButton: {
			type: Boolean,
			alias: 'b',
			description: 'Hide the follow button',
			default: false
		},
		scale:{
			type: Number,
			alias: 'x',
			description: 'Scale of tweet (multiplier to increase the resolution)',
			default: 1,
		}
	},

	help: {
		examples: [
			'# Snapshot a tweet',
			'snap-tweet https://twitter.com/jack/status/20',
			'',
			'# Snapshot a tweet with Japanese locale',
			'snap-tweet https://twitter.com/TwitterJP/status/578707432 --locale ja',
			'',
			'# Snapshot a tweet with dark mode and 900px width',
			'snap-tweet https://twitter.com/Interior/status/463440424141459456 --width 900 --dark-mode',
			,
		],
	},
});

(async () => {
	const options = argv.flags;
	const tweets = argv._.tweetUrls
		.map(
			tweetUrl => ({
				...TweetCamera.parseTweetUrl(tweetUrl),
				tweetUrl,
			}),
		)
		.filter(
			// Deduplicate
			(tweet, index, allTweets) => {
				const index2 = allTweets.findIndex(t => t.tweetId === tweet.tweetId);
				return index === index2;
			},
		);

	const tweetCamera = new TweetCamera();
	const startTask = renderTaskRunner();

	await Promise.all(tweets.map(async ({
		tweetId,
		username,
		tweetUrl,
	}) => {
		const task = startTask(`📷 Snapping tweet #${tweetId} by @${username}`);

		try {
			const snapshot = await tweetCamera.snapTweet(tweetId, options);
			const recommendedFileName = TweetCamera.getRecommendedFileName(
				username,
				tweetId,
				options,
			);
			const fileName = `${recommendedFileName}`;

			if (options.outputDir) {
				const filePath = await unusedFilename(path.resolve(options.outputDir, fileName));
				await fs.promises.writeFile(filePath, snapshot);

				task.success(`📸 Tweet #${tweetId} by @${username} saved to ${filePath}`);
			} else {
				const filePath = tempy.file({
					name: fileName,
				});
				await fs.promises.writeFile(filePath, snapshot);
				open(filePath);

				task.success(`📸 Snapped tweet #${tweetId} by @${username}`);
			}
		} catch (error) {
			task.error(`${error.message}: ${tweetUrl}`);
		}
	}));

	await tweetCamera.close();
})().catch((error) => {
	if (error.code === 'ERR_LAUNCHER_NOT_INSTALLED') {
		console.log(
			'[snap-tweet] Error: Chrome could not be automatically found! Manually pass in the Chrome binary path with the CHROME_PATH environment variable: CHROME_PATH=/path/to/chrome npx snap-tweet ...',
		);
	} else {
		console.log('[snap-tweet] Error:', error.message);
	}
	process.exit(1);
});
