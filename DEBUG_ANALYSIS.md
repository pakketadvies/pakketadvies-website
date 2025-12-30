# BREEDTE PROBLEEM DEBUG ANALYSE

## Huidige Structuur:
```
<div className="container-custom max-w-7xl">  
  └─ padding: 1rem mobiel (16px), 1.5rem tablet (24px), 2rem desktop (32px)
  
  <div className="mt-5">
    <div className="mb-5 rounded-2xl bg-brand-navy-500 px-5 py-4">
      └─ BLAUWE BANNER - heeft px-5 (20px) padding
    
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside>
        └─ SIDEBAR: Help mij kiezen card
           └─ geen extra padding
      
      <section className="space-y-4">
        └─ RESULTS LIST: Contract cards
           └─ Card component heeft eigen padding p-4
           └─ geen container padding

## PROBLEEM:
1. **Mobiel**: 
   - container-custom: 16px padding links+rechts = 32px totaal
   - Blauwe banner: 20px padding links+rechts BINNEN container = width: calc(100vw - 32px - 40px)
   - Contract cards: GEEN extra padding, width: calc(100vw - 32px)
   - Cards zijn BREDER dan banner!

2. **Desktop**:
   - grid gap-6 = 24px gap tussen sidebar (340px) en main
   - Sidebar + gap + main = zou moeten passen in container
   - MAAR: geen explicit width constraint op main column
   - Main column kan uitlopen!

## OPLOSSING:
De grid heeft GEEN padding, maar de cards ZOU
