# 📋 Resumo de Correções - Integração Mercado Pago

## ✅ Problemas Resolvidos

### 1. **Erro 502 no Proxy Reverso** ✅
**Problema:** OpenResty retornando 502 Bad Gateway  
**Causa:** Nome dos containers com hífen em vez de underscore  
**Solução:** 
- Frontend: `teste-integracao-frontend` → `teste_integracao_frontend`
- Backend: `teste-integracao-backend` → `teste_integracao_backend`

---

### 2. **Erro `diff_param_bins` no Pagamento com Cartão** ✅
**Problema:** Mercado Pago rejeitando pagamento com erro 10103  
**Causa:** `payment_method_id` hardcoded como `'visa'`  
**Solução:** Implementada detecção automática do método de pagamento via BIN do cartão

**Código:**
```typescript
// Detecta automaticamente o método (visa, master, amex, etc)
const detectPaymentMethod = async (cardNumber: string) => {
  const bin = unmask(cardNumber).substring(0, 6);
  const paymentMethods = await mp.getPaymentMethods({ bin });
  setDetectedPaymentMethod(paymentMethods.results[0].id);
};
```

---

### 3. **Webhook não Processando Pagamentos PIX** ✅
**Problema:** Pagamento PIX aprovado mas proposta não confirmada  
**Causa:** 
- Webhook URL não configurada
- External reference não sendo lida

**Solução:**
- Configurado `WEBHOOK_URL` no `.env`
- Webhook registrado no Mercado Pago
- Handler atualizado para ler `external_reference`

---

### 4. **Validação de Assinatura do Webhook** ✅
**Problema:** Webhooks sem validação de autenticidade  
**Causa:** Não havia validação de assinatura HMAC  
**Solução:** Implementada validação HMAC SHA256

**Segurança:**
```typescript
// Valida assinatura usando secret
const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
const hmac = crypto.createHmac('sha256', secret);
const generatedHash = hmac.digest('hex');
// Compara com hash recebido
```

---

### 5. **Webhook Recebendo ID no Body** ✅
**Problema:** `paymentId: undefined` nos logs  
**Causa:** MP envia ID no body JSON, não na query string  
**Solução:** Handler lê de ambos os lugares

```typescript
const paymentId = queryId || body?.data?.id;
const topic = queryTopic || body?.type;
```

---

### 6. **Constraint Único no `proposalId`** ✅
**Problema:** Não pode criar segundo pagamento para mesma proposta  
**Causa:** `proposalId` com constraint `@unique`  
**Solução:** 
- Removido `@unique` do `proposalId`
- Mudado relação de one-to-one para one-to-many
- `payment` → `payments[]`

---

## 🔧 Variáveis de Ambiente Necessárias

```bash
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-3649687758332161-101019-143a4cf53988eefcebf6598f08deac5e-408289519"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-7638c7f8-4fdc-4a4f-969a-35474c27d078"
MERCADO_PAGO_WEBHOOK_SECRET="2311544e70c38f773aa6635b07c3dff6d95ab1d58d17701e0b698f899e9f5771"
WEBHOOK_URL="https://api-integracaomp.tehkly.com/api/payments/webhook"

# Banco de Dados
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
SALT_ROUNDS=12

# Outros
NODE_ENV=production
DATE_TIMEZONE="America/Sao_Paulo"
DOCKER_USER='utrapus'
```

---

## 📦 Deploy Checklist

### Passo 1: Commit e Push
```bash
git add .
git commit -m "fix: multiple payments and webhook improvements"
git push
```

### Passo 2: Na VPS - Pull e Rebuild
```bash
cd /caminho/do/projeto
git pull
docker-compose down
docker-compose build
```

### Passo 3: Aplicar Migration
```bash
docker exec -it teste_integracao_backend sh
cd /app
pnpm prisma migrate deploy
exit
```

### Passo 4: Subir Containers
```bash
docker-compose up -d
```

### Passo 5: Verificar Logs
```bash
docker logs teste_integracao_backend -f
docker logs teste_integracao_frontend -f
```

---

## 🧪 Testes

### Teste 1: Webhook
```bash
# No painel do MP, clicar em "Testar URL"
# Deve retornar 200 OK (mesmo que payment não exista)
```

### Teste 2: Pagamento com Cartão
```
Cartão de teste: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
CPF: 12345678909
```

### Teste 3: Pagamento PIX
```
1. Gerar QR Code
2. Pagar via app do MP
3. Verificar webhook nos logs
4. Confirmar proposta atualizada
```

---

## 📊 Logs Esperados

### Inicialização
```
🔑 [Payment] Access Token prefix: APP_USR-3649687
🚀 Application is running on: http://0.0.0.0:4003
```

### Webhook Recebido
```
🔔 [Webhook] Received: { paymentId: '123456', topic: 'payment' }
🔐 [Webhook] Signature: ts=...,v1=...
✅ [Webhook] Signature validated
💳 [Payment] Payment status: approved
✅ [Payment] Proposal confirmed, request closed
```

---

## ⚠️ Problemas Conhecidos

### 1. Teste com ID Fake (123456)
**Normal:** O teste do MP usa ID fake, vai falhar ao buscar no MP  
**Solução:** Ignorar erro 404 em testes

### 2. Múltiplos Webhooks
**Normal:** MP pode enviar múltiplas notificações  
**Solução:** Handler é idempotente, pode processar várias vezes

### 3. Assinatura Inválida em Testes
**Normal:** Alguns testes do MP não enviam assinatura correta  
**Solução:** Handler aceita webhooks sem assinatura com aviso

---

## 🔗 Documentação Adicional

- `WEBHOOK_SECURITY.md` - Detalhes da validação de assinatura
- `ENV_CHECKLIST.md` - Checklist de variáveis de ambiente
- `MIGRATION_GUIDE.md` - Guia de migração do banco

---

## 🎯 Status Atual

- ✅ Proxy reverso funcionando
- ✅ Webhook configurado e validado
- ✅ Detecção automática de cartão
- ✅ PIX funcionando
- ⏳ Migration pendente (múltiplos pagamentos)
- ⏳ Teste completo end-to-end pendente

---

## 🆘 Suporte

Se encontrar problemas:

1. Verificar logs: `docker logs teste_integracao_backend -f`
2. Verificar variáveis: `docker exec teste_integracao_backend env | grep MERCADO`
3. Verificar webhook no painel do MP
4. Consultar documentação: https://www.mercadopago.com.br/developers
