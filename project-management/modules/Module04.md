# Module 04 Report

## Objective
Build a temporary authentication system to secure the internal business application with a single administrator account. The architecture is scalable for a future migration to database-backed users.

## Dependencies installed
- `jsonwebtoken`: Installed in the backend to generate and verify JWT tokens for stateless authentication, adhering to modern API security standards.

## Files created
- `server/controllers/authController.js`
- `server/routes/authRoutes.js`
- `server/middleware/authMiddleware.js`
- `client/src/services/api.js`
- `client/src/store/authStore.js`
- `client/src/components/ProtectedRoute.jsx`

## Routes created
- `POST /api/auth/login` - Authenticates user and returns JWT
- `POST /api/auth/logout` - Endpoint available for destroying sessions logic 
- `GET /api/auth/me` - Returns the currently authenticated user based on JWT
- Frontend protected routing added in `App.jsx`

## Middleware created
- `authMiddleware.js`: Validates the Bearer token and attaches the decoded payload to `req.user`.

## Store created
- `authStore.js`: Zustand store managing token persistence, authentication state, user information, and login/logout methods.

## Authentication flow
1. User enters hardcoded email and password on the Login page.
2. Form is submitted to `POST /api/auth/login`.
3. If credentials are correct, backend creates and signs a JWT, returning it along with user details.
4. `authStore` saves the token in `localStorage` and updates its global state.
5. User is redirected to `/`, which is wrapped in a `<ProtectedRoute>`.
6. Subsequent API requests pass the JWT via the Authorization header using `api.js`.

## Architectural decisions
- Used hardcoded credentials internally in `authController.js` to avoid prematurely storing business data in MySQL.
- Designed `authMiddleware.js` and `authStore.js` robustly so that when migrating to a DB-driven users table later, only the backend validation logic needs swapping.
- Created `api.js` frontend service wrapper to centralize `Authorization` header injection and global 401 unauthenticated redirect handling.

## Remaining work
- The authentication module is complete as per the acceptance criteria.
