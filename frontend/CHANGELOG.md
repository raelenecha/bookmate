# Login and Auth
- added a backend route for login
- added jwt
- added "required" tag for username and password
- added jwt secret in env file
- added token in request header
- added a checkAuth api
- added a auth provider useContext

# Home page
- update token removal from current user ID to token
- added a top rated book api
- added a new top rated item scroller with styles
- updated the api for waitlisted books
- redesign the account links
- change layout direction for waitlisted books

# Models
- removed redundant "id" field in waitlist model
- added reference for "userId" and "bookId" in waitlist model
- removed "createdAt" in waitlist model since MongoDB alr have a built in "timestamp" embedded into in ID
-  optimised and removed unused/redundant attributes

# Book Catalogue
- Reusued the book card component with slight styling adjustment to reduce code

# Others
- replace package "react-router" with "react-router-dom"
- Moved Header button options to the header.jsx
- added a layout.jsx so no need to keep importing header
- added a context to change header options
- added description to add books