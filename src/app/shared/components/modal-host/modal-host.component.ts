import { Component, ViewChild, ViewContainerRef, ComponentRef, inject, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (currentModal) {
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        (click)="onBackdropClick($event)"
      >
        <div 
          class="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
          [style.max-width]="modalWidth"
          (click)="$event.stopPropagation()"
        >
          <div class="p-6">
            <ng-container #modalContent></ng-container>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class ModalHostComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modalContent', { read: ViewContainerRef }) modalContent!: ViewContainerRef;
  
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  
  currentModal: any = null;
  modalWidth: string = '600px';
  private componentRef: ComponentRef<any> | null = null;
  private pendingModal: any = null;
  private viewInitialized = false;

  ngOnInit(): void {
    this.modalService.modal$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(modal => {
      if (modal) {
        this.pendingModal = modal;
        // Set currentModal first to trigger @if
        this.currentModal = modal.component;
        this.modalWidth = modal.width || '600px';
        this.cdr.detectChanges();
        
        // Wait for view to be ready, then load the component
        if (this.viewInitialized) {
          setTimeout(() => this.loadModalComponent(modal), 0);
        }
      } else {
        this.close();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.pendingModal) {
      // Wait a tick for the view to be fully rendered
      setTimeout(() => {
        this.loadModalComponent(this.pendingModal);
        this.pendingModal = null;
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadModalComponent(modal: any): void {
    if (!this.modalContent) {
      console.error('ViewContainerRef not available yet, retrying...');
      setTimeout(() => this.loadModalComponent(modal), 10);
      return;
    }

    // Clear previous modal if exists
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    
    try {
      // Create component
      this.componentRef = this.modalContent.createComponent(modal.component);
      
      // Pass data to component instance
      if (modal.data) {
        Object.keys(modal.data).forEach(key => {
          (this.componentRef!.instance as any)[key] = modal.data[key];
        });
      }

      // Trigger change detection to ensure component is rendered
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading modal:', error);
      this.currentModal = null;
      this.cdr.detectChanges();
    }
  }

  close(): void {
    if (this.componentRef) {
      const result = (this.componentRef.instance as any).result;
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.currentModal = null;
    this.pendingModal = null;
    this.cdr.detectChanges();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      const result = this.componentRef ? (this.componentRef.instance as any).result : undefined;
      this.close();
      this.modalService.close(result);
    }
  }
}

