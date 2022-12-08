import pRetry from 'p-retry';

export const waitForNetworkIdle = (
	Network,
	waitFor: number,
): Promise<void> => new Promise((resolve) => {
	const trackRequests = new Set();
	let resolvingTimeout = setTimeout(resolve, waitFor);

	Network.requestWillBeSent(({ requestId }) => {
		trackRequests.add(requestId);
		clearTimeout(resolvingTimeout);
	});

	Network.loadingFinished(({ requestId }) => {
		trackRequests.delete(requestId);
		if (trackRequests.size === 0) {
			resolvingTimeout = setTimeout(resolve, waitFor);
		}
	});
});

const sleep = (ms: number): Promise<void> => new Promise((resolve) => {
	setTimeout(resolve, ms);
});

export const querySelector = async (
	DOM,
	contextNodeId: number,
	selector: string,
) => await pRetry(
	async () => {
		const { nodeId } = await DOM.querySelector({
			nodeId: contextNodeId,
			selector,
		});

		if (nodeId === 0) {
			throw new Error(`Selector "${selector}" not found`);
		}

		return nodeId as number;
	},
	{
		retries: 3,
		onFailedAttempt: async () => await sleep(100),
	},
);

export const xpath = async (
	DOM,
	query: string,
) => {
	const { searchId, resultCount } = await DOM.performSearch({ query });
	const { nodeIds } = await DOM.getSearchResults({
		searchId,
		fromIndex: 0,
		toIndex: resultCount,
	});

	return nodeIds as number[];
};

export const hideNode = async (
	DOM,
	nodeId: number,
) => {
	await DOM.setAttributeValue({
		nodeId,
		name: 'style',
		value: 'visibility: hidden',
	});
};

export const screenshotNode = async (
	Page,
	DOM,
	nodeId: number,
) => {
	try {
		const { model } = await DOM.getBoxModel({ nodeId });
		const screenshot = await Page.captureScreenshot({
			clip: {
				x: 0,
				y: 0,
				width: model.width,
				height: model.height,
				scale: 2,
			},
		});

		return Buffer.from(screenshot.data, 'base64');
	} catch (error) {
		console.log(error);
		throw new Error('Failed to take a snapshot');
	}
};
