---
title: "Frequently asked questions | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/community-apps/how-does-it-work
scraped_at: 2026-04-21T12:41:57.268990Z
description: "The answers below reflect Make\u2019s thinking as of July 2023. Based on feedback from both partners and customers, as well as business results, we reserve the right to make changes to the program"
---

1. Community Apps

# Frequently asked questions

The answers below reflect Make’s thinking as of July 2023. Based on feedback from both partners and customers, as well as business results, we reserve the right to make changes to the program

## hashtag App development

### hashtag Is there documentation on developing apps for Make?

Yes. You can read the documentation here . Accepted community apps need to be public but do not need to be approved. They are referred to as community apps .

### hashtag Can we also develop templates for our community apps?

It is not currently possible to develop templates for community apps (more precisely, you can create a template but it’s not possible to publish it). As a workaround, you could create a scenario and export its blueprint arrow-up-right and share that with your customers. Your customers could then import it arrow-up-right , provided that they first install your app.

## hashtag Submission process

### hashtag How do I submit the community app?

Submit the app by filling out the submission form arrow-up-right . This form is meant for apps that are completely ready to be listed.

### hashtag Does the app need to be developed before submitting it to Make?

Yes. Contact your Partner Manager to check if the app you're planning to launch is already on our roadmap.

### hashtag How do I know if Make or another partner is working on an app so we can focus on really broadening the apps catalog?

Contact your Partner Manager. We will try to keep a consolidated list of all apps we know of that are currently in development. However, we don’t expect this list can ever be 100% exhaustive.

### hashtag Do we need to submit the source code?

No, there’s no need to submit the source code. You’ll see everything you need to submit on the submission form arrow-up-right , including:

1. Your app invite link, so Make can see and test your app.
2. The landing page where customers can obtain your app.

Your app invite link, so Make can see and test your app.

The landing page where customers can obtain your app.

### hashtag What’s the expected approval time of an app?

Since we only do a business review of each app, and not a technical or security review, we will generally only take 2-3 business days to accept or reject your app. Please be patient with us as we launch this initiative. Some reviews may take slightly longer than this to process.

## hashtag Marketing

### hashtag How are you going to market the apps?

Make will display all community apps with all other publicly available apps on the Integrations page arrow-up-right .

Each service integrated with Make via community app will have its landing page on the Make website that features community apps from all partners who decided to develop and publish an app for that service. Each app will have a link to the partner’s site.

As a partner, you should present the app’s features and benefits, as well as pricing information and terms and conditions associated with its use. This information and any screenshots, videos, or even customer testimonials may be crucial in helping customers decide to use this app.

### hashtag Will Make promote the apps to Make customers?

Yes. If there is a request for such app on Make Idea Exchange, we will announce that the app is now "Available as a community app", link to the landing page on the Make website, and promote the partner’s website as the author of the app.

## hashtag Installation process

### hashtag How will the app be shared with end customers?

The partner organization creates and hosts its own landing page for the app that includes a method for providing the app to customers. The method through which the partner chooses to share the app does not matter to Make.

You are free to provide a direct install link on your landing page (for free/open source apps), ask your customers to request the app via email, or ask them to fill out a form or go through a registration and checkout process. But, regardless of the delivery method you choose, the app will be installed in the customer’s Make organization.

### hashtag How do customers install the app?

All submitted apps need to be invite-only apps. Once the customer clicks on the app invite link, they’ll need to install it in their Make organization, unless you install the app to the customer’s organization via API.

### hashtag Who is hosting the app?

The app is hosted by Make, in your organization as a published app with a generated invite link. However, you need to host your own landing pages for the app.

## hashtag Monetization, pricing, and billing

### hashtag Is Make going to pay partners for developing apps?

No. However, partners are free to monetize their apps independently by selling to Make customers directly.

### hashtag Is Make going to provide the billing mechanism?

No. We may explore ways to introduce this in the future. Currently, it is the partner’s responsibility to bill their customers for the app usage if they wish to monetize their app.

### hashtag How can I monetize my app?

Currently, you need to create your own monetization system. Here are some methods you could explore:

1. Have customers write you an email, send them an invoice, and then share the access with them.
2. Have customers fill out a form on your website and automatically send them an invoice. Upon accepting and recognizing the payment, you can send them access.
3. Have customers subscribe to your service with a full checkout process and billing system. After checkout, share access with them.

Have customers write you an email, send them an invoice, and then share the access with them.

Have customers fill out a form on your website and automatically send them an invoice. Upon accepting and recognizing the payment, you can send them access.

Have customers subscribe to your service with a full checkout process and billing system. After checkout, share access with them.

### hashtag How can I securely share access to my app with customers so they can’t share it with others?

