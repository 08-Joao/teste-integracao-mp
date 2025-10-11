import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// O nome do seu cookie de autenticação
const AUTH_COOKIE_NAME = 'accessToken'; // <-- Altere aqui se o nome do seu cookie for diferente

// 1. Especifique as rotas públicas (que não exigem login)
const GUEST_ROUTES = ['/signin', '/signup'];

// 2. Especifique as rotas que exigem login
const PROTECTED_ROUTES = ['/dashboard']; // Adicione outras rotas protegidas aqui, ex: '/profile'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // Lógica de redirecionamento para usuários LOGADOS
  // Se o cookie de sessão existe e o usuário tenta acessar uma rota de convidado...
  if (sessionCookie && GUEST_ROUTES.includes(pathname)) {
    // ...redireciona para o dashboard.
    // A URL base é obtida de `request.url` para funcionar tanto em localhost quanto em produção.
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Lógica de redirecionamento para usuários DESLOGADOS
  // Se o cookie não existe e o usuário tenta acessar uma rota protegida...
  if (!sessionCookie && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    // ...redireciona para a página de login.
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Se nenhuma das condições acima for atendida, permite que a requisição continue.
  return NextResponse.next();
}

// O matcher define em QUAIS rotas o middleware será executado.
// Isso evita que o middleware rode em requisições desnecessárias (ex: imagens, arquivos estáticos).
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone de favoritos)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}