---
title: "Configure single sign-on using OAuth 2.0 or SAML 2.0 | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-login/configure-single-sign-on/configure-single-sign-on-using-oauth-2.0-or-saml-2.0
scraped_at: 2026-04-21T12:42:55.675191Z
---

1. Manage login chevron-right
2. Configure Single Sign-on

# Configure single sign-on using OAuth 2.0 or SAML 2.0

Double-check your SSO configuration before you click Save on the SSO settings page. When you click Save, Make enables SSO with the settings you provided. and logs you out immediately. You cannot log in with your credentials anymore.

1. Log in to your Make White Label instance.
2. Go to Administration > System settings .
3. Select an SSO type. None - default option indicating that SSO is turned off. OAuth 2.0 Select this option for OpenID Connect (OIDC). SAML
4. Fill in the protocol-specific information as described in the tables following this procedure.
5. Enter an IML resolve. The IML resolve maps necessary data such as ID, name, and email, between Make and your identity provider.
6. Under SSO Options, define whether and how your instance assigns new users to organizations. You can choose from the following options: Don't create a new organization. This option only creates a new user. That new user has no access to the scenario editor or other features. You must manually add the new user to an organization. Create a new organization and team. This option is similar to what happens to Make users on the public cloud. They receive their own organization and can create scenarios as they like. Assign to an existing organization and team. This option requires entering the organization ID number and team ID number. An example use case is users within the same company. Each new user joins the organization and can only access their assigned organization and team.
7. Click Save .

Log in to your Make White Label instance.

Go to Administration > System settings .

Select an SSO type.

1. None - default option indicating that SSO is turned off.
2. OAuth 2.0 Select this option for OpenID Connect (OIDC).
3. SAML

None - default option indicating that SSO is turned off.

OAuth 2.0

1. Select this option for OpenID Connect (OIDC).

Select this option for OpenID Connect (OIDC).

SAML

Fill in the protocol-specific information as described in the tables following this procedure.

Enter an IML resolve. The IML resolve maps necessary data such as ID, name, and email, between Make and your identity provider.

Under SSO Options, define whether and how your instance assigns new users to organizations. You can choose from the following options:

- Don't create a new organization. This option only creates a new user. That new user has no access to the scenario editor or other features. You must manually add the new user to an organization.
- Create a new organization and team. This option is similar to what happens to Make users on the public cloud. They receive their own organization and can create scenarios as they like.
- Assign to an existing organization and team. This option requires entering the organization ID number and team ID number. An example use case is users within the same company. Each new user joins the organization and can only access their assigned organization and team.

Don't create a new organization.

- This option only creates a new user. That new user has no access to the scenario editor or other features. You must manually add the new user to an organization.

This option only creates a new user. That new user has no access to the scenario editor or other features. You must manually add the new user to an organization.

Create a new organization and team.

- This option is similar to what happens to Make users on the public cloud. They receive their own organization and can create scenarios as they like.

This option is similar to what happens to Make users on the public cloud. They receive their own organization and can create scenarios as they like.

Assign to an existing organization and team.

- This option requires entering the organization ID number and team ID number. An example use case is users within the same company. Each new user joins the organization and can only access their assigned organization and team.

This option requires entering the organization ID number and team ID number. An example use case is users within the same company. Each new user joins the organization and can only access their assigned organization and team.

Click Save .

If you do not select a default team, users logging in through SSO will not be able to access any data. This is because all types of data within Make must belong to a team. If a user does not belong to any teams, they cannot work with Make . Read more about teams arrow-up-right .

Make enables SSO with the settings you provided and logs you out immediately. You can now log in with your SSO provider credentials. At the same time, you receive an email with a one-time link, which you can click to disable SSO. Use the one-time link within 24 hours before it expires. After 24 hours you must contact your customer success specialist.

When logging in using SSO for the first time, you must use an account that has the same email address as the account that you used to configure SSO. Make sure that you assign the same email address to the user in your identity provider.

### hashtag Open ID Connect (OAuth 2.0 settings)

The following fields appear once you select OAuth 2.0 from the SSO menu:

User Information URL

Yes

URL obtained from your identity provider.

Example: https://example.com/oauth2/v1/userinfo

```
https://example.com/oauth2/v1/userinfo
```

Client ID

Yes

Obtained from your identity provider. Sometimes called Application ID.

Token URL

Yes

required

URL obtained from your identity provider.

Example: https://example.com/oauth2/v1/token

```
https://example.com/oauth2/v1/token
```

Login scopes

optional

Parameters used when accessing your identity provider.

Scopes separator

optional

The character used between scopes, such as a space or a comma. If your separator is a space, use the spacebar on your keyboard.

Authorize URL

Yes

