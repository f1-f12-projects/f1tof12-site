# f1tof12-site

F1 to F12 is a platform developed for Recruitment companies for their day to day operations.

## Prerequisites

- Node.js (version 18 or higher)
- npm (version 9 or higher)
- AWS CLI configured with appropriate permissions (for Dev/Prod deployments)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd f1tof12-site
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Local Development

```bash
./build.sh Local
# or
npm run start:local
```

- Runs at `http://localhost:3000` with hot reload
- API pointed at `http://localhost:8000`
- Automatically generates `.env` from `endpoints.env`

## Environments

| Environment | URL | How it's deployed |
|---|---|---|
| Local | `http://localhost:3000` | `./build.sh Local` |
| Dev | `https://dev.f1tof12.com` | Push to `dev` branch → GitHub Actions |
| Production | `https://f1tof12.com` | Push to `main` branch → GitHub Actions |

## Deployment

### Dev
Push to the `dev` branch to trigger an automatic deployment:
```bash
git checkout dev
git add .
git commit -m "your changes"
git push origin dev
```
GitHub Actions workflow: `.github/workflows/deploy-dev.yml`

### Production
Merge `dev` into `main` to trigger a production deployment:
```bash
git checkout main
git merge dev
git push origin main
```
GitHub Actions workflow: `.github/workflows/deploy.yml`

Both workflows:
1. Build the React app (`npm run build`)
2. Sync the `build/` folder to the respective S3 bucket
3. Invalidate the CloudFront distribution cache

Check the **Actions** tab on GitHub to monitor deployment status (~3-5 minutes).

## Configuration

### `endpoints.env`
All API endpoint paths are defined in `endpoints.env`. This file is checked into git and is the **single source of truth** for API routes across all environments.

To add a new endpoint, add it to `endpoints.env`:
```
REACT_APP_MY_NEW_ENDPOINT=/vst/my/endpoint
```

### Environment variables (not in git)
Secrets and base URLs are injected at build time:

| Variable | Local | Dev | Prod |
|---|---|---|---|
| `REACT_APP_BASE_URL` | `http://localhost:8000` (build.sh) | `https://dev-api.f1tof12.com` (workflow) | GitHub Secret |
| `REACT_APP_CLOUDFRONT_SECRET` | Not needed | GitHub Secret | GitHub Secret |

### GitHub Secrets required
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `REACT_APP_BASE_URL` (prod)
- `REACT_APP_CLOUDFRONT_SECRET` (prod)
- `DEV_REACT_APP_CLOUDFRONT_SECRET` (dev)
- `S3_BUCKET` (prod)
- `CLOUDFRONT_DISTRIBUTION_ID` (prod)
- `DEV_S3_BUCKET` (dev)
- `DEV_CLOUDFRONT_DISTRIBUTION_ID` (dev)

## Project Structure

```
f1tof12-site/
├── .github/workflows/
│   ├── deploy.yml          # Production deployment (push to main)
│   └── deploy-dev.yml      # Dev deployment (push to dev)
├── src/
│   ├── components/         # Shared React components
│   ├── pages/              # Application pages
│   ├── services/           # API service layer
│   ├── models/             # TypeScript models
│   ├── utils/              # Utility functions
│   ├── styles/             # Shared styles
│   ├── context/            # React context providers
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Entry point
├── endpoints.env           # API endpoint paths (all environments)
├── build.sh                # Local development script
├── package.json
└── tsconfig.json
```
