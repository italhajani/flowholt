---
title: "Clone Make app to local workspace | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/local-development-for-apps/clone-make-app-to-local-workspace
scraped_at: 2026-04-21T12:46:12.283051Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code chevron-right
4. Local development for Apps

# Clone Make app to local workspace

Please be advised that this feature is in beta so it may encounter occasional bugs or inconsistencies.

To start the development of an app in a local directory or git repository, or start tracking changes in your app, you need to clone the Make app to the local workspace.

## hashtag Step 1: Open the local folder

Open the folder where you intend to store the app in Visual Studio Code.

Select the section that corresponds to your development setup:

- 'Local Directory' if you are working directly on your computer's file system
- 'Git Repository' if you are using version control with Git

'Local Directory' if you are working directly on your computer's file system

'Git Repository' if you are using version control with Git

The 'Git Repository' section describes the development in the Git repository using the GitHub Desktop arrow-up-right app. However, any preferred GUI tool arrow-up-right or CLI can be used.

1. Open Visual Studio Code and navigate to File > Open Folder.

Open Visual Studio Code and navigate to File > Open Folder.

1. In the file manager, select the folder where the app should be cloned.
2. In the pop-up window, click "Yes, I trust the authors" option.

In the file manager, select the folder where the app should be cloned.

In the pop-up window, click "Yes, I trust the authors" option.

The current local directory in Visual Studio is set.

1. Navigate to the GitHub Desktop app and open the repository where you intend to store the app.
2. Click Open in Visual Studio Code .

Navigate to the GitHub Desktop app and open the repository where you intend to store the app.

Click Open in Visual Studio Code .

1. In the pop-up window, click "Yes, I trust the authors" option.

In the pop-up window, click "Yes, I trust the authors" option.

The current repository in Visual Studio is set.

## hashtag Step 2: Clone the app to the local folder

Once the repository in Visual Studio is set, you can proceed to cloning the app to the local folder.

In the opened window of Visual Studio Code, go to the Make Apps Editor and right-click the app you wish to save to your repository. Select Clone to Local Folder (beta) .

Read the text in the dialog window and confirm reading by clicking Continue .

Enter the workspace subdirectory name where the app should be cloned to. 

If the subdirectory doesn't exist yet, it will be created. The default subdirectory is set to src . Click Enter .

```
src
```

If you are going to store more than one app in the repository, you can create a subfolder by using the src/app-name path, where the app-name is the name of the app folder.

```
src/app-name
```

```
app-name
```

A dialog window asking whether common data arrow-up-right should be included or not will pop up.

- Exclude (more secure) - Select, if your app contains sensitive data, such as Client ID and Secret. Common data will not be stored in your local workspace or a repository.
- Include (for advanced users only) - Select, if you want to store the common data in your local workspace or a repository. Be aware that storing common data outside of Make could potentially expose the app to vulnerabilities.

Exclude (more secure) - Select, if your app contains sensitive data, such as Client ID and Secret. Common data will not be stored in your local workspace or a repository.

Include (for advanced users only) - Select, if you want to store the common data in your local workspace or a repository. Be aware that storing common data outside of Make could potentially expose the app to vulnerabilities.

The app is now cloned to the local folder.

## hashtag Step 3: Versioning the local app

Versioning is only available if you are using version control with Git.

The following steps describe the development in the Git repository using the GitHub Desktop arrow-up-right app as an example.

The .secrets file with your Make API keys is only stored in the local folder. By default, the file is excluded from the git versioning.

```
.secrets
```

To properly start the versioning of your app in the Git repository:

Go to the GitHub Desktop app and open the repository where you deployed the current version of your app. You will see a list of new files.

Enter the Summary of the commit and click Commit to main . Or optionally, click Publish branch .

Optionally, click Publish branch .

The first version of your app is logged. Every new change or a new component in the app will be considered a new change.

Last updated 3 months ago
