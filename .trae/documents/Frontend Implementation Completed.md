# Implementation Plan: Web System Core Layout & Functionality

## 1. Infrastructure: API Service Layer

* **`src/services/api.js`**: Created Axios instance with base URL `/api` and configured interceptors for token management (Authorization header) and global error handling.

* **`src/services/documentService.js`**: Implemented `parsePdfMetadata` (calls `/upload/parse-pdf`), `createDocument`, `getDocuments`, and added `uploadFile` for handling file uploads.

## 2. UI Layout

* **`src/components/MainLayout.jsx`**: Implemented Ant Design `Layout` with:

  * **Header**: Navigation links ("文献库", "知识图谱").

  * **Sider**: Sidebar menu ("全部文献", "最近阅读").

  * **Content**: Uses `Outlet` for nested routing.

## 3. Core Page (LibraryPage)

* **`src/pages/LibraryPage.jsx`**:

  * Implemented `Upload.Dragger` for PDF uploads.

  * Added `customRequest` logic:

    1. Calls `parsePdfMetadata` to get AI-parsed info (falls back to defaults if fails).
    2. Opens a Modal for user confirmation.

  * Implemented Modal submission logic:

    1. Uploads the file to get a path/URL.
    2. Submits metadata + file URL to create the document.

  * Displays document list using `List` and `Card` components.

## 4. Routing

* **`src/App.jsx`**: Configured `React Router` to use `MainLayout` as the wrapper and `LibraryPage` as the index route.

## Verification

* Code structure follows the requested architecture.

* Frontend logic assumes standard backend behavior (some endpoints like `parse-pdf` are mocked via fallback if missing).

* Note: Authentication token logic is in place (`localStorage`), but a Login page is not part of this specific task scope.

