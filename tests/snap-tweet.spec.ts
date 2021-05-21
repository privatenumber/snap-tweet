import del from 'del';
import {
	downloadsDirectory,
	snapTweet,
	comparePngs,
} from './utils';

beforeAll(async () => {
	await del(downloadsDirectory);
});

test('Basic tweet', async () => {
	const expected = './tests/snapshots/snap-tweet-jack-20.png';
	const snappedFile = await snapTweet(
		'https://twitter.com/jack/status/20',
	);
	const difference = await comparePngs(snappedFile, expected);

	expect(difference).toBe(0);
});

test('Dark mode', async () => {
	const expected = './tests/snapshots/snap-tweet-jack-20-dark.png';
	const snappedFile = await snapTweet(
		'https://twitter.com/jack/status/20',
		'--dark-mode',
	);
	const difference = await comparePngs(snappedFile, expected);

	expect(difference).toBe(0);
});

test('Localization', async () => {
	const expected = './tests/snapshots/snap-tweet-jack-20-ja.png';
	const snappedFile = await snapTweet(
		'https://twitter.com/jack/status/20',
		'--locale',
		'ja',
	);
	const difference = await comparePngs(snappedFile, expected);

	expect(difference).toBe(0);
});
