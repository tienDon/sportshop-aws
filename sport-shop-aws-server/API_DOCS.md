# Authentication API Documentation

## Overview

API Authentication system sử dụng OTP (One-Time Password) cho cả signup và signin, với JWT tokens để quản lý session.

## Flow

1. **Request OTP**: User gửi email/phone (+ name cho signup)
2. **Verify OTP**: User nhập OTP để xác thực và nhận JWT tokens
3. **Access Protected Routes**: Sử dụng access token trong header
4. **Refresh Token**: Tự động refresh khi access token hết hạn

## Endpoints

### 1. Request OTP

**POST** `/api/auth/request-otp`

**Body:**

```json
{
  "identifier": "email@example.com | 0987654321",
  "name": "John Doe" // Optional - có thì là signup, không có thì là signin
}
```

**Response Success:**

```json
{
  "success": true,
  "message": "OTP đã được gửi thành công",
  "userId": "userId",
  "expiresAt": "2025-11-30T10:05:00.000Z",
  "type": "signup" | "signin"
}
```

### 2. Verify OTP

**POST** `/api/auth/verify-otp`

**Body:**

```json
{
  "userId": "userId",
  "identifier": "email@example.com",
  "otpCode": "123456"
}
```

**Response Success:**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": {
    "_id": "userId",
    "name": "John Doe",
    "role": "customer"
  },
  "accessToken": "jwt_access_token"
}
```

**Note:**

- Refresh token được set vào httpOnly cookie (KHÔNG trả về trong response body để bảo mật)
- Access token trả về trong response để frontend lưu vào localStorage

### 3. Resend OTP

**POST** `/api/auth/resend-otp`

**Body:**

```json
{
  "userId": "userId",
  "identifier": "email@example.com"
}
```

### 4. Refresh Token

**POST** `/api/auth/refresh-token`

**Headers:** Refresh token trong cookie

**Response:**

```json
{
  "success": true,
  "accessToken": "new_jwt_access_token"
}
```

### 5. Get User Info

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer access_token
```

**Response:**

```json
{
  "success": true,
  "user": {
    "userId": "userId",
    "email": "email@example.com",
    "phone": null,
    "name": "John Doe",
    "role": "customer"
  }
}
```

### 6. Logout

**POST** `/api/auth/logout`

**Headers:**

```
Authorization: Bearer access_token
```

### 7. Check OTP Status

**POST** `/api/auth/check-otp-status`

**Body:**

```json
{
  "userId": "userId",
  "identifier": "email@example.com"
}
```

## Frontend Usage Example

```javascript
// 1. Signup
const signupResponse = await fetch("/api/auth/request-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    identifier: "user@email.com",
    name: "John Doe",
  }),
});

// 2. Verify OTP
const verifyResponse = await fetch("/api/auth/verify-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Important for cookies
  body: JSON.stringify({
    userId: "userId",
    identifier: "user@email.com",
    otpCode: "123456",
  }),
});

const { user, accessToken } = await verifyResponse.json();

// 3. Store access token
localStorage.setItem("accessToken", accessToken);

// 4. Use access token for protected routes
const protectedResponse = await fetch("/api/protected-route", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

// 5. Auto refresh token when needed
if (protectedResponse.status === 401) {
  const refreshResponse = await fetch("/api/auth/refresh-token", {
    method: "POST",
    credentials: "include",
  });

  if (refreshResponse.ok) {
    const { accessToken } = await refreshResponse.json();
    localStorage.setItem("accessToken", accessToken);
    // Retry the original request
  }
}
```

## Security Features

- Refresh token stored in httpOnly cookie
- Access token short expiration (15 minutes)
- OTP expires after 5 minutes
- Maximum 3 OTP attempts
- Rate limiting for OTP resend (1 minute)
- Auto cleanup expired OTPs
