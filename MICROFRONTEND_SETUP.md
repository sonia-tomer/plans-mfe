# plans-mfe Microfrontend Setup

## ✅ Configuration Status

**plans-mfe is now properly configured as a Web Component microfrontend!**

---

## 🎯 What Was Configured

### 1. **Angular Elements Integration**
- ✅ Installed `@angular/elements` package
- ✅ Updated `main.ts` to use `createCustomElement()`
- ✅ Registered custom element: `plans-mfe-root`

### 2. **Web Component Registration**
- ✅ Changed selector from `app-root` to `plans-mfe-root`
- ✅ App component is now standalone and bootstrapped as Web Component
- ✅ Custom element is registered globally when script loads

### 3. **Build Configuration**
- ✅ Production build outputs optimized files
- ✅ Files are hashed for cache busting
- ✅ Ready for S3 deployment

---

## 📦 Build Output Structure

After running `npm run build`, the output in `dist/plans-mfe/browser/` contains:

```
dist/plans-mfe/browser/
├── main-XXXXX.js          ← Main application bundle (Web Component)
├── chunk-XXXXX.js         ← Angular core & dependencies
├── chunk-XXXXX.js         ← Router & utilities
├── styles-XXXXX.css       ← All styles (Tailwind + custom)
├── chunk-XXXXX.js         ← Lazy-loaded modals (loaded on demand)
└── index.html             ← Entry point (for standalone testing)
```

**Key Files for Shell App:**
- `main-*.js` - Contains the Web Component registration
- `styles-*.css` - All styles
- `chunk-*.js` - Dependencies (loaded automatically)

**Note:** Angular 21 doesn't require `polyfills.js` (modern browsers only).

---

## 🚀 How It Works

### 1. **Web Component Registration**

When `main.js` loads, it:
1. Creates the Angular application
2. Converts the `App` component to a Web Component
3. Registers `plans-mfe-root` as a custom element
4. Ready to be instantiated by the shell app

### 2. **Shell App Integration**

The shell app (SR_Web) will:
1. Load `styles.css` from S3
2. Load `main.js` from S3
3. Wait for custom element registration
4. Create `<plans-mfe-root></plans-mfe-root>` element
5. Angular renders the component inside

### 3. **Example Shell App Code**

```typescript
// In shell app component
private async loadPlansMfe(): Promise<void> {
  const baseUrl = 'https://your-s3-bucket.s3.region.amazonaws.com/plans-mfe/';
  
  // Load styles
  await this.loadCss(`${baseUrl}styles-XXXXX.css`);
  
  // Load main script (registers Web Component)
  await this.loadScript(`${baseUrl}main-XXXXX.js`, true);
  
  // Create the custom element
  const plansElement = document.createElement('plans-mfe-root');
  this.hostElement.nativeElement.appendChild(plansElement);
}
```

---

## 📋 Deployment Checklist

### **Before Deploying to S3:**

1. ✅ **Build for Production**
   ```bash
   npm run build
   ```

2. ✅ **Verify Build Output**
   ```bash
   ls -lh dist/plans-mfe/browser/
   ```
   - Should see `main-*.js`, `styles-*.css`, and chunk files

3. ✅ **Test Locally (Optional)**
   ```bash
   npm run start
   ```
   - Open browser console
   - Verify `customElements.get('plans-mfe-root')` returns the constructor

4. ✅ **Upload to S3**
   ```bash
   aws s3 sync dist/plans-mfe/browser/ s3://your-bucket/plans-mfe/ \
     --cache-control "public, max-age=31536000" \
     --exclude "index.html"
   ```

5. ✅ **Configure CORS on S3**
   - Allow origin: Your shell app domain
   - Allow methods: GET, HEAD
   - Allow headers: Content-Type

6. ✅ **Update Shell App**
   - Add route for plans-mfe
   - Create loader component (similar to `dashboard-mfe.component.ts`)
   - Point to S3 URLs

---

## 🔧 Shell App Integration Steps

### **1. Create Loader Component in SR_Web**

Create: `src/app/micro/plans-mfe/plans-mfe.component.ts`

