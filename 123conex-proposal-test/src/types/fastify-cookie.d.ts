import '@fastify/cookie';

declare module 'fastify' {
  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: import('@fastify/cookie').CookieSerializeOptions,
    ): this;
    clearCookie(
      name: string,
      options?: import('@fastify/cookie').CookieSerializeOptions,
    ): this;
    unsignCookie(value: string): import('@fastify/cookie').UnsignResult;
  }

  interface FastifyRequest {
    cookies: { [cookieName: string]: string | undefined };
    unsignCookie(value: string): import('@fastify/cookie').UnsignResult;
  }
}
