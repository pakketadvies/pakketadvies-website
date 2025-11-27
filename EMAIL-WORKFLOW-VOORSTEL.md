# 📧 Perfect E-mail Opvolging Systeem voor Contractaanvragen

## 🎯 Doel
Een professionele, geautomatiseerde e-mail workflow implementeren die klanten perfect opvolgt na het indienen van een contractaanvraag, vergelijkbaar met gaslicht.com, minder.nl en overstappen.nl.

---

## 📋 E-mail Workflow Overzicht

### **Email 1: Directe Bevestiging (Direct na aanvraag)**
**Timing:** Direct na succesvolle form submission  
**Doel:** Bevestigen dat aanvraag is ontvangen en geruststellen

**Inhoud:**
- ✅ Bevestiging van ontvangst
- 📋 Aanvraagnummer prominent weergegeven
- 📝 Overzicht van ingediende gegevens (contract, leverancier, adres)
- ⏱️ Wat gebeurt er nu? (timeline: binnen 1 uur bevestiging, binnen 1 werkdag contact, binnen 2-3 weken actief)
- 📞 Contactgegevens voor vragen
- 🔗 Link naar klantportaal (optioneel) om status te volgen

**Tone:** Vriendelijk, professioneel, geruststellend

---

### **Email 2: Persoonlijk Contact (Binnen 1 werkdag)**
**Timing:** 1 werkdag na aanvraag (of wanneer status wordt gewijzigd naar "in_behandeling")  
**Doel:** Klant informeren dat er persoonlijk contact komt

**Inhoud:**
- 👋 Persoonlijke begroeting
- 📞 Aankondiging dat energiespecialist contact opneemt
- 📅 Wanneer kan klant contact verwachten?
- 📋 Wat wordt besproken tijdens het gesprek?
- ❓ Voorbereiding: welke vragen kan klant alvast bedenken?
- 📞 Alternatief: klant kan ook zelf bellen

**Tone:** Persoonlijk, behulpzaam, proactief

---

### **Email 3: Status Update - In Behandeling (Optioneel)**
**Timing:** Wanneer admin status wijzigt naar "in_behandeling"  
**Doel:** Klant op de hoogte houden van voortgang

**Inhoud:**
- ✅ Status update: "Uw aanvraag wordt nu verwerkt"
- 📋 Wat gebeurt er achter de schermen?
- ⏱️ Geschatte verwerkingstijd
- 📞 Contactgegevens voor vragen

**Tone:** Informatief, transparant

---

### **Email 4: Contract Actief / Voltooiing (Binnen 2-3 weken)**
**Timing:** Wanneer status wordt gewijzigd naar "afgehandeld"  
**Doel:** Klant informeren dat contract actief is

**Inhoud:**
- 🎉 Gefeliciteerd! Contract is actief
- 📋 Contractdetails (leverancier, tarieven, looptijd)
- 📅 Startdatum contract
- 💰 Besparingsoverzicht (indien beschikbaar)
- 📄 Belangrijke documenten (contract, voorwaarden)
- 📞 Contactgegevens voor vragen
- ⭐ Verzoek om review/feedback

**Tone:** Feestelijk, informatief, waarderend

---

### **Email 5: Follow-up / Review Request (1 week na activatie)**
**Timing:** 1 week na "afgehandeld" status  
**Doel:** Klanttevredenheid meten en relatie versterken

**Inhoud:**
- 💬 Hoe bevalt het nieuwe contract?
- ⭐ Verzoek om review/beoordeling
- 💡 Tips voor energiebesparing
- 📞 Contactgegevens voor vragen
- 🎁 Eventuele loyaliteitsprogramma's

**Tone:** Vriendelijk, waarderend, niet opdringerig

---

## 🛠️ Technische Implementatie

### **Optie 1: Resend (Aanbevolen) ⭐**
**Waarom Resend:**
- ✅ Perfecte integratie met Next.js en Supabase
- ✅ Uitstekende deliverability
- ✅ Eenvoudige API
- ✅ Goede prijs/kwaliteit verhouding
- ✅ Transactional emails (geen marketing)
- ✅ React Email support (voor mooie templates)

**Implementatie:**
1. Resend account aanmaken
2. API key toevoegen aan Vercel environment variables
3. React Email templates maken
4. API routes maken voor elke email trigger
5. Database triggers of webhooks voor automatisering

---

### **Optie 2: Supabase Edge Functions + Resend**
**Waarom:**
- ✅ Dicht bij database (lage latency)
- ✅ Automatische triggers bij database changes
- ✅ Serverless, schaalbaar

**Implementatie:**
1. Supabase Edge Function voor email sending
2. Database trigger die Edge Function aanroept
3. Resend API voor email delivery

---

### **Optie 3: SendGrid / Mailgun**
**Waarom:**
- ✅ Zeer betrouwbaar
- ✅ Uitgebreide analytics
- ✅ Goede deliverability
- ⚠️ Iets complexer dan Resend

---

