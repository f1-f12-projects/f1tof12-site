# Changelog

All notable changes to this project will be documented in this file.

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