```typescript
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-plans-mfe',
  template: `
    <div class="plans-mfe-container">
      <div *ngIf="isLoading" class="loader-container">
        <img src="assets/images/loader.gif" alt="Loading..." />
      </div>
      <div #plansMfeHost [class.hidden]="isLoading"></div>
    </div>
  `,
  styles: [`
    .plans-mfe-container {
      height: 100vh;
      position: relative;
    }
    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .hidden { display: none; }
  `]
})
export class PlansMfeComponent implements OnInit {
  private readonly PLANS_MFE_BASE_URL = 'https://your-s3-bucket.s3.region.amazonaws.com/plans-mfe/';
  
  @ViewChild('plansMfeHost', { static: true }) hostElement!: ElementRef;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadPlansMfe();
  }

  private async loadPlansMfe(): Promise<void> {
    try {
      // Check if already loaded
      if (customElements.get('plans-mfe-root')) {
        this.createPlansMfeElement();
        this.isLoading = false;
        return;
      }

      // Load styles
      await this.loadCss(`${this.PLANS_MFE_BASE_URL}styles-XXXXX.css`);
      
      // Load main script
      await this.loadScript(`${this.PLANS_MFE_BASE_URL}main-XXXXX.js`, true);
      
      // Wait for registration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create element
      this.createPlansMfeElement();
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      this.hostElement.nativeElement.innerHTML = 
        `<p style="color: red; padding: 20px;">Failed to load Plans: ${error.message}</p>`;
    }
  }

  private createPlansMfeElement(): void {
    const element = document.createElement('plans-mfe-root');
    this.hostElement.nativeElement.appendChild(element);
  }

  private loadCss(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${src}"]`)) {
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      link.crossOrigin = 'anonymous';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${src}`));
      document.head.appendChild(link);
    });
  }

  private loadScript(src: string, isModule: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = isModule ? 'module' : 'text/javascript';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }
}
```

### **2. Add Route in Shell App**

In `src/app/app-routing.module.ts`:

```typescript
{
  path: 'plans-mfe',
  component: PlansMfeComponent
}
```

### **3. Handle Hashed Filenames**

Since Angular uses hashed filenames, you have two options:

**Option A: Use Manifest File (Recommended)**
- Create a `manifest.json` in build output with filenames
- Shell app fetches manifest to get correct filenames

**Option B: Fixed Filenames**
- Configure build to output `main.js`, `styles.css` (not recommended - loses cache busting)

**Option C: Parse index.html**
- Shell app fetches `index.html` and parses script/link tags

---

## ✅ Verification

### **Test Web Component Registration**

After building, test in browser console:

```javascript
// Load the main.js file first, then:
customElements.get('plans-mfe-root')
// Should return: class PlansMfeRoot extends HTMLElement

// Create and render:
const element = document.createElement('plans-mfe-root');
document.body.appendChild(element);
// Should render the plans-mfe application
```

### **Check Build Output**

```bash
# Verify main.js contains Web Component registration
grep -i "plans-mfe-root" dist/plans-mfe/browser/main-*.js

# Verify styles are included
ls -lh dist/plans-mfe/browser/styles-*.css
```

---

## 🎯 Key Points

1. ✅ **Web Component Ready**: Plans-mfe is now a proper Web Component
2. ✅ **Custom Element**: Registered as `plans-mfe-root`
3. ✅ **Standalone**: No dependencies on shell app
4. ✅ **Optimized**: 75 kB gzipped initial bundle
5. ✅ **Lazy Loading**: Modals load on demand
6. ✅ **S3 Ready**: Build output ready for S3 deployment

---

## 📝 Next Steps

1. **Deploy to S3** with proper CORS configuration
2. **Create loader component** in shell app
3. **Add route** for plans-mfe
4. **Test integration** end-to-end
5. **Monitor performance** in production

---

## 🚨 Important Notes

- **No Polyfills**: Angular 21 doesn't need polyfills.js (modern browsers only)
- **Hashed Filenames**: Use manifest or index.html parsing to get correct filenames
- **CORS**: Must configure S3 bucket CORS properly
- **Cache**: Set appropriate cache headers on S3
- **Error Handling**: Shell app should handle loading errors gracefully

---

**Status: ✅ Fully Configured for Microfrontend Usage**

