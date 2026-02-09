import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { PlansService } from '../services/plans.service';
import { PricingPlan, ShipmentDetails, PlanBenefits, PlanActivationResponse } from '../models/plan.model';
import { EditSampleShipmentModal } from '../edit-sample-shipment-modal/edit-sample-shipment-modal';
import { PlanActivationSuccessModal } from '../plan-activation-success-modal/plan-activation-success-modal';
import { DowngradeConfirmationModal } from '../downgrade-confirmation-modal/downgrade-confirmation-modal';
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
export class PricingPlans implements OnInit, OnDestroy {
  private plansService = inject(PlansService);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  // Track modal subscriptions to prevent leaks
  private editShipmentModalSubscription?: Subscription;

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

  // Computed signals for derived state - used for logic only
  currentPlan = computed(() => this.plans().find(p => p.isCurrentPlan) || null);
  recommendedPlan = computed(() => this.plans().find(p => p.isRecommended) || null);

  // Static background image URLs computed once for better perf
  readonly planPricingBgUrl = `url(${getImage('plan-pricing-bg')})`;
  readonly largeBusinessBgUrl = `url(${getImage('large-business-section-bg')})`;
  readonly calculatorBgUrl = `url(${getImage('calculator-bg')})`;

  User= JSON.parse(localStorage.getItem('ngStorage-USER') || '{}');
  renewalDate = this.User?.renewal_date;
  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.plansService.getPlans().subscribe({
      next: (plans: PricingPlan[]) => {
        this.plans.set(plans);
        this.loading.set(false);
        // Call rate serviceability API in parallel for current shipment details.
        // We'll log the response for now; binding to avgShipmentCost will be decided from the response shape.
        this.fetchRateServiceability();
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading plans:', error);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private fetchRateServiceability(): void {
    const details = this.shipmentDetails();
    this.plansService.getRateServiceability(details).subscribe((response) => {
      if (!response || !response.data || !response.data.rates) {
        console.warn('Rate serviceability response missing rates:', response);
        return;
      }

      const rates = response.data.rates as Record<string, any>;

      const updatedPlans = this.plans().map((plan) => {
        const planRate = rates[plan.name];
        const surfaceZoneA = planRate?.surface?.zone_a;
        const minStr = surfaceZoneA?.min as string | undefined;

        if (!minStr || minStr === 'NA') {
          return plan;
        }

        const cost = Number(minStr);
        if (!Number.isFinite(cost)) {
          return plan;
        }

        return {
          ...plan,
          avgShipmentCost: Math.round(cost),
        };
      });

      this.plans.set(updatedPlans);
      this.cdr.markForCheck();
    });
  }

  openEditShipmentModal(): void {
    // Unsubscribe from previous subscription if it exists
    if (this.editShipmentModalSubscription) {
      this.editShipmentModalSubscription.unsubscribe();
    }

    // Create new subscription and track it
    this.editShipmentModalSubscription = this.modalService.open(EditSampleShipmentModal, {
      shipmentDetails: { ...this.shipmentDetails() }
    }, '500px').subscribe((result: ShipmentDetails | undefined) => {
      if (result) {
        // Temporary state - not stored, just for calculation
        this.shipmentDetails.set(result);
        this.recalculateCosts();
      }
      // Clean up subscription after it completes
      this.editShipmentModalSubscription = undefined;
    });
  }

  recalculateCosts(): void {
    // User has updated shipment details in the modal; call rate serviceability API
    // again with the new details and update avgShipmentCost for all plans.
    this.fetchRateServiceability();
  }

  activatePlan(plan: PricingPlan): void {
    const current = this.currentPlan();
    if (current && this.isDowngrade(current, plan)) {
      // Downgrade flow: show confirmation, then for paid target plans go straight to QR (skip intro).
      this.openDowngradeConfirmation(plan);
    } else {
      // Normal/upgrade flow
      this.startPlanActivation(plan, false);
    }
  }

  isDowngrade(currentPlan: PricingPlan, newPlan: PricingPlan): boolean {
    // Treat as downgrade when current activated plan id is greater than the target plan id
    const currentId = Number(currentPlan.id);
    const newId = Number(newPlan.id);

    if (Number.isFinite(currentId) && Number.isFinite(newId)) {
      return currentId > newId;
    }

    // Fallback: if ids are not numeric, do not treat as downgrade
    return false;
  }

  openDowngradeConfirmation(plan: PricingPlan): void {
    const current = this.currentPlan();
    if (!current) return;

    this.plansService.getPlanBenefits(current.id).subscribe({
      next: (benefits: PlanBenefits[]) => {
        this.plansService.getDowngradeEffectiveDate().subscribe({
          next: (effectiveDate: string) => {
            this.modalService
              .open(
                DowngradeConfirmationModal,
                {
                  targetPlan: plan,
                  currentPlan: current,
                  benefits: benefits,
                  effectiveDate: effectiveDate,
                },
                '600px'
              )
              .subscribe((confirmed: boolean) => {
                if (confirmed) {
                  // Coming from downgrade confirmation
                  this.startPlanActivation(plan, true);
                }
              });
          }
        });
      }
    });
  }

  /**
   * Decide how to activate a plan:
   * - For free plans (price === 0, e.g. Lite), call upgrade API directly (no mandate / QR popup).
   * - For paid plans, open the subscription dialog to handle mandate + payment.
   *   - If coming from downgrade flow, skip intro and jump to QR.
   */
  private startPlanActivation(plan: PricingPlan, fromDowngrade: boolean): void {
    if (plan.price === 0) {
      // Lite / free plans: no need for mandate flow, directly call upgrade API.
      this.executePlanActivation(plan);
    } else {
      // Paid plans: go through subscription dialog (UPI mandate + QR).
      this.confirmActivation(plan, fromDowngrade);
    }
  }

  confirmActivation(plan: PricingPlan, fromDowngrade: boolean = false): void {
    // Open lightweight subscription dialog (local copy of SR_Web subscription popup).
    // Loaded lazily so it doesn't bloat the initial bundle.
    (async () => {
      const { SubscriptionDialogModal } = await import(
        '../subscription-dialog-modal/subscription-dialog-modal'
      );
      const current = this.currentPlan();
      this.modalService
        .open(
          SubscriptionDialogModal,
          {
            plan,
            currentPlan: current,
            autoStartMandate: fromDowngrade, // when true, modal should skip intro and show QR directly
          },
          '700px'
        )
        .subscribe((result: 'upgrade' | 'cancel' | undefined) => {
          if (result === 'upgrade') {
            this.executePlanActivation(plan);
          }
        });
    })();
  }

  /**
   * Actual activation flow (API call + success modal + reload).
   * Called either directly or after shell reports subscription success.
   */
  private executePlanActivation(plan: PricingPlan): void {
    this.loading.set(true);
    this.cdr.markForCheck();

    this.plansService
      .activatePlan({
        planId: plan.id,
        shipmentDetails: this.shipmentDetails(),
      })
      .subscribe({
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
        },
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
    const url = `/tools/ratecard/forward?courier_type=domestic&plan_id=${plan.id}`;
    window.location.href = url;
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

  ngOnDestroy(): void {
    // Clean up subscriptions on component destruction
    if (this.editShipmentModalSubscription) {
      this.editShipmentModalSubscription.unsubscribe();
    }
  }
}
