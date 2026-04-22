---
title: "HTTPS self-signed or with custom CA | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/other/https-custom-ca
scraped_at: 2026-04-21T12:41:58.937218Z
description: "Connect securely to HTTPS services using self-signed or custom CA certificates."
---

1. Other

# HTTPS self-signed or with custom CA

Connect securely to HTTPS services using self-signed or custom CA certificates.

This guide is relevant only for special cases where it is reasonably expected that the application may need to communicate with third-party servers using HTTPS connections that rely on either a self-signed certificate or a custom certificate authority (CA) instead of a widely trusted public CA.

If your custom app only interacts with services that use publicly trusted certificates, you can safely ignore this guide.

BREAKING CHANGE – Coming 30.4.2026

We would like to inform you in advance about an upcoming change that will strengthen our HTTPS validation policy.

Beginning on 30.4.2026, Make will begin blocking untrusted HTTPS connections by default .

If your servers are using self-signed or otherwise untrusted certificates, please carefully review the guide below and update your custom app accordingly.

While this change may affect a small number of edge-case usages, we are confident that it brings a clear security benefit to all customers.

## hashtag Solution

Your custom app can be extended to accept a custom certificate (trusted CA or self-signed). A certificate issued by a globally trusted CA is preferred.

There are two options to choose from:

- Define the certificate statically
- Ask the user for the certificate dynamically

Define the certificate statically

Ask the user for the certificate dynamically

### hashtag Define certificate statically

Add the trusted custom CA certificate (or self-signed certificate) to both the base and connection JSON configurations of the custom app.

```
base
```

```
connection
```

You need to add the certificate in both places, because connections do not inherit configuration from the base code.

The example above shows the principle of how to configure it. But defining the CA cert statically is useful in limited cases, where the certificate is fixed and known in advance.

The example above shows the principle of how to configure it. But defining the CA cert statically is useful in limited cases, where the certificate is fixed and known in advance.

### hashtag Ask user for certificate dynamically

Let the customer enter the certificate themselves during the connection creation. This is useful if you need to give your custom app the flexibility to connect to any instance on the internet (for example, by having the customer enter their own URL).

For the implementation, add a new mappable parameter with type: "cert" into the Connection and then reference it in both the base and the connection's communication.

```
mappable parameter
```

```
type: "cert"
```

Tip: Download the CA certificate from the existing HTTPS service

The following Linux / macOS command can help you retrieve the required CA certificate (or self-signed certificate) from an existing HTTPS service.

In the first line of the command below, replace YOUR_DOMAIN.com with your actual domain, then copy the certificate string, including the -----BEGIN CERTIFICATE----- and -----END CERTIFICATE----- sections.

```
YOUR_DOMAIN.com
```

```
-----BEGIN CERTIFICATE-----
```

```
-----END CERTIFICATE-----
```

## hashtag Common certificate issues

- Self-signed certificate Often used in internal or test environments. These certificates are created and signed by the server itself, not by a Certificate Authority (CA).
- Custom Certificate Authority (CA) Common in company-internal tools and services. Organizations may run their own CA and issue certificates for internal domains. These CAs are not globally trusted, so the trust must be added manually.
- Expired certificate A certificate that has passed its validity period will be treated as invalid. Even if it was originally issued by a trusted CA, it is no longer accepted unless renewed.
- Other certificate problem examples Invalid CN/SAN : The domain name does not match the one in the certificate. Incomplete chain : Missing intermediate certificates required for full trust. Unknown or weak signature algorithms : Outdated encryption methods (e.g. MD5).

Self-signed certificate Often used in internal or test environments. These certificates are created and signed by the server itself, not by a Certificate Authority (CA).

Custom Certificate Authority (CA) Common in company-internal tools and services. Organizations may run their own CA and issue certificates for internal domains. These CAs are not globally trusted, so the trust must be added manually.

Expired certificate A certificate that has passed its validity period will be treated as invalid. Even if it was originally issued by a trusted CA, it is no longer accepted unless renewed.

Other certificate problem examples

- Invalid CN/SAN : The domain name does not match the one in the certificate.
- Incomplete chain : Missing intermediate certificates required for full trust.
- Unknown or weak signature algorithms : Outdated encryption methods (e.g. MD5).

Invalid CN/SAN : The domain name does not match the one in the certificate.

Incomplete chain : Missing intermediate certificates required for full trust.

Unknown or weak signature algorithms : Outdated encryption methods (e.g. MD5).

## hashtag Behavior quick reference guide

### hashtag Behavior until 30.4.2026

By default, Make allows connections to HTTPS services even when the certificate is invalid or untrusted. In such cases, the platform generates a warning for each affected scenario module.

✅ Public HTTPS certificate

✅ Connection allowed

❗ Self-signed certificate

🔔 Connection allowed, produces warning

❗ Custom CA certificate

🔔 Connection allowed, produces warning

❗ Expired certificate

🔔 Connection allowed, produces warning

❗ Invalid or weak certificate

🔔 Connection allowed, produces warning

### hashtag Behavior from 30.4.2026 (breaking change)

Starting from this date, Make will block HTTPS connections by default if the certificate is untrusted or invalid. To maintain functionality, follow the recommended steps in your custom app:

✅ Public HTTPS certificate

✅ Connection allowed

✅ No action needed

✅ Connection allowed

❗ Self-signed certificate

❌ Connection blocked

🔧 Upload the self-signed certificate

✅ Connection allowed

❗ Custom CA certificate

❌ Connection blocked

🔧 Upload the custom CA certificate

✅ Connection allowed

❗ Expired certificate

❌ Connection blocked

❌ No fix in Custom App is possible

❌ Connection blocked

❗ Invalid or weak certificate

❌ Connection blocked

❌ No fix in Custom App is possible

❌ Connection blocked

## hashtag HTTPS with invalid or expired certificate

Due to security implications, it is not possible to configure the custom app to connect to an HTTPS service if the certificate is invalid or expired .

The only secure solution in this case is to replace the invalid or expired certificate on the server. This process lies outside of Make's control and must be coordinated directly with the third-party technical support team responsible for the affected server.

## hashtag rejectUnauthorized directive deprecation notice

```
rejectUnauthorized
```

The directive rejectUnauthorized: false usable in custom apps for allowing connections to untrusted HTTPS servers with security issues is being deprecated and will be removed in the future.

```
rejectUnauthorized: false
```

Last updated 3 months ago
