import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ContactSalesForm } from '../models/plan.model';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';

export interface ContactSalesResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactSalesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly CONTACT_SALES_URL = `${API_BASE_URL}settings/plans/query-request`;

  submitContactForm(formData: ContactSalesForm): Observable<ContactSalesResponse> {
    const payload = {
      full_name: formData.fullName,
      email: formData.email,
      mobile: formData.phoneNumber,
      company_name: formData.companyName,
      website_url: formData.websiteUrl || '',
      monthly_shipment_volume: formData.monthlyShipmentVolume || '',
      current_shipping_provider: formData.currentShippingProvider || '',
      specific_requirement: formData.specificRequirements || '',
    };

    const headers = this.authService.getAuthHeaders(); 

    return this.http.post<any>(this.CONTACT_SALES_URL, payload, { headers }).pipe(
      map((response) => {
        const success: boolean = !!response?.status;
        const message: string =
          response?.message ||
          response?.data?.message ||
          'Thank you for your interest! Our sales team will contact you shortly.';
        return { success, message };
      }),
      catchError((error) => {
        console.error('Error submitting contact sales query:', error);
        const message: string =
          error?.error?.message ||
          error?.message ||
          'An error occurred while submitting your request.';
        return of({ success: false, message });
      })
    );
  }
}

