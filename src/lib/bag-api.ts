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
      if (toevoeging) {
        if (/^[a-zA-Z]$/.test(toevoeging)) {
          addressUrl += `&huisletter=${toevoeging}`;
        } else if (/^\d+$/.test(toevoeging)) {
          addressUrl += `&huisnummertoevoeging=${toevoeging}`;
        }
      }

      const addressResponse = await fetch(addressUrl, {
        headers: {
          'Accept': 'application/hal+json',
          'X-Api-Key': this.API_KEY
        }
      });

      if (!addressResponse.ok) {
        return { type: 'error', message: 'Adres niet gevonden' };
      }

      const addressData = await addressResponse.json();

      if (!addressData._embedded?.adresssen?.[0]) {
        return { type: 'error', message: 'Adres niet gevonden' };
      }

      const address = addressData._embedded.adressen[0];

      // 4. Check voor vereiste toevoeging
      if (!toevoeging && (address.huisletter || address.huisnummertoevoeging)) {
        return { type: 'error', message: 'Toevoeging vereist' };
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
