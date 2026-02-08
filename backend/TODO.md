# Known Issues and TODO

## Current State

The Laravel backend is fully set up and functional. The React frontend has been moved from `src/` to `resources/js/`, but **still contains references to Supabase** that need to be migrated.

## TODO: Frontend Migration

The following files still use Supabase and need to be updated to use the Laravel API:

### High Priority - Core Functionality
1. **resources/js/contexts/AuthContext.tsx**
   - Replace Supabase auth with Laravel API calls
   - Use the `auth` helper from `resources/js/lib/api.ts`
   
2. **resources/js/lib/supabase.ts**
   - This file should be **deleted** after all references are removed
   
3. **resources/js/components/auth/LoginForm.tsx**
   - Update to use Laravel authentication

### Medium Priority - Data Fetching
4. **All component modules** (resources/js/components/modules/*)
   - Replace Supabase queries with Laravel API calls
   - Use the `ApiClient` from `resources/js/lib/api.ts`
   - Follow the pattern:
     ```typescript
     // Before (Supabase)
     const { data } = await supabase.from('table').select('*');
     
     // After (Laravel)
     const data = await ApiClient.get('/endpoint');
     ```

5. **resources/js/lib/periodValidation.ts**
   - Update to call Laravel API endpoints
   
6. **resources/js/lib/journalEntryHelpers.ts**
   - Update to call Laravel API endpoints

## Migration Strategy

### Step 1: Update Authentication (CRITICAL)
Update `resources/js/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (auth.isAuthenticated()) {
        const userData = await auth.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await auth.login(email, password);
    setUser(user);
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Step 2: Create Laravel Models and APIs
For each data table currently accessed via Supabase:
1. Create Laravel model
2. Create migration
3. Create controller
4. Add routes
5. Update React components

### Step 3: Update Components Incrementally
Work through components one module at a time:
1. Update imports (remove Supabase, import API client)
2. Replace Supabase queries with API calls
3. Test functionality
4. Move to next component

## Backend Tasks (To Create APIs for Existing Features)

Based on the React components, the following Laravel resources need to be created:

### Required Models & APIs
- [ ] Companies (CompanyManagement.tsx)
- [ ] Chart of Accounts (ChartOfAccounts.tsx)
- [ ] Account Types (AccountTypesManagement.tsx)
- [ ] Branches (Branches.tsx)
- [ ] Customers (Customers.tsx)
- [ ] Suppliers (Suppliers.tsx)
- [ ] Journal Entries (JournalEntries.tsx)
- [ ] Purchases (Purchases.tsx)
- [ ] Sales (Sales.tsx)
- [ ] Treasury (Treasury.tsx)
- [ ] Inventory (Inventory.tsx)
- [ ] Warehouses (Warehouses.tsx)
- [ ] Units of Measure (UnitsOfMeasure.tsx)
- [ ] Payment Methods (PaymentMethods.tsx)
- [ ] Tax Configuration (TaxConfiguration.tsx)
- [ ] Document Types (DocumentTypes.tsx)
- [ ] Fixed Assets (FixedAssets.tsx)
- [ ] Accounts Payable (AccountsPayable.tsx)
- [ ] Accounts Receivable (AccountsReceivable.tsx)
- [ ] Fiscal Periods (PeriodClosing.tsx)
- [ ] Reports (Reports.tsx)
- [ ] Modules (ModuleManagement.tsx)
- [ ] Settings (Settings.tsx)

### Database Schema Migration
1. Export existing Supabase data
2. Create Laravel migrations for all tables
3. Import data into MySQL
4. Verify data integrity

## Testing Checklist

After completing migration:
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Protected routes require authentication
- [ ] All CRUD operations work for each resource
- [ ] Authorization policies prevent unauthorized access
- [ ] Data relationships are preserved
- [ ] Frontend displays data correctly
- [ ] Form submissions work
- [ ] Validation errors are displayed
- [ ] Loading states work correctly

## Dependencies to Remove

After migration is complete:
```bash
npm uninstall @supabase/supabase-js
```

Remove files:
- `resources/js/lib/supabase.ts`

## Environment Variables to Update

Remove from `.env`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Performance Considerations

- Laravel API responses should be paginated for large datasets
- Consider adding Laravel caching for frequently accessed data
- Use eager loading to avoid N+1 queries
- Add database indexes for commonly queried fields

## Security Considerations

- [ ] Ensure all API endpoints have proper authentication
- [ ] Verify authorization policies for all resources
- [ ] Validate all user inputs
- [ ] Sanitize data before displaying
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins in production

## Current Working State

✅ **What Works:**
- Laravel backend is fully functional
- Sanctum authentication is configured
- Example Todo API works (can be tested with curl)
- Vite builds successfully
- All Laravel routes are registered

⚠️ **What Needs Work:**
- React frontend still uses Supabase
- Need to create Laravel APIs for all existing features
- Need to update all React components to use new APIs
- Need to migrate database from Supabase to MySQL

## Next Immediate Steps

1. **Test the Todo API** with curl to verify backend works
2. **Create AuthContext using Laravel API** (replace Supabase auth)
3. **Update LoginForm component** to use new auth
4. **Test authentication flow** end-to-end
5. **Create one additional resource** (e.g., Companies) to establish pattern
6. **Replicate pattern** for remaining resources
7. **Remove Supabase dependencies** when migration is complete

## Useful Commands

```bash
# Create new model with migration, controller, and resource
php artisan make:model Company -mcr

# Create policy for authorization
php artisan make:policy CompanyPolicy --model=Company

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# View all routes
php artisan route:list
```
