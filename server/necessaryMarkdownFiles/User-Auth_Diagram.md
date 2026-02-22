# 🧭 User Registration Request Flow

```
USER SENDS REQUEST
↓
http://localhost:5000/api/users/register
↓
```

---

## 1️⃣ EXPRESS SERVER receives HTTP request  
**Location:** `src/server.js → src/app.js`

```
┌─────────────────────────────────────────────────┐
│ 1. EXPRESS SERVER receives HTTP request        │
│    Location: src/server.js → src/app.js        │
└─────────────────────────────────────────────────┘
```

↓

---

## 2️⃣ ROUTER matches URL pattern  
**Location:** `src/routes/index.js`  
Finds: `"/users"` → sends to `users.router.js`

```
┌─────────────────────────────────────────────────┐
│ 2. ROUTER matches URL pattern                  │
│    Location: src/routes/index.js               │
│    Finds: "/users" → sends to users.router.js  │
└─────────────────────────────────────────────────┘
```

↓

---

## 3️⃣ ROUTE HANDLER matches `POST /register`  
**Location:** `users.router.js` (line 73)  
Route definition found.

```
┌─────────────────────────────────────────────────┐
│ 3. ROUTE HANDLER matches POST /register        │
│    Location: users.router.js line 73           │
│    Route definition found!                     │
└─────────────────────────────────────────────────┘
```

↓

---

## 4️⃣ MIDDLEWARE CHAIN STARTS  
Three middlewares execute in order:

- `validateRequest` (checks data)  
- `asyncHandler` (wraps controller)  
- Controller function  

```
┌─────────────────────────────────────────────────┐
│ 4. MIDDLEWARE CHAIN STARTS                     │
│    Three middlewares execute in order:         │
│    a) validateRequest (checks data)            │
│    b) asyncHandler (wraps controller)          │
│    c) controller function                      │
└─────────────────────────────────────────────────┘
```

↓

---

## 5️⃣ validateRequest Middleware  
**Location:** `validateRequest.js`

- Validates `req.body` against Joi schema  
- If invalid → returns 400 error  
- If valid → calls `next()`  

```
┌─────────────────────────────────────────────────┐
│ 5. validateRequest MIDDLEWARE                  │
│    Location: validateRequest.js                │
│    - Validates req.body against Joi schema     │
│    - If invalid → returns 400 error            │
│    - If valid → calls next()                   │
└─────────────────────────────────────────────────┘
```

↓

---

## 6️⃣ asyncHandler Middleware  
**Location:** `asyncHandler.js`

- Wraps controller in `Promise.resolve()`  
- Catches any errors  
- Passes errors to error handler  

```
┌─────────────────────────────────────────────────┐
│ 6. asyncHandler MIDDLEWARE                     │
│    Location: asyncHandler.js                   │
│    - Wraps controller in Promise.resolve()     │
│    - Catches any errors                        │
│    - Passes errors to error handler            │
└─────────────────────────────────────────────────┘
```

↓

---

## 7️⃣ CONTROLLER FUNCTION  
**Location:** `users.controller.js`  
**Function:** `registerUser()`

- Extracts `req.body`  
- Calls service layer  
- Sends response  

```
┌─────────────────────────────────────────────────┐
│ 7. CONTROLLER FUNCTION                         │
│    Location: users.controller.js               │
│    Function: registerUser()                    │
│    - Extracts req.body                         │
│    - Calls service layer                       │
│    - Sends response                            │
└─────────────────────────────────────────────────┘
```

↓

---

## 8️⃣ SERVICE LAYER  
**Location:** `users.service.js`  
**Function:** `registerUser()`

- Business logic (check user exists?)  
- Database operations (create user)  
- External calls (send email)  
- Returns data to controller  

```
┌─────────────────────────────────────────────────┐
│ 8. SERVICE LAYER                               │
│    Location: users.service.js                  │
│    Function: registerUser()                    │
│    - Business logic (check user exists?)       │
│    - Database operations (create user)         │
│    - External calls (send email)               │
│    - Returns data to controller                │
└─────────────────────────────────────────────────┘
```

↓

---

## 9️⃣ MODEL LAYER  
**Location:** `users.model.js`

- `User.create()` called  
- Pre-save hook runs (hash password)  
- Saves to MongoDB  
- Returns user document  

```
┌─────────────────────────────────────────────────┐
│ 9. MODEL LAYER                                 │
│    Location: users.model.js                    │
│    - User.create() called                      │
│    - Pre-save hook runs (hash password)        │
│    - Saves to MongoDB                          │
│    - Returns user document                     │
└─────────────────────────────────────────────────┘
```

↓

---

## 🔟 RESPONSE FLOWS BACK  

Service → Controller → `sendSuccess()`  
HTTP Response sent to user  

```
┌─────────────────────────────────────────────────┐
│ 10. RESPONSE FLOWS BACK                        │
│     Service → Controller → sendSuccess()       │
│     HTTP Response sent to user                 │
└─────────────────────────────────────────────────┘
```

---