URL obtained from your identity provider.

Example: https://example.com/oauth2/v1/authorize

```
https://example.com/oauth2/v1/authorize
```

Client secret

Yes

Obtained from your identity provider.

IML resolve

Yes

Because both Make and your Identity provider use attributes such as username and email, you need to map these attributes using IML.

For Open ID Connect:

{"id":"{{sub}}","email":"{{email}}","name":"{{name}}"}

```
{"id":"{{sub}}","email":"{{email}}","name":"{{name}}"}
```

Redirect URL

optional

The location where the identity provider sends the user once successfully authorized and granted access. Must be unique to your application/instance.

### hashtag SAML 2.0 settings

Service provider primary key

Yes

The private key used to sign requests. You can get this from your certificate authority or create your primary key using OpenSSL. Make can extract this from the following file formats:

- P12
- PFX
- PEM

P12

PFX

PEM

Service provider certificate

Yes

An x.509 certificate you create. Make can extract this from the following file formats:

- P12
- PFX
- PEM

P12

PFX

PEM

Identity provider certificate

Yes

An x.509 certificate created and stored by your IdP, for example, Google, Okta, or Microsoft Azure Directory. You can enter this information in the following ways:

- Copy and paste from your IdP's UI.
- Copy and paste from your IdP's metadata XML file.
- Extract from any of the following: P12 PFX PEM

Copy and paste from your IdP's UI.

Copy and paste from your IdP's metadata XML file.

Extract from any of the following:

- P12
- PFX
- PEM

P12

PFX

PEM

IdP login URL

Yes

Also called an authorization URL. The IdP login URL is available from your IdP, for example, Google, or Okta. The IdP metadata typically contains this information in XML. The IdP metadata is usually downloadable from your Identity provider.

IdP logout URL

Yes

A URL created by your IdP to enable Single Log Out (SLO). Leave this field empty to disable SLO.

Login IML resolve

Yes

Because both Make and your Identity provider use attributes such as username and email, you need to map these attributes using IML.

Redirect URL

Optional

The location where the identity provider sends the user once successfully authorized and granted access. Must be unique to your application/instance.

Allow unencrypted assertions

Optional

Your IdP may not support SAML 2.0 assertions with encryption. Check with your IdP to determine whether you need to enable this option.

Allow unsigned responses

Optional

Your IdP may not support a signed SAML 2.0 response. Check with your IdP to determine whether you need to enable this option.

Sign requests

Optional

Your IdP may require a signed SAML 2.0 response. Check with your IdP to determine whether you need to enable this option.

Audience

Optional

Optional field to define the intended target. Typically this is a URL but can also be formatted as any string of data.

### hashtag Create your service provider primary key and certificate

Your Make White Label instance signs and verifies SAML 2.0 requests with the primary key and certificate that you provide.

Use openssl or similar as in the following example:

```
openssl
```

openssl req -newkey rsa:2048 -new -nodes -x509 -keyout key.pem -out cert.pem

```
openssl req -newkey rsa:2048 -new -nodes -x509 -keyout key.pem -out cert.pem
```

This example creates two separate files that you can extract into the following fields:

- Service provider primary key
- Service provider certificate

Service provider primary key

Service provider certificate

### hashtag Create URLs for your instance as a service provider

To configure SSO on your identity provider, you need to provide URLs. The following are examples using the base domain https://example.celonis.integromat .

```
https://example.celonis.integromat
```

Adjust them according to the domain of your instance.

- SAML ACS URL: https://example.celonis.integromat.com/sso/saml
- SAML Entity Information URL (also known as Audience Restriction URL): https://example.celonis.integromat.com/sso/saml

SAML ACS URL: https://example.celonis.integromat.com/sso/saml

```
https://example.celonis.integromat.com/sso/saml
```

SAML Entity Information URL (also known as Audience Restriction URL): https://example.celonis.integromat.com/sso/saml

```
https://example.celonis.integromat.com/sso/saml
```

### hashtag Create and enter Login IML resolve

To support a broad choice of identity providers (IdPs), Make lets you map values related to identifying users. The IML resolve maps the values from your IdP to Make's internal values by using IML, a JavaScript-based function notation. Your IML resolve must be specific to your IdP. You must map the following properties:

email

```
email
```

You can map this to any valid email.

Note : Aliases and alternate email suffixes can create problems. Be sure to map the most appropriate email in your IML resolve.

name

```
name
```

Used as the user's name in the application.

You can reuse email for this property.

If left blank creates a user without a name that must be updated later.

id

```
id
```

External user ID

Can be an integer or string but must be mapped to an identifier.

```
integer
```

```
string
```

### hashtag Example

In the following example, the resolve maps the following values:

Last updated 1 year ago
