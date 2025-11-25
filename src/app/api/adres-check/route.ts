import { NextRequest, NextResponse } from 'next/server';
import { BagApiService } from '@/lib/bag-api';

export async function POST(request: NextRequest) {
  try {
    const { postcode, huisnummer, toevoeging } = await request.json();

    if (!postcode || !huisnummer) {
      return NextResponse.json(
        { error: 'Postcode en huisnummer zijn verplicht' },
        { status: 400 }
      );
    }

    const result = await BagApiService.checkAddress(postcode, huisnummer, toevoeging);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Adres check error:', error);
    return NextResponse.json(
      { error: 'Interne server fout' },
      { status: 500 }
    );
  }
}
