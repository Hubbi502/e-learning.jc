# Testing Documentation for LMS with Exam Code Generation

## Overview

This document outlines the comprehensive testing suite implemented for the LMS (Learning Management System) with automatic exam code generation. The testing covers all API routes, utility functions, and ensures the exam code generation functionality works correctly.

## Test Structure

### Test Categories

1. **Utility Tests** (`src/__tests__/utils/`)
   - `examCodeGenerator.test.ts` - Tests for exam code generation, validation, and parsing
   - `testHelpers.ts` - Common testing utilities and mocks

2. **API Tests** (`src/__tests__/api/`)
   - `auth.test.ts` - Authentication endpoints testing
   - `exams.test.ts` - Exam management endpoints testing
   - `questions.test.ts` - Question management endpoints testing
   - `students.test.ts` - Student management endpoints testing
   - `dashboard.test.ts` - Dashboard statistics endpoints testing

## Exam Code Generation Testing

### Features Tested

#### 1. Code Generation (`generateExamCode`)
- ✅ Generates correct format for Gengo exams: `GNG-YYYY-XXX`
- ✅ Generates correct format for Bunka exams: `BNK-YYYY-XXX`
- ✅ Handles sequence numbering correctly
- ✅ Pads sequence numbers with zeros (001, 002, etc.)
- ✅ Handles code collisions by incrementing
- ✅ Uses current year in code generation

#### 2. Code Validation (`validateExamCode`)
- ✅ Validates correct exam code formats
- ✅ Rejects invalid prefixes
- ✅ Rejects incorrect year formats
- ✅ Rejects incorrect sequence formats
- ✅ Rejects malformed codes

#### 3. Code Parsing (`parseExamCode`)
- ✅ Correctly parses valid exam codes
- ✅ Extracts category, year, and sequence
- ✅ Returns null for invalid codes

## API Endpoint Testing

### Authentication APIs (`/api/auth/`)

#### `/api/auth/me` (GET)
- ✅ Returns user data when authenticated
- ✅ Returns 401 when not authenticated
- ✅ Handles authentication service errors

#### `/api/auth/login` (POST)
- ✅ Login with valid credentials
- ✅ Rejects invalid credentials
- ✅ Validates required fields
- ✅ Handles service errors

#### `/api/auth/logout` (POST)
- ✅ Successful logout
- ✅ Clears authentication cookie
- ✅ Handles logout errors

### Exam Management APIs (`/api/admin/exams/`)

#### `/api/admin/exams` (GET)
- ✅ Returns paginated exams list
- ✅ Filters by category
- ✅ Handles pagination parameters
- ✅ Handles database errors

#### `/api/admin/exams` (POST)
- ✅ Creates exam with auto-generated exam code
- ✅ Validates required fields (category, duration)
- ✅ Validates category enum values
- ✅ Validates duration range (1-180 minutes)
- ✅ Validates time sequence (end > start)
- ✅ Generates unique exam codes using utility function

#### `/api/admin/exams/[id]` (GET)
- ✅ Returns exam by ID
- ✅ Returns 404 for non-existent exam

#### `/api/admin/exams/[id]` (PUT)
- ✅ Updates exam successfully
- ✅ Generates new exam code when category changes
- ✅ Returns 404 for non-existent exam
- ✅ Validates update data

#### `/api/admin/exams/[id]` (DELETE)
- ✅ Deletes exam successfully
- ✅ Returns 404 for non-existent exam

#### `/api/admin/exams/[id]/toggle-active` (PATCH)
- ✅ Toggles exam active status
- ✅ Returns appropriate messages
- ✅ Returns 404 for non-existent exam

### Question Management APIs (`/api/admin/questions/`)

#### `/api/admin/questions` (GET)
- ✅ Returns paginated questions
- ✅ Filters by category
- ✅ Searches by question text
- ✅ Handles pagination

#### `/api/admin/questions` (POST)
- ✅ Creates questions with categories
- ✅ Validates required fields
- ✅ Validates categories array
- ✅ Validates correct option values

