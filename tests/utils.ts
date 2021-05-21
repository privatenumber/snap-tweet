import path from 'path';
import fs from 'fs';
import assert from 'assert';
import execa from 'execa';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const downloadsDirectory = path.join(__dirname, 'downloads');

export async function comparePngs(
	receivedPngPath: string,
	expectedPngPath: string,
) {
	const [
		received,
		expected,
	] = await Promise.all([
		fs.promises.readFile(receivedPngPath),
		fs.promises.readFile(expectedPngPath),
	]);

	const receivedPng = PNG.sync.read(received);
	const expectedPng = PNG.sync.read(expected);
	const { width, height } = expectedPng;
	const diff = new PNG({ width, height });

	return pixelmatch(receivedPng.data, expectedPng.data, diff.data, width, height, {
		threshold: 0.1,
	});
}

export async function snapTweet(...arguments_: string[]) {
	const { stdout } = await execa('./bin/snap-tweet.js', [
		...arguments_,
		'--output-dir',
		downloadsDirectory,
	]);

	const snapFileName = stdout.match(/\/downloads\/(.+\.png)/)?.[1];
	assert(snapFileName, 'No snap file found');
	return `./tests/downloads/${snapFileName}`;
}
