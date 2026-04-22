# Securing data with Make - Help Center

Source: https://help.make.com/securing-data-with-make
Lastmod: 2026-03-04T12:04:54.642Z
Description: Discover a variety of methods to secure your data in Make.
Explore more

# Securing data with Make

8 min

Data security is important for operational integrity, confidentiality, and authentication.

You can use a variety of methods to secure your data in Make﻿.

## Methods and Make﻿ use cases

Select a method for more detailed information, **including sample use cases with step-by-step instructions**:

﻿[AES (Advanced Encryption Standard)](/aes-advanced-encryption-standard)﻿﻿

AES is a symmetric algorithm that uses the same key for both encryption and decryption.

﻿[PGP (Pretty Good Privacy)](/pgp-pretty-good-privacy)﻿﻿

PGP is a cryptographic tool that encrypts a message using both symmetric and asymmetric keys.

﻿[Digital signature](/digital-signature)﻿﻿

A digital signature is used to verify the identity of the sender and that a message or document is authentic and unaltered.

﻿[Hash functions](/hash-functions)﻿﻿

Hash functions take variable-length inputs and produce fixed-length outputs of text that can't be reversed or decoded.

﻿[Methods of securing data overview](/methods-of-securing-data)﻿﻿

Learn how data security helps prevent data tampering and unauthorized access while minimizing data exposure.﻿

﻿

## Data security examples in Make﻿

Consider the following examples to determine the best data security methods to use for your scenario﻿.

### Encrypt and decrypt data with a secret key that is not hidden

If you want to encrypt and decrypt data with a secret key that is not hidden (low data security):

Use [AES encryption/decryption (simple)](/aes-advanced-encryption-standard)﻿

**Example:**

An internal service to let teams search for non-confidential employee information without accessing the IdP (identity provider).

If a third-party manages to determine the webhook URL and API key, the secret key used for encryption and decryption protects the employee information. However, the key is not hidden in the scenario module.

Required resources:

* A module to connect to the IdP

* ﻿[Encryptor > AES Encrypt (simple)](https://apps.make.com/crypto#aes-encrypt-simple "Encryptor > AES Encrypt (simple)")﻿

* ﻿[Encryptor > AES Decrypt (simple)](https://apps.make.com/crypto#aes-decrypt-simple "Encryptor > AES Decrypt (simple)")﻿

* A secret key shared in advance with all the teams using the service

### Encrypt and decrypt sensitive data with a hidden, secret key

If you want to encrypt and decrypt sensitive data with a hidden, secret key (more data security):

Use [AES encryption/decryption (advanced)](/aes-advanced-encryption-standard)﻿

**Example:**

An internal service to give a limited number of users access to confidential employee information (for example: salary, home address, yearly reviews, etc.).

If a third-party manages to determine the webhook URL and API key, the secret key protects the employee information. Additionally, the shared AES key is encrypted by Make and is inaccessible.

Required resources:

* A module to connect to the IdP

* ﻿[Encryptor > AES Encrypt (advanced)](https://apps.make.com/crypto#aes-encrypt-advanced "Encryptor > AES Encrypt (advanced)")﻿

* ﻿[Encryptor > AES Decrypt (advanced)](https://apps.make.com/crypto#aes-decrypt-advanced "Encryptor > AES Decrypt (advanced)")﻿

* An AES key (128 or 256 bits) shared in advance with relevant users

### Encrypt and decrypt sensitive data with a pair of private and public keys

If you want to encrypt and decrypt sensitive data with a pair of private and public keys (high data security):

Use [PGP encryption/decryption](/pgp-pretty-good-privacy)﻿

**Example:**

A service to share confidential business information with a B2B partner.

PGP provides a high level of security against man-in-the-middle attacks. The sender and recipient exchange public keys in advance. The data is encrypted with the recipient's public key and signed with the sender's private key. The data is decrypted with the recipient's private key and the signature is verified with the sender's public key.

Required resources:

* ﻿[Encryptor > Encrypt a PGP message](https://apps.make.com/crypto#encrypt-a-pgp-message "Encryptor > Encrypt a PGP message")﻿

* ﻿[Encryptor > Decrypt a PGP message](https://apps.make.com/crypto#decrypt-a-pgp-message "Encryptor > Decrypt a PGP message")﻿

* A set of public and private PGP keys for the sender

* A set of public and private PGP keys for the recipient

### Verify the sender and authenticity of a document

If you want to verify the sender and authenticity of a document:

Use a [digital signature](/digital-signature)﻿

**Example:**

A service to verify that the sender of a contract is legitimate and the contract has not been modified.

The sender creates a digital signature with a private RSA key and sends the contract to the recipient with the digital signature. The recipient uses the sender's public RSA key to verify the identity of the sender and that the contract has not been tampered with.

Required resources:

* ﻿[Encryptor > Create a digital signature](https://apps.make.com/crypto#create-digital-signature "Encryptor > Create a digital signature")﻿

* A public and private RSA key for the sender. The public key is shared with the recipient in advance.

### Secure and verify a password

If you want to secure and verify a password:

Use [hash functions](/hash-functions)﻿

**Example:**

A password system for a mission-critical application that requires additional security.

The password is never stored. Instead, the SHA-512 hash of the password is stored in a data store. Whenever a user logs in to access the system, the password they submit is hashed with SHA-512 and the hash is compared to the stored hash.

Required resources:

* ﻿[The SHA-512 hash function](https://help.make.com/text-and-binary-functions#sha512 "The SHA-512 hash function")﻿

* ﻿[A data store](https://help.make.com/l6du-data-stores "A data store")﻿

### Create a secure audit log

If you want to create a secure audit log:

Use [hash functions](/hash-functions)﻿

**Example:**

A method to track users' actions in a system. The method prevents users from accessing or modifying the audit logs.

When a record of the userID and additional details are stored in the data store, a hash is stored as well. To access the record and verify that it has not been changed, your generated hash must match the stored hash. The random salt is saved in a different location, so no one can calculate a new hash if they attempt to modify the record.

Required resources:

* ﻿[A hash function with a random salt](https://help.make.com/text-and-binary-functions#sha256 "A hash function with a random salt")﻿

* ﻿[A data store](https://help.make.com/l6du-data-stores "A data store")﻿

Updated 04 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Custom functions](/custom-functions "Custom functions")[NEXT

Methods of securing data](/methods-of-securing-data "Methods of securing data")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
