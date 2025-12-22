# MERN Literature Management System

## 1. Project Overview
A personal literature management system designed to support PDF parsing, reading, highlighting, and annotation. Built with the MERN stack (MongoDB, Express, React, Node.js), it aims to provide a seamless research experience with persistent data storage and AI integration capabilities.

**Tech Stack:**
*   **Frontend**: React 18, Vite, Ant Design 5, react-pdf-highlighter, pdfjs-dist (v3.11.174).
*   **Backend**: Express, MongoDB (Mongoose), cors.
*   **Database**: MongoDB.

## 2. Project Structure

```bash
.
├── backend/
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers (auth, document, note, etc.)
│   ├── middleware/         # Auth and upload middlewares
│   ├── models/             # Mongoose schemas (User, Document, Note)
│   ├── public/
│   │   └── uploads/        # 📂 Document storage location
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic (AI service)
│   └── server.js           # Entry point
├── frontend/
│   ├── public/
│   │   └── pdf.worker.min.js # ⚙️ Local PDF.js worker (Critical for stability)
│   ├── src/
│   │   ├── components/     # Reusable UI components (MainLayout, DocumentList)
│   │   ├── pages/          # Application pages (Library, PDFReader, Profile)
│   │   ├── services/
│   │   │   └── documentService.js # 🔧 Core data handling & URL construction
│   │   ├── App.jsx         # Router setup
│   │   └── main.jsx        # Entry point
│   └── vite.config.js
└── README.md
```

## 3. Critical Technical Fixes (Debugging Log)

This section documents critical fixes implemented to resolve system-breaking bugs. **Do not regress these changes during future refactoring.**

### 3.1 PDF Infinite Loading / Deadlock
*   **Issue**: The PDF reader would get stuck in an infinite loading state due to version mismatches between `pdfjs-dist` (main thread) and the Worker script, exacerbated by unstable CDN connections in China.
*   **Fix**: 
    1.  Downloaded the exact matching version of `pdf.worker.min.js` (v3.11.174) to `frontend/public/`.
    2.  Forced the worker source in `PDFReaderPage.jsx`:
        ```javascript
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
        ```
    *   **Constraint**: Always ensure the worker file in `public` matches the installed `pdfjs-dist` version in `package.json`.

### 3.2 PDF 404 / Cross-Origin Resource Sharing
*   **Issue**: Frontend (port 3001) could not access PDF files served by Backend (port 3000) using relative paths, or paths were malformed.
*   **Fix**: 
    1.  Implemented URL normalization in `frontend/src/services/documentService.js`.
    2.  Hardcoded the backend base URL to ensure absolute paths:
        ```javascript
        const API_BASE_URL = 'http://localhost:3000';
        // ...
        pdfUrl: doc.filename ? `${API_BASE_URL}/api/files/${doc.filename}` : doc.pdfUrl
        ```

### 3.3 Upload Data Loss (Filename Undefined)
*   **Issue**: After uploading and parsing a PDF, the `filename` was not being saved to the database, causing subsequent read attempts to fail (404).
*   **Root Causes**: 
    1.  Frontend `LibraryPage.jsx` had a variable naming error (`setCurrentFilename` vs `setUploadFilename`).
    2.  Backend Mongoose Schema (`models/Document.js`) lacked the `filename` field, causing it to be silently stripped on save.
*   **Fix**: 
    1.  Rewrote `LibraryPage.jsx` to correctly capture and validate `filename` state before submission.
    2.  Updated `Document.js` schema to include `filename: { type: String }`.

## 4. Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas)

### Backend Setup
```bash
cd backend
# Install dependencies
npm install
# Start server (Runs on port 3000)
npm start
```

### Frontend Setup
```bash
cd frontend
# Install dependencies
npm install
# Start dev server (Runs on port 3001)
npm run dev
```

Access the application at `http://localhost:3001`.

## 5. API Reference (Core)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/upload/parse-pdf` | Uploads a PDF and parses metadata (Title, Authors, Abstract) |
| **POST** | `/api/documents` | Creates a new document record in the database |
| **GET** | `/api/documents` | Retrieves the list of documents for the current user |
| **GET** | `/api/documents/:id` | Retrieves details for a specific document |
| **DELETE** | `/api/documents/:id` | Deletes a document and its associated file/notes |
| **GET** | `/api/files/:filename` | Serves the static PDF file |

## 6. Roadmap

*   [ ] **Highlight Persistence**: Save user highlights and annotations to MongoDB (`/api/annotations`).
*   [ ] **AI Integration**: Implement real API calls to DeepSeek/OpenAI for translation and summarization (currently mocked).
*   [ ] **UI Enhancements**: Improve the reader toolbar, add upload progress indicators, and support dark mode.
*   [ ] **Graph View**: Visualize citation relationships between documents.
