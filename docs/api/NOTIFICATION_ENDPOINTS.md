# Notification API Endpoints Documentation

This document provides complete documentation for the Notification Preferences API endpoints, including request/response formats, authentication requirements, and example usage.

## Base URL

All endpoints are relative to the API base URL:
- **Development:** `http://localhost:3001/api`
- **Production:** `https://api.rewards-bolivia.com/api`

## Authentication

All notification preference endpoints require authentication via JWT bearer token.

**Header:** `Authorization: Bearer {jwt_token}`

The JWT token is obtained during login and should be included in all requests to protected endpoints.

## Endpoints

### 1. Update User Notification Preferences

Update user's email notification preferences (opt-in/opt-out).

**Endpoint:** `PATCH /users/me/preferences`

**Method:** PATCH

**Authentication:** Required

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "emailNotifications": true
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `emailNotifications` | boolean | Yes | Enable (true) or disable (false) email notifications about expiring points |

**Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailNotifications": true,
  "message": "Preferences updated successfully"
}
```

**Success Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | User ID |
| `email` | string | User's email address |
| `firstName` | string | User's first name |
| `lastName` | string | User's last name |
| `emailNotifications` | boolean | Updated notification preference |
| `message` | string | Success message |

**Error Responses:**

**400 Bad Request** - Invalid request body:
```json
{
  "statusCode": 400,
  "message": "emailNotifications must be a boolean",
  "error": "Bad Request"
}
```

**401 Unauthorized** - Missing or invalid JWT token:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found** - User not found:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Example: Enable Notifications (cURL)**
```bash
curl -X PATCH http://localhost:3001/api/users/me/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "emailNotifications": true
  }'
```

**Example: Disable Notifications (cURL)**
```bash
curl -X PATCH http://localhost:3001/api/users/me/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "emailNotifications": false
  }'
```

**Example: Using fetch (JavaScript)**
```javascript
const token = localStorage.getItem('jwt_token');

const response = await fetch(
  'http://localhost:3001/api/users/me/preferences',
  {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      emailNotifications: true,
    }),
  }
);

if (response.ok) {
  const data = await response.json();
  console.log('Preferences updated:', data);
} else {
  console.error('Failed to update preferences:', response.status);
}
```

**Example: Using axios (JavaScript)**
```javascript
import axios from 'axios';

const token = localStorage.getItem('jwt_token');

