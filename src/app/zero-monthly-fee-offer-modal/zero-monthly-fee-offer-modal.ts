import { Component, inject, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { CdnIconComponent } from '../cdn-icons-images/getIcon/cdn-icon.component';

@Component({
  selector: 'app-zero-monthly-fee-offer-modal',
  imports: [CdnIconComponent],
  templateUrl: './zero-monthly-fee-offer-modal.html',
  styleUrl: './zero-monthly-fee-offer-modal.scss',
})
export class ZeroMonthlyFeeOfferModal implements OnInit {
  private modalService = inject(ModalService);

  milestone?: number;

  ngOnInit(): void {
    // Get data from injected properties
    if ((this as any).milestone) {
      this.milestone = (this as any).milestone;
    }
  }

  onClose(): void {
    this.modalService.close();
  }
}
