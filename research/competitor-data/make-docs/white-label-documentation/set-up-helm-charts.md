---
title: "Set up Helm charts | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/set-up-helm-charts
scraped_at: 2026-04-21T12:41:05.580488Z
---

# Set up Helm charts

This guide outlines the steps required to set up and deploy Helm charts for your On-premise services.

## hashtag Set up the Helm charts

To set up the Helm charts, follow the process below:

1. Install Helm
2. Create a Personal Access Token
3. Authenticate with GitHub Container Registry
4. Update Helm Dependencies

Install Helm

Create a Personal Access Token

Authenticate with GitHub Container Registry

Update Helm Dependencies

### hashtag Install Helm

To install Helm, refer to the Installing Helm documentation arrow-up-right and follow the outlined steps.

### hashtag Create a Personal Access Token

To authenticate with GitHub's container registry and pull charts from the OCI registry, you first need to create a Personal Access Token (PAT). To generate your token:

1. Log in to your GitHub account.
2. In the upper-right corner, click your Profile photo > Settings .
3. In the left sidebar, click Developer Settings .
4. Click Personal access tokens > Tokens (classic) .
5. Click Generate new token (classic) .
6. Enter a Note for the token.
7. In the Select scopes field, enable the read:packages permission.
8. Click Generate token .
9. Copy the Personal access tokens (classic) value and store it in a safe place.

Log in to your GitHub account.

In the upper-right corner, click your Profile photo > Settings .

In the left sidebar, click Developer Settings .

Click Personal access tokens > Tokens (classic) .

Click Generate new token (classic) .

Enter a Note for the token.

In the Select scopes field, enable the read:packages permission.

```
read:packages
```

Click Generate token .

Copy the Personal access tokens (classic) value and store it in a safe place.

You will use this token to authenticate with Docker in the section below.

### hashtag Authenticate with GitHub Container Registry using Docker

To authenticate with the GitHub Container Registry using Docker and gain access to pull Helm charts:

1. Run the following command. Ensure $GITHUB_TOKEN is set to your Personal Access Token and $GITHUB_USER is set to your GitHub username:

Run the following command. Ensure $GITHUB_TOKEN is set to your Personal Access Token and $GITHUB_USER is set to your GitHub username:

```
$GITHUB_TOKEN
```

```
$GITHUB_USER
```

1. Enter your GitHub username and the Personal Access Token when prompted.

Enter your GitHub username and the Personal Access Token when prompted.

Once authenticated, you can pull Helm charts from the GitHub OCI registry.

### hashtag Update Helm dependencies

To download all required chart dependencies before installation, navigate to the directory where your Helm Chart is located and run the following:

This downloads all required chart dependencies.

You’ve successfully completed the setup to deploy Helm charts for your On-premise services.

Last updated 1 month ago
