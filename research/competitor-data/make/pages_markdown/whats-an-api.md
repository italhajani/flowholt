# What's an API? - Help Center

Source: https://help.make.com/whats-an-api
Lastmod: 2026-03-23T06:50:31.382Z
Description: Help Center
Get started

Learn the basics

# What's an API?

2 min

An API, or Application Programming Interface, is a set of rules and protocols that allows different software applications to communicate with each other. It specifies how requests and data should be structured so that applications are able to interact smoothly.

Think of an API like a universal remote control. Just as a remote lets you control different devices without knowing how they work inside, an API lets applications work together without knowing what's happening behind the scenes.

In this analogy:

* The remote control is like the API interface.

* The buttons on the remote are like API endpoints.

* Users, pressing buttons, are like a second application making requests.

* The TV or device responding is like an application fulfilling those requests.

Just as you press a specific button to change the channel without knowing how the TV processes that signal, one application can use another application's API to request data or perform actions without understanding its internal workings.

Many SaaS (Software as a Service) applications provide APIs. For example:

* ClickUp API provides numerous endpoints for creating tasks, searching tasks, adding comments, attaching files, and more.

* Gmail API lets you send emails, mark them as read, or move them to a different folder in your inbox.

* Notion API lets you update pages, create databases, retrieve information for database items, and more.

An API consists of a list of services known as **API endpoints**. Each endpoint performs a specific action. Make is a solution that **orchestrates calls to any API**, allowing you to define any type of process. It's important to know that an API endpoint requires **input** (to understand what action to perform) and provides **output** (to deliver the result back to the calling application).

Just like your remote needs you to press the correct button (input) before the TV can change to the channel you want (output), an API needs specific information before it can return the desired result.

The [ClickUp API documentation](https://clickup.com/api/clickupreference/operation/CreateTask/ "ClickUp API documentation") gives a clear example of why APIs are essential for Make.

![Document image](https://images.archbee.com/yjwhINLS3fc-NXg38fV_d-59T2zmd97N0JNSp7No8xy-20250327-191935.png?format=webp "Document image")

﻿

In the ClickUp API documentation, you can find:

* List of available endpoints: A comprehensive catalog of endpoints available through ClickUp's API, including options like "Get Tasks," "Create Task," and more. (**A**)

* Instructions for the "Create a Task" endpoint: Detailed guidelines on how to use the "Create a Task" endpoint. Required inputs: name of the task, status, and other necessary parameters. Expected output: comprehensive information about the created task. (**B**)

* Endpoint access location: Information on where and how to access this specific endpoint. (**C**)

* Practical examples of endpoint calls: Real examples demonstrating how to call the "Create a Task" endpoint effectively. (**D**)

APIs are a convenient way to help applications exchange information and services. Make leverages these APIs from various SaaS applications, acting as a solution that orchestrates calls to any API. Make already integrates with over 2,000 APIs—meaning 2,000 different applications—and this number is constantly increasing.

Updated 23 Mar 2026

Did this page help you?

Yes

No

[PREVIOUS

What is Make?](/what-is-make "What is Make?")[NEXT

Create your first scenario](/create-your-first-scenario "Create your first scenario")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
