---
title: "Remote Procedure Calls | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/debug-your-app/debugging-rpc
scraped_at: 2026-04-21T12:41:38.443241Z
description: "Use the Make web interface to debug Remote Procedure Calls (RPCs)"
---

1. Debug your app

# Remote Procedure Calls

Use the Make web interface to debug Remote Procedure Calls (RPCs)

To find the RPC debug tool:

Navigate to the Custom apps area.

Select your custom app from the list.

Click the Remote Procedures tab.

Select the RPC you want to debug.

Click Test RPC .

## hashtag RPC page

Compare the tabs below to learn how to access information about your RPCs in Make.

### hashtag Communication tab

After creating a new RPC, you can modify the default template in the Communications tab for your needs.

Inside RPC, you can use the relative path and the full form of the URL.

However, we advise using the relative path across all your RPCs and modules.

A relative path is added to the "baseUrl" that you need to specify inside the app Base.

```
"baseUrl"
```

### hashtag Parameters tab

By default, the Parameters tab is empty. Here you can add any parameter you need. You can also add mappable parameters from a module. Learn more about using RPC parameters .

Any parameter created inside an RPC will be available only for RPC debugging. It will not be visible inside your modules or inside scenarios.

To preview and test parameters, click on the Test RPC button.

## hashtag RPC debug tool

The RPC debug tool works the same way modules do.

1. Specify the connection and other fields (parameters) if needed.
2. Click the Test button.
3. The call, which you specified before in the RPC communication, will be executed.

Specify the connection and other fields (parameters) if needed.

Click the Test button.

The call, which you specified before in the RPC communication, will be executed.

You will see the output that you specified in the RPC communication.

```
output
```

If you specified output as " label" and "value" (with the purpose of using it inside a Select parameter), do not expect to see the full server response there.

```
label"
```

```
"value"
```

Sometimes you might get an empty array as a response. If that's not the response that you expected, check that you correctly specified the path to the object, which you use inside iterate .

```
iterate
```

## hashtag Debug RPCs in the dev console

Sometimes you may need to look into the request you're sending and the response from the API.

You can see more details about the RPC you're testing by opening your browser's dev console: Network tab.

The debug values show the request being sent and the response received by the API.

```
debug
```

Last updated 5 months ago
