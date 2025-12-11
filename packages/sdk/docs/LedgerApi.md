# LedgerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**ledgerControllerGetEntry**](#ledgercontrollergetentry) | **GET** /api/ledger/entries/{id} | |
|[**ledgerControllerQueryEntries**](#ledgercontrollerqueryentries) | **GET** /api/ledger/entries | |
|[**ledgerControllerVerifyEntry**](#ledgercontrollerverifyentry) | **GET** /api/ledger/entries/{id}/verify | |

# **ledgerControllerGetEntry**
> ledgerControllerGetEntry()


### Example

```typescript
import {
    LedgerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LedgerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.ledgerControllerGetEntry(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ledgerControllerQueryEntries**
> ledgerControllerQueryEntries()


### Example

```typescript
import {
    LedgerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LedgerApi(configuration);

let accountId: string; // (default to undefined)
let transactionId: string; // (default to undefined)
let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)
let type: string; // (default to undefined)
let minAmount: string; // (default to undefined)
let maxAmount: string; // (default to undefined)
let search: string; // (default to undefined)
let limit: string; // (default to undefined)
let offset: string; // (default to undefined)

const { status, data } = await apiInstance.ledgerControllerQueryEntries(
    accountId,
    transactionId,
    startDate,
    endDate,
    type,
    minAmount,
    maxAmount,
    search,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **accountId** | [**string**] |  | defaults to undefined|
| **transactionId** | [**string**] |  | defaults to undefined|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|
| **type** | [**string**] |  | defaults to undefined|
| **minAmount** | [**string**] |  | defaults to undefined|
| **maxAmount** | [**string**] |  | defaults to undefined|
| **search** | [**string**] |  | defaults to undefined|
| **limit** | [**string**] |  | defaults to undefined|
| **offset** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ledgerControllerVerifyEntry**
> ledgerControllerVerifyEntry()


### Example

```typescript
import {
    LedgerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LedgerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.ledgerControllerVerifyEntry(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

