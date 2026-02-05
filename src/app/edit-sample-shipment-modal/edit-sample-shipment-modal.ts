import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentDetails } from '../models/plan.model';
import { ModalService } from '../services/modal.service';
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

  shipmentForm: FormGroup;
  weightOptions = ['500g', '1kg', '2kg'];
  modeOptions = ['Surface', 'Air'];
  paymentOptions = ['Prepaid', 'COD'];
  result?: ShipmentDetails;

  shipmentDetails?: ShipmentDetails;

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
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.shipmentForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isSelected(fieldName: string, value: string): boolean {
    return this.shipmentForm.get(fieldName)?.value === value;
  }
}
