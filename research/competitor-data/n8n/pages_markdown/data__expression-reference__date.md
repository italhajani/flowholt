# Date | n8n Docs

Source: https://docs.n8n.io/data/expression-reference/date
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Date[#](#date "Permanent link")

## *`Date`*.**`toDateTime()`**[#](#datetodatetime "Permanent link")

**Description:** Converts a JavaScript Date to a Luxon DateTime. The DateTime contains the same information, but is easier to manipulate.

**Syntax:** *`Date`*.toDateTime()

**Returns:** DateTime

**Source:** Custom n8n functionality

**Examples:**

|  |  |
| --- | --- |
| ``` 1 2 ``` | ``` // date = new Date("2024-03-30T18:49") date.toDateTime().plus(5, 'days') //=> 2024-05-05T18:49 ``` |

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
