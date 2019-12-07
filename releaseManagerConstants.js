const releaseManagerConstants = {
	mode: {
		"uploadReleaseAsset": "uploadReleaseAsset",
		"downloadReleaseAsset": "downloadReleaseAsset",
		"cleanReleaseDrafts": "cleanReleaseDrafts"
	},
	error: {
		unknown: "unknown",
		invalidRelease: "invalidRelease",
		invalidTag: "invalidTag"
	},
	requiredArgs: {
		cleanReleaseDrafts: {},
		uploadReleaseAsset: {
			tag: true,
			filePath: true,
			assetName: true
		},
		downloadReleaseAsset: {
			tag: true,
			filePath: true,
			assetName: true
		}
	}
};

module.exports = releaseManagerConstants;
