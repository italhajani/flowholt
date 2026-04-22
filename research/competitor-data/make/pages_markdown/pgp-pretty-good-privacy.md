# PGP (Pretty Good Privacy) - Help Center

Source: https://help.make.com/pgp-pretty-good-privacy
Lastmod: 2026-02-26T07:39:57.386Z
Description: Help Center
Explore more

Securing data with Make

# PGP (Pretty Good Privacy)

1 min

﻿[PGP (Pretty Good Privacy)](https://apps.make.com/crypto#encryptor-modules "PGP (Pretty Good Privacy)") is a cryptographic tool that encrypts a message using both symmetric and asymetric keys. A signature can be sent with the message to further ensure integrity and authentication.

The sender generates a temporary session key, a random number used only once. The session key is used as a symmetric key to encrypt the message. The sender uses a public key from the receiver to encrypt and send the session key. The sender transfers both the encrypted session key and the encrypted message to the receiver. Finally, the receiver uses their private key to decrypt the session key and then uses the session key to decrypt the message.

PGP keys in Make﻿ must have at least 2048 bits.

## Example: Encrypt and decrypt a PGP message with the Encryptor app

In this example we will:

1. Select content to encrypt and send to a recipient.

2. Generate a pair of private and public keys for the sender and recipient.

3. Encrypt the message.

4. Decrypt the message.

**Step 1: Select content to encrypt**

In this example, we set a variable InitialText with our content to send encrypted.

In your scenario, you may have the content set another way or pulled from a different source.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/9wX8upJMbxY8yqAmPXHk--20260209-123012.png?format=webp "Document image")

﻿

**Step 2: Generate a pair of private and public keys for the sender and recipient:**

1

Go to a PGP key generator website of your choice. In this example, we use [this tool](https://pgpkeygenerator.com/ "this tool").

2

Select or set the following values:
**Key Algorithm:** RSA (ECC can be used in Make as well)
**Key Size**: 2048 bits
**Name:** Enter a name to identify the use of the keys.
**Email:** Enter an email address.
**Passphrase:** Content used to protect the private key.
**Expiration time:** Select when you want the keys to expire.

3

Click **Generate Keys** to get a pair of private and public RSA keys. If you are using a different tool to generate your keys, your steps may be different.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/gx3znp3EhD_KUkir1uEyE-20260210-133205.png?format=webp "Document image")

﻿

4

Copy the private and public keys and save them in a safe place. Additionally, remember the passphrase you used. You will need all three in Make.

Both the sender and recipient need a set of private and public keys. The sender and recipient create these key pairs separately and share the public keys with each other.

To encrypt a message, the sender uses the recipient's public key. The recipient uses their private key to decrypt the message.

If the sender also uses their private key to sign the message (not required), the recipient needs the sender's public key to validate the signature.

﻿

**Step 3: Encrypt the message:**

1

Add the **Encryptor > Encrypt a PGP message** module to your scenario.

2

For the required **Public key**, click **Create a keychain**.

3

Enter a **Name** for your recipient's public key.

4

In the **Public Key** field, enter the recipient's public key.

5

Click **Create**.

6

Optional: If you want to attach a verifiable signature, click **Create a keychain** for the **Private key** field. Repeat steps 3, 4, and 5 to create the sender's private key.

7

In the **Message** field, map the value of the content you want to encrypt.

8

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ztyb4KPV4X2JP-Ys6pkSG-20260210-151406.png?format=webp "Document image")

﻿

The ouput of this module is the encrypted message and a verifiable signature is included.

﻿

**Step 4: Decrypt the message:**

1

Add the **Encryptor > Decrypt a PGP message** module to your scenario.

2

For the required **Private key**, click **Create a keychain**.

3

Enter a **Name** for your recipient's private key.

4

In the **Private Key** field, enter the recipient's private key.

5

Click **Create**.

6

Optional: If a verifiable signature was attached, click **Create a keychain** for the **Public key** field. Repeat steps 3, 4, and 5 to create the sendér's public key.

7

In the **Message** field, map the value of the content you want to decrypt.

8

For the **Verify signature with a public key** field, click Yes or No. Click **Yes** if a signature is attached.

9

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/6ScVNNJ1b0h3WYdumM8Og-20260210-152412.png?format=webp "Document image")

﻿

The message is decrypted. The output of this module is the decrypted message and should match the original content set in the InitialText variable.

If the wrong private key is used, the message has been modified, or there is a problem with the sender's signature, the module outputs an error.

﻿

Updated 26 Feb 2026

Did this page help you?

Yes

No

[PREVIOUS

AES (Advanced Encryption Standard)](/aes-advanced-encryption-standard "AES (Advanced Encryption Standard)")[NEXT

Digital signature](/digital-signature "Digital signature")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
