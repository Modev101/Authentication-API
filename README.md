# 🔐 Authentication API

A production-ready **Authentication & User Management API** built with **NestJS**, **Prisma ORM**, **PostgreSQL**, and **TypeScript**. It provides secure JWT authentication, refresh token rotation, role-based access control (RBAC), email verification, password reset, comprehensive audit logging, and enterprise-grade security best practices.

---
## 🚀 Tech Stack

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=black)
![Bcrypt](https://img.shields.io/badge/Bcrypt-003A70?style=for-the-badge)
![Nodemailer](https://img.shields.io/badge/Nodemailer-0A66C2?style=for-the-badge&logo=gmail&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=for-the-badge)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Throttler](https://img.shields.io/badge/Rate_Limiting-FF6B6B?style=for-the-badge)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)
![HTTPie](https://img.shields.io/badge/HTTPie-121212?style=for-the-badge&logo=httpie&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
---

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Authentication:** JWT (Access & Refresh Tokens)
* **Authorization:** Role-Based Access Control (RBAC)
* **Password Hashing:** bcrypt
* **Email Service:** Nodemailer
* **Validation:** class-validator & class-transformer
* **Rate Limiting:** NestJS Throttler

---

## ✨ Features

* 🔐 JWT Authentication (Access & Refresh Tokens)
* 🔄 Secure Refresh Token Rotation
* 👤 User Registration & Login
* 📧 Email Verification
* 🔑 Forgot & Reset Password
* 🛡️ Role-Based Access Control (RBAC)
* 👨‍💼 Admin Dashboard APIs
* 👥 User Management
* 🚫 Account Suspension & Reactivation
* 🔄 User Role Management
* 📝 Comprehensive Audit Logging
* 🌍 IP Address & User-Agent Tracking
* 🔒 Secure Password Hashing with bcrypt
* ⚡ Rate Limiting & Brute Force Protection
* 🗄️ PostgreSQL with Prisma ORM
* 🌐 RESTful API Architecture

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Modev101/Authentication-API.git
cd Authentication-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db"

# JWT
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=you@gmail.com
```

> **Note:** For Gmail, use an **App Password** instead of your account password.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## 🔐 Security Features

* JWT Access & Refresh Tokens
* Refresh Token Rotation
* Password Hashing with bcrypt
* Email Verification
* Password Reset via Email
* Rate Limiting
* Brute Force Protection
* RBAC Authorization
* Audit Logs
* IP Address Tracking
* User-Agent Tracking

---

## 📄 License

This project is licensed under the MIT License.
