---
title: "App logo | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-logo
scraped_at: 2026-04-21T12:45:54.393336Z
---

1. Create your first app

# App logo

Every app in Make has its own logo and color. The combination of logo and color represents the app. With a distinct logo and color, the users quickly see which module belongs to which app.

## hashtag App theme

The app theme is the module color in hexadecimal format. For example, the Make module's color is #6e21cc .

```
#6e21cc
```

## hashtag App logo

To add a logo to your custom app, make sure your logo file meets these requirements:

- an image file in .png format
- square dimensions: minimum size 512 x 512 px and maximum size 2048 x 2048 px
- a maximum size of 500 kB

an image file in .png format

```
.png
```

square dimensions: minimum size 512 x 512 px and maximum size 2048 x 2048 px

a maximum size of 500 kB

Make processes the logo file so that:

- Areas in the logo that are white or transparent will be displayed as the color specified in the Theme field.
- Areas in the logo that are black will be converted to full opacity and will be displayed as white.
- Areas in the logo that are in color or are semi-transparent will be displayed as the color between white and the color specified in the Theme field.

Areas in the logo that are white or transparent will be displayed as the color specified in the Theme field.

Areas in the logo that are black will be converted to full opacity and will be displayed as white.

Areas in the logo that are in color or are semi-transparent will be displayed as the color between white and the color specified in the Theme field.

If you don't have any tool to edit your file with the logo, you can use the Lunapic arrow-up-right free editor.

For creating a transparent layer, you can use the Transparent Background arrow-up-right tool that is available in Lunapic.

## hashtag Examples of how logos are rendered

## hashtag Work with semi-transparent pixels

An app can have only one theme color. You can use multiple transparency levels to give your logo multiple shades of the theme color. You can also create a 3D effect.

## hashtag Update the app's theme and/or logo

You can update the custom app's logo anytime. Navigate to your custom app settings and click Options > Edit .

If your app has been approved, the change of theme/logo needs to be approved by Make.

After you upload or update the logo or theme color, it may take up to 1 hour for the changes to be propagated across the Make platform.

Last updated 5 months ago
