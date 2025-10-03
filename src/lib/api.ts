// Configure your MongoDB backend URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) throw new Error('Delete failed');
  }

  async downloadDocument(id: string, name: string): Promise<void> {
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
