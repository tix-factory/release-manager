var fs = require("fs");

class ReleaseManager {
	constructor(octokit, ownerName, repositoryName, tag) {
		this.ocotokit = octokit;
		this.ownerName = ownerName;
		this.repositoryName = repositoryName;
		this.tag = tag;
	}

	getRelease() {
		return this.ocotokit.repos.getReleaseByTag({
			owner: this.ownerName,
			repo: this.repositoryName,
			tag: this.tag
		});
	}

	getDraftReleases() {
		let releaseManager = this;

		return new Promise(function(resolve, reject) {
			releaseManager.ocotokit.repos.listReleases({
				owner: releaseManager.ownerName,
				repo: releaseManager.repositoryName
			}).then(function(releases) {
				let draftReleases = [];

				releases.forEach(function(release) {
					if (release.draft) {
						draftReleases.push(release);
					}
				});

				resolve(draftReleases);
			}).catch(reject);
		});
	}

	uploadAsset(release, filePath, assetName) {
		let releaseManager = this;

		return new Promise(function(resolve, reject) {
			fs.readFile(filePath, function(err, file) {
				if (err) {
					reject(err);
					return;
				}

				releaseManager.ocotokit.repos.uploadAsset({
					url: release.data.upload_url,
					file: file,
					contentLength: file.length,
					name: assetName
				}).then(resolve).catch(reject);
			});
		});
	}

	deleteRelease(releaseId) {
		return this.ocotokit.deleteRelease({
			owner: this.ownerName,
			repo: this.repositoryName,
			release_id: releaseId
		});
	}
}

return ReleaseManager;
