# AES (Advanced Encryption Standard) - Help Center

Source: https://help.make.com/aes-advanced-encryption-standard
Lastmod: 2026-03-18T14:13:56.129Z
Description: Help Center
Explore more

Securing data with Make

# AES (Advanced Encryption Standard)

2 min

﻿[AES (Advanced Encryption Standard)](https://apps.make.com/crypto#encryptor-modules "AES (Advanced Encryption Standard)") is a symmetric algorithm, using the same key for both encryption and decryption. You can choose between simple and advanced modules in the Encryptor app. Advanced modules are recommended, giving you more control and allowing your key to be hidden.

The AES algorithm has four components:

| **Component** | **Description** |
| --- | --- |
| **Key** | Select a key of either 128 or 256 bits. A longer key provides more security. |
| **Initialization vector** | A random value used at the beginning of encryption to make sure the same data looks different each time it's encrypted, so no one can guess the plaintext value from the results. The initialization vector is sometimes called Nonce.  ﻿  You can choose UTF-8, Base64, or Hexadecimal for encoding. |
| **Authentication tag** | A code generated after encrypting the message. It is also called an integrity check value (ICV) or message authentication code (MAC).  ﻿  This value is calculated using the cyphertext and the initialization vector. It is a unique value generated from the encrypted message. The tag is sent with the message and the recipient repeats the process to generate the authentication tag using the received message. If the two tags are the same, the shared message is the same. |
| **Modes** | Methods for encrypting data.  * CBC (Cipher Block Chaining) mode: Encrypts each block of   data by combining it with the previous block's ciphertext and   requires an initialization vector to start the chain.  * GCM (Galois/Counter) mode: Combines encryption with the   authentication tag to ensure the integrity of the data. |

## Example: Encrypt and decrypt a message with the Encryptor app AES (simple) modules

In this example we will:

1. Select content to encrypt and send to a recipient.

2. Select a secret key to share with the recipient ahead of time, to decrypt the content.

3. Encrypt the message.

4. Decrypt the message.

**Step 1: Select content to encrypt**

In this example, we set a variable InitialText with our content to send with encryption.

In your scenario, you may have the content set another way or pulled from a different source.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/9wX8upJMbxY8yqAmPXHk--20260209-123012.png?format=webp "Document image")

﻿

**Step 2: Select a secret key**

A secret key can be any content agreed upon by the sender and recipient: a word, a phrase, or a series of characters.

In AES simple encryption and decryption, the secret key is not hidden. If you share the scenario with any other users or download the blueprint to share, your secret key is exposed.

**Step 3: Encrypt the message:**

1

Add the **Encryptor > AES Encrypt (simple)** module to your scenario.

2

Select the **Input encoding**. In this example, we use UTF-8.

3

In the **Data** field, map or input the value of the content you want to encrypt.

4

Select the **Output encoding.** In this example, we use hexadecimal.

5

In the **Secret key** field, enter the secret key you have shared with the recipient.

The secret key is not hidden. If you share the scenario with any other users or download the blueprint to share, your secret key is exposed.

6

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/OVqt4BWqZJLxD-rkE-7gj-20260216-120555.png?format=webp "Document image")

﻿

The message is encrypted. The output of this module is the encrypted message in hexadecimal format.

﻿

**Step 4: Decrypt the message:**

1

Add the **Encryptor > AES Decrypt (simple)** module to your scenario.

2

Select the **Input encoding**. In this example, we use hexadecimal to match the output encoding used to encrypt the message.

3

In the **Data** field, map or input the value of the content you want to decrypt.

4

Select the **Output encoding.** In this example, we use UTF-8.

5

In the **Secret key** field, enter the secret key you have shared with the sender.

The secret key is not hidden. If you share the scenario with any other users or download the blueprint to share, your secret key is exposed.

6

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_5kk3IwM3AKwNJ2TDeYqF-20260216-121619.png?format=webp "Document image")

﻿

The message is decrypted. The output of this module is the decrypted message and should match the original content set in the InitialText variable.

If the wrong secret key is used, the message has been modified, or the encoding does not match, the module outputs an error.

## Example: Encrypt and decrypt a message with the Encryptor app AES (advanced) modules

In this example we will:

1. Select content to encrypt and send to a recipient.

2. Generate an AES key.

3. Set an initialization vector.

4. Encrypt the message (GCM ciphor algorithm).

5. Decrypt the message (GCM ciphor algorithm).

**Step 1: Select content to encrypt**

In this example, we set a variable InitialText with our content to send with encryption.

In your scenario, you may have the content set another way or pulled from a different source.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/9wX8upJMbxY8yqAmPXHk--20260209-123012.png?format=webp "Document image")

﻿

**Step 2: Generate an AES key**

To encrypt and decrypt messages with AES, the key must be shared between the sender and recipient ahead of time.

