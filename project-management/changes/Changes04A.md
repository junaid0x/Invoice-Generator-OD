# Patch 04A Report

## Objective
Provide a proper logout experience for the temporary authentication system by updating the Navbar with a user profile dropdown.

## Files modified
- `client/src/components/Navbar.jsx`

## Components modified
- `Navbar`: 
  - Added integration with `authStore` to dynamically fetch user details and authentication state.
  - Profile section is conditionally rendered based on `isAuthenticated`.
  - Created a toggleable dropdown menu using `useState` and `useRef` for closing on outside clicks.
  - Implemented the `handleLogout` function which clears the auth state via the store and uses React Router's `navigate` to redirect the user to `/login`.

## Logout flow
1. User clicks the profile section in the Navbar, expanding the dropdown.
2. User clicks "Logout".
3. `handleLogout` invokes `useAuthStore.logout()`, destroying the JWT token from `localStorage` and clearing global auth state.
4. User is programmatically redirected to `/login` using `useNavigate()`.

## Architectural decisions
- Used `useRef` and `mousedown` event listener to gracefully close the dropdown if the user clicks outside.
- Safely handled user data rendering with `user?.name`, falling back gracefully, ensuring no runtime crashes if the payload is missing fields.
- Kept UI minimal and identical to existing branding without unnecessarily bloating the component with other functionalities like settings.
