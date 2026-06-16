#!/usr/bin/env node
/**
 * Quick update voor de tarieven van /aanbieding/clean-energy-ets2.
 * Past de tariefkaart aan in de productie Supabase database en
 * triggert daarmee (na save) een revalidate via de admin-flow
 * óf direct via een Vercel deploy.
 */

import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Client } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

async function loadPgpass() {
  const raw = await readFile(join(projectRoot, '.pgpass'), 'utf8')
  const line = raw.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#'))
  if (!line) throw new Error('Geen geldige regel in .pgpass')
  const [host, port, database, user, password] = line.split(':')
  return { host, port: Number(port), database, user, password }
}

const NIEUWE_TARIEVEN = [
  { label: 'Unieke kans', waarde: 'ETS-2 risico vastgelegd' },
  { label: 'Elektra piek', waarde: '€ 0,141 per kWh (excl. BTW)' },
  { label: 'Elektra dal', waarde: '€ 0,134 per kWh (excl. BTW)' },
  { label: 'Gastarief', waarde: '€ 0,579 per m3 (excl. BTW)' },
  { label: 'Doelgroep', waarde: 'KvK (ook woonhuis)' },
  { label: 'Looptijd', waarde: 't/m 01-01-2031' },
]

async function main() {
  const config = await loadPgpass()
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  try {
    const result = await client.query(
      `UPDATE aanbieding_tarieven
         SET tariefkaart_items = $1::jsonb,
             updated_at = NOW()
       WHERE slug = 'clean-energy-ets2'
       RETURNING slug, titel, tariefkaart_items, updated_at`,
      [JSON.stringify(NIEUWE_TARIEVEN)]
    )
    if (result.rowCount === 0) {
      console.error('❌ Geen rij gevonden voor slug clean-energy-ets2')
      process.exitCode = 1
      return
    }
    console.log('✅ Tarieven bijgewerkt')
    console.log(JSON.stringify(result.rows[0], null, 2))
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('❌ Fout:', err)
  process.exit(1)
})
