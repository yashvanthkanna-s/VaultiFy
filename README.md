# Vaultify

> **Secure. Store. Share.**

A clean, modern cloud-based personal file storage application built with Java Spring Boot and Vanilla JavaScript.

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- A modern web browser

### Run the Backend

```bash
cd backend
mvn spring-boot:run
```

The server starts at: **http://localhost:8080**

### Open the Frontend

Open `frontend/index.html` in your browser, or use a local server:

```bash
# Using Python
cd frontend
python -m http.server 3000

# Then open: http://localhost:3000
```

---

## 📁 Project Structure

```
VaultiFy/
├── frontend/
│   ├── index.html          ← Landing page
│   ├── login.html          ← Login page
│   ├── signup.html         ← Signup page
│   ├── dashboard.html      ← Dashboard (files)
│   ├── profile.html        ← Profile & storage stats
│   ├── css/
│   │   ├── style.css       ← Global styles (landing, auth)
│   │   └── dashboard.css   ← Dashboard & profile styles
│   └── js/
│       ├── login.js        ← Login form + API
│       ├── signup.js       ← Signup form + API
│       ├── dashboard.js    ← File listing, delete, profile
│       └── upload.js       ← Upload with XHR progress
│
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/vaultify/
│       │   ├── VaultifyApplication.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   └── FileController.java
│       │   ├── service/
│       │   │   ├── AuthService.java
│       │   │   └── FileService.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   └── FileRepository.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   └── FileMetadata.java
│       │   ├── dto/
│       │   │   ├── SignupRequest.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── AuthResponse.java
│       │   │   ├── FileMetadataResponse.java
│       │   │   ├── UserProfileResponse.java
│       │   │   └── ApiResponse.java
│       │   ├── storage/
│       │   │   ├── StorageService.java   ← Interface (swap for S3)
│       │   │   └── LocalStorageService.java
│       │   ├── config/
│       │   │   ├── JwtUtil.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   └── SecurityConfig.java
│       │   └── exception/
│       │       ├── VaultifyException.java
│       │       └── GlobalExceptionHandler.java
│       └── resources/
│           └── application.properties
│
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get profile & storage info |
| POST | `/api/files/upload` | Yes | Upload a file |
| GET | `/api/files` | Yes | List all files |
| GET | `/api/files/{id}/download` | Yes | Download a file |
| DELETE | `/api/files/{id}` | Yes | Delete a file |

---

## ⚙️ Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Storage directory
vaultify.storage.location=./uploads

# JWT expiry (24 hours)
jwt.expiration=86400000

# Max file size
spring.servlet.multipart.max-file-size=50MB
```

---

## 📋 Supported File Types

| Type | Extension |
|------|-----------|
| PDF Document | `.pdf` |
| Word Document | `.docx` |
| ZIP Archive | `.zip` |
| PNG Image | `.png` |
| JPEG Image | `.jpg`, `.jpeg` |

**Limits:**
- Maximum file size: **50 MB**
- Maximum storage per user: **500 MB**
- Maximum users: **10**

---

## 🔒 Security

- Passwords hashed with **BCrypt**
- Authentication via **JWT tokens** (24h expiry)
- All file endpoints require a valid token
- File ownership verified on every download/delete

---

## 🗺️ AWS Roadmap

| Version | Upgrade |
|---------|---------|
| v1.0 | ✅ Local storage + H2 Database |
| v2.0 | Replace `LocalStorageService` → `S3StorageService` |
| v2.1 | Replace H2 → Amazon DynamoDB |
| v3.0 | Deploy to Amazon EC2 |

To swap to S3: implement `StorageService` interface in a new `S3StorageService` class. No changes needed in controllers or services.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Java 17, Spring Boot 3.2
- **Database:** H2 (file-based, persistent)
- **Auth:** Spring Security + JWT (JJWT 0.12)
- **Password:** BCrypt
- **Storage:** Local filesystem (`./uploads/`)

---

*Built with ❤️ — Vaultify v1.0*
