# Segurança do Webhook - Mercado Pago

## 🔐 Validação de Assinatura

Este projeto implementa a validação de assinatura do webhook do Mercado Pago para garantir que apenas notificações autênticas sejam processadas.

## Como Funciona

### 1. Headers Recebidos

O Mercado Pago envia os seguintes headers em cada notificação webhook:

- **x-signature**: Contém o timestamp e o hash HMAC SHA256
  - Formato: `ts=1234567890,v1=abc123def456...`
- **x-request-id**: ID único da requisição (UUID)

### 2. Processo de Validação

```typescript
// 1. Extrair timestamp (ts) e hash (v1) do header x-signature
const parts = signature.split(',');
const ts = parts.find(p => p.startsWith('ts=')).split('=')[1];
const hash = parts.find(p => p.startsWith('v1=')).split('=')[1];

// 2. Criar o manifest (string a ser validada)
const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

// 3. Gerar HMAC SHA256 usando o secret
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
hmac.update(manifest);
const generatedHash = hmac.digest('hex');

// 4. Comparar hashes de forma segura
const isValid = crypto.timingSafeEqual(
  Buffer.from(generatedHash),
  Buffer.from(hash)
);
```

### 3. Manifest Format

O manifest segue o formato específico do Mercado Pago:

```
id:{payment_id};request-id:{request_id};ts:{timestamp};
```

Exemplo:
```
id:12345678;request-id:a1b2c3d4-e5f6-7890-abcd-ef1234567890;ts:1697500000;
```

## 🔑 Configuração

### Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
MERCADO_PAGO_WEBHOOK_SECRET="2311544e70c38f773aa6635b07c3dff6d95ab1d58d17701e0b698f899e9f5771"
```

### Onde Encontrar o Secret

1. Acesse o [Painel de Desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers/panel)
2. Vá em **Suas integrações** → Selecione sua aplicação
3. Clique em **Webhooks**
4. O secret será exibido após configurar a URL do webhook

## 🛡️ Segurança

### Benefícios da Validação

- ✅ **Autenticidade**: Garante que a notificação veio do Mercado Pago
- ✅ **Integridade**: Verifica que os dados não foram alterados
- ✅ **Proteção contra replay attacks**: O timestamp previne reutilização
- ✅ **Proteção contra MITM**: O HMAC garante que ninguém interceptou e modificou

### Modo de Desenvolvimento e Testes

A validação funciona em dois modos:

#### 1. Com Assinatura (Webhooks Reais)
Quando o Mercado Pago envia os headers `x-signature` e `x-request-id`, a validação é **obrigatória**:
- ✅ Se válida: processa normalmente
- ❌ Se inválida: retorna 401 Unauthorized

#### 2. Sem Assinatura (Testes do MP)
Quando não há headers de assinatura (testes do painel do MP), o webhook é **aceito** com um aviso:
```
⚠️ [Webhook] No signature provided - accepting for testing purposes
⚠️ [Webhook] In production with real payments, signatures should be present
```

**⚠️ IMPORTANTE**: 
- Webhooks reais do Mercado Pago SEMPRE incluem assinatura
- Se não houver assinatura em produção, pode ser uma tentativa de ataque
- Configure o secret para garantir validação em webhooks reais

## 📝 Logs

A validação gera logs detalhados para debug:

```
🔔 [Webhook] Received: { paymentId: '12345', topic: 'payment' }
🔐 [Webhook] Signature: ts=1697500000,v1=abc123...
🔐 [Webhook] Request ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
🔐 [Webhook] Manifest: id:12345;request-id:a1b2c3d4-e5f6-7890-abcd-ef1234567890;ts:1697500000;
🔐 [Webhook] Generated hash: abc123...
🔐 [Webhook] Received hash: abc123...
✅ [Webhook] Signature validated
```

## 🧪 Testando

### Teste Manual

Use o endpoint de processamento manual (não valida assinatura):

```bash
curl -X POST https://api-integracaomp.tehkly.com/api/payments/manual-process/12345678
```

### Teste com Webhook Real

Use a ferramenta de simulação do Mercado Pago ou faça um pagamento real de teste.

## 🔗 Referências

- [Documentação Oficial - Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Validação de Assinatura](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#bookmark_validar_origem_da_notifica%C3%A7%C3%A3o)

## 🚨 Troubleshooting

### Erro: "Invalid webhook signature"

1. **Verifique o secret**: Certifique-se de que está usando o secret correto do painel
2. **Formato do manifest**: O formato deve ser exatamente `id:{id};request-id:{uuid};ts:{timestamp};`
3. **Encoding**: Certifique-se de que não há espaços extras ou caracteres especiais
4. **Logs**: Verifique os logs para comparar o hash gerado vs recebido

### Webhook não está chegando

1. **URL configurada**: Verifique se a URL está correta no painel do MP
2. **HTTPS**: O Mercado Pago só envia webhooks para URLs HTTPS
3. **Firewall**: Certifique-se de que a porta está aberta
4. **Logs do servidor**: Verifique se há erros no container

## 📊 Status Codes

- **200**: Webhook processado com sucesso
- **401**: Assinatura inválida (Unauthorized)
- **500**: Erro interno ao processar webhook
