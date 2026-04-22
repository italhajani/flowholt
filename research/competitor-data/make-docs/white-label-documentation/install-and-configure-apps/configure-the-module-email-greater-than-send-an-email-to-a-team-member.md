---
title: "Configure the module Email > Send an Email to a Team Member | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/install-and-configure-apps/configure-the-module-email-greater-than-send-an-email-to-a-team-member
scraped_at: 2026-04-21T12:42:06.822070Z
---

1. Install and configure apps

# Configure the module Email > Send an Email to a Team Member

The native app Email includes a module Send an Email to a Team Member that users can put in their scenarios that automatically sends the specified person an email with a custom subject and body. To offer this module, you need to add the following parameters in JSON in the Email app's common data. The from object lets you define the user and email address your users receive these emails from.

```
from
```

1. Go to Administration > Native Apps .
2. Click Email .
3. Click the App: 7.3.19 tab.
4. Click the toggle for Send an Email to a Team Member to make it visible and accessible for your users.
5. In the Common data field, create an enter a JSON object using the parameters and example below.
6. Click the save icon to save your changes.

Go to Administration > Native Apps .

Click Email .

Click the App: 7.3.19 tab.

Click the toggle for Send an Email to a Team Member to make it visible and accessible for your users.

In the Common data field, create an enter a JSON object using the parameters and example below.

Click the save icon to save your changes.

maxPastRecords

-

integer

Defines the maximum number of emails retrieved in the "Choose where to start - Select the first email" action.

Default: 120

Maximum: 121

timeout

-

integer

Defines the connection timeout in milliseconds.

Default: 30000

smtp

Yes

object

Defines the SMTP connection settings for sending emails.

port

Yes

integer

Defines the SMTP port for sending emails.

host

Yes

string

Defines the host domain for sending emails.

secure

Yes

booelan

Defines whether SMTP requires secure encryption.

authMethod

Yes

string

Defines the SMTP authentication method.

auth

Yes

object

An objection containing the credentials for sending emails.

user

Yes

string

The username for sending emails.

password

Yes

string

The password for sending emails.

from

Yes

string

The name and email address that your users will see as the sender of these emails.

template

-

string

The public URL of an HTML template you want to use for the emails sent to users. The user-defined content of the email message replaces the {{body}} placeholder.

Default: a Make template

Last updated 5 months ago
