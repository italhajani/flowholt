---
title: "Custom IML functions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/debug-your-app/debugging-of-custom-iml-functions
scraped_at: 2026-04-21T12:41:41.441346Z
description: "Debug custom IML functions with a variety of tools"
---

1. Debug your app

# Custom IML functions

Debug custom IML functions with a variety of tools

To debug your IML functions, output the code and use a tool of your choosing.

## hashtag Output a message to the dev console

You can use debug inside your IML functions to print a message or mid-results of your code.
During the function execution, debug messages are visible inside the console of your browser.

```
debug
```

To open the developer console in Google Chrome, open the Chrome Menu in the upper-right-hand corner of the browser window and select More Tools > Developer Tools . You can also use Option + ⌘ + J (on macOS), or Shift + CTRL + J (on Windows/Linux).

```
functionadd(a,b){letsum=a+b;//instead of usual console.log(), use debug().debug("a ="+a)debug('b ='+b)debug(`a+b =${sum}`)returnsum;}
```

By using debug() you can understand what data you are manipulating inside a function.

```
debug()
```

During the run of a module, IML functions called inside this module will also run.

All debug messages that you specified in the IML function are available inside the developer console of your browser.

## hashtag Debug the JavaScript snippet

To debug the output, you can use a variety of tools. Search online to find a JavaScript debugging tool that you prefer.

Here are some to choose from:

- JS Playground arrow-up-right
- Mozilla developer playground arrow-up-right
- RunJS arrow-up-right

JS Playground arrow-up-right

Mozilla developer playground arrow-up-right

RunJS arrow-up-right

You can use this code to test the functionality of the JavaScript debugger to see how it works.

Last updated 5 months ago
