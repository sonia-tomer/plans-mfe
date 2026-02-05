import { Component, inject, OnInit } from '@angular/core';
import { PricingPlan, PlanBenefits } from '../models/plan.model';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-downgrade-confirmation-modal',
  imports: [], // No imports needed - using built-in control flow
  templateUrl: './downgrade-confirmation-modal.html',
  styleUrl: './downgrade-confirmation-modal.scss',
})
export class DowngradeConfirmationModal implements OnInit {
  private modalService = inject(ModalService);

  targetPlan?: PricingPlan;
  currentPlan?: PricingPlan | null;
  benefits: PlanBenefits[] = [];
  effectiveDate?: string;
  result?: boolean;

  ngOnInit(): void {
    // Get data from injected properties
    if ((this as any).targetPlan) {
      this.targetPlan = (this as any).targetPlan;
    }
    if ((this as any).currentPlan !== undefined) {
      this.currentPlan = (this as any).currentPlan;
    }
    if ((this as any).benefits) {
      this.benefits = (this as any).benefits;
    }
    if ((this as any).effectiveDate) {
      this.effectiveDate = (this as any).effectiveDate;
    }
  }

  onKeepCurrentPlan(): void {
    this.modalService.close(false);
  }

  onConfirmPlan(): void {
    this.modalService.close(true);
  }
}
