const core = require("@actions/core");
const github = require("@actions/github");
const releaseManagerConstants = require("./releaseManagerConstants.js");
const ReleaseManager = require("./ReleaseManager.js");

const exitWithError = function(err) {
	console.error(err);
	process.exit(1);
};

const run = function() {
	let githubToken = core.getInput("github_token", { required: true });
	let mode = core.getInput("mode", { required: true });
	let tag = core.getInput("tag");

	let githubContext = github.context;

	console.log(githubContext);
	console.log(`Repository: ${githubContext.repo.owner}/${githubContext.repo.repo}\n\t`, githubContext.repo);

	let ocotokit = new github.GitHub(githubToken);
	let releaseManager = new ReleaseManager(ocotokit, githubContext.repo.owner, githubContext.repo.repo, tag);

	switch (mode) {
		case releaseManagerConstants.mode.uploadReleaseAsset:
			console.log("try run uploadReleaseAsset");
			break;
		case releaseManagerConstants.mode.downloadReleaseAsset:
			console.log("try run downloadReleaseAsset");
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
