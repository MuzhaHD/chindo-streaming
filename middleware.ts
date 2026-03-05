import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // sementara tidak melakukan apa-apa
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};