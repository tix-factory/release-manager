# tix-factory/release-manager
tix-factory/release-manager current has the ability to do the following:
- Upload an asset to a release.
- Download an asset from a release.
- Delete all draft releases.

## Input Parameters
| Modes                                    | Parameter Name | Description |
| :--------------------------------------: | :------------- | :---------- |
| All                                      | github_token   | The github personal access token to be able to access the releases with. |
| All                                      | mode           | The action to execute for the tool. |
| All \[optional\]                         | repo           | The name of the repository. Defaults to the repository the action is running in. |
| All \[optional\]                         | owner          | The name of the owner 'repo' is in. Defaults to the repository the action is running in. |
| downloadReleaseAsset, uploadReleaseAsset | tag            | The tag name for the release to execute against. |
| uploadReleaseAsset                       | filePath       | The file path for the release asset to upload. |
| downloadReleaseAsset                     | filePath       | The file path for where to put the downloaded release asset. |
| uploadReleaseAsset                       | assetName      | The name of the asset should be uploaded as in the release. |
| downloadReleaseAsset                     | assetName      | The name of the asset to download from the release. |
