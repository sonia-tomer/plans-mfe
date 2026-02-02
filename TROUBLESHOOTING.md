# Troubleshooting Blank Screen Issue

## Issue: Blank White Screen

If you're seeing a blank white screen, follow these steps:

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors.

Common errors:
- `customElements is not defined` - Browser doesn't support Web Components
- `Failed to load module` - Build issue
- `Cannot read property of undefined` - Component initialization issue

### 2. Verify Web Component Registration

In browser console, run:
```javascript
customElements.get('plans-mfe-root')
```

Should return: `class PlansMfeRoot extends HTMLElement`

If it returns `undefined`, the component wasn't registered.

### 3. Check if Element Exists in DOM

In browser console:
```javascript
document.querySelector('plans-mfe-root')
```

Should return the element. Check if it has content:
```javascript
document.querySelector('plans-mfe-root').innerHTML
```

### 4. Verify Router is Working

Check if router outlet is rendering:
```javascript
document.querySelector('router-outlet')
```

### 5. Check Network Tab

In DevTools Network tab, verify:
- `main.js` loads successfully (200 status)
- `styles.css` loads successfully
- No 404 errors for chunks

### 6. Common Fixes

#### Fix 1: Clear Browser Cache
```bash
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

#### Fix 2: Rebuild Project
```bash
npm run build
# Then test with ng serve
```

#### Fix 3: Check for JavaScript Errors
Look for any red errors in console that might prevent rendering.

#### Fix 4: Verify index.html
Make sure `index.html` has:
```html
<plans-mfe-root></plans-mfe-root>
```

Not `<app-root></app-root>`.

### 7. Development vs Production

**For Development Testing:**
- Use `ng serve` - should work with `<plans-mfe-root>`
- Component registers automatically when script loads

**For Production (S3):**
- Build with `npm run build`
- Upload to S3
- Shell app loads script and creates element

### 8. Debug Steps

1. **Add console.log to main.ts:**
```typescript
console.log('Bootstrap starting...');
// ... after registration
console.log('Web Component registered:', customElements.get('plans-mfe-root'));
```

2. **Check if component initializes:**
Add to `app.ts`:
```typescript
ngOnInit() {
  console.log('App component initialized');
}
```

3. **Verify router:**
Check if routes are loading by adding console.log to PricingPlans component.

### 9. If Still Not Working

Check:
- [ ] Browser supports Web Components (Chrome, Firefox, Safari, Edge)
- [ ] No CORS errors in console
- [ ] All dependencies are installed (`npm install`)
- [ ] No TypeScript compilation errors
- [ ] Styles are loading (check if Tailwind is working)

### 10. Quick Test

Create a simple test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <script src="http://localhost:4200/main.js" type="module"></script>
  <link rel="stylesheet" href="http://localhost:4200/styles.css">
</head>
<body>
  <plans-mfe-root></plans-mfe-root>
</body>
</html>
```

If this works, the issue is with `ng serve` configuration.

