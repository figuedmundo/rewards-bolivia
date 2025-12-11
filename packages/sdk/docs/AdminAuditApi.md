# AdminAuditApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**adminAuditControllerGenerateHash**](#adminauditcontrollergeneratehash) | **POST** /api/admin/audit/generate/{date} | |
|[**adminAuditControllerGetAllHashes**](#adminauditcontrollergetallhashes) | **GET** /api/admin/audit/hashes | |
|[**adminAuditControllerGetHashForDate**](#adminauditcontrollergethashfordate) | **GET** /api/admin/audit/hash/{date} | |
|[**adminAuditControllerVerifyHash**](#adminauditcontrollerverifyhash) | **GET** /api/admin/audit/verify/{date} | |

# **adminAuditControllerGenerateHash**
> adminAuditControllerGenerateHash()


### Example

```typescript
import {
    AdminAuditApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAuditApi(configuration);

let date: string; // (default to undefined)

const { status, data } = await apiInstance.adminAuditControllerGenerateHash(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminAuditControllerGetAllHashes**
> adminAuditControllerGetAllHashes()


### Example

```typescript
import {
    AdminAuditApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAuditApi(configuration);

let limit: string; // (default to undefined)

const { status, data } = await apiInstance.adminAuditControllerGetAllHashes(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**string**] |  | defaults to undefined|


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

# **adminAuditControllerGetHashForDate**
> adminAuditControllerGetHashForDate()


### Example

```typescript
import {
    AdminAuditApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAuditApi(configuration);

let date: string; // (default to undefined)

const { status, data } = await apiInstance.adminAuditControllerGetHashForDate(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | defaults to undefined|


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

# **adminAuditControllerVerifyHash**
> adminAuditControllerVerifyHash()


### Example

```typescript
import {
    AdminAuditApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAuditApi(configuration);

let date: string; // (default to undefined)

const { status, data } = await apiInstance.adminAuditControllerVerifyHash(
    date
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **date** | [**string**] |  | defaults to undefined|


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

