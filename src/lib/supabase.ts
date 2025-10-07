// src/lib/supabase.ts
import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
 */
export function createClientServer() {
  const cookieStore = cookies();
  
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
 * Route Handler / Server Action client (read-write cookies)
 * Use inside files under /app/api/.../route.ts
 * This version CAN modify cookies
 */
export function createClientRoute(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set(name, value, options as any);
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set(name, "", { ...(options as any), maxAge: 0 });
        },
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