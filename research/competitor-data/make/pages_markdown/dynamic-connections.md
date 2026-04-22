# Dynamic connections - Help Center

Source: https://help.make.com/dynamic-connections
Lastmod: 2026-01-21T15:07:02.074Z
Description: Create variables to dynamically define which connection to use for a particular scenario run
Explore more

Connections

# Dynamic connections

10 min

This feature is available to Enterprise customers.

A **dynamic connection** is a variable that contains a connection. It allows you to choose which connection a module uses in a scenario run.

Imagine that your company uses Gmail to communicate with clients and prospects. Each team member has their own Gmail account and is responsible for a specific region. You have a scenario in Make that sends emails to prospects or deals, and you want those emails to be sent from the Gmail account of the team member responsible for the region.

Without the dynamic connection, you can add a Router and set up filters for each region and manager, and manually select the connection in each module:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/A3nEwr5QETSRWeJoz4oXN-20251218-144535.png?format=webp "Document image")

﻿

With the dynamic connection, however, you can group several connections into one variable:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/HxVni6uKZccOiELu4TwCX-20251218-144651.png?format=webp "Document image")

﻿

When you run a scenario, you can select which account will be used within the scenario inputs:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/aGSvQxYhpYodSzCaKiKWS-20251218-144617.png?format=webp "Document image")

﻿

This is particularly useful for complex scenarios with multiple modules and users. Instead of going through each module one by one to select the required connection or creating multiple scenarios, you can simply define which connection to use through the scenario inputs.

## Create a scenario﻿ with a dynamic connection

To create a scenario﻿ with a dynamic connection, you have to assign a connection to build the scenario﻿. Make﻿ calls the initial connection as the "build-time value."

When you finish the scenario﻿, you can assign a different connection to the dynamic connection anytime.

1

Go to your scenario﻿ and select an app module.

2

Click the three dots next to **Create** **connection**, and then click **Create a dynamic connection.**

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/w-Xikbjkt0qzAxYLk-Ct9-20251009-101545.png?format=webp "Document image")

﻿

3

In the **Dynamic connection name** field, type the name of the connection.

4

Set the **Build-time value** for the dynamic connection:

* In the **Build-time value**, choose an existing connection or click **Add** or **Create new connection** to create a new connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/KEVrwIoFBgXsv7_B8P5aL-20251009-101804.png?format=webp "Document image")

﻿

* In case of creating a new connection, enter a name for the connection in the **Connection name** field of the emerging window.

* Click **Save**.

* Grant Make﻿ access to your Dropbox account.

* Click **Save**.

You have set the build-time value for the dynamic connection. You can see the connection in the **Build-time value** field.

5

Then, select whether you want to use the build-time connection as the default or not. Make﻿ uses the default value to run the scenario﻿.

You will be able to select a different connection when you run the scenario﻿ on demand.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/P-GvWmijjV2ZuJWYBbanD-20251009-102405.png?format=webp "Document image")

﻿

6

Optional: In the **Default value** field, you can select the default connection that will be used when a dynamic connection is selected.

To create a new connection that will be set as the default value, click **Add** and follow the steps to create a connection.

You can set the default value for the dynamic connection in the scenario inputs interface as well:

1. In the Scenario Builder toolbar, click **Scenario inputs and outputs.**

2. Expand the input to see the **Default value** field

3. Set the default.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/9nMBMIjFPJDM3tJQORu9N-20251219-161629.png?format=webp "Document image")

﻿

If you don't provide a default value for the dynamic connection, you can schedule the scenario to **On-demand** only.

7

Click **Save**.

You created a dynamic connection. Now you can continue configuring the module.

You can find your dynamic connections in:

Module settings

Scenario inputs window

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/7VHMaj3GCElh9wGb79Qmw-20251222-100245.png?format=webp "Document image")

﻿

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/54UiwzZXzllfp3VXtwWM4-20251222-100321.png?format=webp "Document image")

﻿

