# Text parser - Help Center

Source: https://help.make.com/regexp
Lastmod: 2026-04-08T14:40:16.832Z
Description: Extract and transform text using patterns and regular expressions to parse data from any source
Explore more

Tools

# Text parser

6 min

Our Text parser section includes several useful modules that can enhance your scenario﻿.

![Text parser](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-4gQfwfgn1LicbIWuzK4gP-20250228-110707.png?format=webp "Text parser")

﻿

## Transformers

### Get elements from HTML

Retrieves the desired elements from an HTML code.

![Get elements from HTML](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-YZ8KrbV0OVvS7iqXCGdum-20250228-110931.png?format=webp "Get elements from HTML")

﻿

| **Field** | **Description** |
| --- | --- |
| Continue the execution of the route even if the module returns no results | If enabled, the scenario﻿ will not be stopped by this module. |
| Element type | Select the type of element you want to retrieve from the HTML code such as an image, link, or iframe element(s). |
| HTML | Enter the HTML code you want to retrieve the specified element types from. |

### Match pattern

Enables you to find and extract string elements matching a search pattern from a given text.

![Match pattern](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-2YDqh-I9nIlIi62MDwIVd-20250228-111157.png?format=webp "Match pattern")

﻿

| **Field** | **Description** |
| --- | --- |
| Pattern | Enter the regular expression pattern. For example, [+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)? extracts all numerals in the provided text.  The pattern will contain at least one capture group in parenthesis () for the output bundle to contain some items. If the pattern does not contain any capture groups, the output bundle will be empty |
| Global match | If enabled, then the module retrieves all matches in the text. If disabled, then the module retrieves only the first entry. |
| Case sensitive | You can disable the case sensitivity by disabling this option (default=case sensitive). |
| Multiline | If checked, beginning and end metacharacters (^ and $) will match the beginning or end of each line, not just the very beginning or end of the whole input string. |
| Continue the execution of the route even if the module returns no results | If enabled, the scenario﻿ will not be stopped by this module. |
| Text | Enter the text you want to match the pattern. |

The search pattern is a [regular expression](https://en.wikipedia.org/wiki/Regular_expression "regular expression") (aka regex or regexp), which is a sequence of characters in which each character is either a metacharacter, having a special meaning, or a regular character that has a literal meaning.

* The complete list of metacharacters can be found on the [MDN web docs website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions "MDN web docs website").

* For a tutorial on how to create regular expressions, we recommend the [RegexOne website](https://regexone.com/ "RegexOne website").

* For an easy, quick regex generator, try the [Regular Expressions generator](https://regex-generator.olafneumann.org "Regular Expressions generator").

* For experimenting with regular expressions, we recommend the [regular expressions 101 website.](https://regex101.com/ "regular expressions 101 website.") Just make sure to tick the ECMAScript (JavaScript) FLAVOR in the left panel:

### Replace

Searches the entered text for a specified value or regular expression, and replaces the result with the new value.

![Replace](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-NuHtIkrwbTxLouKPfysd7-20250228-115723.png?format=webp "Replace")

﻿

| **Field** | **Description** |
| --- | --- |
| Pattern | Enter the search term. You can also use a regular expression. For more details about the regular expression, refer to the [Match pattern](/regexp#match-pattern)﻿ module. |
| New value | Enter a value that will replace the search term. |
| Global match | If this option is enabled, the module will find all matches rather than stopping after the first match. Each match will be output in a separate bundle. |
| Case sensitive | If this option is enabled, the search will be case sensitive. |
| Multiline | If checked, the beginning and end metacharacters (^ and $) will match the beginning or end of each line, not just the very beginning or end of the whole input string. |
| Text | Enter the text to be searched. |

## Data scraping

Data scraping, sometimes called web scraping, data extraction, or web harvesting is the process of collecting data from websites and storing it in your local database or spreadsheets. If you wish to scrape data from a website and you are not familiar with regular expressions, you may use a data scraping tool:

* ﻿[Apify](https://apify.com/ "Apify") is an excellent tool, and we already have it integrated

* ﻿[Web Data Extractors 2025](http://whitepapers.virtualprivatelibrary.net/Web%20Data%20Extractors.pdf "Web Data Extractors 2025")﻿

If the data scraping tool provides a REST API, you can connect to it via our universal **HTTP** and **Webhooks** modules. You can also create an app on your own using the [Make App SDK](https://developers.make.com/custom-apps-documentation "Make App SDK").

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Tools](/util "Tools")[NEXT

Functions](/functions "Functions")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
