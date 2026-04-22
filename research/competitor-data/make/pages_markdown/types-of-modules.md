# Types of modules - Help Center

Source: https://help.make.com/types-of-modules
Lastmod: 2026-04-08T14:40:13.271Z
Description: Discover different module types and learn how to use them to build your scenarios
Key concepts

Apps & modules

# Types of modules

22 min

In Make﻿, a module is a building block you use to create a scenario﻿. Think of it as bricks that you put together to automate your processes.

Each module performs a particular action, such as retrieving data from a service, creating or updating a record, downloading a file, or searching for specific data based on certain conditions. For example, your scenario﻿ can have three modules: one module watches for new customer data in a CRM, the second module converts the data into another format, and the last module sends that information to a different service.

You can find all available modules in the app list when selecting a specific app in the Scenario﻿ Builder.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-rQpun1U8yxJJAZ2-xka54-20250722-102201.png?format=webp "Document image")

﻿

Understanding each module type helps you navigate Make﻿ more easily, build advanced scenarios﻿, and [optimize operations](dH03uONbe4mGQlYisZrs7#)﻿ while reducing costs.

In this article, you'll discover the different types of modules in Make﻿ and how to use them in your scenarios﻿. If you're an advanced user, be sure to check out [the section on tips and examples](/types-of-modules#advanced-tips-and-examples)﻿ for more in-depth insights.

## Triggers, Searches, Actions, and Universal modules

There are four types of modules in Make﻿ based on what they do with data:

* ﻿[Triggers](/types-of-modules#triggers)﻿

* ﻿[Searches](/types-of-modules#searches)﻿

* ﻿[Actions](/types-of-modules#actions)﻿

* ﻿[Universal modules](/types-of-modules#universal-modules)﻿

### Triggers

A trigger tracks changes in a service and brings them to Make﻿ so you can use the data in your scenario﻿. A trigger only shows new data from your service account. Each time a scenario﻿ processes trigger data, it's data that hasn't been processed before in that scenario﻿.

For example, a trigger might detect when a new record is created, or an old record is deleted.

You can add a trigger only once in the scenario﻿ as the first module. This ensures that the trigger initiates the scenario﻿ by detecting the relevant changes and pulling in the data for further processing.

We highly recommend starting your scenario﻿ with a trigger. Still, you can start your scenario﻿ with any possible module. See the [Advanced tips and examples section](/types-of-modules#using-different-modules-as-a-trigger)﻿ to learn more.

**Trigger types**

There are two types of triggers in Make﻿:

* ﻿[Polling triggers](/types-of-modules#polling-triggers)﻿

* ﻿[Instant triggers](/types-of-modules#instant-triggers)﻿

### **Polling triggers**

A polling trigger checks for new data in a service account since the last scenario﻿ run, based on the scenario's [schedule](SCPFttWgFaPf077uJO1jh#)﻿. You can recognize this trigger type by its name, which often starts with "Watch": "Watch a record," "Watch a row," and so on.

The polling trigger sends a request to the service. If new data exists, the scenario runs, and you see the data in the module’s output as bundles. If not, you see no bundles.

A scheduled scenario﻿ run that checks for new data in a service, but returns no data, is called a check run. You can view check runs in the [scenario history](/scenario-history)﻿, located in the **History** tab of scenario﻿ details.

Click **Schedule settings** in the scenario﻿ toolbar to set how often a trigger module runs.

You can choose a starting point for the module to check for new data in a service. Learn more in [Selecting the first bundle for polling triggers](/types-of-modules#selecting-the-first-bundle-for-a-polling-trigger)﻿.

### Instant triggers

With an instant trigger, the service notifies Make﻿ when new data arrives, starting the scenario immediately. In essence, an instant trigger is a [webhook](/webhooks)﻿: a link that the service uses to send new data to Make﻿.

When you add an instant trigger, Make﻿ asks you to create a webhook. Some services may require you to create a connection beforehand.

If you add an instant trigger, you automatically set the scenario﻿ schedule as *Immediately as data arrives*.

You can reschedule a scenario﻿ if needed. In this case, a webhook receives data as soon as it arrives and stores it in a queue until the next scenario﻿ run according to a new schedule.

You can recognize an instant trigger by a lightning icon and an **instant** tag:

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-Yj3yxwo_jyvMJwKFWmTEh-20250722-102311.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-qUXEU6saxmB8NHiY6qV4m-20250722-102415.png?format=webp "Document image")

﻿

To understand how instant and polling triggers differ, think of buying plane tickets. While a polling trigger is like regularly visiting an airline's website to check for discounts, an instant trigger is like the website notifying you when discounts are available.

### Searches

A Search module helps you to get specific data from a service such as records, profiles, or other objects.

Search modules are flexible. You can add as many as you need and place them anywhere within your scenario﻿.

**Search types**

There are two types of search modules in Make﻿:

* A Search module allows filtering and using search queries to find specific data. For example, Search records, Search rows, etc.

* A List module retrieves all data from a service without any filtering. Make﻿ returns all objects that you have in your service account. For example, List records, List sheets, List customers, etc.

In most cases, when using searches, you can get up to 3,200 objects per module run. Also, additional third-party API limits may exist. See the [Module limits section](/types-of-modules#module-limits)﻿ below for more details.

### Actions

An Action module processes the data retrieved from a service. It’s one of the most commonly used modules in Make﻿.

You can include as many as you need and position them anywhere in your scenario﻿.

There are the following types of actions in Make﻿:

* Get

* Create

* Update

* Delete

When using **Delete** modules in Make﻿ (e.g., deleting records, tasks, or other items), be aware that some services may not support recovery of deleted items for actions performed through the API, or in general.

This means that deletions may be **permanent** and **irreversible**, and you won't be able to recover items deleted using the **Delete** module in Make﻿.

There are also some actions that are specific to the service, such as pin, save, or download.

Unlike Search modules that provide information about all objects or objects that match module filters, a Get module helps to receive information about one specified item. You should specify an object ID to get information about it. Read more in the [Advanced Tips and Examples section](/types-of-modules#difference-between-search-and-get-modules)﻿.

### Universal modules

A Universal module allows you to make a custom API call to a service when Make﻿ doesn't provide a pre-built module for an API endpoint you need. This module, usually called the *Make an API Call* module, is available for most services. You may need to refer to the service API documentation to see a full list of available API endpoints.

You can add as many Universal modules as needed and place them anywhere in your scenario﻿.

If Make﻿ doesn't have an app for a service you need, you can use the [HTTP app](qWeEmEt5lYiFLTAjD8VFq#)﻿ to make API calls.

## Apps and tools

Modules can be split into two groups based on whether they need to connect to a service or use a third-party API. There are two types:

* ﻿[Apps](/types-of-modules#apps)﻿

* ﻿[Tools](/types-of-modules#tools)﻿

### Apps

When adding modules of an app, you need to create a connection to start working with them. Each module serves a specific action. For example, to get data, create a record, or delete a profile in your service account. You can associate a certain app module with a specific service API endpoint.

LinkedIn, Google Sheets, HubSpot CRM, Trello and [many more](https://www.make.com/en/integrations?community=1&verified=1 "many more") are apps in Make﻿. When you add a module, you see the **Create a connection** or **Create a webhook** buttons. In the [Connections section](https://www.make.com/en/help/connections "Connections section"), you can learn more about connections in Make﻿.

Some apps don't require creating a connection, but they still use a third-party API. You may face third-party API limits when working with these apps. See the [Module limits section](/types-of-modules#module-limits)﻿ below for more details.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-yUz5kg6vKac4ku_p6YFhP-20250722-102613.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-BY0MmQRxElkBxgojB7lfi-20250722-102647.png?format=webp "Document image")

﻿

### Tools

With tools, you don't need to set up a connection nor use a third-party API. Instead, you enter your data or customize module settings, and the module is ready to work. Examples include Iterator, Aggregator, Data store, Compose a string, Set variable, and many more.

These modules are ready to go as soon as you add them. However, some tools might require some setup before you can use them. For example, Data store might ask you to create a data store within Make﻿.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/t78b6ALuDwes-kdH8D_od_image.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/3wCPNEn3bR_Eo-IsYpo1r_image.png?format=webp "Document image")

﻿

## Advanced tips and examples

In this section, you can find advanced tips and practical examples for using modules in Make﻿.

### Module limits

While using modules, you might run into limits that could cause errors in your scenario﻿.

Most Searches can only process up to 3,200 objects or 5MB of data per run. You only see the first 3,200 objects searched or as many as fit within the 5MB limit, even if there are more. Some modules only have a data size limit: each module can receive or process up to 5MB of data per run.

Keep in mind that the service's API limits may apply. For example, if the API allows only 1,000 objects, that’s all you will receive no matter which type of modules you use. You can refer to the service API documentation to learn more about its limits.

Here are two best practices to avoid errors and make sure your scenario﻿ runs smoothly:

* When available, use the **Limit** field to define how many objects you want to receive during one run.

* Use a Search module if you need specific data. Search modules let you narrow down results with filters and search queries.

If you use the **Limit** field, it's essential to set the right limit for the data being returned per one run. For example, with a polling trigger, you need to find a balance:

* If the limit is too low, Make﻿ will only process a part of data, and the rest will have to wait until the next run. This could cause delays in data processing if a lot of new data arrives.

* If the limit is too high, you might retrieve too many objects in one run. This also increases the risk of hitting the 40-minute scenario﻿ run time limit if you need to perform many actions on each object.

We recommend setting the limit according to the number of new objects you plan to get for each scenario﻿ run.

### ACID modules

Modules tagged as ACID support rollback. Make﻿ will undo all the actions an ACID module takes if an error occurred in subsequent modules.

Imagine your ACID module receives two bundles. The next module processes the first one but encounters an error with the second one. In this case, Make﻿ rolls back the ACID module as if nothing was received. On the next run, the ACID module gets the same two bundles again. The next module, being non-ACID, will try to process both bundles once again.

You can recognize the ACID module by the ACID tag:

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-mvhxbiA8l05193lpSgjmq-20250722-102800.png?format=webp "Document image")

﻿

### Difference between Search and Get modules

Unlike Search modules that provide information about all objects or objects that match module filters, a Get module helps to receive information about one specified object. You should specify an object ID to get information about it.

For data, this means Search or List modules usually return several bundles because there are multiple objects to retrieve. Get modules, however, always return a single object, which means only one bundle.

### Using Update modules

With an Update module, you can perform three actions:

* Erase content using the **erase** keyword in a content field. You can find it in the **General functions** tab.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-Ea9zkw2PHaqq-J96IhDpI-20250722-102954.png?format=webp "Document image")

﻿

Use this keyword only if you make a PUT API call. If you perform a PATCH API call, leave a space in a content field.

* Leave content as it is by leaving a content field empty.

* Overwrite content by entering new data in a content field.

### Using different modules as a trigger

While we recommend starting a Make with a **Watch** module, you can also begin with a **Search** module or **Action** module, depending on your goal. For example, if you need specific data, a **Search** or **List** module can act as a polling trigger starting a Make according to the Make schedule.

![Document image](https://images.archbee.com/PL8X94efBsjvhfQV3wyyj-znugEPnjLVdf_GJ1psrZu-20250722-103105.png?format=webp "Document image")

﻿

If you make a non-Watch module a polling trigger, you cannot add a Watch module afterward.

### Selecting the first bundle for a polling trigger

You can decide where to start to track changes made in the service. To do it, right-click the module and then click **Choose where to start**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/7gWiaz5NXVDBdpp0qrZIg_image.png?format=webp "Document image")

﻿

Typically, you have the following options:

* The current moment

* A specific date

* A specific ID or a record, or an email

* The first record or email

Settings may vary depending on the app.

The option that you select in the **Choose where to start** menu only applies to the first run of the module. Subsequent runs track changes that occurred in the third-party app since the previous run.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Introduction to Make apps](/introduction-to-make-apps "Introduction to Make apps")[NEXT

Module settings](/module-settings "Module settings")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
