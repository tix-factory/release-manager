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
	return core.gitInput(propertyName, getInputOptions(propertyName, mode));
};

const run = function() {
	let githubToken = getInput("github_token");
	let mode = getInput("mode");
	let tag = getInput("tag", mode);
	let filePath = getInput("filePath", mode);

	let githubContext = github.context;

	console.log(`Repository: ${githubContext.repo.owner}/${githubContext.repo.repo}\n\t`, githubContext.repo);

	let ocotokit = new github.GitHub(githubToken);
	let releaseManager = new ReleaseManager(ocotokit, githubContext.repo.owner, githubContext.repo.repo, tag);

	switch (mode) {
		case releaseManagerConstants.mode.uploadReleaseAsset:
		case releaseManagerConstants.mode.downloadReleaseAsset:
			releaseManager.getRelease().then(function(release) {
				console.log(mode, release);
			}).catch(console.error);
			
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

console.log(releaseManagerConstants, ReleaseManager);
run();
