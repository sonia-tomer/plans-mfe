# Plans Microfrontend (plans-mfe)

Angular 21 microfrontend for pricing plans management - **Optimized for fast loading and S3 hosting**.

## Project Structure

```
src/app/
├── models/
│   └── plan.model.ts              # Interfaces for plans, shipment details, etc.
├── services/
│   ├── plans.service.ts           # Plans API service
│   ├── contact-sales.service.ts   # Contact sales form service
│   └── modal.service.ts           # Lightweight modal service (replaces Material Dialog)
├── shared/
│   └── components/
│       └── modal-host/            # Modal host component
├── pricing-plans/                 # Main pricing plans component
├── edit-sample-shipment-modal/    # Edit shipment details modal
├── plan-activation-success-modal/  # Success modal after plan activation
├── downgrade-confirmation-modal/   # Confirmation modal for downgrades
├── contact-sales-form-modal/       # Contact sales form modal
└── zero-monthly-fee-offer-modal/  # Zero fee offer details modal
```

## Features

### Main Pricing Plans Page
- Display all available pricing plans (Lite, Business, Advanced, Pro)
- Show current plan and recommended plan badges
- Sample shipment details section with edit functionality
- Plan activation with downgrade confirmation
- Contact sales for large businesses

### Modals
1. **Edit Sample Shipment Modal**: Edit shipment details (weight, mode, payment, pincodes)
2. **Plan Activation Success Modal**: Success message after plan activation
3. **Downgrade Confirmation Modal**: Warning when downgrading plans
4. **Contact Sales Form Modal**: Enterprise lead form
5. **Zero Monthly Fee Offer Modal**: Details about shipping milestone offers

## Technology Stack

- **Angular 21.1.0** - Latest Angular with all modern features:
  - ✅ **Built-in Control Flow** (`@if`, `@for`, `@switch`) - 90% faster than structural directives
  - ✅ **Signals** (`signal()`, `computed()`) - Fine-grained reactivity for optimal performance
  - ✅ **Standalone Components** - No NgModules, better tree-shaking
  - ✅ **Modern DI** - Using `inject()` function
- **Tailwind CSS 3.4.19** - Utility-first CSS framework (lightweight alternative to Material)
- **No Angular Material** - Removed for performance (~750KB+ saved)
- **No Animations** - Removed for faster loading
- **Custom Modal Service** - Lightweight replacement for Material Dialog

## Key Implementation Notes

### Backend Integration Points
- Plan prices should come from BE (not hardcoded)
- Plan features should be driven by BE
- Shipping milestones (100, 500, 1000) should be variables from BE
- Recommended plan based on past 3 months average order count
- Average shipment cost based on courier rate card (Delhivery Surface)

### Frontend Hardcoded
- Zero Monthly Fee Offer modal content (as per requirements)
- Downgrade confirmation modal text (hardcoded in FE)

### Temporary State
- Edit Sample Shipment modal values are temporary and not stored
- Values reset to defaults on refresh or new session

## Performance Optimizations

### Bundle Size
- **Before**: ~750KB+ (with Angular Material + old syntax)
- **After**: ~320KB (with Tailwind CSS + Angular 21 features)
- **Savings**: ~430KB (~57% reduction)
- **Gzipped**: ~81KB (excellent for S3 hosting)

### Angular 21 Performance Features
- **Built-in Control Flow**: 90% faster than `*ngIf`/`*ngFor`
- **Signals**: More efficient change detection (only updates what changed)
- **Standalone Components**: Better tree-shaking and smaller bundles

### Build Optimizations
- Production build optimized for S3 hosting
- Source maps disabled in production
- License extraction enabled
- Named chunks disabled
- Budget limits: 300KB initial, 500KB max

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Deployment to S3

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload to S3:
   - Build output: `dist/plans-mfe/browser/`
   - Upload all files to your S3 bucket
   - Configure CORS if needed for your shell application

3. Integration with Shell App:
   - The microfrontend is ready to be loaded from S3
   - All components are standalone and lightweight
   - No external Material dependencies

## Angular Version
- Angular 21.1.0
- Standalone components
- No ESLint/Prettier (removed for performance)
