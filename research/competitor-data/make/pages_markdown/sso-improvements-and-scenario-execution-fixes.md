# SSO improvements and scenario execution fixes - Help Center

Source: https://help.make.com/sso-improvements-and-scenario-execution-fixes
Lastmod: 2026-01-19T17:35:08.553Z
Description: Learn about SSO domain verification and enforcement, coupon subscription updates, webhook queue improvements, and multiple scenario execution fixes
Release notes

2024

# SSO improvements and scenario execution fixes

2 min

## Improvements and changes

* Enterprise customers can now claim and verify an email domain for their Single Sign-On (SSO) setup, allowing for SSO enforcement. Make﻿ recognizes users with the claimed email domain and prompts them to use SSO. See our [article on domain claim](/domain-claim#)﻿ for information on setup and provisioning options.

* Using a coupon for a higher plan now changes your subscription. Once the coupon expires, you automatically stay on your new plan. Or, you can manually downgrade to your original plan. See our [article on coupons](ICTrw0S99OVzeFU6y3Y-k#)﻿ for details.

## Fixed issues

* Under the SSO option **Default teams for newly created users**, the list of teams showed deleted teams. This list now shows only valid teams.

* It wasn't possible to delete records in a webhook queue: the **Delete** button wasn't clickable. Now you can delete them.

* The infinite scroll in the scenario﻿ history wasn't infinite: it got stuck and didn't show all records. Now you have access to the full history.

* The hints for creating names of custom functions and scenario﻿ inputs were incorrect. The hints now show the correct requirements for custom function and scenario﻿ inputs names.

* Doubled and unaligned texts appeared when you clicked the **Create a connection** button. We solved it, so you have beautifully aligned and correct texts.

* When you tried to resolve incomplete executions, the **Run once** button wasn't clickable. Also, a module that caused an error lost its mapping. We fixed both issues.

* Mapping pills showed their raw name. Pills now have descriptive names.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/EUW-11ydLZ9tJbZ7pw_12_uuid-b3cecf61-90ac-30ee-0eaf-f77eb9e1900f.png?format=webp "Document image")

﻿

* When you ran the **Explain flow** option and then deleted one or more modules, the dot showing the flow was stuck. We unfroze the dot, and now it shows the full flow (and takes into account the deleted modules).

![Document image](https://images.archbee.com/4CkrlJIBl1di_p1x71ery-EhSDDaZUWp3gyxFmT5LxX-20250228-131453.png?format=webp "Document image")

﻿

* The built-in option that Make﻿ uses to decode URLs in the output refused to decipher links. Now URLs in the output are legible and don't contain odd symbols.

Updated 19 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Module setup badges, community apps](/module-setup-badges-community-apps "Module setup badges, community apps")[NEXT

Introducing dynamic connections](/introducing-dynamic-connections "Introducing dynamic connections")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
