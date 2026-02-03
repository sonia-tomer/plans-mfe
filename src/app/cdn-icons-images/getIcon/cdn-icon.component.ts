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
    'gift': 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-gift-3feb2026.svg'
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

