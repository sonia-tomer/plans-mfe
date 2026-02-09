export interface PlanFeature {
  icon: string; // e.g., "Check", "warning"
  text: string;
}

export interface PlanMilestoneMatrix {
  headingHtml: string;
  offerDetailsLabel: string;
  offerDetailsHtml: string;
  tnc: PlanFeature[];
  targetedShipmentCountPerMonth?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  // Product id used for subscription/mandate initiation (whmcs_product_id)
  productId?: number;
  price: number;
  priceDisplay: string; // e.g., "FREE" or "₹199/month"
  description: string; // e.g., "Ideal for shipping upto 5 orders monthly"
  avgShipmentCost: number;
  features: PlanFeature[]; // Changed from string[] to PlanFeature[]
  isCurrentPlan: boolean;
  isRecommended: boolean;
  nextRenewalDate?: string;
  shippingMilestone?: number; // e.g., 100, 500, 1000 for plan fee refund
  milestoneMatrix?: PlanMilestoneMatrix; // used to render the gift card + popup
  orderRange: {
    min: number;
    max: number;
  };
}

export interface ShipmentDetails {
  weight: '500g' | '1kg' | '2kg';
  mode: 'Surface' | 'Air';
  payment: 'Prepaid' | 'COD';
  pickupPincode: string;
  deliveryPincode: string;
  orderValue?: number;
}

export interface PlanActivationRequest {
  planId: string;
  shipmentDetails?: ShipmentDetails;
  planFeedback?: string;
}

export interface PlanActivationResponse {
  success: boolean;
  message: string;
  billingCycleDate?: string;
  planName?: string;
}

export interface ContactSalesForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  websiteUrl?: string;
  monthlyShipmentVolume?: string;
  currentShippingProvider?: string;
  specificRequirements?: string;
}

export interface PlanBenefits {
  title: string;
  description: string;
}

// API Response Interfaces
export interface PlansApiResponse {
  [key: string]: PlanApiData[] | string | boolean | undefined;
  // Numeric keys contain plan arrays (e.g., "0": PlanApiData[])
  billingCycle?: string;
  blackBoxOptIn?: string;
  srActive?: string;
}

export interface PlanApiData {
  id: number;
  score?: number;
  whmcs_product_id?: string;
  name: string;
  restrictions?: PlanRestrictions;
  is_active?: boolean;
  selected?: boolean;
  planType?: string;
  pricing?: PlanPricing;
}

export interface PlanRestrictions {
  skus?: number;
  vendors?: string;
  accounts?: number;
  channels?: number;
  locations?: number;
  statement?: number;
  bulk_shipping?: number;
  automatic_sync?: number;
  weight_dispute?: number;
  blocked_couriers?: number[];
  blocked_cargo?: number[];
  mandate_properties?: MandateProperties;
  new_assignment_enable_couriers?: number[];
}

export interface MandateProperties {
  amount?: number;
  // API sometimes returns "" instead of an object
  milestone_matrix?: MilestoneMatrix | '';
  service_includes?: ServiceIncludes;
  recommended_plan_id?: number | null;
  recommendation_matrix?: RecommendationMatrix;
}

export interface MilestoneMatrix {
  html?: {
    tnc?: TncItem[];
    heading?: HtmlItem;
    description?: HtmlItem;
  };
  targeted_shipment_count_per_month?: number;
}

export interface TncItem {
  icon?: string;
  text?: string;
  details?: string;
}

export interface HtmlItem {
  icon?: string;
  text?: string;
  details?: string;
}

export interface ServiceIncludes {
  html?: {
    heading?: HtmlItem;
    checklist?: ChecklistItem[];
  };
}

export interface ChecklistItem {
  icon?: string;
  text?: string;
  details?: string;
}

export interface RecommendationMatrix {
  html?: {
    icon?: string;
    text?: string;
    details?: string;
  };
}

export interface PlanPricing {
  whmcs_product_id?: number;
  prices?: PriceItem[];
}

export interface PriceItem {
  price?: number;
  billing_cycle?: string;
  slug?: string;
  discount?: number;
  original_price?: number;
}

