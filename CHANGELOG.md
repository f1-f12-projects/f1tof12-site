# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-09-26

### Added
- Added Requirements page
- When Manager logs in, it will re-direct to Requirements page
- Added Assign Recuiter to the requirement
- Add new Requirement

### Fixed
- Minor bug fixes and improvements on alerts
- Fix to ensure dates always shows in IST format

## [1.2.0] - 2025-09-21

### Added
- Cache system for selective data storage during login
- Company, Invoice, SPOC information caching with automatic invalidation
- Memory leak prevention in Login component
- Cache configuration with TTL and persistence options

### Enhanced
- AuthContext now supports cache data during login/logout
- Company service with intelligent cache management
- Login component with proper cleanup to prevent state updates on unmounted components

### Fixed
- MUI Select out-of-range value warning in Invoice Report
- Memory leak warning in Login component
- TypeScript errors in cache service

## [1.1.3] - 2024-09-19

### Added
- Invoice report functionality with comprehensive reporting features
- Password visibility toggle (peek view) for login forms
- Reset password functionality for admin users
- PageNotFound component for better error handling
- Enhanced invoice management with improved validation
- Version information display component

### Enhanced
- Updated API endpoints for better server compatibility
- Improved role-based access control
- Enhanced invoice list functionality
- Better error handling and user feedback

### Fixed
- Build issues resolved
- API endpoint compatibility issues
- Refresh token handling improvements

## [1.1.2] - 2025-09-07

## Added
- Admin can reset other users password
- Replaced Action text with icons

## [1.1.2] - 2025-09-05

### Added
- Role-based authentication system (recruiter, lead, manager, finance)
- Collapsible sidebar navigation with role-based menu visibility
- Invoice management with comprehensive form validation
- Currency localization (INR format with ₹ symbol)
- Date range filtering for both raised date and due date
- Loading states and error handling throughout the application
- 403 Forbidden error handling

### Enhanced
- Invoice list with optimized FormField component
- Company name display in invoice list after creation
- Amount formatting with Indian locale (1,00,000 format)
- Form field validation with real-time error clearing

### Fixed
- Input focus issue in invoice creation dialog
- FormField component recreation preventing proper input handling
- Date filtering logic to handle null/undefined dates
- Amount field input restrictions for large numbers

## [1.0.0] - Initial Release
- Basic React application setup with Material UI
- Initial project structure and configuration