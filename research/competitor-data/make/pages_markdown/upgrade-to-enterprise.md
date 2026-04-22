# Upgrade to the Enterprise plan - Help Center

Source: https://help.make.com/upgrade-to-enterprise
Lastmod: 2026-04-08T14:40:13.134Z
Description: Migrate your scenarios to an Enterprise plan with a dedicated server and advanced features.
Your organization

Subscription

# Upgrade to the Enterprise plan

18 min

With the Enterprise plan, you get access to the most advanced Make﻿ features, wider limits, priority support, and a separate Celonis Amazon Web Service environment.

After signing up for Enterprise, you will need to migrate your data to our dedicated server in your region. This will give you access to a more stable and reliable infrastructure. Make﻿ provides an effective tool to let you migrate your data fast and easily.

In this article, you will learn how to use the Make﻿ **Migration tool** to move your data and start enjoying the Enterprise plan.

## Migration scope overview

The Migration tool has two modes:

* Fast mode enables automatic migration of selected scenarios﻿ and their associated data. In some cases, the system may require you to take manual steps.

* Manual mode allows you to choose which data to migrate and how to handle it in your Enterprise instance.

### Which data can you migrate?

The Migration tool migrates the following items:

* ﻿Scenarios﻿ and scenario﻿ folders

* Connections (except those that are associated with [connected systems and on-prem agents](/on-premise-agent)﻿

* Webhooks and mailhooks

* Keys

* Data stores

* Data structures

* Custom apps

If the following items exist in your source instance, but no scenarios﻿ use them, the Migration tool **doesn't** move them to the target instance:

* Connections

* Webhooks and mailhooks

* Keys

* Data stores

* Data structures

### Which data can't you migrate?

* User accounts

* Organizations

* ﻿Scenario﻿ executions history and logs

* Incomplete executions

* ﻿[Connections associated with connected systems and on-prem agents](/upgrade-to-enterprise#on-prem-connections)﻿﻿

* Webhook and mailhook queues and logs

* ﻿[Devices](/upgrade-to-enterprise#devices)﻿

* ﻿[Payment details and extra credits](/upgrade-to-enterprise#subscriptions-and-coupons)﻿

## Prepare your data

The Migration tool has some peculiarities that you need to keep in mind when migrating your data either in fast or manual mode. To arrange your target instance better, consider taking some measures that allow you to overcome limits of the Migration tool.

### Teams

**Keep in mind that**: Migration involves transferring data from one team in the source instance to another team in the target instance.

To have your data in different teams in the target instance:

1

In the target instance, create as many teams as needed.

2

In the Migration tool, select the team you want to migrate scenarios to, and then select the specific scenarios﻿ to be moved to the selected team.

You can't move scenarios﻿ from one team to another after finishing migration. When migration is complete, you can clone scenarios﻿ and select the desired team for them.

To avoid data inconsistency, we recommend not migrating data from the same team more than once.

### Time zones

**Keep in mind that**: The Migration tool doesn't migrate the time zone settings. You need to set up time zones in the target instance.

If you aim to run scenarios﻿ in the target instance according to the time zone that you have in the source instance, manually set up a time zone in the target instance. Learn more about [managing time zones](/manage-time-zones)﻿.

### Scenarios

**Keep in mind that**: If your scenarios﻿ contain apps that require you to whitelist IP addresses for access, you need them to have relevant IPs associated with the target instance.

Before migrating such scenarios, [add the following IPS to apps](/allow-connections-to-and-from-make-ip-addresses)﻿ depending on your zone: **eu1.make.celonis.com** or **us1.make.celonis.com**. You may delete those IPs from apps in the source instance after the migration is done.

**Keep in mind that**: The Migration tool doesn't migrate a webhook or mailhook queue. It can cause problems if you use [sequential processing](1yhUnJ8jvZyxiP9Cf3Ps1#1UmY7)﻿ because scenario﻿ data may arrive to the target instance before the queue is processed in the source instance.

To ensure sequential processing, do one of the options:

Option 1: Process the entire queue in the source instance before migrating.

Option 2:

1

Migrate scenarios﻿ in the manual mode.

2

Disable scenarios﻿ in the target instance and enable scenarios﻿ in the source instance.

3

Process the webhook queue.

4

Once all the data is processed, enable scenarios﻿ in the target instance.

Data received after migration goes to the new webhook URL and will be processed once you enable scenarios﻿ in the target instance.

![Migrating scenarios](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-M_grpiFO3U5vKaJAlvnNc-20241203-103945.png?format=webp "Migrating scenarios")

﻿

### Connections

**Keep in mind that**: The Migration tool doesn't replace one connection with another if they have different scopes and permissions.

Ensure that scopes and permissions of connections in the target instance match scopes and permissions of connections that you want to replace.

### Data stores

**Keep in mind that**: Data may be inconsistent between the source and target instances if the Migration tool moves scenarios﻿ that update data stores more frequently than every five minutes.

To avoid inconsistency:

1

Stop all scenarios﻿ in the source instance before starting migration.

You only have to stop scenarios﻿ that contain the **Add/replace a record**, **Delete all records**, **Delete a record**, and **Update a record** modules.

2

Migrate the scenarios﻿.

3

Run the scenarios﻿ in the target instance.

### Custom apps

**Keep in mind that**: You cannot migrate scenarios﻿ with published custom apps if you didn't install those apps into the target instance beforehand.

To have scenarios﻿ with custom apps in the target instance:

1

If the custom app has the **Private** status, publish it. Refer to the [App Builder documentation](https://developers.make.com/custom-apps-documentation/app-visibility#public-app "App Builder documentation") to learn more.

It is not possible to migrate apps that have the **Private** status. Publish the app after making all the necessary changes.
When the custom app has the **Published** status, you cannot:

* Make the custom app Private again

* Delete the custom app

* Delete a module from the custom app

2

Install the published custom app in the target instance.

3

Delete a module from the custom app.

## Migrate your data

You can migrate as many scenarios﻿ as you want at once. If you don't migrate all scenarios﻿ at once, you can continue later.

Follow the next steps to start migration:

1

Go to the [Migration tool](https://migrate.make.com/ "Migration tool").

2

Read all the information and click **Let's start**.

3

In the **Source** and **Target** sections, select Make﻿.

4

In both sections, click **Sign in to source** and **Sign in to target** respectively, and log in to both Make﻿ instances. Then click **Continue.**

5

In both **Organization** dropdown lists, select the source organization to migrate data from, and the target organization to migrate the data into.

6

In both **Team** dropdown lists, select the source team to migrate data from, and the target team to migrate data into. Then click **Continue**.

You see the list of all scenarios﻿ that your source instance has. You can select the migration mode: fast or manual.

You see the list of all scenarios﻿ that your source instance has. You can select the migration mode: fast or manual.

The Migration tool doesn't migrate sscenarios﻿ that have errors: you can find them in the **Non-migratable** scenarios﻿ tab. If you want to move those scenarios﻿ to the target instance, you must first resolve the errors.

### Manage your data and finish the migration

Depending on the migration mode you chose, you need to decide how to handle your data from the source instance. Some options are available only for the manual mode.

We highly recommend using the fast migration mode to ensure smooth and easy data transferring.

1

Select custom apps to replace ones that migrated scenarios﻿ use.

2

Select the action for connections:

* Duplicate a connection in the target instance

* Replace a connection with the one that exists in the target instance

* Use a previously migrated connection

The set of scopes or permissions of a particular connection might differ between the source and the target instance. To see the scopes of a specific connection, go to the **Connection** section and click the eye icon.

If you need to extend scopes:

1. Log in to either a source or a target instance depending on where you need to extend scopes.

2. Create a new scenario﻿ or open an existing one.

3. Add a module that requires additional scopes.

4. Create a new connection. Make﻿ will ask you to provide additional permissions. Click **Continue**.

5. On the app page where you're redirected to, confirm granting new scopes.

6. Optional: Delete the module or the newly created scenario﻿ if you don't need it.

Some apps allow adding scopes manually when creating a new connection. If you created a custom application in a service itself, you may extend scopes in your service account.

3

Select the action for webhooks and mailhooks:

* Duplicate a webhook or mailhook

* Duplicate a webhook or mailhook and forward traffic

We recommend always choosing the second option. If you just duplicate a webhook or mailhook, traffic will still be sent on the webhook or mailhook that you have in the source instance, and no data will appear in the target instance.

A duplicated webhook will have a different URL.

4

If you have linked devices in your source instance, create a mock device in the target instance.

You need to replace a mock device with a real device. See more information in the [devices section](/upgrade-to-enterprise#devices)﻿ below.

5

Select the action for data stores:

* Duplicate a data store and migrate its content

* Duplicate a data store without its content

* Replace a data store with the one that exists in the target instance

The Migration tool will replace data in the data store in the target instance with data from the source instance. If you use auto-generated keys, Make﻿ will store data under different keys in the target instance.

6

Select the action for data structures:

* Duplicate a data structure

* Replace a data structure with the one that exists in the target instance

7

Select the action for keys:

* Duplicate a key
  A duplicated key contains the relevant data, but the key ID is different.

* Replace a key with the one that exists in the target instance

8

Select the action for folders:

* Duplicate a folder

* Replace a folder with the one that exists in the target instance

9

Select what you want to do with the scenarios﻿ both in the source and target instances.

If at least one scenario﻿ contains webhooks or mailhooks, Make﻿ automatically disables all migrated scenarios. You may enable them manually after migration.

10

Click **Start migration**.

The Migration tool shows the list of scenarios﻿ and entities it migrated and confirms that the migration process was successful. Click **Show log** to see the migration log.

If the migration fails, the Migration tool rolls back all changes made both to the source and target instances. Check the migration log out to find out reasons for the failure.

## Post-migration data setup

Using the Migration tool to move your data to a different server environment ensures smooth and easy migration. Still, you must consider specific details and take certain actions after migration to fully benefit from the Enterprise plan.

Your data will remain in your source instance after migration.

### Subscriptions and coupons

﻿Make﻿ doesn't automatically cancel your source instance subscription. After you fully set up your target instance, you need to manually cancel your subscription. After that, your source instance moves to [the Free pricing plan](https://www.make.com/en/pricing "the Free pricing plan"). You can use all available features within this plan.

Extra credits remain in the source instance. Contact our Support to move extra credits to the target instance.

### Scenarios

After migrating scenarios﻿ scheduled as **immediately**, they execute once the scenarios﻿ trigger receives new data.

Some scenarios﻿ require additional configuration after migration. Pay attention to scenarios﻿ that contain:

* Custom apps: They may require additional setup.

* Apps that require IP whitelisting: Make sure that the migrated scenarios have [updated IPs](/allow-connections-to-and-from-make-ip-addresses)﻿ in their apps.

* The Make﻿app: Create a new connection and update all IDs mapped in the app modules. New IDs should be associated with the data based on the target instance.

### On-prem connections

The Migration tool doesn't migrate connections associated with [connected systems and on-prem agents](/on-premise-agent)﻿. You need to manually create connections in the target instance and then link them to connected systems.

### Webhooks and mailhooks

If during migration you selected duplicating webhooks or mailhooks and forwarding traffic, the old URL in the source instance still receives traffic, but redirects it to the new URL in the target instance. Don't delete the old URL in order not to lose traffic. Contact our Support to receive a list of pairs of old and new URLs.

### Devices

The Migration tool creates mock devices in the target instance to migrate scenarios﻿ that use the iOS or Android app.

The mock device is called a deaf device in the target instance.

After migration, to use such scenarios﻿, you must:

1

Create a new device manually in the target instance.

2

Replace a mock device with the newly created in all relevant scenarios﻿.

3

Delete all mock devices.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

View and download invoices](/view-and-download-invoices "View and download invoices")[NEXT

Request sales tax exemption](/request-sales-tax-exemption "Request sales tax exemption")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
