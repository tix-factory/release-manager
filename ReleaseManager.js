const fs = require("fs");
const https = require("https");
const github = require("@actions/github");
const releaseManagerConstants = require("./releaseManagerConstants.js");

class ReleaseManager {
	constructor(githubToken, ownerName, repositoryName, tag) {
		this.githubToken = githubToken;
		this.ownerName = ownerName;
		this.repositoryName = repositoryName;
		this.tag = tag;

		this.ocotokit = new github.GitHub(githubToken);
	}

	getRelease() {
		return new Promise((resolve, reject) => {
			this.ocotokit.repos.getReleaseByTag({
				owner: this.ownerName,
				repo: this.repositoryName,
				tag: this.tag
			}).then((response) => {
				resolve(response.data);
			}).catch((response) => {
				if (response.status === 404) {
					reject({
						error: releaseManagerConstants.error.invalidRelease,
						data: response
					});
				} else {
					reject({
						error: releaseManagerConstants.error.unknown,
						data: response
					});
				}
			});
		});
		return 
	}

	getOrCreateRelease() {
		return new Promise((resolve, reject) => {
			this.getRelease().then(resolve).catch((err) => {
				if (err.error === releaseManagerConstants.error.invalidRelease) {
					this.ocotokit.repos.createRelease({
						owner: this.ownerName,
						repo: this.repositoryName,
						tag_name: this.tag
					}).then((response) => {
						resolve(response.data);
					}).catch(reject);
				} else {
					reject(err);
				}
			});
		});
	}

	getDraftReleases() {
		return new Promise((resolve, reject) => {
			this.ocotokit.repos.listReleases({
				owner: this.ownerName,
				repo: this.repositoryName
			}).then((releases) => {
				let draftReleases = [];

				releases.data.forEach((release) => {
					if (release.draft) {
						draftReleases.push(release);
					}
				});

				resolve(draftReleases);
			}).catch(reject);
		});
	}

	downloadReleaseAsset(releaseAsset) {
		return new Promise((resolve, reject) => {
			https.get(releaseAsset.url, {
				headers: {
					"Accept": "application/octet-stream",
					"Authorization": `Bearer ${this.githubToken}`,
					"User-Agent": "tix-factory/release-manager"
				}
			}, (redirectResponse) => {
				if (redirectResponse.statusCode === 302) {
					https.get(redirectResponse.headers.location, (response) => {
						if (response.statusCode === 200) {
							var chunks = [];

							response.on("data", (chunk) => {
								chunks.push(chunk);
							}).on("end", () => {
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

		return new Promise((resolve, reject) => {
			fs.readFile(filePath, (err, file) => {
				if (err) {
					reject(err);
					return;
				}

				this.ocotokit.repos.uploadReleaseAsset({
					url: release.upload_url,
					file: file,
					name: assetName,
					headers: {
						"Content-Type": "binary/octet-stream",
						"Content-Length": file.length
					}
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
