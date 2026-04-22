# Keys and certificates - Help Center

Source: https://help.make.com/keys-and-certificates
Lastmod: 2026-02-10T12:32:44.670Z
Description: Add and manage keys and certificates for secure authentication and data protection
Explore more

Connections

# Keys and certificates

8 min

Some apps in Make require you to use private or public keys or certificates for secure authentication and data protection. You have to add them in the Scenario Builder in the module settings of the app that requires a key or a certificate.

## Keys and keychains

Keys are used by the [Encryptor](https://apps.make.com/crypto)﻿ app in its AES Encrypt (advanced), AES Decrypt (advanced), Create digital signature, Decrypt a PGP message, and Encrypt a PGP message modules.

The [SSH](https://apps.make.com/ssh "SSH") app also allows using private keys to create the connection.

Although a different type of key, the [HTTP](https://apps.make.com/http "HTTP") app also saves the credentials you provide for making an HTTP request as a keychain for the API key and Basic Auth authentication types.

### Add a key

You should add the keys in the module settings when an app's module requires a public or private key.

Let's take the **Encryptor >** **AES Encrypt (advanced)** module as an example. To add a key there, you will:

1

Create a new scenario or open an existing one.

2

Add the **Encryptor >** **AES Encrypt (advanced)** module.

3

In the **Key** field, click **Create a keychain**.

4

In the **Add new keychain** window, enter your key and other details and click **Create**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/0hXykH-85QS6m7BEi03w3-20251202-095309.png "Document image")

﻿

Once you create it and save the module settings, the key is saved in the **Keys** section. There, you can manage all the created keys.

### Edit or delete a key

To edit a key:

1

In the left sidebar, click **Credentials**, and switch to **Keys.**﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/fiD5I5lPGREgAOLw8p7tq-20260210-123211.png?format=webp "Document image")

﻿

2

Click the **three dots > Edit** next to the required key or keychain.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/aauSHM18954HHi65JHPKt-20251202-103019.png?format=webp "Document image")

﻿

3

You will see a form where you can edit the key and its details. Once you make the edits, click **Save**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/tG34dgn3X83gDukKgFdg4-20251202-101252.png "Document image")

﻿

Make applies the saved changes immediately. After confirming, the key is updated in all the modules where it's used.

To delete a key:

1

In the left sidebar, click **Credentials**, and switch to **Keys.**﻿

2

Click the **three dots > Delete** next to the required key or keychain.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/uVefhQk4BavSjYWBRbX70-20251202-103518.png?format=webp "Document image")

﻿

3

In a pop-up window, click **Delete** to confirm.

If the key is used in scenario(s), a warning will appear showing the scenario name(s). Click **OK** to confirm the deletion.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EfA9PGmNS4kxg2lAZpXoL-20251218-092615.png?format=webp "Document image")

﻿

After confirming, the key is deleted from all the modules where it's used.

## Certificates

You may use certificates in the SSH app and for [configuring SSO](https://help.make.com/google-saml#7h2Hk "configuring SSO") in Make.

### Add a certificate

Let's take the **SSH >** **Execute a command** module as an example. To add a certificate there, you will:

1

Create a new scenario or open an existing one.

2

Add the **SSH >** **Execute a command** module.

3

For a certificate:

1. In the **Connection** field, click **Create a connection**.

2. In the **Auth type** field of the next window, select **Username** **and key**.

3. In the **Private** **key** field, click **Extract**.

4. In the **Extract** field, choose **Certificate**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/LcQB-ID2242bd5HZFAkoc-20251203-090444.png?format=webp "Document image")

﻿

4

Upload the certificate, add the **Password,** and click **Save**.

5

Then configure all the module fields.

## Ways of inserting keys and certificates

There are two ways of inserting a key or certificate:

* Direct insert

* Extract from the file (P12, PFX or PEM)

### Direct insert

With a direct insert, you just copy the key and paste it into the required field. For example, for **RSA PRIVATE KEY** in the **SSH >** **Execute a command** module:

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/TnHpxcVoEQBdtdUwd_dmd-20251203-090101.png "Document image")

﻿

OPENSSH PRIVATE KEY is not supported. This has to be converted using the following command in Terminal: ssh-keygen -p -m PEM -f <pathToTheKey>. For Windows, you can use the PuTTy key generator.

### Extract from the file (P12, PFX or PEM)

To extract a Private Key or a Certificate, you need to use the key extraction function. This will also allow you to extract the key from encrypted files.

The supported file formats are **P12**, **PFX**, and **PEM**.

Let's take the **SSH >** **Execute a command** module as an example. To extract a Private Key or a Certificate, you will:

1

Create a new scenario or open an existing one.

2

Add the **SSH >** **Execute a command** module.

3

In the **Connection** field, click **Create a connection**.

4

In the **Auth type** field of the next window, select **Username** **and key**.

5

In the **Private** **key** field, click **Extract**.

6

In the **Extract** field, choose **Private key.**

7

Click the **Choose File** button.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/ykb9A_KZPWTm7-kC1rcCe-20251203-092720.png "Document image")

﻿

8

Browse and **Open** the required file. For example, when you create a Linux Based EC2 instance on AWS, you receive the login credentials in the PEM file:

[username@hostname aws]$ ls
IMTExample.pem
[username@hostname aws]$

The file contains the private key that is used to connect to the instance.

[username@hostname aws]$ vat IMTExample.pem
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAz7F3k1q2x9K8JfN8u1wPp8Yk4Q2Lw3mA9bR1q2zZ+/QeR9Lh
J3Kf4wQb7vR9kP2n4x1pQ2XhQ9L0vQj3F8tUzZxPnG1kZ0lMnU8BtR5KJ
.........................................................
4sZt3JmU7YwP8Qj3mNqP9jLw2yZk8NwQvH2Rr0YpM5Xk3tPw8mXl0QxNr0aY9uTn
-----END RSA PRIVATE KEY-----

This is a private key you will extract from a PEM file.

9

Once you extract the file, enter the password in the respective field, if needed.

10

Click **Save**.

The private key will be exported from your file and will be used to connect to the required service.

Updated 10 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

Devices](/devices "Devices")[NEXT

Allow connections to and from Make IP addresses](/allow-connections-to-and-from-make-ip-addresses "Allow connections to and from Make IP addresses")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
