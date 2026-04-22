---
title: "Account management | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/make-cli-reference/account-management
scraped_at: 2026-04-21T12:43:11.254976Z
---

1. Make CLI chevron-right
2. Make CLI reference

# Account management

Use these commands to manage teams, organizations, and users with the Make CLI.

### hashtag Teams

Manage your teams.

#### hashtag make-cli teams list

```
make-cli teams list
```

List teams for the current user.

Options

--organization-id

```
--organization-id
```

The organization ID to list teams for

Yes

Example

List teams for the current user:

```
make-cliteamslist--organization-id=5
```

#### hashtag make-cli teams get

```
make-cli teams get
```

Get details of a specific team.

Options

--team-id

```
--team-id
```

The team ID to retrieve

Yes

Example

Get details of a specific team:

#### hashtag make-cli teams create

```
make-cli teams create
```

Create a new team.

Options

--name

```
--name
```

Name for the new team

Yes

--organization-id

```
--organization-id
```

ID of the organization where the team will be created

Yes

--operations-limit

```
--operations-limit
```

Maximum operations limit for the team

No

--transfer-limit

```
--transfer-limit
```

Maximum data transfer limit for the team

No

Example

Create a new team:

#### hashtag make-cli teams delete

```
make-cli teams delete
```

Delete a team.

Options

--team-id

```
--team-id
```

The team ID to delete

Yes

Example

Delete a team:

### hashtag Organizations

Manage your organizations.

#### hashtag make-cli organizations list

```
make-cli organizations list
```

List organizations for the current user.

Example

List organizations for the current user:

#### hashtag make-cli organizations get

```
make-cli organizations get
```

Get details of a specific organization.

Options

--organization-id

```
--organization-id
```

The organization ID to retrieve

Yes

Example

Get details of a specific organization:

#### hashtag make-cli organizations create

```
make-cli organizations create
```

Create a new organization.

Options

--name

```
--name
```

Name of the organization

Yes

--region-id

```
--region-id
```

The ID of the region the organization will be created in

Yes

--timezone-id

```
--timezone-id
```

The ID of the timezone

Yes

--country-id

```
--country-id
```

The ID of the country

Yes

Example

Create a new organization:

#### hashtag make-cli organizations update

```
make-cli organizations update
```

Update an existing organization.

Options

--organization-id

```
--organization-id
```

The organization ID to update

Yes

--name

```
--name
```

New name for the organization

No

--country-id

```
--country-id
```

New country ID

No

--timezone-id

```
--timezone-id
```

New timezone ID

No

Example

Update an existing organization:

#### hashtag make-cli organizations delete

```
make-cli organizations delete
```

Delete an organization.

Options

--organization-id

```
--organization-id
```

The organization ID to delete

Yes

Example

Delete an organization:

### hashtag Users

Manage your users.

#### hashtag make-cli users me

```
make-cli users me
```

Get details of the current user.

Example

Get details of the current user:

### hashtag Shared enumerations

Manage your shared enumerations.

#### hashtag make-cli enums countries

```
make-cli enums countries
```

List all available countries.

Example

List all available countries:

#### hashtag make-cli enums regions

```
make-cli enums regions
```

List all available regions.

Example

List all available regions:

#### hashtag make-cli enums timezones

```
make-cli enums timezones
```

List all available timezones.

Example

List all available timezones:

Last updated 5 days ago
