import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Bootstrap the application normally for development
// For production (Web Component), this will be handled by the shell app
console.log('Bootstrap: Starting plans-mfe application...');

bootstrapApplication(App, appConfig)
  .then(() => {
    console.log('✅ plans-mfe application bootstrapped successfully');
  })
  .catch((err) => {
    console.error('❌ Error bootstrapping application:', err);
    // Log full error details
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
  });