try {
  const response = await axios.patch(
    'http://localhost:3001/api/users/me/preferences',
    {
      emailNotifications: true,
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  console.log('Preferences updated:', response.data);
} catch (error) {
  console.error('Failed to update preferences:', error.response.data);
}
```

---

### 2. Get User Notification Preferences

Retrieve the user's current notification preferences.

**Endpoint:** `GET /users/me/preferences`

**Method:** GET

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK):**
```json
{
  "emailNotifications": true
}
```

**Success Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `emailNotifications` | boolean | User's current notification preference (true = enabled, false = disabled) |

**Error Responses:**

**401 Unauthorized** - Missing or invalid JWT token:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found** - User not found:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Example: Get Preferences (cURL)**
```bash
curl -X GET http://localhost:3001/api/users/me/preferences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example: Using fetch (JavaScript)**
```javascript
const token = localStorage.getItem('jwt_token');

const response = await fetch(
  'http://localhost:3001/api/users/me/preferences',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

if (response.ok) {
  const data = await response.json();
  console.log('Current preference:', data.emailNotifications);
} else {
  console.error('Failed to fetch preferences:', response.status);
}
```

**Example: Using axios (JavaScript)**
```javascript
import axios from 'axios';

const token = localStorage.getItem('jwt_token');

try {
  const response = await axios.get(
    'http://localhost:3001/api/users/me/preferences',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  console.log('Current preference:', response.data.emailNotifications);
} catch (error) {
  console.error('Failed to fetch preferences:', error.response.data);
}
```

---

## Request/Response Format Details

### Email Validation

The `emailNotifications` field in both endpoints accepts only valid boolean values:
- `true` (string boolean will be rejected)
- `false` (string boolean will be rejected)

Invalid values will result in a 400 Bad Request error.

### Response Headers

All successful responses include standard HTTP headers:

```
Content-Type: application/json; charset=utf-8
X-Request-ID: {unique_request_id}
```

### Rate Limiting

These endpoints do not have special rate limiting beyond the global API rate limits. However, rapid successive requests may be throttled.

## Integration Guide for Frontend

### React Hook Example

```typescript
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

// Fetch current preferences
export const useGetNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(
        'http://localhost:3001/api/users/me/preferences',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
  });
};

// Update preferences
export const useUpdateNotificationPreferences = () => {
  return useMutation({
    mutationFn: async (emailNotifications: boolean) => {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(
        'http://localhost:3001/api/users/me/preferences',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ emailNotifications }),
        }
      );
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
  });
};

// Component Usage
export const NotificationPreferencesToggle = () => {
  const { data, isLoading } = useGetNotificationPreferences();
  const { mutate, isPending } = useUpdateNotificationPreferences();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setError(null);
      const newValue = !data?.emailNotifications;
      mutate(newValue);
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={data?.emailNotifications || false}
          onChange={handleToggle}
          disabled={isPending}
        />
        {isPending ? 'Saving...' : 'Receive email notifications about expiring points'}
      </label>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

## Common Use Cases

### Use Case 1: User Opts Out of Notifications

1. User navigates to settings/preferences page
2. User unchecks "Receive email notifications about expiring points"
3. Frontend calls `PATCH /api/users/me/preferences` with `{ emailNotifications: false }`
4. User sees success message
5. No future point expiration notification emails sent to user
6. Skipped notifications still logged with reason "user opted out"

### Use Case 2: User Checks Current Preference

1. User opens settings page
2. Frontend calls `GET /api/users/me/preferences` to fetch current setting
3. Checkbox reflects current preference (enabled/disabled)
4. User can toggle if desired

### Use Case 3: User Re-enables Notifications

1. User previously disabled notifications
2. User changes mind and checks the checkbox again
3. Frontend calls `PATCH /api/users/me/preferences` with `{ emailNotifications: true }`
4. Future point expiration notifications will be sent
5. Notifications resume on next scheduled job run

## Troubleshooting

### 401 Unauthorized Error

**Problem:** API returns 401 Unauthorized

**Solutions:**
1. Verify JWT token is valid and not expired
2. Ensure token is included in `Authorization: Bearer {token}` header (case-sensitive)
3. Re-authenticate and get a new token if current one is expired
4. Check that token is stored correctly in frontend (localStorage, sessionStorage, etc.)

### 400 Bad Request Error

**Problem:** API returns 400 Bad Request with "must be a boolean" message

**Solutions:**
1. Ensure `emailNotifications` value is a boolean (true/false), not a string ("true"/"false")
2. Check JSON request body syntax
3. Verify Content-Type header is `application/json`

### 404 Not Found Error

**Problem:** API returns 404 User not found

**Solutions:**
1. Verify user is authenticated with a valid JWT token for an existing user
2. Check that user hasn't been deleted
3. Re-login if user session has expired

### Network Error / Timeout

**Problem:** Request times out or network error occurs

**Solutions:**
1. Verify API server is running and accessible
2. Check network connectivity
3. Verify correct API endpoint URL
4. Check browser console for detailed error messages
5. Add retry logic with exponential backoff

## Related Documentation

- [Notification Module README](../packages/api/src/modules/notifications/README.md) - Architecture and implementation details
- [Email Template Customization Guide](./TEMPLATE_CUSTOMIZATION.md) - Guide for updating email templates
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Monitoring and Alerting](./MONITORING.md) - Operational metrics and alerts

## OpenAPI/Swagger Specification

The API endpoints are documented in the OpenAPI specification. You can view the interactive Swagger UI at:

**Development:** `http://localhost:3001/api/docs`

The OpenAPI specification includes:
- Full endpoint documentation
- Request/response schemas
- Authentication requirements
- Error responses
- Example values

## Support

For issues or questions about these endpoints:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Notification Module README](../packages/api/src/modules/notifications/README.md)
3. Check application logs for detailed error messages
4. Contact support team with request ID from response headers
