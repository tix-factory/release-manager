const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const releaseManagerConstants = require("./releaseManagerConstants.js");
const ReleaseManager = require("./ReleaseManager.js");

const exitWithError = function(err) {
	console.error(err);
	process.exit(1);
};

const getInputOptions = function(propertyName, mode) {
	switch (propertyName) {
		case "github_token":
		case "mode":
			return { required: true };
		default:
			return {
				required: releaseManagerConstants.requiredArgs[mode][propertyName] || false
			};
	}
};

const getInput = function(propertyName, mode) {
	return core.getInput(propertyName, getInputOptions(propertyName, mode));
};

const run = function() {
	let githubToken = getInput("github_token");
	let mode = getInput("mode");
	let tag = getInput("tag", mode);
	let filePath = getInput("filePath", mode);
	let assetName = getInput("assetName", mode);
	let repo = getInput("repo", mode) || github.context.repo.repo;
	let owner = getInput("owner", mode) || github.context.repo.owner;

	let githubContext = github.context;

	console.log(`Repository: ${owner}/${repo}\n\tCurrent repo:`, githubContext.repo);

	let releaseManager = new ReleaseManager(githubToken, owner, repo, tag);

	switch (mode) {
		case releaseManagerConstants.mode.downloadReleaseAsset:
			releaseManager.getRelease().then(function(release) {
				var releaseAsset = release.assets.filter(function(asset) {
					return asset.name.toLowerCase() === assetName.toLowerCase();
				})[0];

				if (!releaseAsset) {
					exitWithError(`Release asset to download does not exist.\n\tAsset name: ${assetName}`);
					return;
				}

				releaseManager.downloadReleaseAsset(releaseAsset).then(function(assetDataBuffer) {
					fs.writeFile(filePath, assetDataBuffer, function(err) {
						if (err) {
							exitWithError(err);
							return;
						}

						console.log(`Release asset downloaded.\n\tAsset name: ${assetName}\n\tFile path: ${filePath}\n\tContent length: ${assetDataBuffer.length}\n\t`, releaseAsset);
					});
				}).catch(exitWithError);
			}).catch(exitWithError);
			
			break;
		case releaseManagerConstants.mode.uploadReleaseAsset:
			releaseManager.getOrCreateRelease().then(function(release) {
				var releaseAsset = release.assets.filter(function(asset) {
					return asset.name.toLowerCase() === assetName.toLowerCase();
				})[0];

				if (releaseAsset) {
					console.log(`Release already contains asset (${releaseAsset.name})\n\tSkipping...`);
					return;
				}

				releaseManager.uploadReleaseAsset(release, filePath, assetName).then(function(uploadResponse) {
					console.log(`Release asset uploaded.\n\tAsset name: ${assetName}\n\tFile path: ${filePath}\n\t`, uploadResponse);
				}).catch(exitWithError);
			}).catch(exitWithError);
			
			break;
		case releaseManagerConstants.mode.cleanReleaseDrafts:
			releaseManager.getDraftReleases().then(function(draftReleases) {
				if (draftReleases.length <= 0) {
					console.log("No releases to clean.");
					return;
				}

				var deletedCount = 0;
				draftReleases.forEach(function(draftRelease) {
					console.log(`Deleting draft release...\n\tName: ${draftRelease.name}\n\tTag: ${draftRelease.tag_name}`);

					releaseManager.deleteRelease(draftRelease.id).then(function() {
						if (++deletedCount == draftReleases.length) {
							console.log("Deleted " + deletedCount + " releases.");
						}
					}).catch(exitWithError);
				});
			}).catch(exitWithError);

			return;
	}
};

run();
