# Digital signature - Help Center

Source: https://help.make.com/digital-signature
Lastmod: 2026-02-26T07:39:53.267Z
Description: Help Center
Explore more

Securing data with Make

# Digital signature

1 min

A [digital signature](https://apps.make.com/crypto#create-digital-signature "digital signature") is a string used to verify the identify of the sender and that a message or document is authentic and hasn't been changed.
It works by generating a unique hash of the message (using [SHA-1](https://help.make.com/text-and-binary-functions#sha1 "SHA-1") or [SHA-256](https://help.make.com/text-and-binary-functions#sha256 "SHA-256")), which is then encrypted with the sender's private key. The recipient uses the sender's public key to decrypt the signature and retrieve the hash. If the hash values of the received message and the sent message match, it confirms both the sender's identity and that the message hasn't been altered.

## Example: Create a digital signature with the Encryptor app

In this example we will:

1. Select content to send to a recipient with a digital signature.

2. Generate a pair of private and public RSA keys.

3. Create a digital signature and attach it to a message.

4. Verify the digital signature.

**Step 1: Select content to encrypt**

In this example, we set a variable InitialText with our content to send with a digital signature.

In your scenario, you may have the content set another way or pulled from a different source.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/9wX8upJMbxY8yqAmPXHk--20260209-123012.png?format=webp "Document image")

﻿

**Step 2: Generate a pair of private and public RSA keys to use for your digital signature:**

1

Go to an RSA key generator website of your choice. In this example, we use [this tool](https://emn178.github.io/online-tools/rsa/key-generator/ "this tool").

2

Select or set the following values:
**Bits:** 1024
**Format:** PKCS#1. Make does not support other formats.

3

Click **Generate** to get a pair of private and public RSA keys. If you are using a different tool to generate your RSA keys, your steps may be different.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/8ZCIwGRE7b5s0uvuLbg7W-20260209-122133.png?format=webp "Document image")

﻿

4

Copy the private and public RSA keys and save them in a safe place.

You will use these keys to create a digital signature, encrypt a text, and allow the recipient to verify your digital signature.

You must provide your RSA public key to the recipient ahead of time so they can verify the digital signature.

﻿

**Step 3: Create a digital signature:**

1

Add the **Encryptor > Create digital signature** module to your scenario.

2

Click **Create a keychain**.

3

Enter a **Name** for your keychain.

4

In the **Private Key** field, paste your RSA private key.

5

Optional: Add a passphrase. This is not required.

6

Click **Create**.

7

Select the **Algorithm**. RSA-SHA256 is recommended.

8

Select the **Input encoding**. UTF-8 is recommended.

9

Select the **Output encoding**. Hexadecimal is recommended.

10

In the **Data** field, map the value of the content you want to send.

11

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/jChWuH7R5WadJdwLeSD5N-20260209-123644.png?format=webp "Document image")

﻿

The output from the Encryptor module is the digital signature in hexadecimal format. The recipient can use this signature and your RSA public key to verify the validity of the content they received.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/PybZd6Essp5hTSgD5hNux-20260209-124436.png?format=webp "Document image")

﻿

**Step 4: Verify the digital signature**

To verify the signature, use an RSA Verify Signature tool. In this example, we use [this tool](https://emn178.github.io/online-tools/rsa/verify/ "this tool").

Enter the settings, public key, signature, and input to verify the validity. If you are using a different tool to verify the signature, your steps may be different.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/un2FMLwdimL2ElwlLA6Q6-20260209-125343.png?format=webp "Document image")

﻿

If any part of the signature, public key, or input does not match, the result will be invalid and you will know that the message was changed or is not from the expected sender.

﻿

Updated 26 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

PGP (Pretty Good Privacy)](/pgp-pretty-good-privacy "PGP (Pretty Good Privacy)")[NEXT

Hash functions](/hash-functions "Hash functions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
