# EmissionRateApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**emissionRateControllerApproveRecommendation**](#emissionratecontrollerapproverecommendation) | **PATCH** /api/admin/emission-rate-recommendations/{id}/approve | |
|[**emissionRateControllerGetRecommendation**](#emissionratecontrollergetrecommendation) | **GET** /api/admin/emission-rate-recommendations/{id} | |
|[**emissionRateControllerListRecommendations**](#emissionratecontrollerlistrecommendations) | **GET** /api/admin/emission-rate-recommendations | |
|[**emissionRateControllerRejectRecommendation**](#emissionratecontrollerrejectrecommendation) | **PATCH** /api/admin/emission-rate-recommendations/{id}/reject | |

# **emissionRateControllerApproveRecommendation**
> emissionRateControllerApproveRecommendation()


### Example

```typescript
import {
    EmissionRateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EmissionRateApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.emissionRateControllerApproveRecommendation(
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

# **emissionRateControllerGetRecommendation**
> emissionRateControllerGetRecommendation()


### Example

```typescript
import {
    EmissionRateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EmissionRateApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.emissionRateControllerGetRecommendation(
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

# **emissionRateControllerListRecommendations**
> emissionRateControllerListRecommendations()


### Example

```typescript
import {
    EmissionRateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EmissionRateApi(configuration);

let status: string; // (default to undefined)

const { status, data } = await apiInstance.emissionRateControllerListRecommendations(
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] |  | defaults to undefined|


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

# **emissionRateControllerRejectRecommendation**
> emissionRateControllerRejectRecommendation()


### Example

```typescript
import {
    EmissionRateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EmissionRateApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.emissionRateControllerRejectRecommendation(
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

