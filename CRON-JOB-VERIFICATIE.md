# Cron Job Verificatie

## ✅ Wat Werkt

De cron job endpoint werkt perfect:
- ✅ Morgen's prijzen worden opgehaald en opgeslagen
- ✅ Vandaag's prijzen worden gecheckt en opgehaald als ze ontbreken
- ✅ Authenticatie werkt
- ✅ Logging werkt

## 🔍 Wat We Moeten Checken

### 1. Is de Cron Job Geactiveerd in Vercel?

1. **Vercel Dashboard** → Project "pakketadvies-website"
2. **Settings** → **Cron Jobs** (in linker sidebar)
3. Check of `/api/cron/update-dynamic-prices` zichtbaar is
4. **BELANGRIJK**: Check of de "Enabled" toggle **AAN** staat
5. Check de "Schedule": moet zijn `0 14 * * *` (elke dag om 14:00 UTC)

### 2. Check Execution History

1. Klik op de cron job in de lijst
2. Ga naar **"Execution History"** tab
3. Check of er automatische runs zijn:
   - Vandaag om 14:00 UTC (als het al 14:00 UTC is geweest)
   - Gisteren om 14:00 UTC
   - Etc.

### 3. Als Er Geen Automatische Runs Zijn

**Mogelijke oorzaken:**
- Cron job is niet geactiveerd (toggle staat uit)
- Vercel plan ondersteunt geen cron jobs
- Cron job is pas net toegevoegd (kan 1-2 uur duren voordat eerste run start)

**Oplossing:**
- Zet de "Enabled" toggle aan
- Wacht tot 14:00 UTC voor de volgende automatische run
- Of trigger handmatig via "Trigger Now" om te testen

### 4. Test Handmatig via Vercel Dashboard

1. **Cron Jobs** → Klik op de cron job
2. Klik op **"Trigger Now"** of **"Run Now"** button
3. Wacht 10-30 seconden
4. Check **Execution History** voor de nieuwe run
5. Als deze werkt, werkt de automatische cron job ook (als hij geactiveerd is)

## 📊 Verwachte Werking

**Automatisch:**
- Elke dag om 14:00 UTC
- Vercel triggert automatisch de cron job
- Logs verschijnen in Execution History

**Handmatig:**
- Via "Trigger Now" in Vercel Dashboard
- Via curl met Authorization header (zoals ik net deed)

## 🎯 Volgende Stap

**Check of de cron job geactiveerd is in Vercel Dashboard!**

Als de "Enabled" toggle UIT staat, zet hem dan AAN. Dan zou de cron job automatisch moeten draaien om 14:00 UTC elke dag.

