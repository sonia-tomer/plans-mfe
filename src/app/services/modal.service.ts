import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ModalData {
  component: any;
  data?: any;
  width?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new Subject<ModalData | null>();
  private resultSubject = new Subject<any>();
  
  public modal$: Observable<ModalData | null> = this.modalSubject.asObservable();
  public result$: Observable<any> = this.resultSubject.asObservable();

  open(component: any, data?: any, width?: string): Observable<any> {
    this.modalSubject.next({ component, data, width });
    
    // Return observable that will emit when modal closes with result
    return new Observable(observer => {
      const subscription = this.result$.subscribe(result => {
        observer.next(result);
        observer.complete();
        subscription.unsubscribe();
      });
    });
  }

  close(result?: any): void {
    if (result !== undefined) {
      this.resultSubject.next(result);
    }
    this.modalSubject.next(null);
  }
}

