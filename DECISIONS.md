# Technical Decisions

## Time Spent
**Total: ~6.5 hours**
- Backend API & Business Logic: 2.5 hours
- Frontend UI/UX: 2 hours
- Security & Validation: 1 hour
- Testing & Bug Fixes: 1 hour

---

## Key Decisions

### 1. Monorepo Structure
- Single repo with `client/` and `server/` directories
- Shared TypeScript types in `/shared` folder
- Simplifies development and maintains consistency

### 2. PostgreSQL + Prisma
- Type-safe database access
- Production-ready relational database
- Easy seeding and migrations
- Better than SQLite for multi-user scenarios

### 3. Bun Runtime
- Faster than Node.js
- Native TypeScript support
- Can easily swap to Node.js with `npx tsx` (documented in README)

### 4. Shared Zod Schemas
- Single source of truth for validation
- Used by both client and server
- Prevents schema drift
- Runtime type safety

### 5. Security Layers
- Helmet.js for HTTP headers
- CORS with origin whitelist
- Rate limiting (100 req/15min)
- Structured logging with secret redaction
- Bearer token auth (simplified)

### 6. Weekly Overtime Calculation
- Calculate overtime per week, not across entire period
- Complies with 38-hour weekly threshold
- Groups entries by week start (Monday)

### 7. React Query
- Automatic caching and refetching
- Better UX with loading/error states
- Optimistic updates

### 8. Structured Logging (Pino)
- JSON logs for production
- Automatic secret redaction
- Pretty printing in development

### 9. PayRun Persistence
- Store completed pay runs in database (PostgreSQL)
- PayRun and Payslip models with proper relationships
- Totals pre-calculated and stored for performance
- Full audit trail with timestamps
- S3 export kept optional (not core functionality)

---

## What I Would Do Next

### High Priority
1. **Proper Unit Tests** - Jest/Vitest with edge case coverage
2. **API Integration Tests** - Full flow testing with supertest
3. **Missing Endpoints** - `GET /payruns`, `GET /payslips/{employeeId}/{payrunId}`
4. **Real JWT Auth** - RS256 with refresh tokens

### Medium Priority
5. **PDF Generation** - Payslip PDFs with pdfkit
6. **Better Validation** - More Zod schemas, date/time range checks
7. **Error Handling** - Custom error classes, better messages
8. **UI Improvements** - Loading skeletons, toasts, confirmations, pagination

### Low Priority
9. **Performance** - Database indexing, query optimization, caching
10. **AWS Deployment** - CDK/Terraform, Lambda, S3, CloudFront
11. **CI/CD** - GitHub Actions for lint/test/deploy

---

## Known Limitations

1. Bearer token not validated (accepts any non-empty token)
2. No user management or RBAC
3. No audit trail
4. No soft deletes
5. No pagination
6. Pay runs calculated on-demand, not persisted
7. No email notifications

---

## Testing Strategy

### Implemented ✅
- **Jest test framework** with ts-jest
- **18 unit tests** covering:
  - Tax calculation across all brackets ($0-$370, $370-$900, $900-$1,500, etc.)
  - Edge cases (zero income, small amounts, large amounts)
  - Boundary testing ($370.00, $900.00, $1,500.00)
  - Superannuation calculations (11.5%)
  - Net pay calculations matching reference data (Alice & Bob)
- **Test coverage reporting** with HTML/LCOV output
- **Separate test environment** (.env.test)
