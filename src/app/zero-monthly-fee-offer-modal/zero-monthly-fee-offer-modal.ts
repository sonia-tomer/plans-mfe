import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from '../services/modal.service';
import { CdnIconComponent } from '../cdn-icons-images/getIcon/cdn-icon.component';
import { PlanMilestoneMatrix } from '../models/plan.model';

@Component({
  selector: 'app-zero-monthly-fee-offer-modal',
  imports: [CdnIconComponent],
  templateUrl: './zero-monthly-fee-offer-modal.html',
  styleUrl: './zero-monthly-fee-offer-modal.scss',
})
export class ZeroMonthlyFeeOfferModal {
  private modalService = inject(ModalService);
  private sanitizer = inject(DomSanitizer);
  
  // set by modal host
  planName: string = '';
  milestoneMatrix?: PlanMilestoneMatrix;

  onClose(): void {
    this.modalService.close();
  }

  safeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  getTncIconUrl(icon?: string): string | null {
    const key = (icon || '').toLowerCase();
    if (key === 'check') {
      return 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-green-tick-2feb-2026.svg';
    }
    if (key === 'warning') {
      return 'https://sr-cdn-1.shiprocket.in/img/plan-pricing-warning4feb26.png';
    }
    return null;
  }
}
