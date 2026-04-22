---
title: "Interface | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/best-practices/output-parameters/interface
scraped_at: 2026-04-21T12:44:07.017434Z
---

1. Best practices chevron-right
2. Output parameters

# Interface

The interface describes the structure of output bundles and specifies the parameters seen in the mapping modal. It should contain the full response from the API, including nested parameters.

You can generate an interface using our Interface Generator .

## hashtag Dynamic interface according to user-defined fields

Retrieving all fields from the endpoint could be difficult, especially when integrating an ERP or other business-related backend that has hundreds of fields.

The solution to this varies across different platforms, but they are similar.

One method is to use a select parameter to retrieve only the fields that you need. For example, Open Data Protocol (OData) arrow-up-right .

```
select
```

```
GETserviceRoot/Airports?$select=Name,IcaoCode{"@odata.context":"serviceRoot/$metadata#Airports(Name,IcaoCode)","value":[{"@odata.id":"serviceRoot/Airports('KSFO')","@odata.editLink":"serviceRoot/Airports('KSFO')","Name":"San Francisco International Airport","IcaoCode":"KSFO"},......]}
```

With Name and IcaoCode as the only output, adjust the interface to indicate to users that only these fields are available for mapping.

```
Name
```

```
IcaoCode
```

Last updated 5 months ago
