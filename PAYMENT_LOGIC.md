# 💳 Lógica de Pagamentos

## 🎯 Regra de Negócio

**Uma proposta pode ter apenas UM pagamento aprovado.**

## 🔄 Fluxo de Pagamento

### Cenário 1: Primeira Tentativa
```
1. Usuário tenta pagar proposta
2. Sistema verifica: não existe pagamento
3. ✅ Cria novo pagamento
4. Envia para Mercado Pago
```

### Cenário 2: Pagamento Já Aprovado
```
1. Usuário tenta pagar proposta novamente
2. Sistema verifica: existe pagamento com status APPROVED
3. ❌ Retorna erro: "This proposal already has an approved payment"
4. Não permite nova tentativa
```

### Cenário 3: Tentativa Após Falha
```
1. Usuário tentou pagar mas falhou (cartão recusado, erro, etc)
2. Sistema verifica: existe pagamento com status PENDING/REJECTED
3. ⚠️ Deleta o pagamento anterior
4. ✅ Cria novo pagamento
5. Envia para Mercado Pago
```

## 📊 Estados do Pagamento

```typescript
enum PaymentStatus {
  PENDING    // Aguardando confirmação
  APPROVED   // Aprovado ✅
  REJECTED   // Recusado ❌
  CANCELLED  // Cancelado
  REFUNDED   // Reembolsado
}
```

## 🔒 Constraint do Banco

```prisma
model Payment {
  proposalId  String  @unique  // ← Garante 1 pagamento por proposta
}
```

## 💻 Implementação

### Verificação Antes de Criar Pagamento

```typescript
// 1. Buscar pagamento existente
const existingPayment = await prisma.payment.findUnique({
  where: { proposalId }
});

// 2. Se existe e está aprovado → ERRO
if (existingPayment?.status === 'APPROVED') {
  throw new BadRequestException('This proposal already has an approved payment');
}

// 3. Se existe mas não está aprovado → DELETAR e permitir nova tentativa
if (existingPayment) {
  await prisma.payment.delete({
    where: { id: existingPayment.id }
  });
}

// 4. Criar novo pagamento
await prisma.payment.create({ ... });
```

## 🎭 Casos de Uso

### ✅ Permitidos

1. **Primeira tentativa de pagamento**
   - Não existe pagamento anterior
   - Cria novo

2. **Retry após falha**
   - Pagamento anterior: PENDING/REJECTED
   - Deleta anterior e cria novo

3. **Retry após timeout**
   - Pagamento anterior: PENDING (expirado)
   - Deleta anterior e cria novo

### ❌ Bloqueados

1. **Pagamento duplicado**
   - Já existe pagamento APPROVED
   - Retorna erro

2. **Fraude/Abuse**
   - Múltiplas tentativas com pagamento aprovado
   - Bloqueado pela constraint

## 🔔 Webhook

### Quando Webhook Chega

```typescript
// 1. Buscar informações do pagamento no MP
const paymentInfo = await mp.payment.get({ id: paymentId });

// 2. Se aprovado, atualizar banco
if (paymentInfo.status === 'approved') {
  await prisma.payment.updateMany({
    where: { mercadoPagoPaymentId: paymentId },
    data: { 
      status: 'APPROVED',
      paidAt: new Date()
    }
  });
  
  // 3. Confirmar proposta
  await prisma.onCallProposal.update({
    where: { id: proposalId },
    data: { status: 'CONFIRMED' }
  });
}
```

## 🛡️ Proteções

### 1. Constraint Único
```sql
UNIQUE CONSTRAINT on proposalId
```
Garante que não é possível criar 2 pagamentos para mesma proposta no banco.

### 2. Verificação de Status
```typescript
if (existingPayment.status === 'APPROVED') {
  throw new BadRequestException(...);
}
```
Impede nova tentativa se já foi pago.

### 3. Deleção de Falhas
```typescript
await prisma.payment.delete({ where: { id: existingPayment.id } });
```
Remove tentativas falhadas para permitir retry.

## 📱 Mensagens ao Usuário

### Frontend

```typescript
// Pagamento já aprovado
"Este atendimento já foi pago. Verifique seu histórico de pagamentos."

// Erro ao processar
"Erro ao processar pagamento. Tente novamente."

// Cartão recusado
"Pagamento recusado. Verifique os dados do cartão e tente novamente."
```

## 🔍 Logs

### Logs Importantes

```
💳 [Payment] Creating payment for proposal: cmg...
⚠️ [Payment] Removing previous failed payment attempt
✅ [Payment] Payment created: 123456
🔔 [Payment] Webhook received for payment: 123456
💳 [Payment] Payment status: approved
✅ [Payment] Proposal confirmed, request closed
```

## 🧪 Testes

### Teste 1: Primeira Tentativa
```
1. Criar proposta
2. Tentar pagar
3. ✅ Deve criar pagamento
```

### Teste 2: Retry Após Falha
```
1. Criar proposta
2. Tentar pagar (cartão recusado)
3. Tentar pagar novamente
4. ✅ Deve deletar anterior e criar novo
```

### Teste 3: Pagamento Duplicado
```
1. Criar proposta
2. Pagar com sucesso
3. Tentar pagar novamente
4. ❌ Deve retornar erro
```

## 🚨 Troubleshooting

### Erro: "Unique constraint failed on proposalId"

**Causa:** Tentando criar segundo pagamento sem deletar o primeiro  
**Solução:** Verificar se a lógica de verificação está sendo executada

### Erro: "This proposal already has an approved payment"

**Causa:** Usuário tentando pagar proposta já paga  
**Solução:** Normal, mostrar mensagem amigável no frontend

### Pagamento não atualiza após webhook

**Causa:** Webhook não está encontrando o pagamento  
**Solução:** Verificar se `mercadoPagoPaymentId` está correto

## 📚 Referências

- Mercado Pago Docs: https://www.mercadopago.com.br/developers
- Prisma Constraints: https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-a-unique-field
