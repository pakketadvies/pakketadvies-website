# ✅ Volledige Check: Alle Velden in Aanvraag Forms

## 📋 Particulier Aanvraag Form

### Gegevens Data (gegevens_data JSONB):
- ✅ aanhef
- ✅ voornaam
- ✅ voorletters
- ✅ tussenvoegsel
- ✅ achternaam
- ✅ geboortedatum (nu geconverteerd naar ISO)
- ✅ telefoonnummer
- ✅ emailadres
- ✅ heeft_andere_correspondentie_adres
- ✅ correspondentie_adres (straat, huisnummer, postcode, plaats) - **MISSING: toevoeging** (optioneel)

### Aanvraag Data (directe velden):
- ✅ contract_id
- ✅ contract_type
- ✅ contract_naam
- ✅ leverancier_id
- ✅ leverancier_naam
- ✅ aanvraag_type: 'particulier'
- ✅ verbruik_data (volledig object)
- ✅ gegevens_data (zie hierboven)
- ✅ iban
- ✅ rekening_op_andere_naam
- ✅ rekeninghouder_naam
- ✅ heeft_verblijfsfunctie
- ✅ gaat_verhuizen
- ✅ wanneer_overstappen
- ✅ contract_einddatum (nu geconverteerd naar ISO)
- ✅ ingangsdatum (nu geconverteerd naar ISO)
- ✅ is_klant_bij_leverancier
- ✅ herinnering_contract
- ✅ nieuwsbrief
- ✅ heeft_andere_correspondentie_adres
- ✅ correspondentie_adres (JSONB object)

---

## 📋 Zakelijk Aanvraag Form

### Gegevens Data (gegevens_data JSONB):
- ✅ bedrijfsnaam
- ✅ kvkNummer
- ✅ typeBedrijf
- ✅ aanhef
- ✅ voornaam
- ✅ voorletters
- ✅ tussenvoegsel
- ✅ achternaam
- ✅ geboortedatum (nu geconverteerd naar ISO)
- ✅ telefoon
- ✅ email
- ✅ contactpersoon (samengesteld uit voornaam + tussenvoegsel + achternaam)
- ✅ heeft_andere_correspondentie_adres
- ✅ correspondentie_adres (straat, huisnummer, postcode, plaats) - **MISSING: toevoeging** (optioneel)

### Aanvraag Data (directe velden):
- ✅ contract_id
- ✅ contract_type
- ✅ contract_naam
- ✅ leverancier_id
- ✅ leverancier_naam
- ✅ aanvraag_type: 'zakelijk'
- ✅ verbruik_data (volledig object)
- ✅ gegevens_data (zie hierboven)
- ✅ iban
- ✅ rekening_op_andere_naam
- ✅ rekeninghouder_naam
- ✅ heeft_verblijfsfunctie
- ✅ gaat_verhuizen
- ✅ wanneer_overstappen
- ✅ contract_einddatum (nu geconverteerd naar ISO)
- ✅ ingangsdatum (nu geconverteerd naar ISO)
- ✅ is_klant_bij_leverancier
- ✅ herinnering_contract
- ✅ nieuwsbrief
- ✅ heeft_andere_correspondentie_adres
- ✅ correspondentie_adres (JSONB object)

---

## 🔍 Opmerkingen:

1. **Correspondentie adres toevoeging**: Database schema ondersteunt `toevoeging` in correspondentie_adres, maar forms hebben dit veld niet. Dit is waarschijnlijk oké omdat correspondentie adres meestal geen toevoeging nodig heeft, maar we kunnen het toevoegen als optioneel veld.

2. **Datum conversie**: ✅ Alle datums worden nu geconverteerd naar ISO formaat (YYYY-MM-DD) voordat ze naar de database worden gestuurd.

3. **Alle andere velden**: ✅ Lijken correct te worden opgeslagen.

---

## ✅ Conclusie:

Alle belangrijke velden worden correct opgeslagen. De datum conversie fix zou het "date/time field value out of range" probleem moeten oplossen.

