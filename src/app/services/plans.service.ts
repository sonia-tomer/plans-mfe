import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { PricingPlan, ShipmentDetails, PlanActivationRequest, PlanActivationResponse, PlanBenefits, PlansApiResponse, PlanApiData, PlanFeature, PlanMilestoneMatrix } from '../models/plan.model';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private readonly PLANS_API_BASE_URL = `${API_BASE_URL}settings/plans`;
  private readonly RATE_API_URL = 'https://serviceability.shiprocket.in/open/courier/serviceability';

  /**
   * Get all plans from API
   * Uses Angular 21 withFetch() for better performance
   */
  getPlans(): Observable<PricingPlan[]> {
    const url = `${this.PLANS_API_BASE_URL}/allPlansDetails`;
    const params = new HttpParams().set('is_web', '1');
    const headers = this.authService.getAuthHeaders();

    return this.http.get<PlansApiResponse>(url, { headers, params }).pipe(
      map((response) => this.mapApiResponseToPlans(response)),
      catchError((error) => {
        console.error('Error fetching plans from API:', error);
        // Return empty array on error
        return of([]);
      })
    );
  }

  /**
   * Call open serviceability API to get courier serviceability / rate info
   * Used to derive avgShipmentCost in UI (response mapping to be decided).
   */
  getRateServiceability(details: ShipmentDetails): Observable<any> {
    // Use user-provided shipment details to build dynamic params
    const weightKg = this.mapWeightToKg(details.weight);
    const isCod = details.payment.toLowerCase() === 'cod' ? '1' : '0';

    const params = new HttpParams()
      .set('pickup_postcode', details.pickupPincode)
      .set('delivery_postcode', details.deliveryPincode)
      .set('weight', String(weightKg))
      .set('cod', isCod)
      .set('declared_value', String(details.orderValue ?? ''))
      // Use sensible defaults for dimensions if not provided; API expects them but
      // they don't affect the relative comparison much for this sample calculator.
      .set('breadth', '10')
      .set('length', '10')
      .set('height', '10');

    // Open API: no auth token required
    const headers = {
      accept: '*/*',
    };

    return this.http.get<any>(this.RATE_API_URL, { params, headers }).pipe(
      catchError((error) => {
        console.error('Error fetching rate serviceability:', error);
        return of(null);
      })
    );
  }

  private mapWeightToKg(weight: ShipmentDetails['weight']): number {
    switch (weight) {
      case '500g':
        return 0.5;
      case '1kg':
        return 1;
      case '2kg':
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Map API response to PricingPlan array
   */
  private mapApiResponseToPlans(response: PlansApiResponse): PricingPlan[] {
    // The API returns plans in a numeric key (e.g., "0": [...])
    const plansArray: PlanApiData[] = [];
    
    // Find the array of plans in the response
    for (const key in response) {
      if (key !== 'billingCycle' && key !== 'blackBoxOptIn' && key !== 'srActive') {
        const value = response[key];
        if (Array.isArray(value)) {
          plansArray.push(...value as PlanApiData[]);
          break; // Found the plans array
        }
      }
    }

    if (plansArray.length === 0) {
      console.warn('No plans found in API response');
      return [];
    }

    // recommended_plan_id is provided inside mandate_properties. If it's null/undefined, don't show the flag.
    const recommendedPlanId = this.getRecommendedPlanId(plansArray);

    return plansArray.map((plan: PlanApiData) =>
      this.mapPlanDataToPricingPlan(plan, recommendedPlanId)
    );
  }

  private getRecommendedPlanId(plans: PlanApiData[]): string | null {
    for (const p of plans) {
      const id = p.restrictions?.mandate_properties?.recommended_plan_id;
      if (typeof id === 'number') return String(id);
    }
    return null;
  }

  /**
   * Map single plan API data to PricingPlan interface
   * Only extracts fields that are actually used in the HTML template
   */
  private mapPlanDataToPricingPlan(plan: PlanApiData, recommendedPlanId: string | null): PricingPlan {
    // Fields used in HTML: plan.id, plan.name, plan.priceDisplay, plan.description, 
    // plan.avgShipmentCost, plan.features[], plan.isCurrentPlan, plan.isRecommended,
    // plan.shippingMilestone, plan.nextRenewalDate
    
    const planId = String(plan.id || '');
    
    // Use API name directly (e.g., "Business Plan") - used in: {{ plan.name }}
    const planName = plan.name || 'Unknown';
    
    // Get price from mandate_properties.amount - used in: {{ plan.priceDisplay }}
    const price = plan.restrictions?.mandate_properties?.amount || 0;
    const priceDisplay = price === 0 ? 'FREE' : `₹${price}/month`;

    // Extract features from service_includes.html.checklist - used in: @for (feature of plan.features)
    const features: PlanFeature[] = [];
    const checklist = plan.restrictions?.mandate_properties?.service_includes?.html?.checklist || [];
    checklist.forEach((item) => {
      if (item.text) {
        const iconMap: Record<string, string> = {
          'Check': 'green-tick',
          'warning': 'warning',
          'CardGiftcard': 'gift'
        };
        features.push({
          icon: iconMap[item.icon || 'Check'] || 'green-tick',
          text: item.text
        });
      }
    });

    // Get description from recommendation_matrix.html.text - used in: [innerHTML]="plan.description"
    // Keep HTML tags as it will be rendered as HTML content
    const recommendationText = plan.restrictions?.mandate_properties?.recommendation_matrix?.html?.text || '';
    const description = recommendationText.trim() || '';

    // Milestone matrix (gift card + popup). API may return "".
    const milestoneMatrixRaw = plan.restrictions?.mandate_properties?.milestone_matrix;
    const milestoneMatrix = this.mapMilestoneMatrix(milestoneMatrixRaw);
    const shippingMilestone = milestoneMatrix?.targetedShipmentCountPerMonth;

    // Determine if recommended - used in: @if (plan.isRecommended)
    // Use API key recommended_plan_id: if null/undefined, no flag should be shown.
    const isRecommended = !!(recommendedPlanId && planId === recommendedPlanId);

    // Average shipment cost - used in: {{ plan.avgShipmentCost }} (calculated separately)
    const avgShipmentCost = 0;

    // Current plan - used in: @if (plan.isCurrentPlan) and [class.pricing-plan-card-current]
    const isCurrentPlan = plan.selected || false;

    return {
      id: planId,
      name: planName,
      productId: plan.pricing?.whmcs_product_id,
      price: price,
      priceDisplay: priceDisplay,
      description: description,
      avgShipmentCost: avgShipmentCost,
      features: features,
      isCurrentPlan: isCurrentPlan,
      isRecommended: isRecommended,
      nextRenewalDate: undefined, // Used in: @if (plan.nextRenewalDate) but not in API
      shippingMilestone: shippingMilestone,
      milestoneMatrix: milestoneMatrix,
      orderRange: { min: 0, max: Infinity } // Not used in HTML, but required by interface
    };
  }

  private mapMilestoneMatrix(raw: unknown): PlanMilestoneMatrix | undefined {
    if (!raw || raw === '' || typeof raw !== 'object') return undefined;

    const mm: any = raw;
    const html = mm.html;
    if (!html || typeof html !== 'object') return undefined;

    const headingHtml = html.heading?.text ?? '';
    const offerDetailsLabel = html.description?.text ?? 'Offer Details';
    const offerDetailsHtml = html.description?.details ?? '';
    const targeted = mm.targeted_shipment_count_per_month;

    const tncRaw: any[] = Array.isArray(html.tnc) ? html.tnc : [];
    // Keep original API icon keys (ex: "Check", "warning") so UI can decide how to render.
    const tnc: PlanFeature[] = tncRaw
      .map((x) => ({
        icon: String(x?.icon ?? '').trim(),
        text: String(x?.text ?? '').trim(),
      }))
      .filter((x) => x.text.length > 0);

    // If there's no meaningful content, treat as absent so UI hides the card.
    const hasContent =
      String(headingHtml).trim().length > 0 ||
      String(offerDetailsHtml).trim().length > 0 ||
      tnc.length > 0;
    if (!hasContent) return undefined;

    return {
      headingHtml: String(headingHtml),
      offerDetailsLabel: String(offerDetailsLabel || 'Offer Details'),
      offerDetailsHtml: String(offerDetailsHtml),
      tnc,
      targetedShipmentCountPerMonth: typeof targeted === 'number' ? targeted : undefined,
    };
  }



  calculateShipmentCost(planId: string, details: ShipmentDetails): Observable<number> {
    // Mock calculation - replace with actual API call
    const baseCost = 50;
    const weightMultiplier = details.weight === '500g' ? 1 : details.weight === '1kg' ? 1.2 : 1.5;
    const modeMultiplier = details.mode === 'Air' ? 1.3 : 1;
    const paymentMultiplier = details.payment === 'COD' ? 1.1 : 1;
    
    const cost = baseCost * weightMultiplier * modeMultiplier * paymentMultiplier;
    
    // Apply plan discount
    const planDiscounts: Record<string, number> = {
      'free': 0,
      'starter': 0.05,
      'professional': 0.10,
      'enterprise': 0.15
    };
    
    const discount = planDiscounts[planId] || 0;
    const finalCost = cost * (1 - discount);
    
    return of(Math.round(finalCost)).pipe(delay(300));
  }

  activatePlan(request: PlanActivationRequest): Observable<PlanActivationResponse> {
    // Mock activation - replace with actual API call
    const response: PlanActivationResponse = {
      success: true,
      message: 'Plan activated successfully',
      billingCycleDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      planName: request.planId
    };
    
    return of(response).pipe(delay(800));
  }

  getPlanBenefits(planId: string): Observable<PlanBenefits[]> {
    // Mock benefits - replace with actual API call
    const benefits: PlanBenefits[] = [
      {
        title: 'Priority Support',
        description: 'Get faster response times for your queries'
      },
      {
        title: 'Advanced Analytics',
        description: 'Access detailed shipping analytics and reports'
      },
      {
        title: 'API Access',
        description: 'Integrate with your existing systems'
      }
    ];
    
    return of(benefits).pipe(delay(300));
  }

  getDowngradeEffectiveDate(): Observable<string> {
    // Mock date - replace with actual API call
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1); // First day of next month
    return of(date.toISOString().split('T')[0]).pipe(delay(200));
  }
}