## 📐 Database Schema Uitbreiding

### **Nieuwe tabel: `email_logs`**
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'bevestiging', 'contact', 'status_update', 'voltooiing', 'followup'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB, -- Extra data zoals email provider response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Uitbreiding `contractaanvragen` tabel:**
```sql
-- Voeg email voorkeuren toe
ALTER TABLE contractaanvragen
ADD COLUMN email_bevestiging_verzonden BOOLEAN DEFAULT false,
ADD COLUMN email_contact_verzonden BOOLEAN DEFAULT false,
ADD COLUMN email_voltooiing_verzonden BOOLEAN DEFAULT false,
ADD COLUMN email_preferences JSONB DEFAULT '{"nieuwsbrief": false, "status_updates": true}'::jsonb;
```

---

## 🎨 E-mail Template Structuur

### **Design Principes:**
- ✅ Mobile-first responsive design
- ✅ Consistent met website branding (brand-teal, brand-navy)
- ✅ Professioneel maar vriendelijk
- ✅ Duidelijke call-to-actions
- ✅ Goede leesbaarheid
- ✅ Alt-text voor alle afbeeldingen

### **Template Componenten:**
1. **Header:** Logo + bedrijfsnaam
2. **Greeting:** Persoonlijke aanhef
3. **Content:** Hoofdinhoud (variabel per email type)
4. **Timeline/Status:** Visuele weergave van voortgang (optioneel)
5. **Call-to-Action:** Duidelijke buttons
6. **Footer:** Contactgegevens, social media, unsubscribe link

---

## 🔄 Automatisering Workflow

### **Trigger 1: Directe Bevestiging**
**Trigger:** POST `/api/aanvragen/create` succesvol  
**Actie:** 
- Genereer email template met aanvraagdata
- Verstuur via Resend API
- Log in `email_logs` tabel
- Update `email_bevestiging_verzonden = true`

### **Trigger 2: Persoonlijk Contact**
**Trigger:** Status wijziging naar "in_behandeling" OF 1 werkdag na aanvraag  
**Actie:**
- Check of email al verzonden (`email_contact_verzonden`)
- Genereer email template
- Verstuur via Resend API
- Log in `email_logs`
- Update `email_contact_verzonden = true`

### **Trigger 3: Status Updates**
**Trigger:** Status wijziging in admin panel  
**Actie:**
- Check email preferences (als klant status updates heeft aangevinkt)
- Genereer gepersonaliseerde status update email
- Verstuur via Resend API
- Log in `email_logs`

### **Trigger 4: Contract Actief**
**Trigger:** Status wijziging naar "afgehandeld"  
**Actie:**
- Genereer voltooiing email met contractdetails
- Verstuur via Resend API
- Log in `email_logs`
- Update `email_voltooiing_verzonden = true`
- Schedule follow-up email (1 week later)

### **Trigger 5: Follow-up**
**Trigger:** 1 week na "afgehandeld" status  
**Actie:**
- Check of follow-up nog niet verzonden
- Genereer follow-up email
- Verstuur via Resend API
- Log in `email_logs`

---

## 📧 E-mail Template Voorbeelden

### **Email 1: Directe Bevestiging**

**Onderwerp:** ✅ Uw aanvraag is ontvangen - #{aanvraagnummer}

**Inhoud:**
```
Beste [Naam],

Bedankt voor uw aanvraag voor [Contract Naam] bij [Leverancier]!

Uw aanvraagnummer: #{aanvraagnummer}

We hebben uw aanvraag succesvol ontvangen en gaan direct voor u aan de slag.

📋 Overzicht van uw aanvraag:
- Contract: [Contract Naam]
- Leverancier: [Leverancier]
- Leveringsadres: [Adres]
- Aanvraagtype: [Particulier/Zakelijk]

⏱️ Wat gebeurt er nu?

1. Binnen 1 uur
   U ontvangt een bevestigingsmail met alle details van uw aanvraag 
   en uw persoonlijke contactpersoon.

2. Binnen 1 werkdag
   Een energiespecialist neemt contact met u op om uw aanvraag door 
   te nemen en eventuele vragen te beantwoorden.

3. Binnen 2-3 weken
   Na akkoord regelen wij de overstap. Uw nieuwe contract gaat in 
   en u begint te besparen!

📞 Heeft u vragen?
Ons team staat voor u klaar:
- Email: info@pakketadvies.nl
- Telefoon: 085 047 7065
- Ma-Vr: 09:00 - 17:00

Met vriendelijke groet,
Het PakketAdvies team
```

---

### **Email 2: Persoonlijk Contact**

**Onderwerp:** 📞 We nemen binnenkort contact met u op

