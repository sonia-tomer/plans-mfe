import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalHostComponent } from './shared/components/modal-host/modal-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('plans-mfe');

  ngOnInit(): void {
    console.log('✅ App component initialized');
  }
}
