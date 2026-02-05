import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ContactSalesForm } from '../models/plan.model';

export interface ContactSalesResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactSalesService {
  private http = inject(HttpClient);

  submitContactForm(formData: ContactSalesForm): Observable<ContactSalesResponse> {
    // Mock submission - replace with actual API call
    const response: ContactSalesResponse = {
      success: true,
      message: 'Thank you for your interest! Our sales team will contact you shortly.'
    };
    
    return of(response).pipe(delay(1000));
  }
}

