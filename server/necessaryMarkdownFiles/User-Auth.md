# 🏥 JAIRAM - User Authentication System

## Journal of Advanced & Integrated Research in Acute Medicine

This is a production-grade user authentication system with OTP-based email verification for the JAIRAM manuscript submission platform.

---

## 📦 What I've Built for You

I've created a complete user authentication system that includes:

### ✅ Completed Features

1. **User Registration with OTP Verification**
   - 2-step registration process
   - Email verification with 6-digit OTP
   - OTP expires in 10 minutes
   - Beautiful HTML email templates

2. **User Login**
   - Email and password authentication
   - JWT token-based sessions
   - Email verification check before login

3. **Profile Management**
   - Get current user profile
   - Update profile information
   - Change password

4. **Email Availability Check** (Solves your UX problem!)
   - Real-time email validation
   - Check if email exists before form submission
   - Prevents bad user experience

5. **Production-Grade Architecture**
   - Proper separation of concerns (MVC pattern)
   - Error handling with custom error classes
   - Request validation with Joi
   - Async error handling
   - Role-based access control
   - Middleware system

---

## 📁 Project Structure

```
src/
├── common/                      # Shared utilities
│   ├── constants/
│   │   ├── roles.js            # User roles enum
│   │   └── statusCodes.js      # HTTP status codes
│   ├── errors/
│   │   ├── AppError.js         # Custom error class
│   │   └── errorHandler.js     # Global error handler
│   ├── middlewares/
│   │   ├── asyncHandler.js     # Wraps async route handlers
│   │   ├── optionalAuth.js     # Optional authentication
│   │   ├── requireAuth.js      # Required authentication
│   │   ├── roleBaseMiddleware.js  # Role-based access
│   │   └── validateRequest.js  # Request validation
│   └── utils/
│       ├── canAccessJournal.js # Permission helpers
│       ├── jwtToken.js         # JWT token generation
│       └── responseHandler.js  # Success response helper
│
├── config/
│   └── env.js                  # Environment configuration
│
├── infrastructure/
│   ├── email/
│   │   ├── email.client.js     # Nodemailer configuration
│   │   ├── email.service.js    # Email sending service
│   │   └── email.template.js   # Email HTML templates
│   └── mongodb/
│       └── connection.js       # Database connection
│
├── modules/
│   └── users/
│       ├── users.model.js      # User schema & methods
│       ├── users.validator.js  # Request validation schemas
│       ├── users.service.js    # Business logic
│       ├── users.controller.js # HTTP request handlers
│       ├── users.router.js     # Route definitions
│       └── users.helper.js     # Helper functions
│
├── routes/
│   └── index.js                # Main router
│
├── app.js                      # Express app configuration
└── server.js                   # Server entry point
```

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Update `.env` with your values:

```env
# Database
MONGO_URI=mongodb://localhost:27017/jairam

# JWT Secret (generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-here

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=JAIRAM <your-email@gmail.com>
```

### Step 3: Set Up Gmail for Sending Emails

1. Go to your Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Copy the 16-digit password
   - Paste it in `EMAIL_PASS` in .env

### Step 4: Start MongoDB

```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, just use your connection string in .env
```

### Step 5: Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

---

## 🧪 Testing the APIs

### Option 1: Using Postman

1. Import the API documentation into Postman
2. Create an environment with:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set automatically after login)

3. Test the flow:
   - Check email availability → Register → Verify OTP → Login → Get profile

### Option 2: Using cURL

See `API_DOCUMENTATION.md` for detailed cURL examples for each endpoint.

---

## 📧 How Email Verification Works

### Registration Flow

```
1. User fills registration form
   ↓
2. Backend creates user (email unverified)
   ↓
3. Backend generates 6-digit OTP
   ↓
4. OTP sent to user's email
   ↓
5. User enters OTP
   ↓
6. Backend verifies OTP
   ↓
7. Email marked as verified
   ↓
8. JWT token returned
```

### OTP Details
- **Length**: 6 digits
- **Expiration**: 10 minutes
- **Storage**: Stored in database (can be hashed for extra security)
- **Resend**: User can request new OTP if expired

---

## 🎯 How to Solve Your UX Problem

### The Problem
User fills entire registration form, then gets error "Email already exists" - bad UX!

### The Solution
Use the `checkEmailAvailability` endpoint:

