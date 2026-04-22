# Make DevTool - Help Center

Source: https://help.make.com/make-devtool
Lastmod: 2026-01-15T17:59:21.534Z
Description: Debug your scenarios by inspecting API calls, responses, and execution history with Make DevTool
Explore more

Developers

# Make DevTool

24 min

﻿Make﻿ DevTool allows you to debug your Make﻿ scenario﻿ by adding an extra pane to the [Chrome Developer Tools](https://developer.chrome.com/docs/devtools/open "Chrome Developer Tools"). Using this new debugger pane, you can check all the manual runs of your scenarios﻿, review all the performed operations, and see the details of every API call performed.  Additionally, with Make﻿ DevTools you can see which module, operation, or response caused an error in your scenario﻿. This helps you debug your scenario﻿ and get your scenario﻿ back on track.

## Install Make DevTool

1

Open the [Chrome Web Store](https://chromewebstore.google.com/ "Chrome Web Store") and search for Make﻿ DevTool. You can also use [this direct link](https://chrome.google.com/webstore/detail/integromat-devtool/ainnemkhpnjgkhcdkfbhmlenkhehmfhi "this direct link") to install the extension.

2

Click the **Add to Chrome** button. Confirm your decision in the pop-up window that opens.

﻿Make﻿ DevTool is installed in the Chrome Developer Tools pane.

To start using Make﻿ DevTool, open a scenario﻿ in Make﻿, press **Control+Shift+I** or **F12** (Windows) or **Command+Option+I** (Mac) on your keyboard to open Chrome Developer Tools, and switch to the Make﻿ tab.

We recommend docking the Chrome Developer Console to the bottom to maintain a better view of your modules.

![Make DevTool](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Ky4N-YXuHL2WaQP5l-eaX_uuid-6251607f-29a2-e7c0-5df4-b86acc3ca628.png?format=webp "Make DevTool")

﻿

## Use Live Stream

Live Stream displays what is happening in the background of your scenario﻿ when you hit the **Run once** button.

It allows you to view the following information for each module in your scenario﻿:

* Request Headers (API endpoint URL, HTTP method, time and date the request has been called at, request headers, and query string)

* Request Body

* Response Headers

* Response Body

After you run a scenario﻿, select **Live Stream** from the left-side panel and click one of the tabs in the right panel of Make﻿ DevTool to view the information.

![DevTool live stream](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/fw2RT2SbzEVck-h_HKGdv_uuid-d3b7454e-91be-d37e-e3ed-f41d011abe8d.png?format=webp "DevTool live stream")

﻿

### Search in logs

Enter the search term into the search field in the left panel of Make﻿ DevTool to display requests and responses that contain the search term.

![Search in logs](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/k-2vRs99aqpnkKralwCnL_uuid-f1cc3d5e-55f7-ff33-ce10-03d80d209a97.png?format=webp "Search in logs")

﻿

### Clear the list of recorded requests

To clear the list of requests recorded by Make﻿ DevTool, click the bin icon next to the search field.

### Enable console logging

To enable logging into the console, click the computer icon next to the search field.

When logging is enabled, the color of the computer icon switches to green.

![Enable console logging](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/_vgFn-JVWfsjTS0Nrg_ZX_uuid-cc8bcb60-a4f2-413b-089e-c0ee5c672e8d.png?format=webp "Enable console logging")

﻿

Click the same icon one more time if you want to disable logging. The icon turns gray when the feature is disabled.

### Retrieve the request in the raw JSON format or cURL

To retrieve the raw JSON content of the request, click the **Copy RAW** button in the top-right corner of the DevTool's panel.

![Copy raw](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/owNEAyM7u4dEhFKFyXkGK_uuid-14e71fe7-460c-d243-6c36-bd0335c7c611.png?format=webp "Copy raw")

﻿

Similarly, you can retrieve cURL using the **Copy cURL** button next to **Copy RAW** in the top-right corner of Make﻿ DevTool's panel.

## Scenario Debugger

﻿Scenario﻿ Debugger shows you the historical logs of your scenario﻿. The Scenario﻿ Debugger displays the history of the scenario﻿ runs and enables you to search for modules by their names or IDs.

### Search for modules

To search for the module by its name or ID number, enter the search term in the search field in the left panel of the DevTool.

![Search for modules](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/B8slvl665JoyfiEaJBUeY_uuid-5a2556bc-0bee-14b7-9eb7-430645e41d4d.png?format=webp "Search for modules")

﻿

### Open module settings

Double-click the module's name in the list to open its settings in the Scenario Builder.

### View request or response details

You can open the request details by clicking the operation in the list.

![View request or response details](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/qBhvz6pBjiahaEtHFpZW2_uuid-ffb594ed-c58d-6cd5-2574-2eb4023d4293.png?format=webp "View request or response details")

﻿

## Tools

The following set of tools makes setting up your {{}} easier.

### Focus a module

Opens settings of the selected module.

Module ID is the number you see in your Scenario Builder next to the name of the module. The same apps used multiple times in one scenario﻿ will have different IDs for each module.

| **Field** | **Description** |
| --- | --- |
| Module ID | Enter the ID of the module for which you want to open settings and click the **Run** button |

### Find module(s) by mapping

Allows you to search modules' values for the specified term.

| **Field** | **Description** |
| --- | --- |
| Keyword | Enter the term you want to search for and click the **Run** button. The numbers in the output are IDs of modules that contain the term you have searched for. |
| Use Only Values | You can enable this option to only search in module fields' values, or disable it to also search in module fields' names. |

The search is performed through the *name* and *label* parameters.

### Get app metadata

Retrieves metadata of the app by the app's module name or ID. This is useful, for example, when you need to retrieve the app's version used in your scenario﻿ for the technical support or the developer of the app.

| **Field** | **Description** |
| --- | --- |
| Source Module | Select the module for which you want to retrieve metadata. |

### Copy mapping

Copies values from the source module to the target module.

Make sure you set the correct source and target modules because values in the target module will be overwritten. If you select different types of modules, values in the target module will be deleted.

| **Field** | **Description** |
| --- | --- |
| Source Module | Select the module or enter the ID of the module from which you want to copy field values. |
| Target Module | Select the module or enter the ID of the module into which you want to insert the source module values. |

Switch on the **map** toggle to manually enter the ID of the modules for mapping.

When the source and target modules are specified, click the **Run** button to perform the action.

### Copy filter

Copies the filter settings from the source module to the target module.

The copy action is performed on the filter placed on the left side of the selected module.

![Copy filter](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/AUXCYBz7TuCBqiieH_CdP_uuid-835b9c06-ed8f-6dd7-6081-5e32bd44b1a8.png?format=webp "Copy filter")

﻿

| **Field** | **Description** |
| --- | --- |
| Source Module | Select the module or enter the ID of the module from which you want to copy filter values. |
| Target Module | Select the module or enter the ID of the module into which you want to insert the filter values from the source module. Note that the values in the target module will be overwritten. |
| Preserve Fallback Route setting | If enabled and the source filter is set as the fallback route, then the target filter is also set as the fallback route. |

When the source and target modules are specified, click the **Run** button to copy the filter.

### Swap connection

Duplicates a connection from the source module to every module of the same app in the scenario﻿.

| Field | Description |
| --- | --- |
| Source Module | Select the module or enter the ID of the module from which you want to duplicate the connection and set the same connection for every module of the same app in your scenario﻿. |

### Swap variable

Searches for specified variables in the scenario﻿ and replaces them with a new variable.

| **Field** | **Description** |
| --- | --- |
| Variable to Find | Select the variable which you want to be replaced from the module in your scenario﻿ and copy it to the **Variable to Find** field. You can also drag and drop the variable into the field. After it is done the format of the value in the field will look like this: {{5.value}} |
| Replace With | Copy and paste, or drag and drop the variable you want to use instead of the variable specified in the field above.The format of the value in the field will look like this: {{5.value}} |
| Module | Select the module in which you want to replace the variable. If no module is selected, the variable will be replaced in the entire scenario﻿. |

![Swap variable](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/2vpTQZtC7A0K9vKppGSpD_uuid-515ac724-b86c-a23f-ee1a-125d6a447753.png?format=webp "Swap variable")

﻿

When all is set up, click the **Run** button to perform the action.

### Swap app

Replaces the selected app version in your scenario﻿ with another app version.

This tool can be used, for example, to upgrade Gmail and Email apps' modules to the latest version.

Before swapping make sure that the version you’ve selected supports all the modules and functions you might need for your scenario﻿.

### Base 64

Allows you to encode the entered data to Base64 or to decode Base64. This tool can be useful when you want to search for particular data in the encoded request.

| **Field** | **Description** |
| --- | --- |
| Operation | Select whether you want to encode the data from the **Raw Data** field (below) to Base64 or decode Base64 to Raw Data. |
| Raw Data | Enter the data you want to encode to Base64 or Base64 you want to decode to raw data, depending on the option selected in the **Operation** field above. |

When the input is specified, click the **Run** button to perform the selected action.

### Copy module name

Copies the name of the selected module to your clipboard.

| **Field** | **Description** |
| --- | --- |
| Module | Select the module whose name you want to copy. |

When the module is selected, click the **Run** button to copy the module's name.

### Remap source

Allows you to change the mapping source from one module to another. You can do it for the already existing module in your scenario﻿ as well as add a new one.

| **Field** | **Description** |
| --- | --- |
| Source Module | Select the module you want to be replaced as the mapping source for other modules in your scenario﻿. |
| Target Module | Select the module you want to use as a new mapping source. |
| Module to Edit | In case you don't want to change the mapping in the entire Make, select the module you want to change the mapping for. |

When all is set up, click the **Run** button to perform the action.

### Highlight app

Highlights modules of the specified app in your scenario﻿.

| **Field** | **Description** |
| --- | --- |
| App to be highlighted | Select the app you want to highlight in your scenario﻿. |
| Version | Select the version of the app you want to highlight |
| Highlight Color | Enter the hex color you want to use to highlight modules in your scenario﻿. |

﻿

Updated 15 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Developers](/developers "Developers")[NEXT

Make AI Agents (New)](/make-ai-agents-new "Make AI Agents (New)")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
