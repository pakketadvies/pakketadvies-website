#!/usr/bin/env python3
"""
Script om alle aanbieding pagina's te updaten met formulier bovenaan in hero
"""

import re

# Hero template met formulier rechts (2-kolommen layout)
def update_hero_section(content, page_config):
    """Update de hero sectie met 2-kolommen layout inclusief formulier"""
    
    # Find the hero section
    hero_pattern = r'(\/\* Hero \*\/|\/\* Hero met Inline Formulier \*\/)\s*<section className="bg-brand-navy-500.*?<\/section>'
    
    # Nieuwe hero sectie met formulier
    new_hero = f'''      {{/* Hero met Inline Formulier */}}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        {{/* Background Image */}}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="{page_config['image_alt']}"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        {{/* Animated background elements */}}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{{{ animationDelay: '1s' }}}} />
        </div>
        
        <div className="container-custom relative z-10">
          {{/* 2-kolommen layout: Hero content + Formulier */}}
          <div className="grid lg:grid-cols-[1fr,480px] gap-12 items-start">
            {{/* Links: Hero Content */}}
            <div>
              {{/* Badge */}}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
                <{page_config['badge_icon']} weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm font-semibold text-brand-teal-200">{page_config['badge_text']}</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {page_config['title']}{{' '}}
                <span className="text-brand-teal-500">{page_config['title_highlight']}</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                {page_config['subtitle']}
              </p>

              {{/* Trust indicators */}}
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
{page_config['trust_indicators']}
              </div>
            </div>

            {{/* Rechts: Formulier Card */}}
            <div className="lg:sticky lg:top-32">
              <Card className="bg-white shadow-2xl border-0">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6 text-center">
                    <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                      {page_config['form_title']}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Binnen 24 uur reactie · Gratis en vrijblijvend
                    </p>
                  </div>
                  
                  <AanbiedingInteresseForm 
                    aanbiedingType="{page_config['form_type']}"
                    compact={{true}}
                  />
                  
                  {{/* Trust badges */}}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
                        <span>Binnen 24 uur</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
                        <span>7.500+ klanten</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {{/* Bottom wave transition */}}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-20 md:h-24 lg:h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white"/>
          </svg>
        </div>
      </section>'''
    
    # Replace the hero section
    updated_content = re.sub(hero_pattern, new_hero, content, flags=re.DOTALL)
    
    return updated_content


def remove_bottom_form(content):
    """Verwijder het formulier onderaan de pagina"""
    
    # Pattern voor interesse formulier sectie
    form_pattern = r'\/\* Interesse Formulier.*?<\/section>\s*'
    
    updated_content = re.sub(form_pattern, '', content, flags=re.DOTALL)
    
    return updated_content


def update_final_cta(content):
    """Update de finale CTA om naar boven te scrollen i.p.v. naar formulier"""
    
    # Vervang scroll to form met scroll naar top
    updated_content = content.replace(
        '''const formElement = document.getElementById('interesse-formulier')
                formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })''',
        '''window.scrollTo({ top: 0, behavior: 'smooth' })'''
    )
    
    updated_content = updated_content.replace(
        'Laat je gegevens achter en ontdek hoeveel je kunt besparen',
        'Scroll naar boven en vul het formulier in, of bel ons direct voor persoonlijk advies'
    )
    
    updated_content = updated_content.replace(
        'Toon interesse',
        'Scroll naar boven'
    )
    
    return updated_content


# Configuraties per pagina
PAGE_CONFIGS = {
    'mkb-3-jaar': {
        'image_alt': 'Business energy savings',
        'badge_icon': 'Buildings',
        'badge_text': 'MKB 3-jarig vast contract',
        'title': 'Vaste tarieven voor uw',
        'title_highlight': 'MKB-bedrijf',
        'subtitle': '3 jaar lang budgetzekerheid met scherpe zakelijke tarieven. Perfect voor je bedrijfsplanning en financiële rust.',
        'trust_indicators': '''                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <Calculator weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Budgetzekerheid</div>
                    <div className="font-semibold text-white">3 jaar vast</div>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <ChartLineUp weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Zakelijke</div>
                    <div className="font-semibold text-white">Voordelige tarieven</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Volledig</div>
                    <div className="font-semibold text-white">Gratis advies</div>
                  </div>
                </div>''',
        'form_title': 'Vraag offerte aan',
        'form_type': 'mkb-3-jaar',
    },
}

print("Script gemaakt maar niet uitgevoerd - te complex voor Python")
print("Gebruik manual search_replace in plaats daarvan")