The easiest way to do this is to simply share an invite link to the app. If you simply share an invite link and have no further protection in place, you risk the invite link being shared beyond paying customers.

One way to ensure security is to ask customers for an access token as a requirement for connecting to your app. You would need to generate a unique token for each customer that pays for your app, making sharing impossible.

The most effective and secure way is to ask customers to generate an API key on Make’s side with the appropriate scope and use this access to install the app directly into their organization. We’ve got an example of how this can be done here arrow-up-right .

### hashtag How can I price my apps?

We recommend that you choose a flat, monthly fee with a price between $1 and $10 for SMB apps and between $50 and $500 for enterprise apps. However, you’re free to charge a one-off fee, recurring charges, or structure pricing as you wish.

### hashtag How do you define SMB vs. Enterprise apps?

Assess the main customers your app is integrating with. For example, SAP S/4 HANA is primarily focused on enterprise customers, while Pipedrive is an SMB-focused CRM.

### hashtag Is Make going to take any cut from the app price?

Not at this time. Partners keep 100% of their app-related revenue. However, this may change in the future.

## hashtag App support

### hashtag Who is responsible for supporting the apps?

You, as a partner, are responsible for supporting any app(s) you submit.

### hashtag How will customers know who supports the app?

We will make it clear that you, as the app developer, are responsible for providing support.

We expect you to inform your customers of this on your landing pages and in your terms and conditions.

You can also add an info box to your app containing information about where to ask for support, so it’s visible any time a user opens any module.

Below is a code example you can use in the mappable parameters section of your app components. Supply real names and links to your resources when using this example.

### hashtag What level of support does Make expect from partners?

We do not require any specific level of customer support at the moment. You should create terms and conditions for the use of your app, and we assume you are committed to keeping your customers satisfied.

That said, we expect that you will handle customer requests in a reasonable time, especially if you receive a request for support that we’ve redirected to you. Please act promptly if there is a need to escalate an issue.

Failure to address customer issues promptly may result in your app being removed.

We want to make sure that our platform enables customers to continuously run their businesses, and, as part of our ecosystem, we expect your cooperation.

## hashtag Permitted apps

Permitted community apps are such that they:

1. Are submitted by a signed Make partner.
2. Are connecting to a real 3rd party service (they are not just tools leveraging custom IML functions but they actually connect Make with a 3rd party service).
3. Are not yet a default part of Make's offering (more community apps connecting to the same service are allowed).
4. Are not planned to be developed by Make.

Are submitted by a signed Make partner.

Are connecting to a real 3rd party service (they are not just tools leveraging custom IML functions but they actually connect Make with a 3rd party service).

Are not yet a default part of Make's offering (more community apps connecting to the same service are allowed).

Are not planned to be developed by Make.

These are the only conditions we check when approving the app.

### hashtag Why is Make only allowing apps that are not yet a default part of Make's offer?

Our goal is to offer a wider variety of integrations to Make users. Second, some 3rd party apps can greatly reduce the number of operations consumed compared to our apps (e.g., Google Sheets), which ultimately impacts our business. Third, we don’t currently have a mechanism to clearly differentiate existing and community apps, if both exist for the same app.

### hashtag Can I submit an app that allows batch operations?

Apps should only provide the functionality of the API. Please make sure your app does not artificially reduce the number of operations being consumed (e.g., by leveraging IML functions to combine multiple bundles into one bundle).

### hashtag Only apps that are not currently by default part of Make will be approved. What happens if a Partner app is approved and then Make develops it?

We are trying to avoid this situation. Therefore, we will only accept an app if we are not actively developing it. If we accept an app that matches something already on our roadmap, we will usually remove it from our own roadmap unless there’s a reason for us to not do so.

### hashtag Why are you allowing community apps to connect to the same service from multiple partners?

Different partners may choose to pursue different monetization models or offer different features. Offering customers choices will allow them to select the best fit for their use cases.

### hashtag How can you differentiate your app from competing apps connecting to the same service?

1. Description of the app on your website including modules covered
2. Monetization model and price
3. Your location and localization

Description of the app on your website including modules covered

Monetization model and price

Your location and localization

Later we might add this information:

1. Number of customers using the app
2. Ratings and reviews

Number of customers using the app

Ratings and reviews

## hashtag Canceling the Community Apps program

### hashtag What happens if Make decides to close the Community apps program?

While Community Apps is a test program, we hope to expand it in the future. Nonetheless, we reserve the right to close the program. In the unlikely event that we choose to do this, we will provide timely updates to you, and work with you to inform your customers. There won't be any effect on existing users of your apps.

## hashtag Contacts

### hashtag Who is my go-to contact?

Your Partner Manager is your main point of contact.

Last updated 5 months ago
