const releaseManagerConstants = {
	mode: {
		"uploadReleaseAsset": "uploadReleaseAsset",
		"downloadReleaseAsset": "downloadReleaseAsset",
		"cleanReleaseDrafts": "cleanReleaseDrafts"
	},
	error: {
		unknown: "unknown",
		invalidRelease: "invalidRelease"
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
