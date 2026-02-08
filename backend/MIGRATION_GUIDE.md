# Migration Guide: Supabase to Laravel

This document outlines the steps to migrate from Supabase to Laravel backend.

## Overview

The application has been restructured to use:
- **Laravel 11** backend with MySQL database
- **Laravel Sanctum** for authentication (replacing Supabase Auth)
- **React frontend** moved to `resources/js/` (from `src/`)
- **Vite with Laravel plugin** for asset compilation

## Key Changes

### 1. Authentication

**Before (Supabase):**
```typescript
import { supabase } from './lib/supabase';

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Get user
const { data: { user } } = await supabase.auth.getUser();
```

**After (Laravel Sanctum):**
```typescript
// Login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
});
const { user, token } = await response.json();
localStorage.setItem('auth_token', token);

// Get user
const response = await fetch('/api/user', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});
const user = await response.json();
```

### 2. Database Queries

**Before (Supabase):**
```typescript
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .order('created_at', { ascending: false });
```

**After (Laravel API):**
```typescript
const response = await fetch('/api/todos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});
const todos = await response.json();
```

### 3. File Structure Changes

- Frontend code moved from `src/` to `resources/js/`
- Entry point: `resources/js/main.tsx`
- Main app: `resources/js/App.tsx`
- Vite config updated to use `laravel-vite-plugin`

### 4. Environment Variables

**Before (.env for Supabase):**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**After (.env for Laravel):**
```
APP_NAME="Sistema contable"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000
```

## Migration Steps

### Step 1: Update Authentication Context

Create or update your auth context to use Laravel Sanctum:

```typescript
// resources/js/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('auth_token')
  );

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setToken(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const { user, token } = await response.json();
    setUser(user);
    setToken(token);
    localStorage.setItem('auth_token', token);
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, password_confirmation: password })
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    const { user, token } = await response.json();
    setUser(user);
    setToken(token);
    localStorage.setItem('auth_token', token);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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

### Step 2: Create API Helper

Create a helper for API calls:

```typescript
// resources/js/lib/api.ts
const API_BASE = '/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
```

### Step 3: Update Data Fetching

Replace Supabase queries with API calls:

```typescript
// Before
const { data: todos } = await supabase.from('todos').select('*');

// After
const todos = await apiRequest('/todos');
```

### Step 4: Database Migration

1. Export your Supabase data
2. Create corresponding Laravel migrations
3. Import data into MySQL
4. Update any database-specific queries

### Step 5: Remove Supabase Dependencies

```bash
npm uninstall @supabase/supabase-js
```

Remove Supabase configuration:
- Delete `src/lib/supabase.ts` (if exists)
- Remove Supabase environment variables

## Testing the Migration

1. **Start Laravel server:**
   ```bash
   php artisan serve
   ```

2. **Start Vite dev server:**
   ```bash
   npm run dev
   ```

3. **Test authentication:**
   - Register a new user
   - Login with credentials
   - Verify token is stored
   - Test protected routes

4. **Test API endpoints:**
   - Create, read, update, delete operations
   - Verify authorization policies

## Production Deployment

1. **Build assets:**
   ```bash
   npm run build
   ```

2. **Optimize Laravel:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Configure web server** (Apache/Nginx) to point to `public/` directory

4. **Set proper permissions:**
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

## Troubleshooting

### CORS Issues
- Check `config/cors.php` settings
- Ensure `SANCTUM_STATEFUL_DOMAINS` includes your frontend URL

### Authentication Not Working
- Verify token is being sent in headers
- Check Laravel logs: `storage/logs/laravel.log`
- Ensure migrations ran successfully

### Assets Not Loading
- Run `npm run build`
- Clear browser cache
- Check `public/build` directory exists

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Vite with Laravel](https://laravel.com/docs/vite)
