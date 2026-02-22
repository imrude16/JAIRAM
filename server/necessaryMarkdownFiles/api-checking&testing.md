# JAIRAM API Testing Guide

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0.0  
**Last Tested:** February 2026  
**Status:** All endpoints verified ✅

---

> **Instructions for Tester:**
> - Replace `YOUR_TOKEN_HERE` with the JWT token received from `/verify-otp` or `/login` response
> - Replace `USER_ID_HERE` with a valid 24-character MongoDB ObjectId (e.g. `507f1f77bcf86cd799439011`)
> - Run tests in the order listed — each phase builds on the previous
> - All tests use `Content-Type: application/json` unless stated otherwise

---

## TABLE OF CONTENTS

1. [Phase 1 — Success Cases](#phase-1--success-cases)
2. [Phase 2 — Edge Cases & Security Tests](#phase-2--edge-cases--security-tests)

---

---

# Phase 1 — Success Cases

> Run these in exact order. Each test depends on the previous one.

---

## TEST 1 — Check Email Availability (Before Register)

**Method:** `GET`  
**Endpoint:** `/api/users/check-email`  
**Auth:** None

```
GET http://localhost:5000/api/users/check-email?email=arjun.sharma@aiims.delhi.in
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Email is available for registration.",
    "data": {
        "available": true
    },
    "meta": null
}
```

---

## TEST 2 — Register User

**Method:** `POST`  
**Endpoint:** `/api/users/register`  
**Auth:** None

```
POST http://localhost:5000/api/users/register
Content-Type: application/json
```

**Request Body:**
```json
{
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun.sharma@aiims.delhi.in",
    "password": "Arjun@2024",
    "confirmPassword": "Arjun@2024",
    "profession": "DOCTOR",
    "primarySpecialty": "Cardiology",
    "institution": "AIIMS Delhi",
    "department": "Cardiothoracic Surgery",
    "phoneCode": "+91",
    "mobileNumber": "9876543210",
    "address": {
        "street": "Sri Aurobindo Marg",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "postalCode": "110029"
    },
    "termsAccepted": true
}
```

**Expected Response — 201 Created**
```json
{
    "success": true,
    "message": "Registration successful! OTP sent to your email.",
    "data": {
        "email": "arjun.sharma@aiims.delhi.in"
    },
    "meta": null
}
```

> **Next Step:** Check your email inbox for a 6-digit OTP from JAIRAM.

---

## TEST 3 — Check Email After Register (Before Verify)

**Method:** `GET`  
**Endpoint:** `/api/users/check-email`  
**Auth:** None

```
GET http://localhost:5000/api/users/check-email?email=arjun.sharma@aiims.delhi.in
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Email is not available. This email is registered but not verified. Please complete verification.",
    "data": {
        "available": false
    },
    "meta": null
}
```

---

## TEST 4 — Resend OTP

**Method:** `POST`  
**Endpoint:** `/api/users/resend-otp`  
**Auth:** None

```
POST http://localhost:5000/api/users/resend-otp
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in"
}
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "OTP resent successfully. Please check your email.",
    "data": {
        "email": "arjun.sharma@aiims.delhi.in"
    },
    "meta": null
}
```

---

## TEST 5 — Verify OTP

**Method:** `POST`  
**Endpoint:** `/api/users/verify-otp`  
**Auth:** None

> **Before running:** Check your email and copy the 6-digit OTP. Replace `XXXXXX` below.

```
POST http://localhost:5000/api/users/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "otp": "XXXXXX"
}
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Email verified successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "Arjun",
            "lastName": "Sharma",
            "fullName": "Arjun Sharma",
            "email": "arjun.sharma@aiims.delhi.in",
            "role": "USER",
            "profession": "DOCTOR",
            "isEmailVerified": true
        }
    },
    "meta": null
}
```

> **🔑 IMPORTANT:** Copy the `token` value from this response. You will need it for all protected routes (Tests 8–11).

---

## TEST 6 — Check Email After Verification

**Method:** `GET`  
**Endpoint:** `/api/users/check-email`  
**Auth:** None

```
GET http://localhost:5000/api/users/check-email?email=arjun.sharma@aiims.delhi.in
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Email is not available. This email is already registered. Please login.",
    "data": {
        "available": false
    },
    "meta": null
}
```

---

## TEST 7 — Login

**Method:** `POST`  
**Endpoint:** `/api/users/login`  
**Auth:** None

```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "password": "Arjun@2024"
}
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx",
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "Arjun",
            "lastName": "Sharma",
            "fullName": "Arjun Sharma",
            "email": "arjun.sharma@aiims.delhi.in",
            "role": "USER",
            "profession": "DOCTOR",
            "isEmailVerified": true
        }
    },
    "meta": null
}
```

---

## TEST 8 — Get User Profile

**Method:** `GET`  
**Endpoint:** `/api/users/profile`  
**Auth:** Bearer Token required

```
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "User retrieved successfully",
    "data": {
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "Arjun",
            "lastName": "Sharma",
            "fullName": "Arjun Sharma",
            "email": "arjun.sharma@aiims.delhi.in",
            "profession": "DOCTOR",
            "primarySpecialty": "Cardiology",
            "institution": "AIIMS Delhi",
            "department": "Cardiothoracic Surgery",
            "phoneCode": "+91",
            "mobileNumber": "9876543210",
            "address": {
                "street": "Sri Aurobindo Marg",
                "city": "New Delhi",
                "state": "Delhi",
                "country": "India",
                "postalCode": "110029"
            },
            "role": "USER",
            "isEmailVerified": true,
            "status": "ACTIVE"
        }
    },
    "meta": null
}
```

---

## TEST 9 — Update Profile

**Method:** `PATCH`  
**Endpoint:** `/api/users/profile`  
**Auth:** Bearer Token required

```
PATCH http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
    "department": "Interventional Cardiology",
    "mobileNumber": "9123456789"
}
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "user": {
            "id": "507f1f77bcf86cd799439011",
            "firstName": "Arjun",
            "lastName": "Sharma",
            "department": "Interventional Cardiology",
            "mobileNumber": "9123456789"
        }
    },
    "meta": null
}
```

---

## TEST 10 — Verify Profile Was Updated

**Method:** `GET`  
**Endpoint:** `/api/users/profile`  
**Auth:** Bearer Token required

```
GET http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "User retrieved successfully",
    "data": {
        "user": {
            "department": "Interventional Cardiology",
            "mobileNumber": "9123456789"
        }
    },
    "meta": null
}
```

> Verify `department` is now `"Interventional Cardiology"` and `mobileNumber` is `"9123456789"`.

---

## TEST 11 — Change Password

**Method:** `POST`  
**Endpoint:** `/api/users/change-password`  
**Auth:** Bearer Token required

```
POST http://localhost:5000/api/users/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
    "currentPassword": "Arjun@2024",
    "newPassword": "Arjun@2025",
    "confirmNewPassword": "Arjun@2025"
}
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Password changed successfully",
    "data": null,
    "meta": null
}
```

---

## TEST 12 — Login With New Password

**Method:** `POST`  
**Endpoint:** `/api/users/login`  
**Auth:** None

```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "password": "Arjun@2025"
}
```

**Expected Response — 200 OK**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx.xxxxx",
        "user": { ... }
    },
    "meta": null
}
```

> Confirms old password no longer works and new password is active.

---

---

# Phase 2 — Edge Cases & Security Tests

> These tests verify the system **rejects bad input** and **cannot be exploited**.  
> Every test below should return an **error response**, NOT a success.

---

## CATEGORY 1 — Validation Edge Cases

---

### TEST E1 — Weak Password Rejected

**Method:** `POST`  
**Endpoint:** `/api/users/register`  
**Auth:** None

```
POST http://localhost:5000/api/users/register
Content-Type: application/json
```

**Request Body:**
```json
{
    "firstName": "Priya",
    "lastName": "Nair",
    "email": "priya.nair@kims.kerala.in",
    "password": "123456",
    "confirmPassword": "123456",
    "profession": "DOCTOR",
    "primarySpecialty": "Neurology",
    "institution": "KIMS Hospital",
    "phoneCode": "+91",
    "mobileNumber": "9845001122",
    "address": {
        "street": "Anayara",
        "city": "Thiruvananthapuram",
        "state": "Kerala",
        "country": "India",
        "postalCode": "695029"
    },
    "termsAccepted": true
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "Password must contain at least one uppercase letter, lowercase letter, number, and special character (@$!%*?&)",
                "path": "password"
            }
        ]
    }
}
```

---

### TEST E2 — Password Mismatch Rejected

**Method:** `POST`  
**Endpoint:** `/api/users/register`  
**Auth:** None

**Request Body:** *(same as E1 but change passwords)*
```json
{
    "firstName": "Priya",
    "lastName": "Nair",
    "email": "priya.nair@kims.kerala.in",
    "password": "Priya@2024",
    "confirmPassword": "Priya@2025",
    "profession": "DOCTOR",
    "primarySpecialty": "Neurology",
    "institution": "KIMS Hospital",
    "phoneCode": "+91",
    "mobileNumber": "9845001122",
    "address": {
        "street": "Anayara",
        "city": "Thiruvananthapuram",
        "state": "Kerala",
        "country": "India",
        "postalCode": "695029"
    },
    "termsAccepted": true
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "Passwords do not match",
                "path": "confirmPassword"
            }
        ]
    }
}
```

---

### TEST E3 — Invalid Email Format Rejected

**Request Body:** *(same as E1 but change email)*
```json
{
    "email": "notanemail"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "Please provide a valid email address",
                "path": "email"
            }
        ]
    }
}
```

---

### TEST E4 — Invalid Phone Code Rejected

**Request Body:** *(same as E1, valid password, but change phoneCode)*
```json
{
    "password": "Priya@2024",
    "confirmPassword": "Priya@2024",
    "phoneCode": "91"
}
```

> Phone code `91` is missing the `+` prefix. Should be `+91`.

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "Phone code must be in format +XX or +XXX (e.g., +91, +1)",
                "path": "phoneCode"
            }
        ]
    }
}
```

