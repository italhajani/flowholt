# Module settings - Help Center

Source: https://help.make.com/module-settings
Lastmod: 2026-01-15T17:23:06.549Z
Description: Learn how to configure different module fields to ensure your scenarios run correctly
Key concepts

Apps & modules

# Module settings

4 min

For each module in your scenario﻿, you need to configure its settings - the fields you see when you click on the module. These fields define the data you want to receive or send to an application, the information you want to pass between modules, and specific details regarding what actions each module should take.

For example, the [Dropbox](https://apps.make.com/dropbox#)﻿ modules require you to specify the target folder for uploading files. For the [Email](https://apps.make.com/email#)﻿ modules, you need to enter the email address to which emails should be sent. Every setting is unique for each module.

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-TmDNf-QX_zgyiaGYgpxbt-20250211-143045.png?format=webp "Document image")

﻿

The module settings open automatically when you add a new module to your scenario﻿. You can also open or re-open the module settings in the [Scenario editor](7euvHnup3GLX7SO-Jdcng#)﻿ by clicking on the module.

## Connection settings

In almost every app's module settings, you will find connection settings. This is where you create a connection to your user account for the given app, and is the first step when adding a new module to your scenario﻿. Some fields you might see in the connection settings include Username, Password, API Key, or Client Credentials. For more information and instructions on how to create a connection to any of your accounts see [Connecting to services](/connect-an-application#)﻿.

## Required and optional fields

Some fields in the module settings are required, while others are optional. You can identify which fields are required by their name written in **bold**. If you try to save your module settings without filling in a required field, you will receive an error. Your scenario﻿ cannot run unless all required fields are filled in.

In each field, you can either type the appropriate text into the field or fill it in by [mapping an item](/mapping#)﻿ from another module in your scenario﻿.

For some parameters (mostly arrays with several fields that Make﻿ retrieves depending upon the selected connection) you can see a **Map** toggle. Switching on the **Map** toggle brings up a text field where you can [map items](/mapping#)﻿ from the preceding modules.

## Standard fields

When you open the module settings, you will see all of the module's standard fields. These include the most frequently used fields for the module, and are typically the default items you see when going to the website of the service you are using. Standard fields can be both optional and required.

## Advanced fields

Some modules also include advanced fields that can be found in the module's advanced settings. These fields include more complex items that may require specific technical knowledge to use. To open the advanced settings, switch on the **Advanced settings** toggle.

## Data types

Each field in the module settings accepts a specific data type, signifying what format of information you can enter or map into the field. This can be text, date, number, etc. You can identify a field's data type by hovering over the name of the field. For more information, see [Item data types](hdc1mr5JWOaqEIiS266kB#)﻿.

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Types of modules](/types-of-modules "Types of modules")[NEXT

Update legacy modules with new modules](/update-legacy-modules-with-new-modules "Update legacy modules with new modules")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