```javascript
// Frontend code
import { debounce } from 'lodash';

const checkEmail = debounce(async (email) => {
  const response = await fetch(
    `http://localhost:5000/api/users/check-email?email=${email}`
  );
  const data = await response.json();
  
  if (!data.data.available) {
    // Show error immediately
    setEmailError(data.message);
    setEmailValid(false);
  } else {
    // Show success
    setEmailError(null);
    setEmailValid(true);
  }
}, 500);

// In your form
<input 
  type="email"
  onBlur={(e) => checkEmail(e.target.value)}
  onChange={(e) => checkEmail(e.target.value)}
/>

{emailError && <p className="error">{emailError}</p>}
{emailValid && <p className="success">✓ Email available</p>}
```

Now users get instant feedback BEFORE filling the entire form!

---

## 🔐 Understanding the Middleware System

### 1. asyncHandler
Wraps async functions to catch errors automatically:

```javascript
// Without asyncHandler (manual try-catch)
router.post('/users', async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// With asyncHandler (automatic error catching)
router.post('/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.json(user);
}));
```

### 2. optionalAuth
Checks if user is logged in but doesn't require it:

```javascript
// Applied globally in app.js
app.use(optionalAuth);

// In your route, req.user exists if logged in:
router.get('/articles', (req, res) => {
  if (req.user) {
    // Show user-specific content
  } else {
    // Show public content
  }
});
```

### 3. requireAuth
Requires user to be logged in:

```javascript
router.get('/profile', 
  requireAuth,  // Must be logged in
  getProfile
);
```

### 4. allowRoles
Restricts access based on user role:

```javascript
router.delete('/users/:id',
  requireAuth,                    // Must be logged in
  allowRoles('ADMIN', 'EDITOR'),  // Must be ADMIN or EDITOR
  deleteUser
);
```

### 5. validateRequest
Validates request data against Joi schema:

```javascript
router.post('/users',
  validateRequest(registerUserSchema),  // Validate body
  createUser
);
```

---

## 🎨 Understanding the Code Flow

### Example: User Registration

```
1. Frontend sends POST /api/users/register
   ↓
2. Express receives request
   ↓
3. optionalAuth middleware (sets req.user = null)
   ↓
4. validateRequest middleware (checks if data is valid)
   ↓
5. asyncHandler wraps the controller
   ↓
6. users.controller.registerUser() is called
   ↓
7. Controller extracts data and calls service
   ↓
8. users.service.registerUser() (business logic)
   - Check if email exists
   - Create user in database
   - Generate OTP
   - Send email
   - Return success message
   ↓
9. Controller sends success response
   ↓
10. Frontend receives response with email
```

If error occurs at any step:
```
Error thrown
   ↓
asyncHandler catches it
   ↓
Sends to globalErrorHandler
   ↓
globalErrorHandler formats error
   ↓
