import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Get authorization token from localStorage
   * In a microfrontend, this should be passed from the shell app or stored in a shared location
   */
  getToken(): string | null {
    // Try to get token from localStorage (for development/testing)
    // In production, this should be passed from the shell app
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('satellizer_token');
    }
    return null;
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }

    // Add role-type if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const roleType = localStorage.getItem('role_type');
      if (roleType) {
        headers['role-type'] = roleType;
      }
    }

    return new HttpHeaders(headers);
  }
}

