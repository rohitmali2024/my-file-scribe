// Configure your MongoDB backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Demo mode configuration
const DEMO_MODE = true; // Set to false when backend is ready
const DEMO_USER = {
  email: 'demo@filescribe.com',
  password: 'demo123',
  name: 'Demo User',
  id: 'demo-user-123'
};

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  userId: string;
}

// Demo data storage
const getDemoDocuments = (): Document[] => {
  const stored = localStorage.getItem('demo_documents');
  return stored ? JSON.parse(stored) : [];
};

const saveDemoDocuments = (docs: Document[]) => {
  localStorage.setItem('demo_documents', JSON.stringify(docs));
};

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (DEMO_MODE) {
      // Demo mode authentication
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const token = 'demo-token-' + Date.now();
        this.token = token;
        localStorage.setItem('auth_token', token);
        return {
          user: { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name },
          token
        };
      }
      throw new Error('Invalid credentials. Use demo@filescribe.com / demo123');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    if (DEMO_MODE) {
      throw new Error('Signup disabled in demo mode. Use demo@filescribe.com / demo123 to login');
    }

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) throw new Error('Signup failed');
    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getDocuments(search?: string, sortBy: 'name' | 'date' = 'date'): Promise<Document[]> {
    if (DEMO_MODE) {
      let docs = getDemoDocuments();
      
      // Filter by search
      if (search) {
        docs = docs.filter(doc => 
          doc.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Sort
      docs.sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
      
      return docs;
    }

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('sortBy', sortBy);
    
    const response = await fetch(`${API_BASE_URL}/documents?${params}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  }

  async uploadDocument(file: File): Promise<Document> {
    if (DEMO_MODE) {
      // Create a demo document
      const doc: Document = {
        id: 'doc-' + Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        userId: DEMO_USER.id
      };
      
      const docs = getDemoDocuments();
      docs.push(doc);
      saveDemoDocuments(docs);
      
      return doc;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }

  async deleteDocument(id: string): Promise<void> {
    if (DEMO_MODE) {
      const docs = getDemoDocuments();
      const filtered = docs.filter(doc => doc.id !== id);
      saveDemoDocuments(filtered);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) throw new Error('Delete failed');
  }

  async downloadDocument(id: string, name: string): Promise<void> {
    if (DEMO_MODE) {
      const docs = getDemoDocuments();
      const doc = docs.find(d => d.id === id);
      if (!doc) throw new Error('Document not found');
      
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = name;
      a.click();
      return;
    }

    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const api = new ApiClient();
