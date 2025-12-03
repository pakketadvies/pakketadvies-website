# Vercel Cron Jobs - Plan Beperkingen

## ✅ Hobby Plan (Gratis)

**Cron jobs zijn beschikbaar op Hobby plan!**

**Beperkingen:**
- ✅ Maximaal **2 cron jobs** per project
- ✅ Elke cron job kan maximaal **1x per dag** draaien
- ⚠️ **Uitvoeringstijd kan variëren**: 
  - Gepland om 14:00 UTC kan ergens tussen **14:00 en 14:59 UTC** worden uitgevoerd
  - Dit is normaal voor Hobby plan

**Onze cron job:**
- ✅ We hebben maar 1 cron job (binnen de limiet van 2)
- ✅ We draaien 1x per dag om 14:00 UTC (binnen de limiet)
- ✅ Dit zou moeten werken op Hobby plan!

## 💼 Pro Plan

**Voordelen:**
- ✅ Tot **40 cron jobs** per project
- ✅ **Onbeperkte uitvoeringen** per dag
- ✅ **Nauwkeurigere timing** (minder variatie)

## 🔍 Waarom Werkt Onze Cron Job Mogelijk Niet?

Als de cron job niet automatisch werkt op Hobby plan, kan het zijn:

1. **Cron job niet geactiveerd**
   - Check Settings → Cron Jobs → "Enabled" toggle

2. **Timing variatie**
   - Op Hobby plan kan de cron job tot 59 minuten later draaien
   - Check Execution History voor runs (ook als ze later zijn)

3. **Eerste run duurt langer**
   - Na het toevoegen van een cron job kan de eerste run 1-2 uur duren

4. **Vercel heeft de cron job nog niet geregistreerd**
   - Na een nieuwe deployment kan het even duren voordat Vercel de cron job ziet
   - Redeploy kan helpen

## ✅ Oplossing

**Check in Vercel Dashboard:**
1. Settings → Cron Jobs
2. Check of `/api/cron/update-dynamic-prices` zichtbaar is
3. Check of "Enabled" toggle **AAN** staat
4. Check Execution History voor runs (ook als ze later zijn dan 14:00 UTC)

**Als de cron job niet verschijnt:**
- Redeploy de applicatie
- Wacht 5-10 minuten
- Refresh de Cron Jobs pagina

**Als de cron job wel verschijnt maar niet draait:**
- Check Execution History voor errors
- Trigger handmatig via "Trigger Now" om te testen
- Check of er errors zijn in de logs

## 📊 Conclusie

**Cron jobs werken op Hobby plan!** 

Onze cron job zou moeten werken, maar:
- Timing kan variëren (14:00-14:59 UTC)
- Check Execution History voor runs (ook als ze later zijn)
- Zorg dat de "Enabled" toggle aan staat

