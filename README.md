Project name:devpulse
- live URL: https://devpulse-api-sand.vercel.app/

Features:
- User Authentication(Signup/Login)
- JWT-based secure login system
- Role-based authorization (contributor/maintainer)
- create,read,update,delete issues
- Filter issues type and status and sort by newest/oldest
- password hashing using bcrypt
- sql queries by using PostgreSQL

Tech stack:
- Node.js
- Express.js
- Typescript
- PostgreSQL
- JSON Web Token(JWT)
- bcrypt

Setup steps:
- clone repository ```bash 
git clone https://github.com/fhkathika/devpulse.git
 cd devpulse

API endpoints:
1. create user
POST /api/auth/signup
2. login
POST /api/auth/login
3. create issue
POST /api/issues
Headers:Authorization:Bearer <token>
5. get all issue
GET /api/issues?sort=newest
6. get single issues
GET /api/issues/:id
7. update issue
PATCH /api/issues/:id
Headers:Authorization:Bearer <token>
8. DELETE /api/issues/:id
Headers:Authorization:Bearer <token>

Database Schema summery:

users table
- id(primary key)
- name
- email (unique)
- password(hashed)
- role(contributor/maintainer)
- created_at
- updated_at

issues table:
- id(primary key)
- title
- description
- type(bug/feature_request
- status (open/in_progress/resolved)
- reporter_id
- created_id
- updated_id