---

### TEST E5 — Invalid Mobile Number Rejected

**Request Body:** *(same as E1, valid password, but change mobileNumber)*
```json
{
    "password": "Priya@2024",
    "confirmPassword": "Priya@2024",
    "mobileNumber": "123"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "Mobile number must be between 7 and 15 digits",
                "path": "mobileNumber"
            }
        ]
    }
}
```

---

### TEST E6 — Check Email With No Query Param

**Method:** `GET`  
**Endpoint:** `/api/users/check-email`  
**Auth:** None

```
GET http://localhost:5000/api/users/check-email
```

*(No `?email=` query parameter)*

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "query",
                "message": "Email is required",
                "path": "email"
            }
        ]
    }
}
```

---

### TEST E7 — Terms Not Accepted Rejected

**Request Body:** *(same as E1, valid password, but change termsAccepted)*
```json
{
    "password": "Priya@2024",
    "confirmPassword": "Priya@2024",
    "termsAccepted": false
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "You must accept the terms and conditions to register",
                "path": "termsAccepted"
            }
        ]
    }
}
```

---

## CATEGORY 2 — Authentication Security

---

### TEST E8 — Access Profile Without Token

**Method:** `GET`  
**Endpoint:** `/api/users/profile`  
**Auth:** None

```
GET http://localhost:5000/api/users/profile
```

*(No Authorization header)*

**Expected Response — 401 Unauthorized**
```json
{
    "success": false,
    "errorCode": "UNAUTHORIZED",
    "message": "Authentication required"
}
```

---

### TEST E9 — Access Profile With Fake Token

**Method:** `GET`  
**Endpoint:** `/api/users/profile`  
**Auth:** Fake Bearer Token

```
GET http://localhost:5000/api/users/profile
Authorization: Bearer thisisacompletelyfaketoken123xyz
```

**Expected Response — 401 Unauthorized**
```json
{
    "success": false,
    "errorCode": "UNAUTHORIZED",
    "message": "Invalid or expired token"
}
```

---

### TEST E10 — Login With Wrong Password

**Method:** `POST`  
**Endpoint:** `/api/users/login`  
**Auth:** None

```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "password": "WrongPassword@123"
}
```

**Expected Response — 401 Unauthorized**
```json
{
    "success": false,
    "errorCode": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
}
```

---

### TEST E11 — Login With Non-Existent Email

**Method:** `POST`  
**Endpoint:** `/api/users/login`  
**Auth:** None

```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "ghost@nowhere.com",
    "password": "Ghost@2024"
}
```

**Expected Response — 401 Unauthorized**
```json
{
    "success": false,
    "errorCode": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
}
```

> **Security Note:** Both wrong password and non-existent email return the SAME error message intentionally. This prevents attackers from knowing whether an email exists in the system.

---

### TEST E12 — Login Before Email Verification

> **Setup Required:** First register a NEW user but do NOT verify the OTP.

```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
    "firstName": "Rahul",
    "lastName": "Gupta",
    "email": "rahul.gupta@pgimer.edu.in",
    "password": "Rahul@2024",
    "confirmPassword": "Rahul@2024",
    "profession": "RESEARCHER",
    "primarySpecialty": "Immunology",
    "institution": "PGIMER Chandigarh",
    "phoneCode": "+91",
    "mobileNumber": "9812345678",
    "address": {
        "street": "Sector 12",
        "city": "Chandigarh",
        "state": "Punjab",
        "country": "India",
        "postalCode": "160012"
    },
    "termsAccepted": true
}
```

Then immediately try to login WITHOUT verifying OTP:

```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "rahul.gupta@pgimer.edu.in",
    "password": "Rahul@2024"
}
```

**Expected Response — 403 Forbidden**
```json
{
    "success": false,
    "errorCode": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in",
    "details": {
        "email": "rahul.gupta@pgimer.edu.in"
    }
}
```

---

## CATEGORY 3 — OTP Security

---

### TEST E13 — Wrong OTP Rejected

**Method:** `POST`  
**Endpoint:** `/api/users/verify-otp`  
**Auth:** None

```
POST http://localhost:5000/api/users/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "otp": "000000"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "INVALID_OTP",
    "message": "Invalid or expired OTP"
}
```

---

### TEST E14 — OTP With Letters Rejected

**Method:** `POST`  
**Endpoint:** `/api/users/verify-otp`  
**Auth:** None

```
POST http://localhost:5000/api/users/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "otp": "12ab56"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "OTP must contain only numbers",
                "path": "otp"
            }
        ]
    }
}
```

---

### TEST E15 — Verify OTP For Already Verified Email

**Method:** `POST`  
**Endpoint:** `/api/users/verify-otp`  
**Auth:** None

```
POST http://localhost:5000/api/users/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in",
    "otp": "123456"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "EMAIL_ALREADY_VERIFIED",
    "message": "Email already verified. Please login."
}
```

---

### TEST E16 — Resend OTP For Already Verified Email

**Method:** `POST`  
**Endpoint:** `/api/users/resend-otp`  
**Auth:** None

```
POST http://localhost:5000/api/users/resend-otp
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "arjun.sharma@aiims.delhi.in"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "EMAIL_ALREADY_VERIFIED",
    "message": "Email already verified. Please login."
}
```

---

## CATEGORY 4 — Authorization Security

---

### TEST E17 — Try to Escalate Role via Profile Update

**Method:** `PATCH`  
**Endpoint:** `/api/users/profile`  
**Auth:** Bearer Token (normal USER token)

```
PATCH http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
    "role": "ADMIN"
}
```

**Expected Behavior:** Either `400` — "At least one field must be provided" (role stripped before validation), OR profile updated but role remains `USER` unchanged.

**Verify By:** Call `GET /api/users/profile` after this — role must still be `USER`.

---

### TEST E18 — Try to Change Email via Profile Update

**Method:** `PATCH`  
**Endpoint:** `/api/users/profile`  
**Auth:** Bearer Token (normal USER token)

```
PATCH http://localhost:5000/api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "hacker@evil.com"
}
```

**Expected Behavior:** Either `400` — "At least one field must be provided" (email stripped before validation), OR request succeeds but email remains unchanged.

**Verify By:** Call `GET /api/users/profile` after this — email must still be `arjun.sharma@aiims.delhi.in`.

---

### TEST E19 — Change Password With Wrong Current Password

**Method:** `POST`  
**Endpoint:** `/api/users/change-password`  
**Auth:** Bearer Token required

```
POST http://localhost:5000/api/users/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
    "currentPassword": "WrongPassword@999",
    "newPassword": "NewArjun@2025",
    "confirmNewPassword": "NewArjun@2025"
}
```

**Expected Response — 401 Unauthorized**
```json
{
    "success": false,
    "errorCode": "INVALID_PASSWORD",
    "message": "Current password is incorrect"
}
```

---

### TEST E20 — Change Password to Same as Current

**Method:** `POST`  
**Endpoint:** `/api/users/change-password`  
**Auth:** Bearer Token required

> **Note:** Use the current active password. After Test 11, this is `Arjun@2025`.

```
POST http://localhost:5000/api/users/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
    "currentPassword": "Arjun@2025",
    "newPassword": "Arjun@2025",
    "confirmNewPassword": "Arjun@2025"
}
```

**Expected Response — 400 Bad Request**
```json
{
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation Failed",
    "details": {
        "errors": [
            {
                "field": "body",
                "message": "New password must be different from current password",
                "path": "newPassword"
            }
        ]
    }
}
```

---

### TEST E21 — Access Admin Route as Normal User

**Method:** `GET`  
**Endpoint:** `/api/users/:id`  
**Auth:** Bearer Token (normal USER token)

```
GET http://localhost:5000/api/users/USER_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

