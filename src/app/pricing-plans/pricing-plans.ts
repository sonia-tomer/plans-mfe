import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PlansService } from '../services/plans.service';
import { PricingPlan, ShipmentDetails, PlanBenefits, PlanActivationResponse } from '../models/plan.model';
import { EditSampleShipmentModal } from '../edit-sample-shipment-modal/edit-sample-shipment-modal';
import { PlanActivationSuccessModal } from '../plan-activation-success-modal/plan-activation-success-modal';
import { DowngradeConfirmationModal } from '../downgrade-confirmation-modal/downgrade-confirmation-modal';
import { ContactSalesFormModal } from '../contact-sales-form-modal/contact-sales-form-modal';
import { ZeroMonthlyFeeOfferModal } from '../zero-monthly-fee-offer-modal/zero-monthly-fee-offer-modal';
import { ModalService } from '../services/modal.service';
import { getImage } from '../cdn-icons-images/getImage/getImage';
import { CdnIconComponent } from '../cdn-icons-images/getIcon/cdn-icon.component';
import { FeaturesSection } from './features-section/features-section';
import { IntegrationSection } from './integration-section/integration-section';
@Component({
  selector: 'app-pricing-plans',
  imports: [CdnIconComponent, FeaturesSection, IntegrationSection], // Import CdnIconComponent for icons, FeaturesSection, and IntegrationSection
  templateUrl: './pricing-plans.html',
  styleUrl: './pricing-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricingPlans implements OnInit {
  private plansService = inject(PlansService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

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

  // Shipment details as array for display with dots
  shipmentDetailsArray = computed(() => {
    const details = this.shipmentDetails();
    return [
      `Based on ${details.weight} ${details.payment.toLowerCase()} ${details.mode.toLowerCase()} shipment`,
      details.pickupPincode,
      details.deliveryPincode
    ];
  });

  ngOnInit(): void {
    console.log('✅ PricingPlans component initialized');
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.plansService.getPlans().subscribe({
      next: (plans: PricingPlan[]) => {
        this.plans.set(plans);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading plans:', error);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  openEditShipmentModal(): void {
    this.modalService.open(EditSampleShipmentModal, {
      shipmentDetails: { ...this.shipmentDetails() }
    }, '500px').subscribe((result: ShipmentDetails | undefined) => {
      if (result) {
        // Temporary state - not stored, just for calculation
        this.shipmentDetails.set(result);
        this.recalculateCosts();
      }
    });
  }

  recalculateCosts(): void {
    // Recalculate average shipment costs for all plans
    const currentDetails = this.shipmentDetails();
    this.plans().forEach(plan => {
      this.plansService.calculateShipmentCost(plan.id, currentDetails).subscribe({
        next: (cost: number) => {
          // Update plan in signal
          const updatedPlans = this.plans().map(p => 
            p.id === plan.id ? { ...p, avgShipmentCost: cost } : p
          );
          this.plans.set(updatedPlans);
          this.cdr.markForCheck();
        }
      });
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
    // Compare plan tiers - lower price means downgrade
    return newPlan.price < currentPlan.price;
  }

  openDowngradeConfirmation(plan: PricingPlan): void {
    const current = this.currentPlan();
    if (!current) return;

    this.plansService.getPlanBenefits(current.id).subscribe({
      next: (benefits: PlanBenefits[]) => {
        this.plansService.getDowngradeEffectiveDate().subscribe({
          next: (effectiveDate: string) => {
            this.modalService.open(DowngradeConfirmationModal, {
              targetPlan: plan,
              currentPlan: current,
              benefits: benefits,
              effectiveDate: effectiveDate
            }, '600px').subscribe((confirmed: boolean) => {
              if (confirmed) {
                this.confirmActivation(plan);
              }
            });
          }
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
      next: (response: PlanActivationResponse) => {
        this.loading.set(false);
        if (response.success) {
          this.openActivationSuccessModal(plan, response);
          this.loadPlans(); // Reload to get updated current plan
        }
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error activating plan:', error);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  openActivationSuccessModal(plan: PricingPlan, response: PlanActivationResponse): void {
    this.modalService.open(PlanActivationSuccessModal, {
      plan: plan,
      billingCycleDate: response.billingCycleDate
    }, '600px');
  }

  async openContactSalesModal(): Promise<void> {
    const { ContactSalesFormModal } = await import('../contact-sales-form-modal/contact-sales-form-modal');
    this.modalService.open(ContactSalesFormModal, undefined, '754px');
  }

  openZeroFeeOfferModal(plan: PricingPlan): void {
    if (!plan.milestoneMatrix) return;
    this.modalService.open(
      ZeroMonthlyFeeOfferModal,
      {
        planName: plan.name,
        milestoneMatrix: plan.milestoneMatrix,
      },
      '500px'
    );
  }

  viewRateCard(plan: PricingPlan): void {
    // TODO: Implement rate card view
    console.log('View rate card for:', plan.name);
  }

  getImage(name: string): string {
    return getImage(name);
  }

  /**
   * Sanitize HTML content for safe rendering
   */
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }
}
