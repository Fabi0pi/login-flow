import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./Lib/jwt";

const PUBLIC_ROUTES = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = payload !== null;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

/**
 * NOTE
 
   PROXY file Serve per intercettare una richiesta HTTP prima che venga renderizzata una pagina o eseguita una route.
    - fare redirect
    - fare rewrite degli URL
    - controllare autenticazione e permessi
    - leggere o impostare cookie
    - aggiungere/modificare header
    - applicare logiche globali a determinate rotte

  Runtime Node.js invece che Edge
  Fino a Next.js 15, il middleware girava sull'Edge runtime (limitato: no Node.js APIs). Dal v16, Proxy gira su Node.js di default — per questo verifyToken con jose funziona senza problemi.

  request.cookies.get('auth_token') senza await
  Nel Proxy si legge il cookie dall'oggetto request direttamente (API sincrona), non da next/headers. Sono due API diverse: next/headers è per i Route Handlers e i Server Components, request.cookies è
  per il Proxy.

  Due redirect simmetrici
  - Autenticato su rotta pubblica (/login, /register) → /dashboard: evita che un utente già loggato veda il form di login.
  - Non autenticato su rotta protetta → /login: il cuore della protezione.
  
  Il matcher esclude api/*, _next/*, favicon.ico
  Il Proxy non deve girare sulle API routes (gestiscono la loro auth) né sui file statici (CSS, JS, immagini). Senza questo, ogni richiesta a /_next/static/... passerebbe per la verifica JWT — inutile
  e lento.

  Il Proxy è prima linea di difesa, non l'unica
  I docs avvertono esplicitamente: "Always verify authentication inside each Server Function, not just in Proxy." Il Proxy serve per redirect e UX. La vera verifica di sicurezza avviene nei Route
  Handlers (come fa già il nostro /api/auth/me).
 */