> Replace `USER_ID_HERE` with any valid 24-character MongoDB ObjectId.  
> Example: `507f1f77bcf86cd799439011`

**Expected Response — 403 Forbidden**
```json
{
    "success": false,
    "errorCode": "FORBIDDEN",
    "message": "Forbidden"
}
```

---

### TEST E22 — Register Duplicate Verified Email

**Method:** `POST`  
**Endpoint:** `/api/users/register`  
**Auth:** None

```
POST http://localhost:5000/api/users/register
Content-Type: application/json
```

**Request Body:**
```json
{
    "firstName": "Arjun",
    "lastName": "Sharma",
    "email": "arjun.sharma@aiims.delhi.in",
    "password": "Arjun@2024",
    "confirmPassword": "Arjun@2024",
    "profession": "DOCTOR",
    "primarySpecialty": "Cardiology",
    "institution": "AIIMS Delhi",
    "department": "Cardiothoracic Surgery",
    "phoneCode": "+91",
    "mobileNumber": "9876543210",
    "address": {
        "street": "Sri Aurobindo Marg",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "postalCode": "110029"
    },
    "termsAccepted": true
}
```

**Expected Response — 409 Conflict**
```json
{
    "success": false,
    "errorCode": "USER_ALREADY_EXISTS",
    "message": "An account with this email already exists. Please login."
}
```

