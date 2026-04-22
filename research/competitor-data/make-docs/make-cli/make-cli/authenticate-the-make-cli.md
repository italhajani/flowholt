---
title: "Authenticate the Make CLI | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/authenticate-the-make-cli
scraped_at: 2026-04-21T12:41:10.580612Z
---

1. Make CLI

# Authenticate the Make CLI

Before you can run commands, you must connect the Make CLI to your Make account. Your authentication options are the login wizard, environment variables, or per-command options.

### hashtag Login wizard (recommended)

The login wizard saves your credentials locally, so you don't have to pass them with every command.

To start the wizard, run:

```
make-clilogin
```

The wizard guides you through the following steps:

1. Select your zone (for example, EU1 ).
2. If you don't have a Make API key, create one in the Make API key page that opens in your browser.
3. Enter your API key.

Select your zone (for example, EU1 ).

```
EU1
```

If you don't have a Make API key, create one in the Make API key page that opens in your browser.

Enter your API key.

Your credentials are saved to the following location, depending on your operating system:

macOS / Linux

~/.config/make-cli/config.json

```
~/.config/make-cli/config.json
```

Windows

%APPDATA%\make-cli\config.json

```
%APPDATA%\make-cli\config.json
```

Once authenticated, all commands work without extra options.

#### hashtag Authentication status

To confirm which account you're signed in to, run:

```
make-cliwhoami
```

#### hashtag Log out

To remove your saved credentials, run:

### hashtag Environment variables

To set your API key and zone as environment variables:

### hashtag Per-command options

To pass your credentials directly with each command using the --api-key and --zone options:

```
--api-key
```

```
--zone
```

### hashtag Authentication priority

If you use more than one authentication method, the Make CLI resolves credentials in the following order:

1. Per-command options
2. Environment variables
3. Saved credentials from the login wizard

Per-command options

Environment variables

Saved credentials from the login wizard

Last updated 5 days ago