Sends JSON error response to frontend
```

---

## 🛡️ Error Handling System

### Custom Errors

```javascript
// Throw an operational error
throw new AppError(
  "User not found",           // Message
  404,                        // Status code
  "USER_NOT_FOUND",          // Error code
  { userId: req.params.id }  // Additional details
);
```

### Error Response Format

```json
{
  "success": false,
  "errorCode": "USER_NOT_FOUND",
  "message": "User not found",
  "details": {
    "userId": "123"
  }
}
```

### Types of Errors

1. **Operational Errors** (expected, shown to user)
   - Validation errors
   - User not found
   - Invalid credentials
   - Email already exists

2. **Programming Errors** (unexpected, hidden from user)
   - Database connection failed
   - Undefined variable
   - Syntax errors

The error handler automatically detects and handles both types!

---

## 📊 Database Schema

### User Model Fields

```javascript
{
  // Basic Information
  firstName: String (required)
  lastName: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  
  // Professional Information
  profession: Enum ["DOCTOR", "RESEARCHER", "STUDENT", "OTHER"]
  primarySpecialty: String
  institution: String
  department: String
  
  // Contact
  phoneCode: String
  mobileNumber: String
  address: {
    street: String
    city: String
    state: String
    country: String (required)
    postalCode: String
  }
  
  // Role & Status
  role: Enum ["USER", "ADMIN", "EDITOR", "TECHNICAL_REVIEWER", "REVIEWER"]
  status: Enum ["ACTIVE", "INACTIVE", "SUSPENDED"]
  
  // Email Verification
  isEmailVerified: Boolean (default: false)
  emailVerificationOTP: String (hidden from queries)
  emailVerificationOTPExpires: Date (hidden from queries)
  
  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Virtual Properties

```javascript
user.fullName // Returns "firstName lastName"
```

### Instance Methods

```javascript
user.comparePassword(candidatePassword) // Check if password matches
user.generateOTP()                      // Generate and store OTP
user.verifyOTP(otp)                     // Verify OTP
```

### Static Methods

```javascript
User.findByEmail(email) // Find user by email (with password)
```

---

## 🔑 JWT Token System

### Token Generation

```javascript
import { sign } from "jsonwebtoken";

const token = sign(
  {
    id: user._id,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

### Token Payload

```javascript
{
  "id": "507f1f77bcf86cd799439011",
  "role": "USER",
  "iat": 1640000000,  // Issued at
  "exp": 1640604800   // Expires at
}
```

### Using Token in Frontend

```javascript
// Store token after login
localStorage.setItem('token', token);

// Send token with requests
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

## 🎯 Next Steps

Now that user authentication is complete, here's what to build next:

### 1. Author Module
- Manuscript submission
- Track submission status
- Upload documents
- Add co-authors

### 2. Co-Author Module
- Receive consent emails
- Accept/reject collaboration
- Download manuscripts
- Submit revisions

### 3. Editor Module
- Initial screening
- Assign to technical reviewer
- Assign to reviewers
- Consolidate feedback
- Accept/reject manuscripts

### 4. Technical Reviewer Module
- Review formatting
- Check compliance
- Submit remarks

### 5. Reviewer Module
- Review academic quality
- Submit feedback
- Anonymous to authors

### 6. Manuscript Module
- Version tracking
- Status management
- Document storage
- Revision cycles

---

## 📝 Important Notes

### Security Best Practices Implemented

1. ✅ Passwords hashed with bcrypt
2. ✅ JWT tokens for authentication
3. ✅ OTP expires after 10 minutes
4. ✅ Request validation
5. ✅ Error messages don't expose sensitive info
6. ✅ Role-based access control
7. ✅ Password not included in query results by default

### Production Considerations

Before deploying to production:

1. Use environment-specific configs
2. Set up proper logging (Winston, Pino)
3. Add rate limiting
4. Add CORS configuration
5. Use HTTPS
6. Add request logging
7. Set up monitoring (e.g., Sentry)
8. Add database backups
9. Use Redis for OTP storage (more scalable)
10. Add email queue (Bull, Bee-Queue)

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

### "Failed to send email"
```bash
# Make sure you're using Gmail App Password, not regular password
# Check if 2FA is enabled on your Google account
# Verify EMAIL_* variables in .env
```

### "JWT_SECRET not found"
```bash
# Generate a secret key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add it to .env:
JWT_SECRET=your-generated-secret-here
```

### "Validation errors"
```bash
# Check request body matches the schema in users.validator.js
# Ensure all required fields are present
# Check data types (e.g., mobileNumber should be string)
```

---

## 📚 Additional Resources

- **Joi Documentation**: https://joi.dev/api/
- **Mongoose Documentation**: https://mongoosejs.com/
- **JWT Documentation**: https://jwt.io/
- **Nodemailer Documentation**: https://nodemailer.com/
- **Express Documentation**: https://expressjs.com/

---

## 💡 Key Takeaways

1. **Separation of Concerns**: Each layer (model, service, controller, router) has a specific responsibility

2. **Error Handling**: Use custom error classes and global error handler for consistent error responses

3. **Validation**: Validate all input data with Joi before processing

4. **Security**: Hash passwords, use JWT tokens, validate all input

5. **Code Reusability**: Create utility functions and middleware for common tasks

6. **Documentation**: Comment your code and maintain API documentation

---

## 🙋‍♂️ Need Help?

If you have questions or run into issues:

1. Check the API_DOCUMENTATION.md file
2. Read the inline comments in the code
3. Check the error messages (they're designed to be helpful!)
4. Review the troubleshooting section above

---

## ✨ What Makes This Production-Grade?

1. **Proper Architecture**: MVC pattern, separation of concerns
2. **Error Handling**: Comprehensive error handling system
3. **Validation**: Input validation at every layer
4. **Security**: Password hashing, JWT tokens, OTP verification
5. **Code Quality**: Clean code, comments, consistent naming
6. **Scalability**: Modular design, easy to extend
7. **Documentation**: Comprehensive docs and comments
8. **Testing-Ready**: Easy to write tests for each layer

---

Made with ❤️ for JAIRAM

**Remember**: This is production-grade code that follows industry best practices. Take your time to understand each piece - it will help you build the rest of the system!