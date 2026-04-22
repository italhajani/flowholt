---
title: "Custom code injection | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/customize-your-instance/custom-domains/custom-code-injection
scraped_at: 2026-04-21T12:46:09.524336Z
---

1. Customize your instance chevron-right
2. Custom domains

# Custom code injection

The Custom code tab of Administration > System settings lets you inject your custom code into any customer-facing html in the following places:

```
html
```

- The header
- The footer

The header

The footer

You can inject a custom code to customize the appearance of your Make White Label and integrate it with third parties such as Zendesk and HotJar.

Each field has a character limit of 5,000 characters. If you use externally loaded content or third-party integrations such as Hotjar, Segment, or Google Tag Manager, you need to update the Dynamic CSPs with the relevant URLs.

Because adding custom codes risks irreversible damage to your instance, use the following procedure to identify possible issues and address them first:

1. Use the Dynamic CSPs field to allow resources and content from the external URLs in your custom HTML. See the section on Dynamic CSPs below for details .

Use the Dynamic CSPs field to allow resources and content from the external URLs in your custom HTML. See the section on Dynamic CSPs below for details .

Third parties have support documentation for the CSPs required by your custom code.

1. In a Chrome browser window, load a page on your white-label instance where you want to see your changes.
2. Right-click on any element on your instance's page and select Inspect .
3. In the developer console, find the Console section. Copy-paste the section of your code between <script> and </script> , and hit Enter .
4. The console displays information about any errors. If there are no errors, you can see your changes live in your browser as a temporary preview.

In a Chrome browser window, load a page on your white-label instance where you want to see your changes.

Right-click on any element on your instance's page and select Inspect .

In the developer console, find the Console section. Copy-paste the section of your code between <script> and </script> , and hit Enter .

```
<script>
```

```
</script>
```

The console displays information about any errors. If there are no errors, you can see your changes live in your browser as a temporary preview.

The console identifies errors related to your CSP. In this case, update your Dynamic CSPs and click Save.

1. Optional: For custom footers, right-click in the Elements section and select Edit as HTML. Find <body> and copy-paste your custom footer before </body> .
2. Check that your changes both look and function properly in your browser

Optional: For custom footers, right-click in the Elements section and select Edit as HTML. Find <body> and copy-paste your custom footer before </body> .

```
<body>
```

```
</body>
```

Check that your changes both look and function properly in your browser

Your browser displays a preview of your integrated custom code. If your preview does not appear correct, use the information in the Console section to troubleshoot.

If the above procedure loads your custom code without issues, use the following procedure to insert your custom code:

1. Go to Administration > System settings .
2. Find Code Injections .
3. In the Header field, enter the code you want injected into the <header> section of user-facing HTML.
4. In the Footer field, enter the code you want injected before <before> in user-facing HTML.
5. Click Publish .

Go to Administration > System settings .

Find Code Injections .

In the Header field, enter the code you want injected into the <header> section of user-facing HTML.

```
<header>
```

In the Footer field, enter the code you want injected before <before> in user-facing HTML.

```
<before>
```

Click Publish .

Your changes go live within 10 minutes and apply to the administration UI as well as the customer-facing UI.

Most common problems involve CSPs. Edit your Dynamic CSPs based on the errors you find in the developer tools.

Last updated 1 year ago
