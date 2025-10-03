# Backend Integration Guide

This app is configured to work with your MongoDB backend.

## Required API Endpoints

Your backend should implement these endpoints:

### Authentication
- `POST /api/auth/signup` - Register new user
  - Body: `{ email, password, name }`
  - Response: `{ user: { id, email, name }, token }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Response: `{ user: { id, email, name }, token }`

### Documents
- `GET /api/documents` - Get all user's documents
  - Query params: `search` (optional), `sortBy` (name|date)
  - Headers: `Authorization: Bearer {token}`
  - Response: `[{ id, name, type, size, url, uploadedAt, userId }]`

- `POST /api/documents/upload` - Upload a document
  - Body: FormData with `file` field
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ id, name, type, size, url, uploadedAt, userId }`

- `DELETE /api/documents/:id` - Delete a document
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ success: true }`

- `GET /api/documents/:id/download` - Download a document
  - Headers: `Authorization: Bearer {token}`
  - Response: File blob

## Configuration

Set your backend URL in `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

Or use environment variable (create `.env.local`):
```
VITE_API_URL=https://your-backend-url.com/api
```

## Security Notes

- All requests use JWT Bearer token authentication
- Token is stored in localStorage
- File uploads support: PDF, DOC, DOCX, PPT, PPTX, images (JPG, PNG, GIF)
- Implement proper CORS on your backend to allow frontend origin
