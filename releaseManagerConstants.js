const releaseManagerConstants = {
	mode: {
		"uploadReleaseAsset": "uploadReleaseAsset",
		"downloadReleaseAsset": "downloadReleaseAsset",
		"cleanReleaseDrafts": "cleanReleaseDrafts"
	},
	requiredArgs: {
		cleanReleaseDrafts: {},
		uploadReleaseAsset: {
			tag: true,
			filePath: true
		},
		downloadReleaseAsset: {
			tag: true,
			filePath: true
		}
	}
};

module.exports = releaseManagerConstants;
