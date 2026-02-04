import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cdn-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (iconUrl) {
      <img 
        [src]="iconUrl" 
        [alt]="name"
        [style.width]="widthStyle"
        [style.height]="heightStyle"
        [attr.width]="width"
        [attr.height]="height"
      />
    }
  `,
  styles: [`
    :host {
      display: inline-block;
      
      img {
        display: block;
        max-width: 100%;
        height: auto;
      }
    }
  `]
})
export class CdnIconComponent {
  @Input({ required: true }) name!: string;
  @Input() width: number | string = 20;
  @Input() height: number | string = 20;

  // Icon name to URL mapping
  private iconMap: Record<string, string> = {
    'edit-pen': 'https://sr-cdn-1.shiprocket.in/img/plan_Pricing_edit_pen_3feb26.svg',
    'green-tick': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-green-tick-2feb-2026.svg',
    'gift': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-gift-3feb2026.svg',
    'dot': 'https://sr-cdn-1.shiprocket.in/img/dot-plan-pricing-4feb26.png',
    'arrow-right': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-arrow-feb426.png',
    'close': 'https://sr-cdn-1.shiprocket.in/img/cross_plans_pricing_4feb26.svg',
    'warning': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-warning4feb26.png',
    'calculator' : 'https://sr-cdn-1.shiprocket.in/img/calculatorfeb426.svg',
    'green-filled' : 'https://sr-cdn-1.shiprocket.in/img/tick-filledfeb426.png',
    'recommended' :'https://sr-cdn-1.shiprocket.in/img/recomented_icon_planpricingfeb426.png'
  };

  get iconUrl(): string {
    return this.iconMap[this.name] || '';
  }

  get widthStyle(): string {
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }

  get heightStyle(): string {
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }
}

