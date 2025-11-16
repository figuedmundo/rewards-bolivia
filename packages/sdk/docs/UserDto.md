# UserDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Unique identifier of the user | [default to undefined]
**email** | **string** | Email address of the user | [default to undefined]
**name** | **string** | Full name of the user | [default to undefined]
**role** | **string** | Role of the user (client, business, admin) | [default to undefined]
**pointsBalance** | **number** | Current points balance of the user | [default to undefined]
**createdAt** | **string** | Date and time when the user was created | [default to undefined]
**updatedAt** | **string** | Date and time when the user was last updated | [default to undefined]

## Example

```typescript
import { UserDto } from './api';

const instance: UserDto = {
    id,
    email,
    name,
    role,
    pointsBalance,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
