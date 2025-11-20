# 🗄️ DATABASE MIGRATIES TOEPASSEN

## ⚠️ BELANGRIJK: Handmatige Stap Vereist

De nieuwe energie-tarieven database migraties moeten handmatig worden toegepast via de Supabase Dashboard.

## 📋 Stappen:

### 1. **Open Supabase Dashboard**
Ga naar: https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/sql/new

### 2. **Voer Migratie 007 Uit**

Kopieer de inhoud van:
```
supabase/migrations/007_energie_combined.sql
```

Plak in de SQL Editor en klik op **"Run"**.

Deze migratie bevat:
- ✅ Alle tabellen voor netbeheerders, aansluitwaarden, tarieven
- ✅ 100% officiële seed data uit Sepa offerte
- ✅ RLS policies
- ✅ Enexis 2025 tarieven (3x80A, G25)

### 3. **Verificatie**

Run deze query om te controleren of alles werkt:

```sql
SELECT 
  n.naam as netbeheerder,
  a.code as aansluiting,
  t.all_in_tarief_jaar as tarief
FROM netbeheer_tarieven_elektriciteit t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_elektriciteit a ON t.aansluitwaarde_id = a.id
WHERE t.jaar = 2025 AND t.actief = true;
```

Je zou moeten zien:
```
Enexis | 3x80A | 4055.59
```

## ✅ Daarna

Na het toepassen van de migratie:
1. De rest van de code is al klaar
2. Berekeningslogica API werkt
3. Admin panel kan tarieven beheren
4. Calculator gebruikt deze data

## 🚀 Alternatief: Supabase CLI (als je DB wachtwoord hebt)

Als je het database wachtwoord hebt:

```bash
supabase db push
# Of specifiek deze migratie:
supabase db push --include-all
```

---

**Laat me weten zodra de migratie is toegepast, dan gaan we verder met de rest!** 🎯

