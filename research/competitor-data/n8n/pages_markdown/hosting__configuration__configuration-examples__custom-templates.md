# Configure a custom workflow templates library | n8n Docs

Source: https://docs.n8n.io/hosting/configuration/configuration-examples/custom-templates
Lastmod: 2026-04-14
Description: Set up a custom workflow template library for your self-hosted n8n instance.
# Configure a custom workflow templates library[#](#configure-a-custom-workflow-templates-library "Permanent link")

n8n provides a library of workflow [templates](../../../../glossary/#template-n8n). When self-hosting n8n, you can:

* Continue to use n8n's workflow templates library (this is the default behavior)
* Disable workflow templates
* Create your own workflow templates library

## Disable workflow templates[#](#disable-workflow-templates "Permanent link")

In your environment variables, set `N8N_TEMPLATES_ENABLED` to false.

## Use your own workflow templates library[#](#use-your-own-workflow-templates-library "Permanent link")

In your environment variables, set `N8N_TEMPLATES_HOST` to the base URL of your API.

### Endpoints[#](#endpoints "Permanent link")

Your API must provide the same endpoints and data structure as n8n's.

The endpoints are:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/templates/workflows/<id>` | Fetch template metadata for preview/browsing |
| GET | `/workflows/templates/<id>` | Fetch workflow data to import onto canvas |
| GET | `/templates/search` | Search for workflow templates |
| GET | `/templates/collections/<id>` | Get a specific template collection |
| GET | `/templates/collections` | List all template collections |
| GET | `/templates/categories` | List all template categories |
| GET | `/health` | Health check endpoint |

Critical: Two different response formats required

The two workflow endpoints require **different response formats**:

* **`/templates/workflows/{id}`**: Returns the template itself, which includes the workflow in the `workflow` key
* **`/workflows/templates/{id}`**: Returns the workflow the template contains

See Schemas below for details.

### Query parameters[#](#query-parameters "Permanent link")

The `/templates/search` endpoint accepts the following query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | integer | The page of results to return |
| `rows` | integer | The maximum number of results to return per page |
| `category` | comma-separated list of strings (categories) | The categories to search within |
| `search` | string | The search query |

The `/templates/collections` endpoint accepts the following query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `category` | comma-separated list of strings (categories) | The categories to search within |
| `search` | string | The search query |

### Schemas[#](#schemas "Permanent link")

The key difference between the two workflow endpoints:

|  |  |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 ``` | ``` // GET /templates/workflows/{id} returns (wrapped): {   "workflow": {     "id": 123,     "name": "...",     "totalViews": 1000,     // ... see full workflow item schema below     "workflow": {    // actual workflow definition       "nodes": [...],       "connections": {}     }   } }  // GET /workflows/templates/{id} returns (flat): {   "id": 123,   "name": "...",   "workflow": {      // actual workflow definition     "nodes": [...],     "connections": {}   } } ``` |

Detailed schemas for response objects:

Show `workflow` item data schema

Used by `/templates/workflows/{id}` endpoint (wrapped in a `workflow` key).

This schema describes the template metadata used for displaying templates in search/browse UI. It includes a nested `workflow` property that contains the actual importable workflow definition.

| Workflow item data schema | |
| --- | --- |
| ```   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45  46  47  48  49  50  51  52  53  54  55  56  57  58  59  60  61  62  63  64  65  66  67  68  69  70  71  72  73  74  75  76  77  78  79  80  81  82  83  84  85  86  87  88  89  90  91  92  93  94  95  96  97  98  99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 259 260 261 262 263 264 265 266 267 268 ``` | ``` {   "$schema": "http://json-schema.org/draft-07/schema#",   "title": "Generated schema for Root",   "type": "object",   "properties": {     "id": {       "type": "number"     },     "name": {       "type": "string"     },     "totalViews": {       "type": "number"     },     "price": {},     "purchaseUrl": {},     "recentViews": {       "type": "number"     },     "createdAt": {       "type": "string"     },     "user": {       "type": "object",       "properties": {         "username": {           "type": "string"         },         "verified": {           "type": "boolean"         }       },       "required": [         "username",         "verified"       ]     },     "nodes": {       "type": "array",       "items": {         "type": "object",         "properties": {           "id": {             "type": "number"           },           "icon": {             "type": "string"           },           "name": {             "type": "string"           },           "codex": {             "type": "object",             "properties": {               "data": {                 "type": "object",                 "properties": {                   "details": {                     "type": "string"                   },                   "resources": {                     "type": "object",                     "properties": {                       "generic": {                         "type": "array",                         "items": {                           "type": "object",                           "properties": {                             "url": {                               "type": "string"                             },                             "icon": {                               "type": "string"                             },                             "label": {                               "type": "string"                             }                           },                           "required": [                             "url",                             "label"                           ]                         }                       },                       "primaryDocumentation": {                         "type": "array",                         "items": {                           "type": "object",                           "properties": {                             "url": {                               "type": "string"                             }                           },                           "required": [                             "url"                           ]                         }                       }                     },                     "required": [                       "primaryDocumentation"                     ]                   },                   "categories": {                     "type": "array",                     "items": {                       "type": "string"                     }                   },                   "nodeVersion": {                     "type": "string"                   },                   "codexVersion": {                     "type": "string"                   }                 },                 "required": [                   "categories"                 ]               }             }           },           "group": {             "type": "string"           },           "defaults": {             "type": "object",             "properties": {               "name": {                 "type": "string"               },               "color": {                 "type": "string"               }             },             "required": [               "name"             ]           },           "iconData": {             "type": "object",             "properties": {               "icon": {                 "type": "string"               },               "type": {                 "type": "string"               },               "fileBuffer": {                 "type": "string"               }             },             "required": [               "type"             ]           },           "displayName": {             "type": "string"           },           "typeVersion": {             "type": "number"           },           "nodeCategories": {             "type": "array",             "items": {               "type": "object",               "properties": {                 "id": {                   "type": "number"                 },                 "name": {                   "type": "string"                 }               },               "required": [                 "id",                 "name"               ]             }           }         },         "required": [           "id",           "icon",           "name",           "codex",           "group",           "defaults",           "iconData",           "displayName",           "typeVersion"         ]       }     },     "description": {       "type": "string"     },     "image": {       "type": "array",       "items": {         "type": "object",         "properties": {           "id": {             "type": "number"           },           "url": {             "type": "string"           }         }       }     },     "categories": {       "type": "array",       "items": {         "type": "object",         "properties": {           "id": {             "type": "number"           },           "name": {             "type": "string"           }         }       }     },     "workflowInfo": {       "type": "object",       "properties": {         "nodeCount": {           "type": "number"         },         "nodeTypes": {           "type": "object"         }       }     },     "workflow": {       "type": "object",       "properties": {         "nodes": {           "type": "array"         },         "connections": {           "type": "object"         },         "settings": {           "type": "object"         },         "pinData": {           "type": "object"         }       },       "required": [         "nodes",         "connections"       ]     }   },   "required": [     "id",     "name",     "totalViews",     "createdAt",     "user",     "nodes",     "workflow"   ] } ``` |

Show `category` item data schema

| Category item data schema | |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 ``` | ``` {   "$schema": "http://json-schema.org/draft-07/schema#",   "type": "object",   "properties": {     "id": {       "type": "number"     },     "name": {       "type": "string"     }   },   "required": [     "id",     "name"   ] } ``` |

Show `collection` item data schema

| Collection item data schema | |
| --- | --- |
| ```  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 ``` | ``` {   "$schema": "http://json-schema.org/draft-07/schema#",   "type": "object",   "properties": {     "id": {       "type": "number"     },     "rank": {       "type": "number"     },     "name": {       "type": "string"     },     "totalViews": {},     "createdAt": {       "type": "string"     },     "workflows": {       "type": "array",       "items": {         "type": "object",         "properties": {           "id": {             "type": "number"           }         },         "required": [           "id"         ]       }     },     "nodes": {       "type": "array",       "items": {}     }   },   "required": [     "id",     "rank",     "name",     "totalViews",     "createdAt",     "workflows",     "nodes"   ] } ``` |

You can also interactively explore n8n's API endpoints:

<https://api.n8n.io/templates/categories>
<https://api.n8n.io/templates/collections>
<https://api.n8n.io/templates/search>
<https://api.n8n.io/health>

You can [contact us](mailto:help@n8n.io) for more support.

## Add your workflows to the n8n library[#](#add-your-workflows-to-the-n8n-library "Permanent link")

You can submit your workflows to n8n's template library.

n8n is working on a creator program, and developing a marketplace of templates. This is an ongoing project, and details are likely to change.

Refer to [n8n Creator hub](https://www.notion.so/n8n/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f) for information on how to submit templates and become a creator.

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
