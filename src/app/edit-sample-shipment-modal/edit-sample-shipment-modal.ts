import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentDetails } from '../models/plan.model';
import { ModalService } from '../services/modal.service';
import { PlansService } from '../services/plans.service';
import { CdnIconComponent } from '../cdn-icons-images/getIcon/cdn-icon.component';

@Component({
  selector: 'app-edit-sample-shipment-modal',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdnIconComponent
  ],
  templateUrl: './edit-sample-shipment-modal.html',
  styleUrl: './edit-sample-shipment-modal.scss',
})
export class EditSampleShipmentModal implements OnInit {
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);
  private plansService = inject(PlansService);

  shipmentForm: FormGroup;
  weightOptions = ['500g', '1kg', '2kg'];
  modeOptions = ['Surface', 'Air'];
  paymentOptions = ['Prepaid', 'COD'];
  result?: ShipmentDetails;

  shipmentDetails?: ShipmentDetails;

  // Track async postcode validation state
  isCheckingPickupPostcode = false;
  isCheckingDeliveryPostcode = false;
  private lastValidatedPickupPostcode: string | null = null;
  private lastValidatedDeliveryPostcode: string | null = null;

  constructor() {
    this.shipmentForm = this.fb.group({
      weight: ['500g', Validators.required],
      mode: ['Surface', Validators.required],
      payment: ['Prepaid', Validators.required],
      pickupPincode: ['110001', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      deliveryPincode: ['400059', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    // Get data from injected properties (set by modal host)
    if ((this as any).shipmentDetails) {
      const details = (this as any).shipmentDetails;
      this.shipmentForm.patchValue({
        weight: details.weight,
        mode: details.mode,
        payment: details.payment,
        pickupPincode: details.pickupPincode,
        deliveryPincode: details.deliveryPincode
      });
    }
  }

  onCancel(): void {
    this.modalService.close();
  }

  onCalculate(): void {
    if (this.shipmentForm.valid) {
      const formValue = this.shipmentForm.value;
      const result = {
        weight: formValue.weight,
        mode: formValue.mode,
        payment: formValue.payment,
        pickupPincode: formValue.pickupPincode,
        deliveryPincode: formValue.deliveryPincode,
        orderValue: 1000
      };
      this.result = result;
      this.modalService.close(result);
    } else {
      Object.keys(this.shipmentForm.controls).forEach(key => {
        this.shipmentForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.shipmentForm.get(fieldName);
    if (control?.hasError('required')) {
      return `Enter ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
    if (control?.hasError('pattern')) {
      return 'Invalid pincode format';
    }
    if (control?.hasError('invalidPostcode')) {
      // Use the API error message if available, otherwise fallback to default
      const apiMessage = control.errors?.['postcodeMessage'];
      return apiMessage || 'Service not available for this pincode';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.shipmentForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isSelected(fieldName: string, value: string): boolean {
    return this.shipmentForm.get(fieldName)?.value === value;
  }

  /**
   * Restrict pincode fields to numeric characters only.
   */
  onPincodeKeypress(event: KeyboardEvent): void {
    const char = event.key;
    // Allow control keys (backspace, tab, arrows, etc.)
    if (char.length > 1) {
      return;
    }
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }

  /**
   * Normalise pasted/typed value to digits only and max length 6.
   */
  onPincodeInput(fieldName: 'pickupPincode' | 'deliveryPincode', event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value || '';
    value = value.replace(/\D/g, '').slice(0, 6);
    input.value = value;
    this.shipmentForm.get(fieldName)?.setValue(value, { emitEvent: false });

    // Only call postcode API once, when we have exactly 6 digits and value changed
    if (value.length === 6) {
      if (fieldName === 'pickupPincode') {
        if (this.lastValidatedPickupPostcode === value) return;
        this.lastValidatedPickupPostcode = value;
      } else {
        if (this.lastValidatedDeliveryPostcode === value) return;
        this.lastValidatedDeliveryPostcode = value;
      }
      this.validatePostcodeField(fieldName, value);
    }
  }

  /**
   * Call API to validate postcode for a specific field.
   */
  private validatePostcodeField(fieldName: 'pickupPincode' | 'deliveryPincode', value: string): void {
    const control = this.shipmentForm.get(fieldName);
    if (!control) return;

    if (fieldName === 'pickupPincode') {
      this.isCheckingPickupPostcode = true;
    } else {
      this.isCheckingDeliveryPostcode = true;
    }

    this.plansService.validatePostcode(value).subscribe((result) => {
      const currentErrors = control.errors || {};

      if (!result.valid) {
        // Store the API error message in the error object
        control.setErrors({ 
          ...currentErrors, 
          invalidPostcode: true,
          postcodeMessage: result.message || 'Service not available for this pincode'
        });
      } else if (currentErrors['invalidPostcode']) {
        delete currentErrors['invalidPostcode'];
        delete currentErrors['postcodeMessage'];
        const hasOtherErrors = Object.keys(currentErrors).length > 0;
        control.setErrors(hasOtherErrors ? currentErrors : null);
      }

      if (fieldName === 'pickupPincode') {
        this.isCheckingPickupPostcode = false;
      } else {
        this.isCheckingDeliveryPostcode = false;
      }
    });
  }

}
