# Frontend Environment Setup

## Para Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do frontend com:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4003
NEXT_PUBLIC_API_URL=http://localhost:4003
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-7638c7f8-4fdc-4a4f-969a-35474c27d078
```

## Para Produção

O Dockerfile já configura as variáveis corretas:

```env
NEXT_PUBLIC_BACKEND_URL=https://api-integracaomp.tehkly.com
NEXT_PUBLIC_API_URL=https://api-integracaomp.tehkly.com
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-7638c7f8-4fdc-4a4f-969a-35474c27d078
```

## Importante

- **Sempre use `NEXT_PUBLIC_BACKEND_URL`** para consistência
- **Reinicie o servidor** após criar/modificar `.env.local`
- **Não commite** `.env.local` (já está no `.gitignore`)
