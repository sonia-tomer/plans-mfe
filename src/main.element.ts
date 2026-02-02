// Production entry point for Web Component mode
// This file is used when building for S3/production
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Bootstrap as Web Component for microfrontend usage
(async () => {
  try {
    console.log('Bootstrap: Creating application for Web Component...');
    const app = await createApplication(appConfig);
    
    // Define the custom element
    const PlansMfeElement = createCustomElement(App, {
      injector: app.injector
    });
    
    // Register the custom element
    if (!customElements.get('plans-mfe-root')) {
      customElements.define('plans-mfe-root', PlansMfeElement);
      console.log('✅ Web Component "plans-mfe-root" registered successfully');
    } else {
      console.log('⚠️ Web Component "plans-mfe-root" already registered');
    }
  } catch (error) {
    console.error('❌ Error bootstrapping plans-mfe as Web Component:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
})();

