import { Component, signal, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CdnIconComponent } from '../../cdn-icons-images/getIcon/cdn-icon.component';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CdnIconComponent],
  templateUrl: './features-section.html',
  styleUrl: './features-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesSection {
  private cdr = inject(ChangeDetectorRef);

  // Features section expand/collapse state
  featuresExpanded = signal(false);

  toggleFeatures(): void {
    this.featuresExpanded.set(!this.featuresExpanded());
    this.cdr.markForCheck();
  }
}

