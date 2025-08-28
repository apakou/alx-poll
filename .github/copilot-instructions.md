```
# Supabase Usage Rules: Auth & Database

## **Guiding Principle**
Always use the Supabase client correctly for the environment (Server Component, Client Component, or API Route). Never expose sensitive keys.

---

## **1. Environment Setup & Client Creation**

### **Client Import Patterns**
- **Server Components / Server Actions:** Always import and use `createClient` from `@/lib/supabase/server`. This client is configured for server-side operations and can read the auth session from cookies.
- **API Routes (Route Handlers):** Use `createRouteHandlerClient` from `@/lib/supabase/route-handler` to get a client that has access to the request cookies.
- **Client Components:** Use `createBrowserClient` from `@/lib/supabase/client`. This client uses the public `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### **Example Client Creation**
```typescript
// Server Component/Action
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
const { data: user } = await supabase.auth.getUser();

// API Route (Route Handler)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const supabase = createRouteHandlerClient({ cookies });
const { data: session } = await supabase.auth.getSession();

// Client Component
'use client';
import { createBrowserClient } from '@/lib/supabase/client';
const supabase = createBrowserClient();
const { data: subscription } = supabase.channel('...').on(...).subscribe();
```
