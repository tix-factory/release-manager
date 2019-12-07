const fs = require("fs");
const https = require("https");
const github = require("@actions/github");

class ReleaseManager {
	constructor(githubToken, ownerName, repositoryName, tag) {
		this.githubToken = githubToken;
		this.ownerName = ownerName;
		this.repositoryName = repositoryName;
		this.tag = tag;

		this.ocotokit = new github.GitHub(githubToken);
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

				releases.data.forEach(function(release) {
					if (release.draft) {
						draftReleases.push(release);
					}
				});

				resolve(draftReleases);
			}).catch(reject);
		});
	}

	downloadReleaseAsset(releaseAsset) {
		let releaseManager = this;

		return new Promise(function(resolve, reject) {
			https.get(releaseAsset.url, {
				headers: {
					"Accept": "application/octet-stream",
					"Authorization": `Bearer ${releaseManager.githubToken}`,
					"User-Agent": "tix-factory/release-manager"
				}
			}, function(redirectResponse) {
				if (redirectResponse.statusCode === 302) {
					https.get(redirectResponse.headers.location, function(response) {
						if (response.statusCode === 200) {
							var chunks = [];

							response.on("data", function(chunk) {
								chunks.push(chunk);
							}).on("end", function() {
								var buffer = Buffer.concat(chunks);
								resolve(buffer);
							});
						} else {
							reject(`Failed to download asset (${redirectResponse.headers.location})\n\tStatus code: ${response.statusCode}`);
						}
					}).on("error", reject);
				} else {
					reject(`Failed to get redirect location for asset (${releaseAsset.url}).\n\tStatus code: ${redirectResponse.statusCode}`);
				}
			}).on("error", reject);
		});
	}

	uploadReleaseAsset(release, filePath, assetName) {
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
		return this.ocotokit.repos.deleteRelease({
			owner: this.ownerName,
			repo: this.repositoryName,
			release_id: releaseId
		});
	}
}

module.exports =  ReleaseManager;
