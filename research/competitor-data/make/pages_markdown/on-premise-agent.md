# On-premise agent - Help Center

Source: https://help.make.com/on-premise-agent
Lastmod: 2026-04-08T14:40:12.246Z
Description: Install and use on-premise agents to securely access local applications and databases
Explore more

Connections

# On-premise agent

15 min

This feature is available to Enterprise customers.

With the On-premise agent (On-prem agent) installed on your system, your scenarios﻿ can access applications and databases on your local network without changing the settings of your firewall.

![On-prem agent schema](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/w41YoDn4iUd-XjVJfge1y_uuid-12fede23-a807-af2c-3968-41ba3ea97882.png?format=webp "On-prem agent schema")

﻿

One On-prem agent can connect to many applications that are located in the same network. Currently, we provide an [HTTP Agent](https://apps.make.com/http-agent "HTTP Agent") app that allows for a connection with other custom systems that provide an API or a web service.

![Using an HTTP agent](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/21uggu3neaOf_DHKyAD5K_uuid-017d61ea-47e4-8a99-44c6-25c9ec267dde.png?format=webp "Using an HTTP agent")

﻿

﻿

![More detailed on-prem schema](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/PiAIDjTYpQ2pb7-PUvvqq_uuid-6df3d17f-d7fd-c6c0-4314-08b788e6b1a4.png?format=webp "More detailed on-prem schema")

﻿

To start using an On-prem agent in your scenario﻿, you need to:

1. ﻿[Create](/on-premise-agent#create-an-on-prem-agent)﻿ a new On-prem agent in the **On-prem agents** section of the **Organization** dashboard.

2. ﻿[Download](/on-premise-agent#download-the-on-prem-agent)﻿ the On-prem agent and [install](/on-premise-agent#install-the-on-prem-agent)﻿ it on your device.

3. ﻿[Connect a system](/on-premise-agent#connect-a-system)﻿ (an application) to the installed On-prem agent.

4. ﻿[Create a connection](/on-premise-agent#create-a-connection-in-the-scenario)﻿ between Make﻿ and the connected system when adding the application module in your scenario﻿.

## Add an On-prem agent

The installation process consists of three steps:

* Create an On-prem agent in the **On-prem Agents** section, in Make﻿.

* Download the On-prem agent to your device.

* Install the On-prem agent on your device.

Only users with the **Owner**, **Admin**, and **App dev** organization roles can perform all three steps.

### Create an On-prem agent

To create an On-premise agent:

1

In the left sidebar, click **Org**.

2

Switch to the **On-prem Agents** tab.

3

Click **+ Create on-prem agent**.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Fp2m4gjORuiQVisEBI9N6-20251015-094353.png?format=webp "Document image")

﻿

4

In the **On-prem agent name** field, enter the agent name, and click **Create agent**.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/NEZg6CtaynUDJtnus2aWb-20251015-094542.png "Document image")

﻿

5

A dialog box with credentials appears.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/2cUxTR6OysA07nhupXJHU-20251015-094959.png "Document image")

﻿

6

Save the **Client ID**, the **Secret**, and the **Base URL** in a safe place. You will need these credentials in the installation stage later.

Make sure to save the credentials in a secure location. This is the only time when Make﻿ shows the On-prem agent credentials.

7

Check the **I saved my credentials** box.

8

Click **Download installer**.

﻿Make﻿ redirects you to the download page, where you can choose your device OS and [download the On-prem agent installer](/on-premise-agent#download-the-on-prem-agent)﻿.

### Download the On-prem agent

To run the On-prem agent on your device, you need to download its installation package:

1

Once you click **Download installer** as described in step 8 in [Create an On-prem agent](/on-premise-agent#create-an-on-prem-agent)﻿section, you'll be redirected to the installation page. Select your device's operating system and click **Download**.

For macOS, download the file for Linux.

![Document image](https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-k6_9qgRdrgAx_jWOmb2v-20251015-095319.png "Document image")

﻿

If the auto-download doesn't start automatically, use the link instead.

2

Define where you want to save the On-prem agent installation package on your device.

3

Click **Save**.

### Install the On-prem agent

Installation is the last step you need to start using the On-prem agent in Make. Here you will find steps for installing the On-prem agent on Windows, macOS, and Linux.

### Installation for Windows

You need to have Java 11 or above already installed on your device:

1

Go to the folder where you saved the On-prem agent when downloading, right-click the file, and select **Run as Administrator**. An installation window appears. Click **Install**.

![Make Agent Installer](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-a76EsKwgw5ZN8o0_UwlUp-20250218-105639.png?format=webp "Make Agent Installer")

﻿

You might see a warning. Click **Yes** to continue the installation process.

2

Insert the credentials you saved when [creating the On-prem agent](/on-premise-agent#create-an-on-prem-agent)﻿ in Make and click **Next**.

![Insert credentials](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-kTmrH7Y6SwggpXUws4Pvk-20250218-105901.png?format=webp "Insert credentials")

﻿

3

Select the path for installation and click **Next**.

![Path for installation](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-zAyXG0US3MkoDf1a8k2Wi-20250218-110031.png?format=webp "Path for installation")

﻿

4

Make sure your internet connection is stable. Click **Install**.

5

Complete the installation by clicking **Finish**.

6

A confirmation window appears. Click **Close**.

The On-prem agent status changes to **Active** in Make after refreshing the On-prem agents page. You can [connect a system](/on-premise-agent#connect-a-system)﻿ to it.

![Active agent](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/Ud9PGgEOhmfdGVNj3WAeq_uuid-f4e1e2b1-900d-ab7d-6f88-57bb46c2ab43.png?format=webp "Active agent")

﻿

You can also check your system to see if the installation was successful:

1

Open the **Services** app on your computer.

2

In the list of services, find **Make Agent**. If the status is **Running**, you can start using the On-prem agent in Make. If there is no status, check the [troubleshooting guide](/on-premise-agent#troubleshooting)﻿.

The installer works only for the agent you've downloaded. If you need to run more than one agent on your server, you need to download the installer once again and repeat the installation procedure.

### Installation for macOS

You need to have Java 11 or above already installed on your device:

1

Go to the folder where you saved the .zip archive.

2

Unzip the archive.

3

Open the application-local.yml file and fill in the following fields with the data you saved when [adding an On-prem agent](/on-premise-agent#add-an-on-prem-agent)﻿ in Make﻿.

* make: authentication: client-id

* make: authentication: client-secret

* make: authentication: base-url

4

Save the changes in the file.

5

Open the Terminal.

6

Open the folder that you unzipped from the archive in the Terminal. It is called **Linux-Mac**.

7

Launch the file using this command: java -jar agent.jar

![Mac installation command](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-_bGYBCSSG_WSv1m6x5aVt-20250221-092551.png?format=webp "Mac installation command")

﻿

The system launches the On-prem agent. If you see the Successfully connected Agent with ID... and Started to poll for tasks strings, it means the agent is installed successfully. You can connect a system to it.

### Installation for Linux

You need to have Java 11 or above already installed on your device:

1

Go to the folder where you saved the .zip archive.

2

Unzip the archive.

3

Copy the application-example.yml file, and rename the copied file to application-local.yml.

4

Open the application-local.yml file and fill in the following fields with the data you saved when [adding an On-prem agent](/on-premise-agent#add-an-on-prem-agent)﻿ in Make﻿.

* make: authentication: client-id

* make: authentication: client-secret

* make: authentication: base-url

5

Save the changes in the file.

6

Open the Terminal.

7

Open the folder that you unzipped from the archive in the Terminal. It is called **Linux-Mac**.

8

Launch the file using this command: java -jar agent.jar

![Mac installation command](https://images.archbee.com/yAufeXqD1oGWOPBNi5MAm-_bGYBCSSG_WSv1m6x5aVt-20250221-092551.png?format=webp "Mac installation command")

﻿

The system launches the On-prem agent. If you see the Successfully connected Agent with ID... and Started to poll for tasks strings, it means the agent is installed successfully. You can connect a system to it.

## Connect a system

Once you have installed the On-prem agent, you can connect it to an application (a connected system). You can connect several systems to one On-prem agent.

Only users with the **Owner**, **Admin**, and **App dev** organization roles can connect a system.

### Connect the HTTP system

1

In the left sidebar, click **Organization**.

2

Click the **On-prem agents** tab.

3

Click **Connect system**.

4

In the **Name** field, insert a connection name. This name appears when adding an application module to a Make.

5

In the **Choose app to connect** dropdown list, select the [HTTP Agent](https://apps.make.com/http-agent "HTTP Agent") app.

![Document image](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/GCq_Pq73GOybKwqG1PPGS-20260128-141145.png?format=webp "Document image")

﻿

6

Define the base URL to the application API.

The URL contains a host, a port, and a definition of API for a particular app. If the app runs on the same device where the On-prem agent is installed, the host is localhost. If the app runs on another device, the host is the device IP address. The port and the API definition vary based on the app.

In this example URL https://localhost:3000/api

* the host is localhost

* the port is 3000

* the definition of API is /api

﻿

7

In the **URL** field, insert the URL to the application API.

8

Click **Save**.

In the connected systems list, you will see a new connection that works with this specific On-prem agent. Now you can start building a scenario﻿.

You might be asked to renew the access to the connected system after a certain period of time. If so, click **Revoke** in the **Connected systems** section.

## Create a connection in the scenario

To create a [connection](/connect-an-application)﻿, go to the Scenario Builder.

1

Click **Create a new scenario**.

2

Select the **HTTP Agent** from the dropdown list.

3

Select a module and connect it to Make﻿.

4

Finish configuring the module settings.

After adding the module, you can continue building your scenario﻿. The module uses your selected On-prem agent.

Currently, Make supports only **HTTP Agent** application for the On-prem agent usage.

## On-prem agent status

The following table explains On-prem agent statuses.

| **Status** | **Description** | **Recommended next steps** |
| --- | --- | --- |
| **Active** | The On-prem agent is installed on your device and works under normal conditions. You can connect a system to it and use it in scenarios﻿. | ﻿ |
| **Not responding** | The On-prem agent is disconnected. Make﻿ checks its activity every four minutes. If the On-prem agent doesn't respond, it means the Internet connection is lost. | Check On-prem agent troubleshooting.  When in Not responding status, associated scenarios﻿ still run, but the module using the On-prem agent shows a **500 error.** |
| **Registered** | The On-prem agent is created and appears in the **On-prem agents** section. | * Make sure to complete the installation of the On-prem agent.  * Check if your firewall or anti-virus software is blocking the On-prem agent. |
| **Stopped** | The On-prem agent was stopped manually. | Make your On-prem agent active again if needed. |

## Troubleshooting

Here you can find solutions for the most common issues when working with the On-prem agent in Make﻿.

### Windows installer broke in the middle of the installation

If the installation process breaks, and the progress bar remains the same, do the following:

1. Check if you have these drives installed and updated:
   a. Visual Studio 2019
   b. AdoptOpenJDK 11
   c. Java 11 and above

2. Restart the installation process.

### Error regarding wrong Java version when installing the On-prem agent for Windows

The following error appears if you have the wrong version of Java installed on your device:

![Java error](https://images.archbee.com/oAyFj2GHlBeBVWF5OAir2/wVIsh1dv4ybC5Re9RpA7s_uuid-7c3ca7ef-0ed2-c483-0d07-331deffdd518.png?format=webp "Java error")

﻿

1. Open the Command line.

2. Use the echo %JAVA\_HOME% command to make sure Java is in the Windows PATH variable.

3. Use the java -version command to make sure Java 11 or above is installed.

### No permissions to run the Windows installer

Right-click the installer and click **Run as Administrator**.

### On-prem agent in Not responding status in Make

Check the following:

* The device where the On-prem agent is installed is operational.

* The device is connected to the Internet.

* The Internet connection is stable.

* Your firewall and anti-virus software don't block the On-prem agent.

* Restart the On-prem agent on your device (Windows only):

### On-prem agent not running on a Windows machine

If you open the **Services** app on Windows and see that the **Make Agent** app doesn't have the **Running** status, you can do the following:

1. Go to the folder where you saved the On-prem agent on your machine.

2. Open the **application-local** file and check your credentials: Client ID, Secret, and Base URL.

3. Open the **logs** folder and locate the problem.

﻿

Updated 08 Apr 2026

Did this page help you?

Yes

No

[PREVIOUS

Dynamic connections](/dynamic-connections "Dynamic connections")[NEXT

Devices](/devices "Devices")

[Docs powered by Archbee](https://www.archbee.com/?utm_campaign=hosted-docs&utm_medium=referral&utm_source=help.make.com)
