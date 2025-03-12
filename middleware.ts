import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  
  // const isLoggedIn = request.cookies.has("auth-token") // TODO: Implement proper token validation
  // 登录状态的判断：9000接口判断 x-csrf-token 有没有值；其它的先不用判断
  // const csrfToken = request.cookies.get("x-csrf-token")?.value
    //  || request.headers.get("x-csrf-token");
  // const isLoggedIn = csrfToken
  const isLoggedIn = true

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/signup", "/forgot-password"]

  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // console.log("isPublicPath", isPublicPath);

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // if (isLoggedIn && isPublicPath) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  // if (isLoggedIn && !isPublicPath) {
  //   return NextResponse.next();
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
  
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export function middleware(request: NextRequest) {
//   // 仅校验关键接口
//   const requiresAuth = request.nextUrl.pathname.startsWith('/api/auth');
//   const csrfToken = request.cookies.get('x-csrf-token')?.value;
  
//   if (requiresAuth && !csrfToken) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
  
//   return NextResponse.next();
// }