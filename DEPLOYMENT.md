# Deployment playbook

## GitHub

Create a new GitHub repository named `daytona-flood-watch`, then from the extracted project directory:

```bash
git init
git add .
git commit -m "Initialize Daytona Flood Watch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/daytona-flood-watch.git
git push -u origin main
```

The GitHub Actions workflow runs lint, typecheck, unit tests, and production build on each push and pull request.

## Vercel

Import the GitHub repository at https://vercel.com/new, select the Next.js framework, and deploy. No secret API credentials are required for the included feeds. `NEXT_PUBLIC_MAP_STYLE` is optional. Verify your basemap provider's production terms and attribution.

## Smoke tests after deployment

1. Visit `/api/health` and verify HTTP 200.
2. Visit `/api/dashboard` and verify each feed has `status`, `source`, and `fetchedAt`.
3. Confirm that unavailable feeds display as unavailable, not zero or safe.
4. Confirm map markers match returned station observations and forecast points.
5. Test map controls and links on mobile and keyboard-only navigation.
6. Confirm NWS county coverage and station IDs against official data before public promotion.
7. Configure domain, uptime monitoring, security headers, analytics/privacy notice, and incident-response ownership.

## Emergency disclaimer

The dashboard is not an emergency alert service and does not replace NWS, local emergency management, or evacuation instructions. No data means unknown conditions, not safety.
