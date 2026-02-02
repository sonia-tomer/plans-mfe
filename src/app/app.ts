import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalHostComponent } from './shared/components/modal-host/modal-host.component';

@Component({
  selector: 'plans-mfe-root', // Changed for Web Component registration
  imports: [RouterOutlet, ModalHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App implements OnInit {
  protected readonly title = signal('plans-mfe');

  ngOnInit(): void {
    // Debug: Verify component initializes
    console.log('plans-mfe-root App component initialized');
    console.log('Router outlet should be rendering...');
    
    // Check if router outlet exists
    setTimeout(() => {
      const routerOutlet = document.querySelector('router-outlet');
      console.log('Router outlet found:', routerOutlet !== null);
      
      const pricingPlans = document.querySelector('app-pricing-plans');
      console.log('Pricing plans component found:', pricingPlans !== null);
    }, 1000);
  }
}
