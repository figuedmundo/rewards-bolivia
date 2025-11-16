# TransactionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**transactionsControllerEarnPoints**](#transactionscontrollerearnpoints) | **POST** /api/transactions/earn | |
|[**transactionsControllerGetEconomyStats**](#transactionscontrollergeteconomystats) | **GET** /api/transactions/economy-stats | |
|[**transactionsControllerRedeemPoints**](#transactionscontrollerredeempoints) | **POST** /api/transactions/redeem | |

# **transactionsControllerEarnPoints**
> transactionsControllerEarnPoints(earnPointsDto)


### Example

```typescript
import {
    TransactionsApi,
    Configuration,
    EarnPointsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let earnPointsDto: EarnPointsDto; //

const { status, data } = await apiInstance.transactionsControllerEarnPoints(
    earnPointsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **earnPointsDto** | **EarnPointsDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **transactionsControllerGetEconomyStats**
> transactionsControllerGetEconomyStats()


### Example

```typescript
import {
    TransactionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

const { status, data } = await apiInstance.transactionsControllerGetEconomyStats();
```

### Parameters
This endpoint does not have any parameters.


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

# **transactionsControllerRedeemPoints**
> transactionsControllerRedeemPoints(body)


### Example

```typescript
import {
    TransactionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransactionsApi(configuration);

let body: object; //

const { status, data } = await apiInstance.transactionsControllerRedeemPoints(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

