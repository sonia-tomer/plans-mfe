import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactSalesService } from '../services/contact-sales.service';
import { ModalService } from '../services/modal.service';
import { CdnIconComponent } from '../cdn-icons-images/getIcon/cdn-icon.component';

@Component({
  selector: 'app-contact-sales-form-modal',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdnIconComponent
  ],
  templateUrl: './contact-sales-form-modal.html',
  styleUrl: './contact-sales-form-modal.scss',
})
export class ContactSalesFormModal {
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);
  private contactSalesService = inject(ContactSalesService);

  contactForm: FormGroup;
  loading = false;
  characterCount = 0;
  maxCharacters = 500;

  shippingProviders = [
    'Delhivery',
    'Blue Dart',
    'FedEx',
    'DTDC',
    'Xpressbees',
    'Other'
  ];

  monthlyShipmentVolumeOptions = [
    '0-100',
    '101-500',
    '501-1000',
    '1001-5000',
    '5000+'
  ];

  constructor() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      companyName: ['', [Validators.required]],
      websiteUrl: [''],
      monthlyShipmentVolume: ['', [Validators.required]],
      currentShippingProvider: [''],
      specificRequirements: ['']
    });

    this.contactForm.get('specificRequirements')?.valueChanges.subscribe(value => {
      this.characterCount = value?.length || 0;
    });
  }

  onCancel(): void {
    this.modalService.close();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading = true;
      this.contactSalesService.submitContactForm(this.contactForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            alert(response.message);
            this.modalService.close();
          }
        },
        error: (error) => {
          console.error('Error submitting form:', error);
          this.loading = false;
          alert('An error occurred. Please try again.');
        }
      });
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid phone number';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
