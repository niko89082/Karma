// src/lib/supabase.ts
import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";

/**
 * Browser client — use inside client components
 * This is for any component with 'use client' directive
 */
export const createClientBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

/**
 * Server Component client (read-only cookies)
 * Use inside layouts/pages (App Router server components)
 * This version CANNOT modify cookies (no set/remove)
 * 
 * NOTE: This function must be imported dynamically in server components
 * or wrapped in an async function to avoid build errors
 */
export async function createClientServer() {
  // Dynamic import to avoid build-time issues
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Server Components cannot modify cookies — no-ops here
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );
}

/**
 * Helper function to get the current user from browser client
 * Use this in client components when you need user info
 */
export async function getCurrentUser() {
  const supabase = createClientBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Helper function to check if user is authenticated
 * Use this for protected routes/components
 */
export async function isAuthenticated() {
  const supabase = createClientBrowser();
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}