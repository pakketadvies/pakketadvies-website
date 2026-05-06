#!/usr/bin/env node
/**
 * Past de migratie 1008_create_aanbieding_tarieven.sql toe op de
 * productie Supabase database via de pooler connection.
 *
 * Credentials worden gelezen uit het .pgpass bestand in de project root.
 *
 * Eenmalig draaien:
 *   node scripts/apply-migration-1008.mjs
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
  const pgpassPath = join(projectRoot, '.pgpass')
  const raw = await readFile(pgpassPath, 'utf8')
  const line = raw
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#'))
  if (!line) {
    throw new Error('Geen geldige regel gevonden in .pgpass')
  }
  const [host, port, database, user, password] = line.split(':')
  return { host, port: Number(port), database, user, password }
}

async function main() {
  const sqlPath = join(
    projectRoot,
    'supabase',
    'migrations',
    '1008_create_aanbieding_tarieven.sql'
  )
  const sql = await readFile(sqlPath, 'utf8')

  const config = await loadPgpass()
  console.log(`🔌 Verbinden met ${config.host}:${config.port}/${config.database} als ${config.user}`)

  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  console.log('✅ Verbonden')

  try {
    console.log('🚀 Migratie 1008 uitvoeren...')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✅ Migratie 1008 succesvol toegepast')

    const verify = await client.query(
      `SELECT slug, titel, jsonb_array_length(tariefkaart_items) AS aantal_tarieven, jsonb_array_length(hero_badges) AS aantal_badges, updated_at
         FROM aanbieding_tarieven
         ORDER BY slug`
    )
    console.log('\n📊 Inhoud van aanbieding_tarieven:')
    console.table(verify.rows)
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ Migratie mislukt:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('❌ Onverwachte fout:', err)
  process.exit(1)
})
