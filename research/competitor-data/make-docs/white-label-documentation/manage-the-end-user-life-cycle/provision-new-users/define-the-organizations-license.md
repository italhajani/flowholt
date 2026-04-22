---
title: "Define the organization's license | White Label | Make Developer Hub"
url: https://developers.make.com/white-label-documentation/manage-the-end-user-life-cycle/provision-new-users/define-the-organizations-license
scraped_at: 2026-04-21T12:46:00.068788Z
---

1. Manage the end-user life cycle chevron-right
2. Provision new users

# Define the organization's license

Every organization has a license which is a collection of parameters that define access to features, such as custom variables, and limit consumables and assets, such as operations and data stores. You can use these parameters to do the following:

- Offer multiple tiers of access. For example, offering your customers more operations or data stores based on their contracts.
- Control resource usage on your instance. For example, limits on API calls or time between scenario runs.

Offer multiple tiers of access. For example, offering your customers more operations or data stores based on their contracts.

Control resource usage on your instance. For example, limits on API calls or time between scenario runs.

auditLogsDays

```
auditLogsDays
```

Use this integer parameter to specify how many days of event history the Audit Logs will store. Currently, the maximum supported duration is 365 days.

analyticsAccess

```
analyticsAccess
```

Use this boolean parameter to define if the Analytics page is available.

operations

```
operations
```

Use this parameter to limit the number of operations available for your customer's organization.

This limit renews according to the value of the restartPeriod parameter.

```
restartPeriod
```

transfer

```
transfer
```

Use this parameter to limit the amount of data that the organization's scenarios can transfer.

This limit renews according to the value of the restartPeriod parameter.

```
restartPeriod
```

interval

```
interval
```

Use this parameter to set the shortest time in minutes between two scheduled scenario runs.

fslimit

```
fslimit
```

Use this parameter to limit the file size that the organization's scenarios can process.

iolimit

```
iolimit
```

Use this parameter to limit the size of webhook queues for the organization.

dslimit

```
dslimit
```

Use this parameter to limit the number of data stores that the organization can have.

dsslimit

```
dsslimit
```

Use this parameter to limit the total storage capacity for all data stores in the organization.

(Deprecated) productManagement

```
productManagement
```

This parameter has no impact on white-label instances. Use the following value in all cases:

salesforce

```
salesforce
```

(Deprecated) gracePeriod

```
gracePeriod
```

This parameter has no impact on white-label instances. Use the following value in all cases:

7

```
7
```

fulltext

```
fulltext
```

Use this boolean parameter to enable full-text search in the scenario history log.

Once enabled, scenario executions are indexed with full-text search capabilities moving forward. However, there is no impact on previously run executions. Only scenario executions after enabling this feature are available for searching via full text.

scenarios

```
scenarios
```

Use this parameter to limit the number of active scenarios that the organization can have.

advsched

```
advsched
```

Use this boolean parameter to enable access to advanced scenario scheduling.

apiLimit

```
apiLimit
```

Use this parameter to limit of API requests per 1 minute per organization.

Define this parameter as 0 to disable API access.

executionTime

```
executionTime
```

Use this parameter to limit the amount of time in minutes that a single scenario can run.

customVariables

```
customVariables
```

Use this boolean parameter to enable custom variables in scenarios. Access applies to all users in the organization who can create and edit scenarios but only in the context of that specific organization.

Depends on the system flag feature_variables .

```
feature_variables
```

creatingTemplates

```
creatingTemplates
```

Use this boolean parameter to let users in the organization create scenario templates.

This parameter allows your internal developers to create custom templates to share with your customers.

installPublicApps

```
installPublicApps
```

Use this boolean parameter to let users in the organization access custom apps created by someone outside of the organization created.

One possible use case is for your internal apps developers to collaborate across organizations.

restartPeriod

```
restartPeriod
```

Use this parameter to define how often an organization's consumables (operations, etc.) renew. You can choose between a monthly or an annual reset cycle.

teams

```
teams
```

Use this parameter to limit the number of teams that an organization can have.

appslimit

```
appslimit
```

Use this parameter to limit the total number of connection-based apps for all of an organization's active scenarios. For example, 10 means a maximum limit of 10 connection-based apps for an organization's active scenarios.

retention

```
retention
```

Use this parameter to define how long your instance stores logs (such as execution logs) for the organization.

Default value is 60 days if not set.

premiumApps

```
premiumApps
```

Use this parameter to allow access to premium app tiers. To fully implement app tiers, you must also define an app's tier level.

dlqStorage

```
dlqStorage
```

Use this parameter to limit storage for incomplete executions.

scenarioIO

```
scenarioIO
```

Use this boolean parameter to allow access to the scenario inputs feature.

Depends on system flags feature_variables and feature_scenario_inputs

customProperties

```
customProperties
```

Use this integer parameter to enable the custom scenario properties feature. With custom properties, your users can add custom metadata to scenarios and use them to sort and filter their scenarios.

0 to disable custom scenario properties arrow-up-right for an organization.

```
0
```

1 or higher to define the number of custom scenario properties an organization can create.

```
1
```

dynamicDependencies

```
dynamicDependencies
```

Use this boolean parameter to define if dynamic dependencies are allowed in scenarios.

By default, this parameter is set to false, which means dynamic dependencies are not allowed. If set to true, it enables the usage of dynamic dependencies in scenarios.

dynamicConnections

```
dynamicConnections
```

Use this boolean parameter to enable the use of connections in scenario inputs and map them in modules.

By default, this parameter is set to false, meaning that this feature is not enabled. However, in order to use dynamicConnections , you need to have the dynamicDependencies flag turned on. If set to true, it allows you to call scenarios with arbitrary connections.

```
dynamicConnections
```

```
dynamicDependencies
```

Last updated 8 months ago