﻿

To generate an AES key:

1

Go to an encryption key generator website of your choice. In this example, we use [this tool](https://randomkeygen.com/encryption-key "this tool").

2

Select or set the following values:
**Key Size**: 128 or 256 bits. In this example we use 256 bits.
**Format:** Hexadecimal or Base64. In this example, we use hexadecimal.

3

Click **Generate** to get your **AES Key**. If you are using a different tool to generate your key, your steps may be different.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/M-GauvU6EG0dnC5jhsKxv-20260217-101920.png?format=webp "Document image")

﻿

4

Copy the AES key save it in a safe place.

You will use this AES key to create a keychain and encrypt your content.

﻿

**Step 3: Set an initialization vector**

Although AES key generator websites also provide initialization vectors, it is best to use a different initialization vector every time, for more secure encryption.

For this reason, we use the **Set variable** module to generate a new initialization variable before the content is encrypted.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/ao-OH9MM7wlO3h0wZ4huC-20260217-102107.png?format=webp "Document image")

﻿

1

Add the **Tools > Set variable** module to your scenario.

2

In the **Variable name** field, enter a name for your initialization vector.

3

In the **Variable value** field, enter the following to generate a substring of a unique ID (128 bit) with only the first 16 characters:

substring(uuid; 0; 16)

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/-algyZOvbnfpgWL_dOpCm-20260217-104345.png?format=webp "Document image")

﻿

The UUID variable can be found under the **Text and binary functions** tab:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/sP9hOOImQvM13OX8B-xaE-20260217-104530.png?format=webp "Document image")

﻿

The initialization vector variable is mapped in the encryption module in the next step.

You need to use a 128-bit initialization vector for the GCM cipher algorithm. For the CBC cipher algorithm, you can use a 96-bit initalization vector instead. GCM is the preferred method, shown here.

﻿

**Step 4: Encrypt the message (GCM ciphor algorithm)**

1

Add the **Encryptor > AES Encrypt (advanced)** module to your scenario.

2

Click **Create a keychain**.

3

Enter a **Name** for your AES key.

4

In the **Key** field, enter your AES key.

5

In the **Key Encoding** field, select Hexadecimal.

6

Click **Create**.

7

In the **Bits** field, select 256.

8

In the **Input encoding** field, select UTF-8.

9

In the **Data** field, map the value of the content you want to encrypt.

10

In the **Output encoding** field, select Hexadecimal.

11

In the **Cipher Algorithm** field, select GCM.

12

In the **Initialization Vector Encoding** field, select UTF-8.

13

In the **Initalization Vector** field, map the value of the initialization vector created in the previous **Set variable** module.

14

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/7KEmOjBuGMi36mig1HDoe-20260217-110725.png?format=webp "Document image")

﻿

The message is encrypted.

The output of this module has the Data, Initialization Vector, and Authentication Tag in hexadeximal format. You will use these values to decrypt the message.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/oUNWjuzX_OVonUUpPOwcq-20260217-111529.png?format=webp "Document image")

﻿

If you run the scenario again, the output data will be different because the initialization vector is a variable that changes with each run.

The initialization vector and the authentication tag can be sent in cleartext to the recipient; they don't need to be secured.

**﻿**

**Step 5: Decrypt the message (GCM ciphor algorithm)**

1

Add the **Encryptor > AES Decrypt (advanced)** module to your scenario.

2

Use the same keychain created in Step 4 above or create a new keychain with the same values.

In AES encryption, the sender and recipient use the same key to encrypt and decrypt the message.

3

In the **Bits** field, select 256.

4

In the **Input encoding** field, select Hexadecimal to match the encryption output encoding.

5

In the **Data** field, map the value of the encryption output Data.

6

In the **Output encoding** field,select UTF-8.

7

In the **Cipher Algorithm** field, select GCM to match the same algorithm used for encryption.

8

In the **Initialization Vector Encoding** field, select Hexadecimal to match the encyption output encoding of this value.

9

In the **Initalization Vector** field, map the value of the initialization vector from the encryption output.

10

In the **Authentication Tag Encoding** field, select Hexadecimal to match the encryption output encoding of this value.

11

In the **Authentication Tag** field, map the value of the authentication tag from the encryption output.

12

Click **Save**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/t7yTsWDw9Ew6kpsCYYkAy-20260217-120827.png?format=webp "Document image")

﻿

The message is decrypted. The output of this module is the decrypted message and should match the original content set in the InitialText variable.

If the wrong key is used, the message has been modified, or there is a discrepancy with the initalization vector or authentication tag, the module outputs an error.

﻿

Updated 18 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

Methods of securing data](/methods-of-securing-data "Methods of securing data")[NEXT

PGP (Pretty Good Privacy)](/pgp-pretty-good-privacy "PGP (Pretty Good Privacy)")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
