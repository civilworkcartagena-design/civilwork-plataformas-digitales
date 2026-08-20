import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) await auth.protect();
});
export const config = {
  matcher: ['/dashboard(.*)']
};
