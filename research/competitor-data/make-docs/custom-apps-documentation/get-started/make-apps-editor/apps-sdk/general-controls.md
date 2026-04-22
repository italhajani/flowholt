---
title: "Use general controls | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/general-controls
scraped_at: 2026-04-21T12:45:24.505878Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code

# Use general controls

The following are basic controls in VS Code.

## hashtag Add a new item

To add a new item such as a module, connection, or webhook, right-click the corresponding folder and click the New <item> option.

Each time the prompt appears, you are asked to fill in information about the newly created item. Follow the indicated prompts to create an item. Your new item appears under the corresponding folder.

## hashtag Edit the source code

To start editing the source code, find the item to edit in the left menu and click it.

A new editor will appear and the current source will be downloaded from Make.

You can edit it as a normal file. If your app contains some RPCs or IML functions, you will see auto-complete suggestions for them.

Use the shortcut CTRL+S to upload the source code back to Make.

```
CTRL+S
```

## hashtag Edit metadata

To edit metadata (for example, to change the label of a module), right-click the desired item and select the Edit metadata option from the menu.

In the prompt, change allowed values. If you don't want to change a value, skip the field by pressing the Enter key.

## hashtag Change the connection or webhook

To change the attached connection or webhook of an item, right-click the item and select the Change connection (or webhook) option from the menu.

In the prompt, change the connection or webhook. If possible, there will also be an option to unassign the current connection without assigning a new one.

You will also see a prompt to assign an alternative (secondary) connection. The alternative connection should not be the same as the main connection. You can leave it empty.

## hashtag Delete an item

To delete an item, right-click it and select Delete .

You will be asked to confirm the deletion. If you answer Yes , the item will be deleted from the app.

Deleting items is only possible in private apps. Once an app is published, the capability to delete items within the app is disabled. Learn more about your apps' visibility arrow-up-right and the deletion of items.

## hashtag Generate the interface code

Use the Interface Generator to generate an interface.

Last updated 3 months ago
