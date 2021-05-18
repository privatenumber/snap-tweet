import fs from 'fs';
import path from 'path';
import cac from 'cac';
import unusedFilename from 'unused-filename';
import tempy from 'tempy';
import open from 'open';
import renderTaskRunner from './render-task-runner';
import TweetCamera from './tweet-camera';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

const cli = cac('snap-tweet')
	.usage('<...tweet urls>')
	.option(
		'-o, --output-dir <path>',
		'Tweet screenshot output directory',
	)
	.option(
		'-w, --width <width>',
		'Width of tweet',
		{
			default: 550,
		},
	)
	.option(
		'-t, --show-thread',
		'Show tweet thread',
	)
	.option(
		'-d, --dark-mode',
		'Show tweet in dark mode',
	)
	.option(
		'-l, --locale <locale>',
		'Locale',
		{
			default: 'en',
		},
	)
	.help()
	.version(version)
	.example('$ snap-tweet https://twitter.com/jack/status/20')
	.example('$ snap-tweet https://twitter.com/TwitterJP/status/578707432 --locale ja')
	.example('$ snap-tweet https://twitter.com/Interior/status/463440424141459456 --width 900 --dark-mode');

(async ({ args, options }) => {
	if (options.help || options.version) {
		process.exit(0);
	}

	const tweets = args
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

	if (tweets.length === 0) {
		cli.outputHelp();
		process.exit(0);
	}

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
			const fileName = `snap-tweet-${recommendedFileName}`;

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
})(cli.parse()).catch((error) => {
	console.log('[snap-tweet] Error:', error.message);
	process.exit(1);
});
