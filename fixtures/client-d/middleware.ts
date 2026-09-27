import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const locale = request.headers.get("accept-language")?.split(",")[0] ?? "en";
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}
