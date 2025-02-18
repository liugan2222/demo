// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export function middleware(request: NextRequest) {
//   const isLoggedIn = request.cookies.has("auth-token") // TODO: Implement proper token validation

//   // Public paths that don't require authentication
//   const publicPaths = ["/login", "/signup", "/forgot-password"]

//   const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

//   console.log("isPublicPath", isPublicPath);

//   if (!isLoggedIn && !isPublicPath) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (isLoggedIn && isPublicPath) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   if (isLoggedIn && !isPublicPath) {
//     return NextResponse.next();
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};