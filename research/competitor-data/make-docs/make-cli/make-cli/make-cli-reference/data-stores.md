---
title: "Data stores | Make CLI | Make Developer Hub"
url: https://developers.make.com/make-cli/make-cli/make-cli-reference/data-stores
scraped_at: 2026-04-21T12:43:09.641072Z
---

1. Make CLI chevron-right
2. Make CLI reference

# Data stores

Use these commands to manage data stores, records, and structures with the Make CLI.

### hashtag Data stores

Manage your data stores.

#### hashtag make-cli data-stores list

```
make-cli data-stores list
```

List all data stores for a team.

Options

--team-id

```
--team-id
```

The team ID to filter data stores by

Yes

Example

List all data stores for a team:

```
make-clidata-storeslist--team-id=5
```

#### hashtag make-cli data-stores get

```
make-cli data-stores get
```

Get data store details by ID.

Options

--data-store-id

```
--data-store-id
```

The data store ID to retrieve

Yes

Example

Get data store details by ID:

#### hashtag make-cli data-stores create

```
make-cli data-stores create
```

Create a new data store.

Options

--name

```
--name
```

Name of the data store

Yes

--team-id

```
--team-id
```

ID of the team to create the data store in

Yes

--max-size-m-b

```
--max-size-m-b
```

Maximum size in MB for the data store

Yes

--datastructure-id

```
--datastructure-id
```

ID of the data structure defining the record format

No

Example

Create a new data store:

#### hashtag make-cli data-stores update

```
make-cli data-stores update
```

Update a data store.

Options

--data-store-id

```
--data-store-id
```

The data store ID to update

Yes

--name

```
--name
```

New name for the data store

No

--max-size-m-b

```
--max-size-m-b
```

New maximum size in MB for the data store

No

--datastructure-id

```
--datastructure-id
```

New data structure ID

No

Example

Update a data store:

#### hashtag make-cli data-stores delete

```
make-cli data-stores delete
```

Delete a data store.

Options

--data-store-id

```
--data-store-id
```

The data store ID to delete

Yes

Example

Delete a data store:

### hashtag Data store records

Manage your data store records.

#### hashtag make-cli data-store-records list

```
make-cli data-store-records list
```

List all records in a data store.

Options

--data-store-id

```
--data-store-id
```

The data store ID to list records from

Yes

--limit

```
--limit
```

Maximum number of records to return

No

Example

List all records in a data store:

#### hashtag make-cli data-store-records create

```
make-cli data-store-records create
```

Create a new record in a data store.

Options

--data-store-id

```
--data-store-id
```

The data store ID to create the record in

Yes

--key

```
--key
```

Unique key for the record (optional)

No

--data

```
--data
```

Record data

Yes

Example

Create a new record in a data store:

#### hashtag make-cli data-store-records update

```
make-cli data-store-records update
```

Update an existing record in a data store.

Options

--data-store-id

```
--data-store-id
```

The data store ID containing the record

Yes

--key

```
--key
```

Unique key of the record to update

Yes

--data

```
--data
```

Updated record data

Yes

Example

Update an existing record in a data store:

#### hashtag make-cli data-store-records replace

```
make-cli data-store-records replace
```

Replace an existing record in a data store or create if it doesn't exist.

Options

--data-store-id

```
--data-store-id
```

The data store ID containing the record

Yes

--key

```
--key
```

Unique key of the record to replace

Yes

--data

```
--data
```

New record data

Yes

Example

Replace an existing record in a data store or create if it doesn't exist:

#### hashtag make-cli data-store-records delete

```
make-cli data-store-records delete
```

Delete specific records from a data store by keys.

Options

--data-store-id

```
--data-store-id
```

The data store ID to delete records from

Yes

--keys

```
--keys
```

Array of record keys to delete

Yes

Example

Delete specific records from a data store by keys:

### hashtag Data structures

Manage your data structures.

#### hashtag make-cli data-structures list

```
make-cli data-structures list
```

List data structures for a team.

Options

--team-id

```
--team-id
```

The team ID to list data structures for

Yes

Example

List data structures for a team:

#### hashtag make-cli data-structures get

```
make-cli data-structures get
```

Get details of a specific data structure.

Options

--data-structure-id

```
--data-structure-id
```

The data structure ID to retrieve

Yes

Example

Get details of a specific data structure:

#### hashtag make-cli data-structures create

```
make-cli data-structures create
```

Create a new data structure.

Options

--team-id

```
--team-id
```

The unique ID of the team in which the data structure will be created

Yes

--name

```
--name
```

The name of the data structure. The maximum length of the name is 128 characters

Yes

--strict

```
--strict
```

Set to true to enforce strict validation of the data put in the data structure

No

--spec

```
--spec
```

Sets the data structure specification. Each item follows the Make Parameters Syntax

Yes

Example

Create a new data structure:

#### hashtag make-cli data-structures update

```
make-cli data-structures update
```

Update an existing data structure.

Options

--data-structure-id

```
--data-structure-id
```

The data structure ID to update

Yes

--name

```
--name
```

The name of the data structure. The maximum length of the name is 128 characters

No

--strict

```
--strict
```

Set to true to enforce strict validation of the data put in the data structure

No

--spec

```
--spec
```

Sets the data structure specification. Each item follows the Make Parameters Syntax

No

Example

Update an existing data structure:

#### hashtag make-cli data-structures delete

```
make-cli data-structures delete
```

Delete a data structure.

Options

--data-structure-id

```
--data-structure-id
```

The data structure ID to delete

Yes

Example

Delete a data structure:

Last updated 5 days ago
