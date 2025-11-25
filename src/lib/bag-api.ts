export interface BagApiResponse {
  type: 'particulier' | 'zakelijk' | 'error';
  street?: string;
  city?: string;
  message: string;
}

export class BagApiService {
  private static readonly API_KEY = 'l79b1692caaba64c49919c7e7bf1a2d7e7';
  private static readonly BASE_URL = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2';

  static async checkAddress(
    postcode: string,
    huisnummer: string,
    toevoeging?: string
  ): Promise<BagApiResponse> {

    try {
      // 1. Postcode opschonen (exact zoals oude code)
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const parsedHuisnummer = parseInt(huisnummer, 10);

      // 2. Eerste API call: Adressen endpoint
      let addressUrl = `${this.BASE_URL}/adressen?postcode=${cleanPostcode}&huisnummer=${parsedHuisnummer}`;

      // 3. Toevoeging parameter (exact zoals oude code)
      const trimmedToevoeging = toevoeging?.trim();
      if (trimmedToevoeging) {
        // Test eerst of het een enkele letter is (huisletter)
        if (/^[a-zA-Z]$/.test(trimmedToevoeging)) {
          addressUrl += `&huisletter=${trimmedToevoeging.toUpperCase()}`;
        } 
        // Anders is het een huisnummertoevoeging (cijfers of combinatie)
        else if (/^[a-zA-Z0-9]+$/.test(trimmedToevoeging)) {
          addressUrl += `&huisnummertoevoeging=${trimmedToevoeging}`;
        }
      }

      const addressResponse = await fetch(addressUrl, {
        headers: {
          'Accept': 'application/hal+json',
          'X-Api-Key': this.API_KEY
        }
      });

      if (!addressResponse.ok) {
        const errorText = await addressResponse.text();
        console.error(`BAG API Error (${addressResponse.status}):`, errorText);
        return { 
          type: 'error', 
          message: addressResponse.status === 404 
            ? 'Adres niet gevonden in BAG database' 
            : `BAG API fout (${addressResponse.status})` 
        };
      }

      const addressData = await addressResponse.json();

      // Debug logging (alleen in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('BAG API Address Response:', JSON.stringify(addressData, null, 2));
      }

      // Check response structuur (kan _embedded.adressen of _embedded.adressen zijn)
      const adressen = addressData._embedded?.adressen || addressData._embedded?.adresssen;
      
      if (!adressen || !Array.isArray(adressen) || adressen.length === 0) {
        console.error('BAG API: Geen adressen gevonden in response', addressData);
        return { type: 'error', message: 'Adres niet gevonden' };
      }

      let address = adressen[0];

      // 4. Check voor vereiste toevoeging (maar alleen als er meerdere adressen zijn)
      // Als er maar 1 adres is, kunnen we doorgaan zonder toevoeging
      if (!trimmedToevoeging && adressen.length > 1) {
        // Er zijn meerdere adressen, toevoeging is waarschijnlijk nodig
        // Maar we proberen eerst met het eerste adres
        console.warn('BAG API: Meerdere adressen gevonden, maar geen toevoeging opgegeven. Gebruik eerste resultaat.');
      }
      
      // Als er wel een toevoeging is opgegeven, check of deze matcht
      if (trimmedToevoeging) {
        const hasHuisletter = address.huisletter && address.huisletter.toUpperCase() === trimmedToevoeging.toUpperCase();
        const hasToevoeging = address.huisnummertoevoeging && address.huisnummertoevoeging === trimmedToevoeging;
        
        if (!hasHuisletter && !hasToevoeging && adressen.length > 1) {
          // Toevoeging komt niet overeen, probeer andere adressen
          const matchingAddress = adressen.find((addr: any) => {
            const addrLetter = addr.huisletter?.toUpperCase();
            const addrToevoeging = addr.huisnummertoevoeging;
            return addrLetter === trimmedToevoeging.toUpperCase() || addrToevoeging === trimmedToevoeging;
          });
          
          if (matchingAddress) {
            // Gebruik het matching adres
            address = matchingAddress;
          } else {
            return { type: 'error', message: `Toevoeging '${trimmedToevoeging}' komt niet overeen met adres` };
          }
        }
      }

      // 5. Tweede API call: Verblijfsobject
      const verblijfIdentificatie = address.adresseerbaarObjectIdentificatie;
      const verblijfUrl = `${this.BASE_URL}/verblijfsobjecten/${verblijfIdentificatie}`;

      const verblijfResponse = await fetch(verblijfUrl, {
        headers: {
          'Accept': 'application/hal+json',
          'Accept-Crs': 'epsg:28992',
          'X-Api-Key': this.API_KEY
        }
      });

      if (!verblijfResponse.ok) {
        return { type: 'error', message: 'Kan adresdetails niet ophalen' };
      }

      const verblijfData = await verblijfResponse.json();

      if (!verblijfData.verblijfsobject?.gebruiksdoelen) {
        return { type: 'error', message: 'Kan gebruiksdoelen niet bepalen' };
      }

      // 6. EXACTE woonfunctie logica uit oude code
      const gebruiksdoelen = verblijfData.verblijfsobject.gebruiksdoelen;

      let audienceType: 'particulier' | 'zakelijk';
      if (gebruiksdoelen.includes('woonfunctie')) {
        const otherFunctions = gebruiksdoelen.filter((f: string) => f !== 'woonfunctie');
        audienceType = otherFunctions.length === 0 ? 'particulier' : 'zakelijk';
      } else {
        audienceType = 'zakelijk';
      }

      return {
        type: audienceType,
        street: address.openbareRuimteNaam,
        city: address.woonplaatsNaam,
        message: audienceType === 'particulier'
          ? 'Particulier adres - geschikt voor consumentencontracten'
          : 'Zakelijk adres - geschikt voor zakelijke contracten'
      };

    } catch (error) {
      console.error('BAG API Error:', error);
      return { type: 'error', message: 'Technische fout bij adrescontrole' };
    }
  }
}