#### `/api/admin/questions/[id]` (GET/PUT/DELETE)
- ✅ CRUD operations for individual questions
- ✅ Proper error handling
- ✅ Category relationship management

### Student Management APIs (`/api/admin/students/`)

#### `/api/admin/students` (GET)
- ✅ Returns paginated students
- ✅ Filters by category and status
- ✅ Searches by name, class, and exam code
- ✅ Handles different student statuses

#### `/api/admin/students/[id]` (GET/DELETE)
- ✅ Individual student operations
- ✅ Includes score relationships
- ✅ Proper error handling

### Dashboard Statistics API (`/api/admin/dashboard/stats/`)

#### `/api/admin/dashboard/stats` (GET)
- ✅ Returns comprehensive dashboard statistics
- ✅ Calculates top students with average scores
- ✅ Shows recent activity with exam codes
- ✅ Handles empty data gracefully
- ✅ Sorts activities by timestamp
- ✅ Includes exam codes in activity messages

## Test Utilities and Mocking

### Mock Data Factories
- `createMockExam()` - Creates realistic exam test data
- `createMockQuestion()` - Creates question test data
- `createMockStudent()` - Creates student test data
- `createMockAdmin()` - Creates admin user test data

### Request Helpers
- `createMockRequest()` - Creates NextRequest mocks
- `createAuthenticatedRequest()` - Creates authenticated requests
- `extractResponseData()` - Extracts JSON from responses

### Assertion Helpers
- `expectSuccessResponse()` - Validates successful API responses
- `expectErrorResponse()` - Validates error responses
- `expectValidationError()` - Validates validation error responses

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Categories
```bash
# Run utility tests only
node test-runner.js utils

# Run API tests only
node test-runner.js api

# Run exam tests only
node test-runner.js exam
```

### Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

## Key Testing Features

### 1. Exam Code Integration Testing
- Tests that exam creation automatically generates unique codes
- Verifies code format matches category (GNG/BNK prefix)
- Tests code regeneration when category changes
- Validates code uniqueness across the system

### 2. Database Mocking
- All database operations are mocked using Jest
- Realistic data relationships maintained in mocks
- Transaction-like behavior simulated for complex operations

### 3. Authentication Testing
- Mock JWT token handling
- Cookie-based authentication simulation
- Protected route testing

### 4. Error Handling Coverage
- Database error scenarios
- Validation error testing
- 404 and 500 error responses
- Edge case handling

### 5. Data Validation Testing
- Input validation for all endpoints
- Type checking and enum validation
- Range validation for numeric fields
- Required field validation

## Integration with Exam Code System

The testing suite specifically validates the exam code generation system:

1. **Automatic Generation**: Tests verify that new exams get unique codes
2. **Category-Based Prefixes**: Ensures Gengo exams get GNG prefix, Bunka exams get BNK prefix
3. **Year Integration**: Verifies current year is used in code generation
4. **Sequence Management**: Tests that sequence numbers increment properly
5. **Collision Handling**: Validates that duplicate codes are avoided
6. **Search Integration**: Tests that exam codes can be searched in admin interfaces
7. **Dashboard Integration**: Verifies exam codes appear in recent activity

## Test Coverage Goals

- **API Routes**: 100% coverage of all endpoints
- **Utility Functions**: 100% coverage of exam code utilities
- **Error Scenarios**: Comprehensive error handling testing
- **Integration**: End-to-end workflow testing
- **Edge Cases**: Boundary condition testing

## Continuous Integration

The test suite is designed to run in CI environments:

```bash
npm run test:ci
```

This command runs tests with:
- No watch mode
- Coverage reporting
- Verbose output
- Exit on completion

## Summary

This comprehensive testing suite ensures that:

1. ✅ All API endpoints work correctly
2. ✅ Exam code generation is reliable and unique
3. ✅ Database operations are properly mocked
4. ✅ Error scenarios are handled gracefully
5. ✅ Authentication and authorization work correctly
6. ✅ Data validation prevents invalid inputs
7. ✅ Integration between components works seamlessly

The tests provide confidence that the LMS with automatic exam code generation is robust, reliable, and ready for production use.
