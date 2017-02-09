token       Stores the session token (like a cookie)

postid      Stores the postid to be opened as soon as the specific posts page is opened (will reset the postid before redirecting). Dashboard will use this to correctly redirect after logging in.

admin       true if user should be shown some buttons to go to admin panels. This is NOT a security vulnerability because even if users force this flag in javascript, they can see the page but with no content from the server.