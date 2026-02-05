import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdnIconComponent } from '../../cdn-icons-images/getIcon/cdn-icon.component';

interface IntegrationCard {
  icon: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-integration-section',
  standalone: true,
  imports: [CdnIconComponent],
  templateUrl: './integration-section.html',
  styleUrl: './integration-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationSection {
  // Integration cards data
  integrationCards: IntegrationCard[] = [
    // Row 1
    { icon: 'plan_pricing_integration_1', width :26 ,height :32, title: 'Cargo Shipping', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' ,},
    { icon: 'plan_pricing_integration_2', width :26 ,height :32, title: 'Instant Deliveries', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_3', width :26 ,height :32, title: 'Domestic Shipping', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    // Row 2
    { icon: 'plan_pricing_integration_4', width :26 ,height :32, title: 'Warehousing', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_5', width :26 ,height :32, title: 'International Parcels', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_6', width :26 ,height :32, title: 'International Cargo', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    // Row 3
    { icon: 'plan_pricing_integration_7', width :26 ,height :32, title: 'Brand Launch', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_8', width :26 ,height :32, title: 'Checkout', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_9', width :26 ,height :32, title: 'Whatsapp Solutions', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    // Row 4
    { icon: 'plan_pricing_integration_10', width :26 ,height :32, title: 'Marketing', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_11', width :26 ,height :32, title: 'Trends', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_12', width :26 ,height :32, title: 'Business Loan', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    // Row 5
    { icon: 'plan_pricing_integration_13', width :26 ,height :32, title: 'Credit Score', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
    { icon: 'plan_pricing_integration_14', width :26 ,height :32, title: 'Omnichannel', description: 'Easily manage your order flow end-to-end, from confirming new orders to preparing them for dispatch.' },
  ];

  // Helper method to get cards for a specific row
  getRowCards(rowIndex: number): IntegrationCard[] {
    const cardsPerRow = [3, 3, 3, 3, 2];
    const startIndex = cardsPerRow.slice(0, rowIndex).reduce((sum, count) => sum + count, 0);
    const endIndex = startIndex + cardsPerRow[rowIndex];
    return this.integrationCards.slice(startIndex, endIndex);
  }
}

