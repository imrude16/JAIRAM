# JAIRAM - Journal of Advanced and Integrated Research in Acute Medicine

A full-stack journal management platform for the Journal of Advanced and Integrated Research in Acute Medicine. The project provides a public-facing medical journal website, article and issue pages, author registration and authentication, manuscript submission, co-author consent tracking, reviewer invitations, editorial assignment workflows, technical editor review, reviewer feedback, admin user management, role change requests, Cloudinary-based file uploads, and email-driven communication across the publication lifecycle.

> Maintainer: `https://github.com/imrude16`<br>
> Repository: `https://github.com/imrude16/JAIRAM`<br>
> Project Type: Full-stack medical journal and manuscript workflow platform

---

## Table of Contents

- [Project Overview](#project-overview)
- [How the Project Works](#how-the-project-works)
- [Core Workflows](#core-workflows)
- [Features](#features)
- [Roles and Access Control](#roles-and-access-control)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Data Models and Statuses](#data-models-and-statuses)
- [Security and Validation](#security-and-validation)
- [Deployment Notes](#deployment-notes)
- [Future Improvements](#future-improvements)
- [Project Status](#project-status)

---

## Project Overview

JAIRAM is designed as a complete digital platform for a medical research journal. It combines a public journal website with a private manuscript management system for authors, co-authors, editors, technical editors, reviewers, and administrators.

The public frontend presents journal information, articles, issues, editorial board details, author guidelines, ethics information, peer review process details, article processing charge information, FAQs, contact forms, and trust information. The authenticated side supports registration, login, OTP verification, dashboards, manuscript submission, consent decisions, reviewer invitation responses, manuscript timelines, editorial assignment, revision cycles, and role-specific review actions.

The application is split into two independent parts:

- `client/`: Vite + React frontend for the public journal website, authentication screens, dashboards, submission forms, consent pages, and review interfaces.
- `server/`: Express + MongoDB backend for authentication, validation, APIs, role-based access control, manuscript workflow, email delivery, Cloudinary upload signatures, and persistence.

---

## How the Project Works

### Public Journal Website Flow

Visitors browse the React frontend through public pages such as Home, Articles, Issues, Ahead of Print, Editorial Board, About, Ethics, Author Guidelines, Peer Review Process, Article Processing Charge, FAQs, Powered Trust, and Contact.

Routing is handled on the client side using React Router. Shared layout components such as Header, MinimalHeader, Footer, navigation, mobile menu, cards, badges, inputs, buttons, and modals provide a consistent journal interface.

### Authentication Flow

1. A user registers with personal, professional, contact, address, and terms acceptance details.
2. The frontend sends registration data to `POST /api/users/register`.
3. The backend validates the payload, hashes passwords with bcrypt, creates or prepares the user record, and sends an email OTP.
4. The user verifies the OTP through `POST /api/users/verify-otp`.
5. On successful verification, the backend returns a JWT token and user profile.
6. The frontend stores the token as `jairam_token` and attaches it to later API requests through the shared Axios instance.

### Login and Session Flow

1. A user logs in through `POST /api/users/login`.
2. The backend verifies credentials and account status.
3. The frontend stores the JWT and user object.
4. Protected routes such as `/dashboard`, `/submissions/:id`, `/submissions/:id/timeline`, and `/reviewer-checklist` require an authenticated user.
5. If an API request returns `401`, the frontend clears stored auth data and redirects to `/auth/login`.

### Contact Flow

1. A visitor submits the contact form.
2. The frontend sends the message to `POST /api/contact`.
3. The backend validates the name, email, subject, and message.
4. The email service sends the enquiry to the configured contact receiver.
5. The frontend displays the success or error state.

---

## Core Workflows

### Manuscript Draft and Submission Flow

1. A logged-in author opens the manuscript submission flow.
2. The frontend collects article type, title, running title, abstract, keywords, manuscript details, author information, co-authors, files, declarations, checklist answers, conflict of interest, copyright agreement, PDF confirmation, and suggested reviewers.
3. Draft data can be saved through `POST /api/submissions/draft`.
4. The final manuscript is created or updated through `POST /api/submissions` and `PATCH /api/submissions/:id`.
5. The author submits the manuscript through `POST /api/submissions/:id/submit`.
6. The backend generates a submission number in the format `JAIRAM-YYYY-NNNN`.
7. The backend creates the first submission cycle and manuscript version.
8. Co-author consent emails and reviewer invitation emails are sent when required.

### Co-Author Consent Flow

1. The author adds co-authors either by database search or manual entry.
2. The backend creates co-author consent records and tokenized consent links.
3. Co-authors can accept or reject from an email link using `POST /api/submissions/coauthor-consent`.
4. Authenticated co-authors can also respond from the dashboard using `POST /api/submissions/:submissionId/coauthor-consent-dashboard`.
5. If every co-author accepts, the manuscript can proceed.
6. If a co-author rejects or does not respond, the issue is tracked in consent records and submission consent fields.
7. Editors or admins can review consent status and, where appropriate, approve a consent override.

### Reviewer Invitation Flow

1. Authors suggest reviewers during manuscript submission.
2. Suggested reviewers receive tokenized invitation links.
3. Reviewers respond using `POST /api/submissions/reviewer-invitation-response`.
4. The backend tracks accepted, declined, and pending responses.
5. Reviewer majority is calculated so the editorial workflow can proceed when enough reviewers accept.

### Editorial Assignment Flow

1. Admin can assign an editor to a submission through `POST /api/submissions/:id/assign-editor`.
2. Editor or admin can move a submission to review once consent conditions are satisfied.
3. Editor or admin can assign technical editors through `POST /api/submissions/:id/assign-technical-editor`.
4. Technical editors accept or reject assignments through `POST /api/submissions/:id/technical-editor-assignment-response`.
5. Editor or admin can assign reviewers through `POST /api/submissions/:id/assign-reviewers`.
6. Reviewers accept or reject assignments through `POST /api/submissions/:id/reviewer-assignment-response`.

### Review and Revision Flow

1. Technical editors submit review output through `POST /api/submissions/revisions`.
2. Reviewers submit reviewer feedback through the same revision endpoint with reviewer-specific checklist and recommendation data.
3. Editors review technical editor and reviewer feedback.
4. Editors can request revision, accept, or reject through `POST /api/submissions/:id/editor-decision`.
5. Authors resubmit requested revisions through `POST /api/submissions/:id/resubmit-revision`.
6. Each revision round is tracked with submission cycles and manuscript versions.
7. Users with permission can view the full submission timeline through `GET /api/submissions/:id/timeline`.

### Payment and Final Acceptance Flow

1. A submission can reach `PROVISIONALLY_ACCEPTED`.
2. Payment is handled outside the system.
3. Editor or admin updates payment status using `PUT /api/submissions/:id/payment-status`.
4. Once payment is confirmed, the editorial process can move the submission to `ACCEPTED`.

### Role Change Request Flow

1. Editors can search users and request role changes.
2. Role change requests are created through `POST /api/admin/role-change-requests`.
3. Admin reviews requests through `PATCH /api/admin/role-change-requests/:requestId`.
4. Approved requests update the target user's role and send notification emails.
5. Admin can also manage user roles, profiles, and statuses directly.

---

## Features

### Public Frontend Pages

- Home page with journal landing content and current issue sections.
- Articles page and article detail page.
- Issues page and current issue route.
- Ahead of Print page.
- Editorial Board page.
- About page.
- Ethics page.
- Author Guidelines page.
- Peer Review Process page.
- Reviewer Checklist page.
- Article Processing Charge page.
- FAQ page.
- Powered Trust page.
- Contact page with enquiry form.
- Authentication pages for login, registration, OTP verification, forgot password, and reset password.

### Authenticated User Features

- Register with OTP-based email verification.
- Login using JWT authentication.
- Forgot password and reset password using OTP.
- View and manage dashboard data.
- Submit manuscripts as author.
- Save, fetch, and delete manuscript drafts.
- View personal submissions.
- View submission details and timeline.
- Respond to co-author consent invitations.
- Resubmit author revisions when requested.

### Editorial and Reviewer Features

- Editor dashboard for manuscript oversight.
- Technical editor dashboard for assigned technical reviews.
- Reviewer dashboard for assigned review tasks.
- Assign technical editors and reviewers.
- Accept or reject technical editor and reviewer assignments.
- Submit technical editor feedback.
- Submit reviewer feedback with checklist, remarks, confidential notes, and recommendation.
- Make editor decisions at defined decision stages.
- Track co-author consent status and reviewer majority status.
- Review full reviewer documents, assigned reviewers, and feedback.

### Admin Features

- Admin dashboard for broad system control.
- List and search users with pagination and filters.
- View user details.
- Update user profile data.
- Update user account status.
- Update user role directly.
- Review editor-submitted role change requests.
- Assign editors to submissions.
- View all non-draft submissions.

### Backend Capabilities

- Modular Express API architecture.
- MongoDB persistence with Mongoose models.
- JWT authentication and optional authentication middleware.
- Role-based middleware for admin, editor, technical editor, reviewer, and user access.
- Joi-based request validation.
- Central async handler and global error handler.
- Password hashing with bcrypt.
- OTP generation and email delivery.
- Cloudinary signed upload URL generation.
- Submission number generation using an atomic yearly counter.
- Manuscript lifecycle tracking with cycles and versions.
- Consent tracking with token expiry and audit fields.
- Reviewer invitation tracking and majority calculation.
- Email templates and email client abstraction.

---

## Roles and Access Control

| Role | Purpose |
| --- | --- |
| `USER` | Standard registered user, usually an author or co-author. |
| `REVIEWER` | Reviews assigned submissions and provides recommendations. |
| `TECHNICAL_EDITOR` | Handles technical checks and technical review assignments. |
| `EDITOR` | Manages editorial workflow, assignments, decisions, and role change requests. |
| `ADMIN` | Manages users, roles, submissions, admin actions, and editor assignments. |

Access is enforced on the backend through `requireAuth` and `allowRoles(...)`. The frontend also uses protected routes and role-aware dashboard views, but backend authorization is the source of truth.

---

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router DOM 7
- Axios
- Zustand
- React Hook Form
- Yup
- React Hot Toast
- Framer Motion
- Lucide React
- Tailwind CSS 4
- CSS files for component and page styling

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi
- Nodemailer
- Cloudinary
- CORS
- dotenv
- Pino and pino-http

### Tooling

- npm
- Nodemon
- ESLint
- Vite build tooling
- Git

---

## Folder Structure

```text
JAIRAM/
|-- README.md
|-- client/
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   |-- vercel.json
|   |-- public/
|   |   |-- assets/
|   |   |   |-- Logo.jpg
|   |   |   |-- home.png
|   |   |   |-- peer_review_process.png
|   |   |   `-- by.png
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- index.css
|       |-- components/
|       |   |-- articles/
|       |   |-- common/
|       |   |-- forms/
|       |   |-- home/
|       |   |-- layout/
|       |   |-- login/
|       |   |-- register/
|       |   |-- search/
|       |   `-- sidebar/
|       |-- data/
|       |-- hooks/
|       |-- pages/
|       |   |-- AdminDashboard/
|       |   |-- ArticleDetailPage/
|       |   |-- ArticleProcessingCharge/
|       |   |-- ArticlesPage/
|       |   |-- AuthPage/
|       |   |-- AuthorGuidelines/
|       |   |-- CoAuthorConsentPage/
|       |   |-- ContactPage/
|       |   |-- Editor-Board/
|       |   |-- EditorDashboard/
|       |   |-- EthicsPage/
|       |   |-- FAQ_Page/
|       |   |-- HomePage/
|       |   |-- IssuePage/
|       |   |-- OtpVerificationPage/
|       |   |-- PeerReviewSystem/
|       |   |-- ReviewerDashboard/
|       |   |-- ReviewerInvitationPage/
|       |   |-- SubmitPage/
|       |   |-- SubmissionDetailPage/
|       |   |-- SubmissionTimelinePage/
|       |   |-- TechnicalEditorDashboard/
|       |   `-- UserDashboard/
|       |-- services/
|       |-- store/
|       `-- utils/
`-- server/
    |-- package.json
    |-- nodemon.json
    |-- necessaryMarkdownFiles/
    |-- src/
        |-- app.js
        |-- server.js
        |-- routes/
        |   `-- index.js
        |-- config/
        |   |-- cloudinary.js
        |   |-- env.js
        |   `-- index-sync.js
        |-- infrastructure/
        |   |-- email/
        |   `-- mongodb/
        |-- common/
        |   |-- constants/
        |   |-- errors/
        |   |-- middlewares/
        |   `-- utils/
        `-- modules/
            |-- admin/
            |-- consents/
            |-- contact/
            |-- manuscriptVersions/
            |-- reviewers/
            |-- submissions/
            |-- submissionCycles/
            |-- technicalEditors/
            `-- users/
```

---

## Environment Variables

Create separate `.env` files for the frontend and backend. Do not commit real secrets.

### Client `.env`

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

### Server `.env`

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET_KEY=<long-random-jwt-secret>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email-address>
EMAIL_PASS=<email-app-password>
EMAIL_FROM=<sender-email-address>
CONTACT_RECEIVER_EMAIL=<contact-recipient-email>

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

Required server variables:

- `MONGO_URI`
- `JWT_SECRET_KEY`

Required for email delivery:

- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `CONTACT_RECEIVER_EMAIL`

Required for Cloudinary uploads:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Recommended in production:

- `NODE_ENV=production`
- `FRONTEND_URL=<deployed-frontend-url>`
- Strong `JWT_SECRET_KEY`
- Restricted CORS origin configuration in `server/src/app.js`

---

## Local Setup

### Prerequisites

- Node.js
- npm
- MongoDB database connection string
- Email account or SMTP credentials for OTP and workflow emails
- Cloudinary account for manuscript file upload support

### 1. Clone the Repository

```bash
git clone https://github.com/imrude16/JAIRAM.git
cd JAIRAM
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Configure Environment Variables

Create:

- `client/.env`
- `server/.env`

Use the placeholder examples from the [Environment Variables](#environment-variables) section.

### 5. Start the Backend

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Root check:

```text
http://localhost:5000/
```

### 6. Start the Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The frontend runs on the Vite development URL, usually:

```text
http://localhost:5173
```

---

## Available Scripts

### Client

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint checks for the frontend.

### Server

```bash
npm run dev
```

Starts the backend with Nodemon.

```bash
npm start
```

Starts the backend with Node.

---

## API Overview

### General

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Confirms that the JAIRAM backend is running. |
| `GET` | `/api/health` | Checks backend health. |

### Users and Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/users/check-email` | Checks whether an email is available during registration. |
| `POST` | `/api/users/register` | Starts user registration and sends OTP. |
| `POST` | `/api/users/verify-otp` | Verifies registration OTP and returns JWT token. |
| `POST` | `/api/users/resend-otp` | Sends a fresh registration OTP. |
| `POST` | `/api/users/login` | Logs in a user and returns JWT token. |
| `POST` | `/api/users/forgot-password` | Sends password reset OTP. |
| `POST` | `/api/users/reset-password` | Verifies reset OTP and updates password. |
| `GET` | `/api/users/profile` | Returns the authenticated user's profile. |
| `POST` | `/api/users/change-password` | Changes password for the authenticated user. |
| `GET` | `/api/users/:id` | Admin-only user lookup by ID. |
| `PATCH` | `/api/users/:id` | Admin-only user update. |

### Contact

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/contact` | Sends a contact form enquiry email. |

### Submissions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/submissions` | Lists submissions based on the current user's role. |
| `POST` | `/api/submissions` | Creates a manuscript submission draft. |
| `GET` | `/api/submissions/:id` | Returns submission details if the user has permission. |
| `PATCH` | `/api/submissions/:id` | Updates a draft or revision-requested submission. |
| `POST` | `/api/submissions/:id/submit` | Finalizes and submits a manuscript. |
| `POST` | `/api/submissions/:id/resubmit-revision` | Lets an author resubmit a requested revision. |
| `GET` | `/api/submissions/:id/timeline` | Returns cycles and manuscript version timeline. |
| `POST` | `/api/submissions/draft` | Saves or updates a draft submission. |
| `GET` | `/api/submissions/draft` | Gets the latest draft for the authenticated user. |
| `DELETE` | `/api/submissions/draft/:id` | Deletes a saved draft. |
| `POST` | `/api/submissions/upload-url` | Generates signed Cloudinary upload data. |

### Consent and Invitations

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/submissions/token-info` | Reads token metadata for consent or invitation pages. |
| `POST` | `/api/submissions/coauthor-consent` | Processes token-based co-author consent. |
| `POST` | `/api/submissions/:submissionId/coauthor-consent-dashboard` | Processes authenticated co-author dashboard consent. |
| `GET` | `/api/submissions/my-consent-invitations` | Lists consent invitations for the authenticated user. |
| `GET` | `/api/submissions/:submissionId/coauthor-consents` | Returns co-author consent records for an author's submission. |
| `POST` | `/api/submissions/reviewer-invitation-response` | Processes reviewer invitation response by token. |
| `POST` | `/api/submissions/cron/auto-reject-expired-consents` | Processes expired co-author consent deadlines. |

### Editorial Workflow

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/submissions/:id/status` | Editor/admin status update. |
| `PUT` | `/api/submissions/:id/payment-status` | Editor/admin payment status update. |
| `POST` | `/api/submissions/:id/assign-editor` | Admin assigns an editor. |
| `POST` | `/api/submissions/:id/move-to-review` | Moves a submission into peer review. |
| `PATCH` | `/api/submissions/:id/suggested-reviewers/:reviewerIndex/editor-approval` | Marks a suggested reviewer as editor-approved. |
| `POST` | `/api/submissions/:id/editor-approve-consent` | Editor/admin override for consent issues. |
| `POST` | `/api/submissions/revisions` | Technical editor, reviewer, or editor submits review/revision output. |
| `POST` | `/api/submissions/:id/editor-decision` | Editor/admin records accept, reject, or revision decision. |
| `GET` | `/api/submissions/:id/coauthor-consent-status` | Checks co-author consent readiness. |
| `GET` | `/api/submissions/:id/reviewer-majority-status` | Checks reviewer invitation majority readiness. |
| `POST` | `/api/submissions/:id/assign-technical-editor` | Editor/admin assigns technical editor. |
| `POST` | `/api/submissions/:id/technical-editor-assignment-response` | Technical editor accepts or rejects assignment. |
| `POST` | `/api/submissions/:id/assign-reviewers` | Editor/admin assigns reviewers. |
| `POST` | `/api/submissions/:id/reviewer-assignment-response` | Reviewer accepts or rejects assignment. |

### Search

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/submissions/search/authors` | Searches authors. |
| `GET` | `/api/submissions/search/reviewers` | Searches reviewers. |
| `GET` | `/api/submissions/search/technical-editors` | Searches technical editors. |

### Reviewers

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/reviewers/:submissionId` | Editor/admin retrieves full reviewer document. |
| `GET` | `/api/reviewers/:submissionId/assigned` | Editor/admin retrieves assigned reviewers. |
| `GET` | `/api/reviewers/:submissionId/feedback` | Editor/admin retrieves reviewer feedback. |

### Admin

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/admin/role-change-requests` | Editor creates a role change request. |
| `GET` | `/api/admin/role-change-request-users` | Editor searches users for role change requests. |
| `GET` | `/api/admin/my-role-change-requests` | Editor views their own role change request history. |
| `GET` | `/api/admin/role-change-requests` | Admin lists role change requests. |
| `PATCH` | `/api/admin/role-change-requests/:requestId` | Admin approves or rejects a role change request. |
| `GET` | `/api/admin/users` | Admin lists users with filters and pagination. |
| `GET` | `/api/admin/users/:userId` | Admin views a user by ID. |
| `PATCH` | `/api/admin/users/:userId/role` | Admin directly updates a user's role. |
| `PATCH` | `/api/admin/users/:userId/profile` | Admin updates profile fields for a user. |
| `PATCH` | `/api/admin/users/:userId/status` | Admin updates account status. |

---

## Data Models and Statuses

### User Roles

| Role | Meaning |
| --- | --- |
| `USER` | Regular authenticated user. |
| `REVIEWER` | User allowed to review assigned submissions. |
| `TECHNICAL_EDITOR` | User allowed to perform technical editor review work. |
| `EDITOR` | User allowed to manage editorial review and decisions. |
| `ADMIN` | User allowed to manage users, roles, and high-level workflow operations. |

### User Account Status

| Status | Meaning |
| --- | --- |
| `ACTIVE` | User can log in and use the system. |
| `INACTIVE` | User account is inactive. |
| `SUSPENDED` | User account is suspended and should not be allowed normal access. |

### Submission Status

| Status | Meaning |
| --- | --- |
| `DRAFT` | Submission is editable and not yet finalized. |
| `SUBMITTED` | Manuscript has been submitted and received a submission number. |
| `UNDER_REVIEW` | Editorial or peer review work is in progress. |
| `REVISION_REQUESTED` | Author must submit a revised manuscript. |
| `PROVISIONALLY_ACCEPTED` | Manuscript is accepted conditionally, usually pending payment. |
| `ACCEPTED` | Manuscript is finally accepted. |
| `REJECTED` | Manuscript has been rejected. |

### Consent Deadline Status

| Status | Meaning |
| --- | --- |
| `ACTIVE` | Consent request is active and waiting for response. |
| `REMINDED` | Reminder has been sent after the initial waiting period. |
| `NOTIFIED` | A consent issue has been reported, such as rejection. |
| `RESOLVED` | Consent issue is resolved or editor-approved. |
| `AUTO_REJECTED` | Consent deadline expired without resolution. |

### Consent Record Status

| Status | Meaning |
| --- | --- |
| `PENDING` | Co-author has not responded yet. |
| `APPROVED` | Co-author accepted authorship consent. |
| `REJECTED` | Co-author rejected authorship consent. |

### Reviewer Invitation Status

| Status | Meaning |
| --- | --- |
| `PENDING` | Suggested reviewer has not responded. |
| `ACCEPTED` | Suggested reviewer accepted invitation. |
| `DECLINED` | Suggested reviewer declined invitation. |

### Submission Cycle Status

| Status | Meaning |
| --- | --- |
| `IN_PROGRESS` | Current review cycle is active. |
| `COMPLETED` | Review cycle is finished. |
| `REVISION_REQUESTED` | Cycle resulted in a revision request. |

### Editor Decision Stages

| Stage | Meaning |
| --- | --- |
| `INITIAL_SCREENING` | First editor review after submission. |
| `POST_TECH_EDITOR` | Editor decision after technical editor review. |
| `POST_REVIEWER` | Editor decision after reviewer feedback. |
| `FINAL_DECISION` | Final editorial decision. |

### Reviewer Recommendations

| Recommendation | Meaning |
| --- | --- |
| `ACCEPT` | Reviewer recommends acceptance. |
| `MINOR_REVISION` | Reviewer recommends minor revision. |
| `MAJOR_REVISION` | Reviewer recommends major revision. |
| `REJECT` | Reviewer recommends rejection. |

---

## Security and Validation

- Passwords are hashed with bcrypt before storage.
- JWT tokens are used for authenticated API access.
- Protected backend routes use `requireAuth`.
- Role-restricted routes use `allowRoles(...)`.
- Public token flows are used for co-author consent and reviewer invitation responses.
- OTP-based verification is used for registration and password reset.
- Joi validation is applied to request bodies, query strings, and route parameters.
- User response serialization removes password and OTP fields.
- Consent and invitation tokens are excluded from JSON responses.
- Cloudinary uploads use signed upload data generated by the backend.
- Submission numbers are generated with an atomic MongoDB counter.
- Submission edits are restricted after submission to protect finalized manuscript data.
- Global async handling and error handling keep API responses consistent.
- CORS is currently enabled broadly in development and should be restricted in production.

---

## Deployment Notes

### Frontend

The frontend can be deployed to Vercel, Netlify, or any static hosting provider that supports Vite builds.

Build command:

```bash
npm run build
```

Output directory:

```text
client/dist
```

Set `VITE_BACKEND_URL` to the deployed backend API base URL:

```env
VITE_BACKEND_URL=https://<backend-domain>/api
```

### Backend

The backend can be deployed to a Node.js hosting provider.

Production notes:

- Set `NODE_ENV=production`.
- Set `PORT` according to the host.
- Set `MONGO_URI` to a production MongoDB database.
- Set a strong `JWT_SECRET_KEY`.
- Set valid SMTP credentials for email delivery.
- Set valid Cloudinary credentials for file uploads.
- Set `FRONTEND_URL` to the deployed frontend URL so email links point to the correct site.
- Restrict CORS origins in `server/src/app.js`.
- Confirm public token flows work correctly from deployed frontend routes.

---

## Future Improvements

- Add automated backend tests for authentication, submissions, consent, review, and admin workflows.
- Add frontend component and integration tests for submission and dashboard flows.
- Add scheduled execution for expired consent processing instead of relying only on an endpoint.
- Add a dedicated payment gateway integration for article processing charges.
- Add article publishing APIs and CMS-like controls for issues, articles, announcements, and ahead-of-print content.
- Add richer audit logging for role changes, editor decisions, status changes, and file uploads.
- Add granular notification preferences and email retry queues.
- Add OpenAPI or Postman documentation for all backend endpoints.
- Add production-ready CORS, rate limiting, request logging, and security headers.
- Add analytics for manuscript turnaround time, reviewer response time, and editorial workload.

---

## Project Status

The project currently includes a working React frontend, public journal pages, authentication screens, role-aware dashboards, contact form integration, manuscript submission workflow, co-author consent handling, reviewer invitation handling, technical editor and reviewer assignment flows, editor decision handling, admin role and user management, MongoDB persistence, JWT authentication, email support, and Cloudinary upload support.
