---
title: "Pagination in list/search modules | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/debug-your-app/debugging-of-pagination-in-list-search-modules
scraped_at: 2026-04-21T12:41:37.989597Z
description: "Debug pagination issues in list and search modules by creating test records and results"
---

1. Debug your app

# Pagination in list/search modules

Debug pagination issues in list and search modules by creating test records and results

If the API supports pagination, it should be implemented. To test that the pagination works as intended, we recommended you set the page size to a low number, if possible.

```
{"url":"/contacts/filters/{{parameters.filter_id}}","method":"GET","qs":{//"per_page": 100"per_page":10//set value for testing},"response":{"output":"{{item.contact}}","iterate":"{{body.data.contacts}}","limit":"{{parameters.limit}}"},"pagination":{"qs":{"page":"{{pagination.page}}"},"condition":"{{body.data.max_page > body.data.page}}"}}
```

## hashtag Create test records

Next, create as many records to equal one page and a few more.

Use the Flow Control > Repeater module to do this, which also returns the ID of the repeat.

Map this ID in the following module to differentiate the records.

Once the test records are created, you can test your search module.

## hashtag Test search module

With the help of the ID from the repeater, you can see if the records are ordered and how, and whether the records are correctly retrieved (for example, they are not being duplicated).

In the console, you can also control every retrieved page and its size.

## hashtag Possible pagination issues:

- The stop condition limit set by the user doesn't work. Therefore all the records that exist in the account are retrieved (or only the first page if there is also the issue from the point below).
- The next page condition isn't set correctly so the next page isn't retrieved, even though it should according to the user's limit and the content of the account.
- The next page condition isn't set correctly so the next pages are retrieved, even though all records were already retrieved. They can either be duplicated or without any records. Without looking into the console, you will not see them.
- The pagination is not optimized so even though there is a parameter saying “there is no other page to retrieve”, it still retrieves the next page that is empty (developer implements the pagination for offset even though he/she could implement it using the cursor parameter).
- The value in the parameter page is too low so there are too many pages being retrieved (= too many calls).
- Uncommon: the records are duplicated because the pages are overlapped (1st page 1-100, 2nd page 100-199 instead of 1-100, 101-200).

The stop condition limit set by the user doesn't work. Therefore all the records that exist in the account are retrieved (or only the first page if there is also the issue from the point below).

```
limit
```

The next page condition isn't set correctly so the next page isn't retrieved, even though it should according to the user's limit and the content of the account.

```
next page
```

The next page condition isn't set correctly so the next pages are retrieved, even though all records were already retrieved. They can either be duplicated or without any records. Without looking into the console, you will not see them.

```
next page
```

The pagination is not optimized so even though there is a parameter saying “there is no other page to retrieve”, it still retrieves the next page that is empty (developer implements the pagination for offset even though he/she could implement it using the cursor parameter).

The value in the parameter page is too low so there are too many pages being retrieved (= too many calls).

```
page
```

Uncommon: the records are duplicated because the pages are overlapped (1st page 1-100, 2nd page 100-199 instead of 1-100, 101-200).

Last updated 5 months ago
