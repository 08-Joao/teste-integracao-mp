# 🔄 Guia de Migração - Múltiplos Pagamentos por Proposta

## Mudanças no Schema

### Antes
```prisma
model OnCallProposal {
  payment  Payment?  // One-to-one
}

model Payment {
  proposalId  String  @unique  // Único
}
```

### Depois
```prisma
model OnCallProposal {
  payments  Payment[]  // One-to-many
}

model Payment {
  proposalId  String  // Não único - permite múltiplas tentativas
}
```

## 🚀 Como Aplicar a Migração

### Passo 1: Gerar a Migration

```bash
cd teste-integracao-backend
pnpm prisma migrate dev --name allow-multiple-payments-per-proposal
```

### Passo 2: Aplicar em Produção

Na VPS:

```bash
cd /caminho/do/projeto/teste-integracao

# Pull das alterações
git pull

# Entrar no container do backend
docker exec -it teste_integracao_backend sh

# Aplicar migration
cd /app
pnpm prisma migrate deploy

# Sair do container
exit

# Reiniciar
docker-compose restart teste_integracao_backend
```

## ⚠️ Impacto

### Benefícios
- ✅ Permite múltiplas tentativas de pagamento
- ✅ Histórico completo de transações
- ✅ Usuário pode tentar novamente se falhar

### Considerações
- ⚠️ Código deve buscar o último pagamento aprovado
- ⚠️ Webhook pode receber notificações de pagamentos antigos

## 🔧 Ajustes no Código

### Buscar Último Pagamento Aprovado

```typescript
// Antes
const payment = await prisma.payment.findUnique({
  where: { proposalId }
});

// Depois
const payment = await prisma.payment.findFirst({
  where: { 
    proposalId,
    status: 'APPROVED'
  },
  orderBy: { createdAt: 'desc' }
});
```

## 📊 Verificar Dados Após Migração

```sql
-- Ver pagamentos por proposta
SELECT proposalId, COUNT(*) as payment_count
FROM Payment
GROUP BY proposalId
HAVING COUNT(*) > 1;

-- Ver status dos pagamentos
SELECT status, COUNT(*) 
FROM Payment 
GROUP BY status;
```

## 🆘 Rollback (se necessário)

Se algo der errado:

```bash
# Ver histórico de migrations
pnpm prisma migrate status

# Fazer rollback
pnpm prisma migrate resolve --rolled-back <migration_name>
```

## ✅ Checklist

- [ ] Gerar migration localmente
- [ ] Testar localmente
- [ ] Commitar mudanças
- [ ] Pull na VPS
- [ ] Aplicar migration na VPS
- [ ] Verificar logs
- [ ] Testar pagamento
