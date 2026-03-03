import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const protectedRoutes = ["/doctors", "/dashboard"];

export async function middleware(request: NextRequest) {
    // First, refresh the session (existing behavior)
    const response = await updateSession(request);

    const { pathname } = request.nextUrl;

    // Check if the current route is protected
    const isProtected = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isProtected) {
        // Create a read-only Supabase client to check the session
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    setAll() { },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            // Redirect to login with return URL
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
