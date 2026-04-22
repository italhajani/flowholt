# Set the self-hosted instance timezone | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/configuration-examples/time-zone
Lastmod: 2026-04-14
Description: Change the default timezone for your self-hosted n8n instance.
# Set the self-hosted instance timezone[#](#set-the-self-hosted-instance-timezone "Permanent link")

The default timezone is America/New\_York. For instance, the Schedule node uses it to know at what time the workflow should start. To set a different default timezone, set `GENERIC_TIMEZONE` to the appropriate value. For example, if you want to set the timezone to Berlin (Germany):

|  |  |
| --- | --- |
| ``` 1 ``` | ``` export GENERIC_TIMEZONE=Europe/Berlin ``` |

You can find the name of your timezone [here](https://momentjs.com/timezone/).

Refer to [Environment variables reference](../../environment-variables/timezone-localization/) for more information on this variable.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
