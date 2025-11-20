#!/bin/bash

# Supabase Database Configuration
# ================================
# 
# Om database migraties via de terminal uit te voeren, heb je het database wachtwoord nodig.
#
# STAPPEN:
# --------
# 1. Ga naar: https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/settings/database
# 2. Scroll naar "Connection string" sectie
# 3. Klik op "Database password" en kopieer je wachtwoord
# 4. Voer onderstaand commando uit (vervang YOUR_PASSWORD met je echte wachtwoord):
#
#    export PGPASSWORD='YOUR_PASSWORD'
#
# 5. Nu kun je Supabase DB commando's uitvoeren zonder steeds het wachtwoord in te voeren
#
# Bijvoorbeeld:
#    supabase db push
#
# Of direct SQL uitvoeren:
#    psql "postgresql://postgres.dxztyhwiwgrxjnlohapm:YOUR_PASSWORD@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" -f supabase/migrations/004_fix_leveranciers_rls.sql

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SUPABASE DATABASE AUTHENTICATIE SETUP                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Stap 1: Haal je database wachtwoord op"
echo "   → https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/settings/database"
echo ""
echo "📌 Stap 2: Kopieer je wachtwoord en voer dit commando uit:"
echo ""
echo "   export PGPASSWORD='JOUW_WACHTWOORD_HIER'"
echo ""
echo "📌 Stap 3: Test de connectie:"
echo ""
echo "   supabase db push"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 TIP: Als je het wachtwoord niet meer weet, kun je het resetten via:"
echo "   https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/settings/database"
echo "   Klik op 'Reset database password'"
echo ""

