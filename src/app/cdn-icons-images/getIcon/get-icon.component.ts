import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-icon.component.html',
  styleUrl: './get-icon.component.scss'
})
export class GetIconComponent {
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

