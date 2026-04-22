---
title: "Groups | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/naming-conventions/groups
scraped_at: 2026-04-21T12:44:14.593208Z
---

1. Best practices chevron-right
2. Naming conventions

# Groups

If an app has over 10 modules, the modules should be put into groups. These groups should be named after the entity with which the modules work or the type of job the modules are executing.

Consider the following when you decide the order of groups and modules in your app:

- Triggers All instant triggers All polling triggers
- Generic modules Sorted in groups, if possible Example of a group: RECORDS
- Typical modules divided by business logic Sorted in groups (examples: TASKS, DEALS, CONTACTS) Sorted from the most important to the least important Ordered by RCUD logic (read, create, update, delete)
- Other Examples: Make an API call, Execute a GraphQL query

Triggers

- All instant triggers
- All polling triggers

All instant triggers

All polling triggers

Generic modules

- Sorted in groups, if possible
- Example of a group: RECORDS

Sorted in groups, if possible

Example of a group: RECORDS

Typical modules divided by business logic

- Sorted in groups (examples: TASKS, DEALS, CONTACTS)
- Sorted from the most important to the least important
- Ordered by RCUD logic (read, create, update, delete)

Sorted in groups (examples: TASKS, DEALS, CONTACTS)

Sorted from the most important to the least important

Ordered by RCUD logic (read, create, update, delete)

Other

- Examples: Make an API call, Execute a GraphQL query

Examples: Make an API call, Execute a GraphQL query

- TRIGGERS
- FORMS
- TASKS
- DEALS
- OTHER

TRIGGERS

FORMS

TASKS

DEALS

OTHER

FORMS

- List forms
- Get a form
- Create a form
- Update a form
- Delete a form

List forms

Get a form

Create a form

Update a form

Delete a form

When dividing modules into groups by business logic, if every group only has one module, do not apply custom grouping. Instead, use the default groups: ACTIONS and OTHER.

Last updated 5 months ago
