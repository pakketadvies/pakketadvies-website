import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

/**
 * Script om marketingbeelden voor PakketAdvies te genereren via de OpenAI Images API.
 *
 * Gebruik (lokaal bij jou):
 * 1) Voeg in `.env.local` toe: OPENAI_API_KEY=jouweigenapikey
 * 2) Run:  npx ts-node scripts/generate-images.ts
 */

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY ontbreekt. Zet deze in je .env.local vóór je het script draait.')
  process.exit(1)
}

const client = new OpenAI({ apiKey })

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images')

type ImageSpec = {
  filename: string
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '1536x1024' | '1024x1536'
}

const basePrompt =
  'Ultra high quality, realistic business photo, modern Dutch SME and corporate context, clean white office or business environment, soft daylight, minimal styling, subtle energy theme (screens with energy usage graphs, contracts, charts), color palette navy (#1A3756) and teal (#00AF9B) accents, professional, trustworthy, no text, no logos, no watermarks.'

const images: ImageSpec[] = [
  {
    filename: 'hero-main.jpg',
    size: '1792x1024',
    prompt:
      basePrompt +
      ' Wide shot of an energy consultant and business owner standing next to a large wall screen showing abstract energy price graphs and contract options, clean white office interior, glass walls, both looking confident, background slightly blurred.',
  },
  {
    filename: 'features-dashboard.jpg',
    size: '1024x1024',
    prompt:
      basePrompt +
      ' Close-up of a clean white desk with a laptop showing an abstract energy usage and tariff comparison dashboard, next to neatly stacked printed contracts and a pen, minimal composition, soft shadows, charts visible but not readable.',
  },
  {
    filename: 'how-it-works-docs.jpg',
    size: '1024x1024',
    prompt:
      basePrompt +
      ' Top-down shot of three printed pages on a white desk: energy usage overview, contract comparison, and signed contract, with a pen placed neatly, minimal layout, navy and teal highlights on the documents, text hinting at structure but not readable.',
  },
  {
    filename: 'calculator-laptop.jpg',
    size: '1024x1024',
    prompt:
      basePrompt +
      ' Close-up of hands typing on a laptop with a clean energy savings calculator interface on screen, simple charts and numbers visible but not readable, white desk, small plant slightly blurred in the background, navy and teal UI elements.',
  },
  {
    filename: 'contract-signing.jpg',
    size: '1024x1024',
    prompt:
      basePrompt +
      ' Close-up of a business person signing an energy contract with a high-quality pen on a clean white table, second hand pointing at a specific line on the contract, subtle navy and teal highlights in pen or folder, background office blurred, no readable text.',
  },
  {
    filename: 'testimonial-bakery.jpg',
    size: '1024x1024',
    prompt:
      basePrompt +
      ' Owner of a small modern bakery standing in the shop, talking with an energy consultant at a small table with a laptop open on abstract energy usage graphs, warm but minimal interior, focus on trustworthy collaboration.',
  },
  {
    filename: 'testimonial-warehouse.jpg',
    size: '1024x1024',
    prompt:
      basePrompt +
      ' Owner of a logistics or transport company in a modern warehouse, standing with an energy consultant reviewing a tablet with abstract energy cost graphs, forklifts and shelves blurred in background, professional but approachable.',
  },
  {
    filename: 'solar-roof.jpg',
    size: '1792x1024',
    prompt:
      basePrompt +
      ' Medium-sized commercial rooftop fully covered with solar panels, modern industrial area in background, clear sky, subtle teal tint in reflections, clean and minimal composition, no people, no logos.',
  },
]

async function generateImage({ filename, prompt, size = '1024x1024' }: ImageSpec) {
  console.log(`▶️  Generating ${filename} ...`)

  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size,
    n: 1,
    response_format: 'b64_json',
  })

  const image = response.data && response.data[0]
  const b64 = image?.b64_json

  if (!b64) {
    throw new Error(`Geen base64 data ontvangen voor ${filename}`)
  }

  const buffer = Buffer.from(b64, 'base64')

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const outPath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(outPath, buffer)

  console.log(`✅  ${filename} opgeslagen in public/images`)
}

async function main() {
  console.log('🚀 Beelden genereren voor PakketAdvies...')
  for (const spec of images) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await generateImage(spec)
    } catch (err) {
      console.error(`❌ Fout bij ${spec.filename}:`, err)
    }
  }
  console.log('✨ Klaar. Beelden staan in public/images.')
}

main().catch((err) => {
  console.error('❌ Onverwachte fout:', err)
  process.exit(1)
})

