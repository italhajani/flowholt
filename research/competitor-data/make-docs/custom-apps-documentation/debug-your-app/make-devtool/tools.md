---
title: "Tools | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/debug-your-app/make-devtool/tools
scraped_at: 2026-04-21T12:43:59.395677Z
---

1. Debug your app chevron-right
2. Make DevTool

# Tools

The Tools section of the Make DevTool has useful features that can help you build your scenario.

## hashtag Focus a module

Opens settings of the selected module.

The module ID is the number you see in the Scenario Builder next to the name of the module. The same apps used multiple times in one scenario will have different IDs for each module.

## hashtag Find module(s) by mapping

Searches module(s)' values for the specified term.

Keyword

Enter the term you want to search for and click the Run button. The numbers in the output are IDs of modules tha contain the term you have entered.

Use only values

Enable this option to only search in module fields' values. Disable this option to also search in module fields' names.

## hashtag Get app metadata

Retrieves app metadata by the app's module name or ID. This is useful when you need to get the app version used in your scenario for technical support or development of the app.

## hashtag Copy mapping

Copies values from the source module to the target module. When the source and target modules are specified, click the Run button to copy the mapping.

Source module

Select the module or enter the module ID of the module from which you want to copy field values.

Target module

Select the module or enter the module ID of the module into which you want to insert the source module values. The values in the target module will be overwritten.

## hashtag Copy filter

Copies the filter settings from the source module to the target module. The copy action is performed on the filter placed on the left side of the selected module. When the source and target modules are specified, click the Run button to copy the filter.

Source module

Select the module or enter the ID of the module from which you want to copy filter values.

Target module

Select the module or enter the ID of the module into which you want to insert the filter values from the source module. The values in the target module will be overwritten.

Preserve fallback route setting

If enabled and the source filter is set as the fallback route, then the target filter is also set at the fallback route.

## hashtag Swap connection

Duplicates a connection from the source module to every module of the same app in the scenario.

Source module

Select the module or enter the ID of the module from which you want to duplicate the connection and set the same connection for every module of the same app in your scenario.

## hashtag Swap variable

Searches for specified variables in the scenario and replaces them with a new variable.

Variable to find

Select the variable you want to replace from the module in your scenario and copy it to this field. You can also drag and drop the variable into the field.

Replace with

Copy and paste, or drag and drop the variable you want to use instead of the variable specified in the field above.

Module

Select the module in which you want to replace the variable. If no module is selected, the variable will be replaced in the entire scenario.

## hashtag Swap app

Replaces the selected app version in your scenario with another app version.

Before swapping, make sure that the version you've selected supports all the modules and functions you might need for your scenario.

## hashtag Base 64

Encodes the entered data to Base64 or decodes Base64. This is useful when you you want to search for particular data in the encoded request. When the input is specified, click the Run button to perform the action.

Operation

Select whether you want to encode the data from the Raw Data field to Base64 or decode Base64 to raw data.

Raw Data

Enter the data you want to encode to Base64 or the Base64 you want to decode to raw data, depending on the option selected in the Operation field above.

## hashtag Copy module name

Copies the name of the selected module to your clipboard. When the module is selected, click the Run button to copy the module's name.

Module

Select the module whose name you want to copy.

## hashtag Remap source

Changes the mapping source from one module to another. You can do this for an existing module in your scenario as well as a new one. Click the Run button to perform the action.

Source module

Select the module to be replaced as the mapping source for other modules in your scenario.

Target module

Select the module you want to use as the new mapping source.

Module to edit

If you don't want to change the mapping in the entire scenario, select the module you want to change the mapping for.

## hashtag Highlight app

Highlights modules of the specified app in your scenario.

App to be highlighted

Select the app you want to highlight in your scenario.

Version

Select the version of the app you want to highlight.

Highlight color

Enter the hex color you want to use to highlight modules in your scenario.

## hashtag Get blueprint size

Checks the size of modules in the scenario. This is useful when you are having trouble saving a blueprint that is too large.

## hashtag Showcase mode

Toggles the showcase mode of the scenario editor. This mode is useful when you are building a scenario and don't want to set up the full module.

To leave showcase mode, run this tool again or save the scenario and refresh the browser window.

## hashtag Mock labels

Changes the label and description of the given module. Changes made by this tool are not permanent and don't affect the real scenarios. This option is meant for presentation purposes only. To reset the text, refresh the browser window.

Module

Select the module to change the label and description.

Label

Enter the label of the module. An empty value equals no change. If you want a blank label, enter (space).

Description

Enter the description of the module. An empty value equals no change. If you want a blank label, enter (space).

## hashtag Change background

Temporarily changes the background color of the scenario. This is useful when you need a white background for screenshots and mockups. To reset the background, refresh the browser window.

Last updated 5 months ago
