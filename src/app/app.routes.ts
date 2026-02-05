import { Routes } from '@angular/router';
import { PricingPlans } from './pricing-plans/pricing-plans';

export const routes: Routes = [
  {
    path: '',
    component: PricingPlans
  },
  {
    path: 'plans',
    component: PricingPlans
  }
];