In the **Build-time value** tab, you can also see the dynamic connection with the connection it's using:

In the **Build-time value** tab, you can also see the dynamic connection with the connection it's using:

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Uwat2zhvck9omaXFRNaTA-20251222-100608.png?format=webp "Document image")

﻿

## Run a scenario﻿ with a dynamic connection

A dynamic connection is like a variable or a container for connections, which is empty until you assign a connection to it. Thus, to run a scenario﻿ with a dynamic connection, you have to assign a connection to it or use a default. You can either create a new dynamic connection or use an existing one.

### Use an existing dynamic connection

To run a scenario﻿ with a dynamic connection, use the scenario﻿ inputs. In scenario﻿ inputs, assign a connection to the dynamic connection for your scenario﻿ run or use the default.

To run your scenario﻿ on schedule, you have to provide a default for your dynamic connections. Make﻿ uses the default connection in scheduled scenario﻿ runs.

1

Go to your scenario﻿.

2

Click **Run once**. A scenario﻿ inputs window appears.

3

You can either set up a new connection or use an existing connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/V8jeLOAXcTqs3gJaEgivN-20251222-103414.png?format=webp "Document image")

﻿

4

Click **OK**.

﻿Make﻿ runs the scenario﻿ with the selected connections.

## Update a dynamic connection

Compared to other connections, dynamic connections are flexible and can change the value they contain. For example, you might want to assign a different connection to the dynamic connection with each scenario﻿ run. This might be practical when you want to frequently use different credentials in the scenario﻿.

Another option is to update just the default for the dynamic connection for scheduled scenario﻿ runs.

You can update a dynamic connection:

* ﻿[In the module settings](l9Gc1XFkuEukW-x_QjRpZ#U1F3D)﻿

* ﻿[In the scenario inputs](l9Gc1XFkuEukW-x_QjRpZ#_HK9I)﻿

### Update dynamic connections in the module settings

To update a dynamic connection in the module settings:

1

Open the **Connections** dropdown list in the app module and find the dynamic connection you want to edit.

2

Click **Edit**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/IsR7BVSHlMZ7rJMwUp37r-20251009-122649.png?format=webp "Document image")

﻿

3

Next, you can change the dynamic connection name (optional).

4

In the **Build-time value** dropdown list, select the connection you want to assign to the dynamic connection. Click **Add**, if you want to create a new connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/1eB02jL3NKR_oY1Js_pSZ-20251222-111245.png?format=webp "Document image")

﻿

5

Click **Save**.

You have updated the dynamic connection. When the scenario﻿ runs, the dynamic connection will use the connection you assigned.

### Update dynamic connections in the scenario﻿ inputs

To update a dynamic connection in the scenario inputs:

1

Go to the scenario﻿ in which you want to update the dynamic connection.

2

In the Scenario Builder toolbar, click **Scenario inputs and outputs.**

3

Switch to the **Build-time value** tab.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GXVdaB-u6ibpR-Cnl99IC-20251009-123645.png?format=webp "Document image")

﻿

4

Click **Edit**.

5

In the dropdown list, select another connection you want to assign to the dynamic connection. Click **Add** if you want to create a new connection.

6

Click **Save**.

You have updated the dynamic connection. When the scenario﻿ runs, the dynamic connection will use the connection you assigned.

## Delete a dynamic connection

To delete a dynamic connection:

1

Go to the scenario﻿ in which you want to delete the dynamic connection.

2

In the Scenario Builder toolbar, click **Scenario inputs and outputs.**

3

In the **Scenario** **inputs** tab, click the delete icon next to the dynamic connection.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/j8vfPhvoiz3ppn4BpRm9s-20251222-111831.png?format=webp "Document image")

﻿

4

Click **Save**.

You have deleted your dynamic connection.

Updated 21 Jan 2026

Did this page help you?

Yes

No

[PREVIOUS

Credential requests](/credential-requests "Credential requests")[NEXT

On-premise agent](/on-premise-agent "On-premise agent")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
