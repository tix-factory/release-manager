# tix-factory/release-manager
tix-factory/release-manager current has the ability to do the following:
- Upload an asset to a release.
- Download an asset from a release.
- Delete all draft releases.

## Input Parameters
| Modes                                    | Parameter Name | Description |
| :--------------------------------------- | :------------- | :---------- |
| All                                      | github_token   | The github personal access token to be able to access the releases with. |
| All                                      | mode           | The action to execute for the tool. |
| All \[optional\]                         | repo           | The name of the repository. Defaults to the repository the action is running in. |
| All \[optional\]                         | owner          | The name of the owner 'repo' is in. Defaults to the repository the action is running in. |
| downloadReleaseAsset, uploadReleaseAsset | tag*           | The tag name for the release to execute against. |
| uploadReleaseAsset                       | filePath       | The file path for the release asset to upload. |
| downloadReleaseAsset                     | filePath       | The file path for where to put the downloaded release asset. |
| uploadReleaseAsset                       | assetName      | The name of the asset should be uploaded as in the release. |
| downloadReleaseAsset                     | assetName      | The name of the asset to download from the release. |
\* tag can be set to 'latest' to pull latest release

## Samples
Download asset from latest release of another repository.
See live sample on [roblox-plus/roblox-nuget](https://github.com/Roblox-Plus/roblox-nuget/blob/0655136ad4996912d2b386d79aba8971d5919875/.github/workflows/dotnetcore.yml#L15-L24)
```yml
    - name: Download tix-factory/nuget nuget.zip
      uses: tix-factory/release-manager@v1
      with:
        github_token: ${{ secrets.github_token }}
        mode: downloadReleaseAsset
        filePath: ./tix-factory-nuget.zip
        assetName: nuget.zip
        tag: latest
        repo: nuget
        owner: tix-factory
```

Create a release an upload an asset to it. (Assumes BUILD_NUMBER is an environment variable that exists.)
See live sample on [tix-factory/nuget workflow](https://github.com/tix-factory/nuget/blob/baaee975c0ddb1fb048feaf95c82fab8e1655c90/.github/workflows/dotnetcore.yml#L36-L43).
```yml
    - name: Create Release
      uses: tix-factory/release-manager@v1
      with:
        github_token: ${{ secrets.github_token }}
        mode: uploadReleaseAsset
        filePath: ./nuget.zip
        assetName: nuget.zip
        tag: ${{ format('release-number-{0}', env.BUILD_NUMBER) }}
```

Delete all draft releases.
```yml
    - name: Clean draft releases
      uses: tix-factory/release-manager@v1
      with:
        github_token: ${{ secrets.github_token }}
        mode: cleanReleaseDrafts
```