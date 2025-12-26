# 🔍 SEO Audit - PakketAdvies Website
**Datum**: 27 januari 2025

## 📊 Executive Summary

De website heeft een goede basis voor SEO, maar er zijn belangrijke verbeteringen nodig voor:
- **Social sharing** (WhatsApp, Facebook, Twitter) - Open Graph tags ontbreken op veel pagina's
- **Particuliere pagina's** - Minimale metadata
- **Structured data** - Kan uitgebreid worden
- **Sitemap** - Mist belangrijke pagina's
- **robots.txt** - Is leeg

---

## ✅ Wat goed is

1. **Basis metadata** op hoofdpagina's (zakelijk)
2. **Open Graph** op homepage en kennisbank
3. **Twitter Cards** op homepage
4. **Canonical URLs** op meeste pagina's
5. **Sitemap.ts** bestaat en wordt dynamisch gegenereerd
6. **Structured data** componenten bestaan (Organization, Breadcrumb, FAQ, Service)

---

## ❌ Kritieke problemen

### 1. **robots.txt is leeg**
- **Impact**: Hoog
- **Probleem**: Geen directives voor crawlers
- **Fix**: Toevoegen van allow/disallow rules, sitemap reference

### 2. **Particuliere pagina's hebben minimale metadata**
- **Impact**: Hoog
- **Probleem**: 
  - Geen description
  - Geen Open Graph tags
  - Geen Twitter cards
  - Minimale title
- **Voorbeelden**:
  - `/particulier` - alleen title
  - `/particulier/vast` - alleen title
  - `/particulier/dynamisch` - alleen title
  - `/particulier/energie-vergelijken` - alleen title

### 3. **Calculator pagina's hebben geen metadata**
- **Impact**: Medium
- **Probleem**: `/calculator` heeft geen metadata
- **Fix**: Metadata toevoegen met description, OG tags

### 4. **Open Graph images zijn niet specifiek**
- **Impact**: Medium
- **Probleem**: Bijna alle pagina's gebruiken `hero-main.jpg`
- **Impact**: Social sharing ziet er generiek uit
- **Fix**: Specifieke images per pagina type

### 5. **Sitemap mist pagina's**
- **Impact**: Medium
- **Probleem**: 
  - Sectoren subpagina's ontbreken (horeca, retail, kantoren, etc.)
  - Producten subpagina's ontbreken (vast-contract, dynamisch-contract, etc.)
  - Aanbiedingen subpagina's ontbreken
- **Fix**: Alle pagina's toevoegen aan sitemap

### 6. **Structured data is beperkt**
- **Impact**: Medium
- **Probleem**:
  - Geen FAQ schema op FAQ pagina's
  - Geen LocalBusiness schema
  - Geen Product schema voor contracten
  - Geen Breadcrumb schema op meeste pagina's
- **Fix**: Structured data toevoegen waar relevant

### 7. **Geen hreflang tags**
- **Impact**: Laag (maar belangrijk voor internationale SEO)
- **Probleem**: Geen hreflang voor zakelijk/particulier varianten
- **Fix**: Hreflang toevoegen waar relevant

---

## 🔧 Aanbevelingen per prioriteit

### **PRIORITEIT 1 (Kritiek - Direct fixen)**

1. **robots.txt vullen**
   - Allow rules voor belangrijke pagina's
   - Disallow voor admin, API routes
   - Sitemap reference

2. **Particuliere pagina's: volledige metadata**
   - Title, description, keywords
   - Open Graph tags
   - Twitter cards
   - Canonical URLs

3. **Calculator metadata**
   - Title, description
   - Open Graph tags

### **PRIORITEIT 2 (Belangrijk - Binnenkort fixen)**

4. **Sitemap uitbreiden**
   - Alle sectoren subpagina's
   - Alle producten subpagina's
   - Alle aanbiedingen subpagina's

5. **Specifieke Open Graph images**
   - Per pagina type een relevante image
   - Correcte afmetingen (1200x630px)

6. **Structured data uitbreiden**
   - FAQ schema op FAQ pagina's
   - LocalBusiness schema op contact/over-ons
   - Breadcrumb schema op alle pagina's

### **PRIORITEIT 3 (Nice to have)**

7. **Hreflang tags** (als meertalig in toekomst)
8. **Product schema** voor contracten
9. **Review/Rating schema** (als reviews beschikbaar zijn)

---

## 📱 Social Sharing Check

### WhatsApp / Facebook / LinkedIn
- **Homepage**: ✅ Goed (OG tags aanwezig)
- **Kennisbank**: ✅ Goed
- **Particulier**: ❌ Geen OG tags
- **Calculator**: ❌ Geen OG tags
- **Sectoren**: ✅ Goed
- **Producten**: ✅ Goed

### Twitter
- **Homepage**: ✅ Goed (Twitter card)
- **Kennisbank**: ✅ Goed
- **Particulier**: ❌ Geen Twitter card
- **Andere pagina's**: ❌ Meeste missen Twitter cards

---

## 🎯 Conversie-optimalisatie voor SEO

### Huidige situatie
- Metadata is vaak te generiek
- Geen call-to-action in descriptions
- Open Graph descriptions zijn niet converterend

### Aanbevelingen
1. **Descriptions moeten converteren**:
   - Voeg voordelen toe ("Bespaar tot 30%")
   - Voeg urgency toe ("Gratis advies")
   - Duidelijke CTA ("Vergelijk nu")

2. **Open Graph images moeten converteren**:
   - Voeg tekst toe aan images (bijv. "Bespaar tot 30%")
   - Gebruik brand colors
   - Duidelijke call-to-action

3. **Structured data voor rich snippets**:
   - FAQ schema voor featured snippets
   - Review schema voor sterren in zoekresultaten
   - Product schema voor product listings

---

## 📋 Checklist per pagina type

### Homepage (/)
- ✅ Title
- ✅ Description
- ✅ Keywords
- ✅ Open Graph
- ✅ Twitter Card
- ✅ Canonical
- ✅ Structured Data (Organization)
- ⚠️ Open Graph image kan converterender

### Particulier (/particulier)
- ✅ Title
- ❌ Description
- ❌ Keywords
- ❌ Open Graph
- ❌ Twitter Card
- ✅ Canonical
- ❌ Structured Data

### Calculator (/calculator)
- ❌ Title
- ❌ Description
- ❌ Keywords
- ❌ Open Graph
- ❌ Twitter Card
- ❌ Canonical
- ❌ Structured Data

### Kennisbank (/kennisbank)
- ✅ Title
- ✅ Description
- ✅ Keywords
- ✅ Open Graph
- ✅ Twitter Card
- ✅ Canonical
- ⚠️ Structured Data kan uitgebreid

### Sectoren (/sectoren)
- ✅ Title
- ✅ Description
- ✅ Keywords
- ✅ Open Graph
- ✅ Twitter Card
- ✅ Canonical
- ❌ Structured Data (Service schema)

---

## 🚀 Implementatie Plan

1. **Fase 1**: Kritieke fixes (robots.txt, particuliere metadata, calculator metadata)
2. **Fase 2**: Sitemap uitbreiden, specifieke OG images
3. **Fase 3**: Structured data uitbreiden, hreflang tags

---

## 📊 Verwachte impact

Na implementatie:
- **Social sharing**: 100% van pagina's heeft goede previews
- **Google Search**: Betere rankings door complete metadata
- **Click-through rate**: Hoger door converterende descriptions
- **Rich snippets**: Mogelijkheid voor featured snippets, FAQ snippets

