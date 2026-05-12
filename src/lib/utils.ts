import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API helper to include token
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jwt');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  }

  const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Something went wrong';
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.message) errorMessage = errorData.message;
    } catch {
      errorMessage = `Server Error: ${response.status} ${errorText.substring(0, 100)}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};