---

---

## TEST RESULTS TRACKER

### Phase 1 — Success Cases

| # | Endpoint | Method | Status |
|---|----------|--------|--------|
| 1 | `/api/users/check-email` (before register) | GET | ✅ |
| 2 | `/api/users/register` | POST | ✅ |
| 3 | `/api/users/check-email` (after register, before verify) | GET | ✅ |
| 4 | `/api/users/resend-otp` | POST | ✅ |
| 5 | `/api/users/verify-otp` | POST | ✅ |
| 6 | `/api/users/check-email` (after verify) | GET | ✅ |
| 7 | `/api/users/login` | POST | ✅ |
| 8 | `/api/users/profile` (get) | GET | ✅ |
| 9 | `/api/users/profile` (update) | PATCH | ✅ |
| 10 | `/api/users/profile` (verify update) | GET | ✅ |
| 11 | `/api/users/change-password` | POST | ✅ |
| 12 | `/api/users/login` (new password) | POST | ✅ |

### Phase 2 — Edge Cases & Security Tests

| # | Test Description | Category | Status |
|---|-----------------|----------|--------|
| E1 | Weak password rejected | Validation | ✅ |
| E2 | Password mismatch rejected | Validation | ✅ |
| E3 | Invalid email format rejected | Validation | ✅ |
| E4 | Invalid phone code rejected | Validation | ✅ |
| E5 | Invalid mobile number rejected | Validation | ✅ |
| E6 | Missing email query param | Validation | ✅ |
| E7 | Terms not accepted rejected | Validation | ✅ |
| E8 | No token — access profile | Auth Security | ✅ |
| E9 | Fake token — access profile | Auth Security | ✅ |
| E10 | Wrong password login | Auth Security | ✅ |
| E11 | Non-existent email login | Auth Security | ✅ |
| E12 | Login before verification | Auth Security | ✅ |
| E13 | Wrong OTP rejected | OTP Security | ✅ |
| E14 | OTP with letters rejected | OTP Security | ✅ |
| E15 | Verify already verified email | OTP Security | ✅ |
| E16 | Resend OTP to verified email | OTP Security | ✅ |
| E17 | Role escalation via update | Authorization | ✅ |
| E18 | Email change via update | Authorization | ✅ |
| E19 | Wrong current password | Authorization | ✅ |
| E20 | Same new password | Authorization | ✅ |
| E21 | Admin route as normal user | Authorization | ✅ |
| E22 | Duplicate verified email register | Authorization | ✅ |

---

*JAIRAM Backend — Users Module API Testing Guide*  
*Total Tests: 34 | Success Cases: 12 | Edge Cases: 22*