import fs from 'fs'
import path from 'path'
import https from 'https'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY ontbreekt.')
  process.exit(1)
}

const client = new OpenAI({ apiKey })
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images')

type ImageSpec = {
  filename: string
  prompt: string
  size?: '1024x1024' | '1792x1024'
}

const basePrompt =
  'Ultra high quality, realistic business photo, modern Dutch SME context, clean white office, soft daylight, minimal styling, subtle energy theme, color palette navy (#1A3756) and teal (#00AF9B) accents, professional, trustworthy, no text, no logos, no watermarks.'

const images: ImageSpec[] = [
  {
    filename: 'hero-main.jpg',
    size: '1792x1024',
    prompt: basePrompt + ' Wide shot energy consultant and business owner next to large wall screen showing abstract energy graphs, clean white office interior, glass walls, confident, background slightly blurred.',
  },
  {
    filename: 'features-dashboard.jpg',
    size: '1024x1024',
    prompt: basePrompt + ' Close-up white desk with laptop showing abstract energy usage dashboard, stacked contracts, pen, minimal composition, soft shadows.',
  },
  {
    filename: 'how-it-works-docs.jpg',
    size: '1024x1024',
    prompt: basePrompt + ' Top-down shot three printed pages on white desk: energy overview, comparison, signed contract, pen placed neatly, navy and teal highlights.',
  },
  {
    filename: 'calculator-laptop.jpg',
    size: '1024x1024',
    prompt: basePrompt + ' Close-up hands typing on laptop with clean energy calculator interface on screen, white desk, small plant blurred background, navy teal UI.',
  },
  {
    filename: 'contract-signing.jpg',
    size: '1024x1024',
    prompt: basePrompt + ' Close-up business person signing energy contract with pen on white table, second hand pointing at line, navy teal highlights, office blurred.',
  },
  {
    filename: 'testimonial-bakery.jpg',
    size: '1024x1024',
    prompt: basePrompt + ' Owner small modern bakery standing in shop, talking with energy consultant at table with laptop showing graphs, warm minimal interior.',
  },
  {
    filename: 'testimonial-warehouse.jpg',
    size: '1024x1024',
    prompt: basePrompt + ' Owner logistics company in modern warehouse with energy consultant reviewing tablet with energy graphs, forklifts shelves blurred background.',
  },
  {
    filename: 'solar-roof.jpg',
    size: '1792x1024',
    prompt: basePrompt + ' Commercial rooftop covered with solar panels, modern industrial area background, clear sky, subtle teal tint reflections, clean minimal, no people.',
  },
]

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

async function generateImage({ filename, prompt, size = '1024x1024' }: ImageSpec) {
  console.log(`▶️  Generating ${filename} ...`)

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    size,
    n: 1,
  })

  const imageUrl = response.data?.[0]?.url

  if (!imageUrl) {
    throw new Error(`Geen image URL ontvangen voor ${filename}`)
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const outPath = path.join(OUTPUT_DIR, filename)
  await downloadImage(imageUrl, outPath)

  console.log(`✅  ${filename} opgeslagen in public/images`)
}

async function main() {
  console.log('🚀 Beelden genereren voor PakketAdvies...')
  for (const spec of images) {
    try {
      await generateImage(spec)
    } catch (err) {
      console.error(`❌ Fout bij ${spec.filename}:`, err)
    }
  }
  console.log('✨ Klaar!')
}

main().catch((err) => {
  console.error('❌ Fout:', err)
  process.exit(1)
})
