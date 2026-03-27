import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/products/:path*",
    "/users/:path*",
  ],
}
