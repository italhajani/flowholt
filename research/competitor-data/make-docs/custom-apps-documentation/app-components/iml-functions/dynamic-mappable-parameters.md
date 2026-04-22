---
title: "Dynamic mappable parameters | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/app-components/iml-functions/dynamic-mappable-parameters
scraped_at: 2026-04-21T12:44:43.409876Z
---

1. App components chevron-right
2. Custom IML functions

# Dynamic mappable parameters

Some APIs rely heavily on custom objects, with fields defined by the user. These can vary from one project/workspace/user to another, so in these cases you might need to define the mappable parameters dynamically, using metadata endpoints that define the objects the API expects. In some cases, these fields may also have different types than the ones supported in Make.

Some API examples are Monday, Asana, Jira, NocoDB, Notion, among many others.

In these cases, you must define the mappable parameters with the help of an RPC, and if the types differ from Make types, you also need to implement a custom IML function that will act as a sort of conversion table. This conversion table has a list of API formats and their equivalents in Make.

For example, when the API returns a field of type single_line_text , it is in Make as text . You can also use additional parameters available from the metadata request, such as whether the parameter is mandatory or optional, what are available options in selects, etc.

```
single_line_text
```

```
text
```

```
{"data":{"fields":[{"id":"1","name":"Birthday","type":"anniversary","position":0,"mandatory":false,"reminder_days":0},{"id":"2","name":"CF Single Line Text","type":"single_line_text","position":1,"mandatory":false},{"id":"3","name":"CF Multi Line Text","type":"multi_line_text","position":2,"mandatory":false},{"id":"4","name":"CF Number","type":"number","position":3,"mandatory":false},{"id":"5","name":"CF Dropdown","type":"select_box","position":4,"mandatory":false,"choices":["a","b","c"]},{"id":"6","name":"CF Date","type":"date","position":5,"mandatory":false},{"id":"7","name":"CF Checkbox","type":"multiple_choice","position":6,"mandatory":false,"choices":["1","2","3"]}]}}
```

Last updated 5 months ago
