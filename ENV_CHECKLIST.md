# ✅ Checklist de Variáveis de Ambiente

## 🚨 Erro Atual
```
Error: MERCADO_PAGO_ACCESS_TOKEN is not defined in environment variables
```

## 📋 Variáveis Obrigatórias no .env da VPS

Certifique-se de que o arquivo `.env` na VPS contém **TODAS** estas variáveis:

### 1. Docker Hub
```bash
DOCKER_USER='utrapus'
```

### 2. Aplicação
```bash
NODE_ENV=production
```

### 3. Banco de Dados
```bash
DATABASE_URL="postgresql://neondb_owner:npg_OFzr5XEN8IKh@ep-late-butterfly-adz4bd4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 4. JWT
```bash
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="7d"
SALT_ROUNDS=12
```

### 5. Timezone
```bash
DATE_TIMEZONE="America/Sao_Paulo"
```

### 6. Mercado Pago (⚠️ FALTANDO - CAUSA DO ERRO)
```bash
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-3649687758332161-101019-143a4cf53988eefcebf6598f08deac5e-408289519"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-7638c7f8-4fdc-4a4f-969a-35474c27d078"
MERCADO_PAGO_WEBHOOK_SECRET="2311544e70c38f773aa6635b07c3dff6d95ab1d58d17701e0b698f899e9f5771"
WEBHOOK_URL="https://api-integracaomp.tehkly.com/api/payments/webhook"
```

---

## 🔧 Como Corrigir na VPS

### Passo 1: Conectar na VPS
```bash
ssh seu-usuario@sua-vps
```

### Passo 2: Navegar até o diretório do projeto
```bash
cd /caminho/do/projeto/teste-integracao
```

### Passo 3: Editar o arquivo .env
```bash
nano .env
# ou
vim .env
```

### Passo 4: Adicionar as variáveis faltantes
Copie e cole as variáveis do Mercado Pago (seção 6 acima)

### Passo 5: Salvar e sair
- **nano**: Ctrl+X, depois Y, depois Enter
- **vim**: Esc, depois :wq, depois Enter

### Passo 6: Verificar se as variáveis foram salvas
```bash
cat .env | grep MERCADO_PAGO
```

Deve mostrar:
```
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-3649687758332161-101019-143a4cf53988eefcebf6598f08deac5e-408289519"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-7638c7f8-4fdc-4a4f-969a-35474c27d078"
MERCADO_PAGO_WEBHOOK_SECRET="2311544e70c38f773aa6635b07c3dff6d95ab1d58d17701e0b698f899e9f5771"
```

### Passo 7: Reiniciar os containers
```bash
docker-compose down
docker-compose pull  # Baixar novas imagens se houver
docker-compose up -d
```

### Passo 8: Verificar logs
```bash
docker logs teste_integracao_backend -f
```

Deve aparecer:
```
🔑 [Payment] Access Token prefix: APP_USR-3649687
🔑 [Payment] Is TEST token: false
⚠️ [Payment] WARNING: Credentials do not start with TEST-
⚠️ [Payment] If these are test credentials from the "Teste" tab, this is OK
🚀 Application is running on: http://0.0.0.0:4003
```

---

## 📝 Arquivo .env Completo (Exemplo)

```bash
# Docker Hub Configuration
DOCKER_USER='utrapus'

# Application Environment
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_OFzr5XEN8IKh@ep-late-butterfly-adz4bd4q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Mercado Pago Configuration
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-3649687758332161-101019-143a4cf53988eefcebf6598f08deac5e-408289519"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-7638c7f8-4fdc-4a4f-969a-35474c27d078"
MERCADO_PAGO_WEBHOOK_SECRET="2311544e70c38f773aa6635b07c3dff6d95ab1d58d17701e0b698f899e9f5771"
WEBHOOK_URL="https://api-integracaomp.tehkly.com/api/payments/webhook"

# Security
SALT_ROUNDS=12
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# Timezone
DATE_TIMEZONE="America/Sao_Paulo"
```

---

## ⚠️ Importante

1. **Não commite o .env real** - O arquivo `.env` da VPS deve conter as credenciais reais e NÃO deve ser commitado no Git
2. **Use .env.example como referência** - O `.env.example` serve apenas como template
3. **Credenciais sensíveis** - Nunca exponha suas credenciais do Mercado Pago publicamente

---

## 🆘 Se o erro persistir

1. Verifique se o arquivo `.env` está no mesmo diretório do `docker-compose.yml`
2. Verifique se não há espaços extras nas variáveis
3. Verifique se as aspas estão corretas
4. Tente recriar os containers: `docker-compose down -v && docker-compose up -d`
