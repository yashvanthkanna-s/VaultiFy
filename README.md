# Vaultify

Vaultify is a personal file storage app I built as a clean, lightweight alternative to heavy cloud storage solutions. It's designed to securely store and share files for a small group of friends or personal use.

The goal wasn't to build a Google Drive clone, but rather a solid MVP that demonstrates clean layered architecture and is ready to scale up to AWS (S3 and DynamoDB) later on.

## What it does
- User authentication with JWT and BCrypt password hashing.
- Upload, download, and delete files (PDFs, Images, ZIPs, Docs).
- Enforces user quotas (max 500MB per user, max 50MB per file).
- Dashboard and profile stats to track usage.

## Tech Stack
I kept things simple and avoided heavy frontend frameworks.
- **Backend:** Java 17, Spring Boot 3.2
- **Database:** H2 (file-based)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Storage:** Local filesystem (for now)

## How to run it locally

### 1. Start the Backend
Make sure you have Java 17 and Maven installed.
```bash
cd backend
mvn spring-boot:run
```
The API runs on `http://localhost:8080`.

### 2. Start the Frontend
You can just open `frontend/index.html` in your browser. Alternatively, run a quick local server so everything loads cleanly:
```bash
cd frontend
python -m http.server 3000
```
Then visit `http://localhost:3000`.

## Project Structure Highlights
- `backend/src/main/java/com/vaultify/storage/StorageService.java`: This is an interface I created to handle file operations. Right now, it's implemented by `LocalStorageService`, but it's designed so I can just write an `S3StorageService` later and swap it out without touching the controllers.
- `frontend/css/`: Built a small custom design system using CSS variables. No Tailwind or Bootstrap here.
- `frontend/js/upload.js`: Handles multipart file uploads using `XMLHttpRequest` so we get real-time upload progress bars on the frontend.

## Future Plans (AWS Migration)
The next steps for this project are to move it to the cloud:
1. Swap the `LocalStorageService` for Amazon S3.
2. Swap the H2 database for Amazon DynamoDB (the repository interfaces are already set up for this).
3. Deploy the Spring Boot app to EC2 or Elastic Beanstalk.
