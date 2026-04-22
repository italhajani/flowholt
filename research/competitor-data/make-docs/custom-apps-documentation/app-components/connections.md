---
title: "Connections | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/connections
scraped_at: 2026-04-21T12:41:48.553238Z
---

1. App components

# Connections

APIs usually use authentication or authorization to limit access to their endpoints.

Make provides a list of the most common types of connections with prefilled code that can be edited for your needs. In general, you will only need to change the URLs and names of the parameters.

## hashtag Types of connections

- Basic connection
- JWT
- OAuth 1.0
- OAuth 2.0

Basic connection

JWT

OAuth 1.0

OAuth 2.0

## hashtag Common data

When you use an OAuth connection, an ID and secret are generated for your user. To store them, you should use the common data inside the connection.

Once the app is approved, the common data is locked and can't be changed due to security reasons.

Inside the connection, common data can be accessed by the common.variable IML expression.

```
common.variable
```

Common data is encrypted when stored in Make.

## hashtag Reserved words in connections

Reserved words are variables used internally by Make. Using reserved words for the parameter name key can lead to unexpected results. Avoid using a reserved word.

```
name
```

Make reserved words are:

- accountName : name of the connection used by the app module,
- teamID : ID of the team to which the active user is currently assigned.

accountName : name of the connection used by the app module,

```
accountName
```

teamID : ID of the team to which the active user is currently assigned.

```
teamID
```

If you use a Make reserved word for the name key of a parameter, the value stored in the internal Make parameter will be used by your parameter too.

```
name
```

Consider the following configuration of a connection. The parameter labeled Account Name has the name key set to preserved word accountName .

```
Account Name
```

```
name
```

```
accountName
```

The code above leads to mirroring the value from the default Connection name parameter into a parameter labeled Account name . The value accountName is set by Make to the name of the created connection.

```
Connection name
```

```
Account name
```

```
accountName
```

Last updated 5 months ago
