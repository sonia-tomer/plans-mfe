import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlansService } from '../services/plans.service';
import { PricingPlan, ShipmentDetails } from '../models/plan.model';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-pricing-plans',
  imports: [], // No imports needed - using built-in control flow
  templateUrl: './pricing-plans.html',
  styleUrl: './pricing-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class PricingPlans implements OnInit {
  private plansService = inject(PlansService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  // Using signals for reactive state - Angular 21 feature
  plans = signal<PricingPlan[]>([]);
  loading = signal(false);
  shipmentDetails = signal<ShipmentDetails>({
    weight: '500g',
    mode: 'Surface',
    payment: 'Prepaid',
    pickupPincode: '110001',
    deliveryPincode: '400059',
    orderValue: 1000
  });

  // Computed signals for derived state - more efficient
  currentPlan = computed(() => this.plans().find(p => p.isCurrentPlan) || null);
  recommendedPlan = computed(() => this.plans().find(p => p.isRecommended) || null);
  shipmentDetailsDisplay = computed(() => {
    const details = this.shipmentDetails();
    return `${details.weight} • ${details.mode} Mode • ${details.payment} • ${details.pickupPincode} → ${details.deliveryPincode}`;
  });

  ngOnInit(): void {
    console.log('PricingPlans component initialized');
    this.loadPlans();
  }

  loadPlans(): void {
    console.log('Loading plans...');
    this.loading.set(true);
    this.plansService.getPlans().subscribe({
      next: (plans) => {
        console.log('Plans loaded:', plans.length, 'plans');
        this.plans.set(plans);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  async openEditShipmentModal(): Promise<void> {
    const { EditSampleShipmentModal } = await import('../edit-sample-shipment-modal/edit-sample-shipment-modal');
    this.modalService.open(EditSampleShipmentModal, {
      shipmentDetails: { ...this.shipmentDetails() }
    }, '500px').subscribe((result) => {
      if (result) {
        this.shipmentDetails.set(result);
        this.cdr.markForCheck();
        this.recalculateCosts();
      }
    });
  }

  recalculateCosts(): void {
    const currentDetails = this.shipmentDetails();
    // Batch updates for better performance - parallel API calls
    const updates = this.plans().map(plan => 
      this.plansService.calculateShipmentCost(plan.id, currentDetails)
        .pipe(map(cost => ({ planId: plan.id, cost })))
    );
    
    // Use forkJoin for parallel execution
    forkJoin(updates).subscribe({
      next: (results) => {
        const updatedPlans = this.plans().map(p => {
          const update = results.find(r => r.planId === p.id);
          return update ? { ...p, avgShipmentCost: update.cost } : p;
        });
        this.plans.set(updatedPlans);
        this.cdr.markForCheck();
      }
    });
  }

  activatePlan(plan: PricingPlan): void {
    const current = this.currentPlan();
    if (current && this.isDowngrade(current, plan)) {
      this.openDowngradeConfirmation(plan);
    } else {
      this.confirmActivation(plan);
    }
  }

  isDowngrade(currentPlan: PricingPlan, newPlan: PricingPlan): boolean {
    return newPlan.price < currentPlan.price;
  }

  async openDowngradeConfirmation(plan: PricingPlan): Promise<void> {
    const current = this.currentPlan();
    if (!current) return;

    // Parallel API calls for better performance
    forkJoin({
      benefits: this.plansService.getPlanBenefits(current.id),
      effectiveDate: this.plansService.getDowngradeEffectiveDate()
    }).subscribe({
      next: ({ benefits, effectiveDate }) => {
        import('../downgrade-confirmation-modal/downgrade-confirmation-modal').then(({ DowngradeConfirmationModal }) => {
          this.modalService.open(DowngradeConfirmationModal, {
            targetPlan: plan,
            currentPlan: current,
            benefits,
            effectiveDate
          }, '600px').subscribe((confirmed) => {
            if (confirmed) {
              this.confirmActivation(plan);
            }
          });
        });
      }
    });
  }

  confirmActivation(plan: PricingPlan): void {
    this.loading.set(true);
    this.cdr.markForCheck();
    this.plansService.activatePlan({
      planId: plan.id,
      shipmentDetails: this.shipmentDetails()
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.openActivationSuccessModal(plan, response);
          this.loadPlans();
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error activating plan:', error);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  async openActivationSuccessModal(plan: PricingPlan, response: any): Promise<void> {
    const { PlanActivationSuccessModal } = await import('../plan-activation-success-modal/plan-activation-success-modal');
    this.modalService.open(PlanActivationSuccessModal, {
      plan: plan,
      billingCycleDate: response.billingCycleDate
    }, '600px');
  }

  async openContactSalesModal(): Promise<void> {
    const { ContactSalesFormModal } = await import('../contact-sales-form-modal/contact-sales-form-modal');
    this.modalService.open(ContactSalesFormModal, undefined, '600px');
  }

  async openZeroFeeOfferModal(milestone: number): Promise<void> {
    const { ZeroMonthlyFeeOfferModal } = await import('../zero-monthly-fee-offer-modal/zero-monthly-fee-offer-modal');
    this.modalService.open(ZeroMonthlyFeeOfferModal, { milestone }, '500px');
  }

  viewRateCard(plan: PricingPlan): void {
    console.log('View rate card for:', plan.name);
  }
}
