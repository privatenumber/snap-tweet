declare const waitForNetworkIdle: (Network: any, waitFor: number) => Promise<void>;
declare const querySelector: (DOM: any, contextNodeId: number, selector: string) => Promise<any>;
declare const hideNode: (DOM: any, queryNodeId: number, selector: string) => Promise<void>;
declare const screenshotNode: (Page: any, DOM: any, nodeId: number) => Promise<Buffer>;

export { hideNode, querySelector, screenshotNode, waitForNetworkIdle };
