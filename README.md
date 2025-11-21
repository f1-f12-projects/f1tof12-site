# f1tof12-site

This project is a React application that utilizes Material UI for styling and components. Below are the details for setting up and using the project.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 5.6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd f1tof12-site
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application

To start the development server, run:
```
npm start
```
This will launch the application in your default web browser at `http://localhost:3000`.

## Build Instructions

### Local Development Build
```bash
npm start
```
- Uses `.env.local` and `.env.endpoints`
- Runs at `http://localhost:3000`
- Hot reload enabled

### Dev Environment Build
```bash
npm run build:dev
# or
./build-dev.sh
```
- Fetches secrets from AWS SSM
- Uses `https://dev-api.f1tof12.com`
- Deploys to `https://dev.f1tof12.com`

### Production Build
```bash
npm run build
# or
./build-prod.sh
```
- Fetches secrets from AWS SSM
- Uses production API endpoints
- Deploys to `https://f1tof12.com`

## Deployment

### Automatic Deployment (Git-based)

#### Deploy to Dev Environment
```bash
# Switch to dev branch
git checkout dev

# Make your changes and commit
git add .
git commit -m "feature: your changes"

# Push to trigger auto-deployment
git push origin dev
```
**Result**: Automatically deploys to `https://dev.f1tof12.com`

#### Deploy to Production
```bash
# Switch to main branch
git checkout main

# Merge dev changes or make direct changes
git merge dev
# or
git add .
git commit -m "release: your changes"

# Push to trigger auto-deployment
git push origin main
```
**Result**: Automatically deploys to `https://f1tof12.com`

#### Workflow Details
- **Dev**: Uses `.github/workflows/deploy-dev.yml`
- **Prod**: Uses `.github/workflows/deploy.yml`
- **Duration**: ~3-5 minutes per deployment
- **Monitoring**: Check GitHub Actions tab for deployment status

### Manual Deployment
```bash
# Dev deployment
./build-dev.sh
aws s3 sync build/ s3://dev.f1tof12.com --delete
aws cloudfront create-invalidation --distribution-id E3466UWO43CDU4 --paths "/*"

# Prod deployment
./build-prod.sh
aws s3 sync build/ s3://f1tof12.com --delete
aws cloudfront create-invalidation --distribution-id <PROD_DISTRIBUTION_ID> --paths "/*"
```

## Environment URLs
- **Local**: `http://localhost:3000`
- **Dev**: `https://dev.f1tof12.com`
- **Production**: `https://f1tof12.com`

### Project Structure

- `src/index.tsx`: Entry point of the application.
- `src/App.tsx`: Main application component.
- `src/components/`: React components
- `src/services/`: API service layer
- `src/pages/`: Application pages
- `src/theme/index.ts`: Custom Material UI theme configuration.
- `build-dev.sh`: Dev environment build script
- `build-prod.sh`: Production build script
- `.github/workflows/`: CI/CD pipelines
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.

### Prerequisites for Deployment

- AWS CLI configured with appropriate permissions
- Access to AWS SSM parameters:
  - `/f1tof12/cloudfront/secret-value` (production)
  - `/f1tof12/dev/cloudfront/secret-value` (dev)
- GitHub repository secrets configured for CI/CD

### Usage

The application is built using React and Material UI. You can create new components by following the structure in the `src/components` directory and utilize the Material UI components as needed.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for details.