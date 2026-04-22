---
title: "Make CLI reference | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/make-cli-reference
scraped_at: 2026-04-21T12:41:11.218704Z
---

1. Make CLI

# Make CLI reference

This reference contains every command and option available in the Make CLI.

To get started with the Make CLI, follow the installation guide .

### hashtag Global options

Global options apply to all commands.

--api-key <key>

```
--api-key <key>
```

Make API key

--zone <zone>

```
--zone <zone>
```

Make zone (for example, eu2.make.com )

```
eu2.make.com
```

--output

```
--output
```

Output format: json (default), compact , or table

```
json
```

```
compact
```

```
table
```

-V , --version

```
-V
```

```
--version
```

Output the version number

-h , --help

```
-h
```

```
--help
```

Display help for the command

All commands follow this structure:

```
make-cli[globaloptions]<category><action>[actionoptions]
```

Example

```
make-cli--zoneeu2.make.comscenarioslist--team-id=1
```

### hashtag Output formatting

By default, the Make CLI returns output as JSON. Use the --output option to change the format.

```
--output
```

Example

```
make-cliscenarioslist--team-id=123--output=table
```

### hashtag Help commands

To view all available commands and options, run:

To view commands for a specific category, run:

### hashtag Commands by category

Commands are grouped into the following categories and subcategories:

Scenarios

- Scenarios
- Scenario executions
- Incomplete executions
- Scenario folders
- Custom functions
- Webhooks
- Devices

Scenarios

Scenario executions

Incomplete executions

Scenario folders

Custom functions

Webhooks

Devices

Credentials

- Connections
- Keys
- Credential requests

Connections

Keys

Credential requests

Data stores

- Data stores
- Data store records
- Data structures

Data stores

Data store records

Data structures

Account management

- Teams
- Organizations
- Users
- Shared enumerations

Teams

Organizations

Users

Shared enumerations

Custom app development

- App definitions
- App connections
- App functions
- App modules
- App remote procedures
- App webhooks

App definitions

App connections

App functions

App modules

App remote procedures

App webhooks

Last updated 3 days ago