**Inhoud:**
```
Beste [Naam],

Goed nieuws! We gaan uw aanvraag #{aanvraagnummer} nu persoonlijk 
behandelen.

👤 Uw persoonlijke contactpersoon
Een energiespecialist van ons team neemt binnen 1 werkdag contact 
met u op om:
- Uw aanvraag door te nemen
- Eventuele vragen te beantwoorden
- De volgende stappen te bespreken

📞 Zelf bellen?
U kunt ons ook direct bereiken:
- Telefoon: 085 047 7065
- Email: info@pakketadvies.nl
- Ma-Vr: 09:00 - 17:00

💡 Tip: Bedenk alvast welke vragen u heeft, dan kunnen we u 
direct helpen!

Met vriendelijke groet,
Het PakketAdvies team
```

---

### **Email 4: Contract Actief**

**Onderwerp:** 🎉 Uw nieuwe energiecontract is actief!

**Inhoud:**
```
Beste [Naam],

Gefeliciteerd! Uw nieuwe energiecontract is actief.

📋 Contractdetails:
- Contract: [Contract Naam]
- Leverancier: [Leverancier]
- Startdatum: [Datum]
- Looptijd: [X jaar]
- Tarief elektriciteit: € [X] per kWh
- Tarief gas: € [X] per m³

💰 Uw besparing
Op basis van uw verbruik bespaart u naar verwachting 
€ [X] per jaar!

📄 Belangrijke documenten
U ontvangt binnenkort van [Leverancier]:
- Uw contract
- Algemene voorwaarden
- Overstapbevestiging

📞 Vragen?
Ons team staat voor u klaar:
- Email: info@pakketadvies.nl
- Telefoon: 085 047 7065

⭐ Tevreden?
We horen graag wat u van onze service vindt!

Met vriendelijke groet,
Het PakketAdvies team
```

---

## 🚀 Implementatie Stappen

### **Fase 1: Basis Setup (Week 1)**
1. ✅ Resend account aanmaken
2. ✅ Resend API key toevoegen aan Vercel
3. ✅ React Email installeren
4. ✅ Basis email template component maken
5. ✅ Database schema uitbreiden

### **Fase 2: Directe Bevestiging (Week 1)**
1. ✅ Email 1 template maken
2. ✅ API route voor email sending
3. ✅ Integratie in `/api/aanvragen/create`
4. ✅ Testing

### **Fase 3: Status Updates (Week 2)**
1. ✅ Email 2 template maken
2. ✅ Automatisering voor "in_behandeling" status
3. ✅ Email 3 template (optioneel)
4. ✅ Testing

### **Fase 4: Voltooiing & Follow-up (Week 2)**
1. ✅ Email 4 template maken
2. ✅ Automatisering voor "afgehandeld" status
3. ✅ Email 5 template maken
4. ✅ Scheduled email (1 week na voltooiing)
5. ✅ Testing

### **Fase 5: Klantportaal (Optioneel - Week 3)**
1. ✅ Klantportaal pagina maken
2. ✅ Status tracking
3. ✅ Document downloads
4. ✅ Email history

---

## 💰 Kosten Overzicht

### **Resend Pricing:**
- **Free tier:** 3,000 emails/maand
- **Pro:** $20/maand voor 50,000 emails
- **Business:** $80/maand voor 200,000 emails

**Geschat verbruik:**
- 5 emails per aanvraag
- ~100 aanvragen/maand = 500 emails/maand
- **Gratis tier is voldoende!** 🎉

---

## ✅ Best Practices

1. **Deliverability:**
   - ✅ SPF, DKIM, DMARC records configureren
   - ✅ From address: `noreply@pakketadvies.nl` of `info@pakketadvies.nl`
   - ✅ Reply-to: `info@pakketadvies.nl`

2. **Privacy & Compliance:**
   - ✅ AVG/GDPR compliant
   - ✅ Unsubscribe link in elke email
   - ✅ Duidelijke privacy policy link

3. **Testing:**
   - ✅ Test op verschillende email clients (Gmail, Outlook, Apple Mail)
   - ✅ Test op mobiel en desktop
   - ✅ Test alle links en buttons

4. **Monitoring:**
   - ✅ Track open rates, click rates
   - ✅ Monitor bounce rates
   - ✅ Log alle emails in database

5. **Personalization:**
   - ✅ Gebruik klantnaam
   - ✅ Gebruik contractdetails
   - ✅ Gebruik aanvraagnummer

---

## 🎯 Success Metrics

- ✅ Email delivery rate > 95%
- ✅ Open rate > 40%
- ✅ Click rate > 10%
- ✅ Bounce rate < 2%
- ✅ Klanttevredenheid (via follow-up email)

---

## 📝 Volgende Stappen

1. **Beslissing maken:**
   - Welke email service? (Resend aanbevolen)
   - Welke emails zijn prioriteit?
   - Klantportaal nu of later?

2. **Goedkeuring:**
   - Email templates reviewen
   - Timing bespreken
   - Content finaliseren

3. **Implementatie:**
   - Volg implementatie stappen hierboven
   - Test grondig
   - Deploy naar productie

---

**Dit voorstel is gebaseerd op best practices van gaslicht.com, minder.nl, overstappen.nl en moderne email marketing automation.**

