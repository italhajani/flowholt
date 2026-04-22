---
title: "Test your app | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/create-your-first-app/test-your-app
scraped_at: 2026-04-21T12:41:35.686843Z
---

1. Create your first app

# Test your app

To test your app in Make, create a new scenario.

In the Scenario Builder, add the Geocodify > Search geolocation module that you have just created.

Note that is has the Private tag.

Click Create a connection .

Enter your API Key from the Geocodify API.

Click Save .

Insert the address you want to geolocate, for example: Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France.

This is the Location parameter you set up in the Mappable parameters tab.

Click Save to save the module.

Save the scenario. A pop-up appears appears asking for confirmation to install the app in your organization.

- Click Yes on the pop-up to install the app in your organization.
- Click Run once to run the scenario.

Click Yes on the pop-up to install the app in your organization.

Click Run once to run the scenario.

Open the output to retrieve the coordinates. They are under Output> Bundle 1> response> features> 1> geometry> coordinates .

The coordinates are output this way because you chose to return the response as is, without filtering or customization.

Your app works. Congratulations!

At this point, your module is hidden by default. Even if the app is installed in the organization, it won't appear in the scenario editor for other users until you make it visible.

To let other users see your module, go to the module in the app setup and slide the toggle from hidden to visible.

To learn more about app and module visibility, see the App visibility article .

Last updated 5 months ago
