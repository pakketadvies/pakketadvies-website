#!/usr/bin/env node
/**
 * Complete Storage Setup Script
 * - Creates documents bucket
 * - Fixes storage policies
 * - Updates logos bucket MIME types
 */

import https from 'https';
import { readFileSync } from 'fs';

const SUPABASE_ACCESS_TOKEN = 'sbp_8c0b2e1c1d91f499b2ad9f5209339aa66ddf6257';
const PROJECT_REF = 'dxztyhwiwgrxjnlohapm';
const SUPABASE_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

// Helper function to make API requests
function apiRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_API_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject({ status: res.statusCode, error: parsed });
          }
        } catch (e) {
          reject({ status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Execute SQL query
async function executeSQL(sql) {
  return apiRequest('/database', 'POST', {
    query: sql,
  });
}

// Get storage buckets
async function getBuckets() {
  try {
    const result = await apiRequest('/storage/buckets');
    return result.data || [];
  } catch (error) {
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
}

// Create storage bucket
async function createBucket(name, options = {}) {
  return apiRequest('/storage/buckets', 'POST', {
    name,
    public: options.public !== false,
    file_size_limit: options.fileSizeLimit || null,
    allowed_mime_types: options.allowedMimeTypes || null,
  });
}

// Update storage bucket
async function updateBucket(name, options) {
  return apiRequest(`/storage/buckets/${name}`, 'PATCH', options);
}

async function main() {
  console.log('🚀 Starting complete storage setup...\n');

  try {
    // Step 1: Check existing buckets
    console.log('📦 Step 1: Checking existing buckets...');
    const buckets = await getBuckets();
    console.log(`Found ${buckets.length} buckets: ${buckets.map(b => b.name).join(', ')}\n`);

    const documentsBucket = buckets.find(b => b.name === 'documents');
    const logosBucket = buckets.find(b => b.name === 'logos');

    // Step 2: Create documents bucket if it doesn't exist
    if (!documentsBucket) {
      console.log('📦 Step 2: Creating documents bucket...');
      try {
        await createBucket('documents', {
          public: true,
          fileSizeLimit: null, // No limit
          allowedMimeTypes: null, // Allow all types
        });
        console.log('✅ Documents bucket created successfully!\n');
      } catch (error) {
        console.error('❌ Failed to create documents bucket:', error);
        console.log('\n⚠️  Bucket creation via API failed. Please create it manually in Supabase Dashboard:\n');
        console.log('   1. Go to Storage in Supabase Dashboard');
        console.log('   2. Click "Create a new bucket"');
        console.log('   3. Name: documents, Public: ON, MIME types: empty\n');
      }
    } else {
      console.log('✅ Documents bucket already exists\n');
    }

    // Step 3: Update logos bucket MIME types (remove restrictions)
    if (logosBucket) {
      console.log('🔧 Step 3: Checking logos bucket MIME type restrictions...');
      if (logosBucket.allowed_mime_types && logosBucket.allowed_mime_types.length > 0) {
        console.log(`⚠️  Logos bucket has MIME type restrictions: ${logosBucket.allowed_mime_types.join(', ')}`);
        console.log('   Removing restrictions to allow PDF/DOC files...');
        try {
          await updateBucket('logos', {
            allowed_mime_types: null, // Remove restrictions
          });
          console.log('✅ Logos bucket MIME type restrictions removed!\n');
        } catch (error) {
          console.error('❌ Failed to update logos bucket:', error);
          console.log('\n⚠️  Please update manually in Supabase Dashboard:\n');
          console.log('   1. Go to Storage → logos bucket');
          console.log('   2. Click "Edit bucket"');
          console.log('   3. Clear "Allowed MIME types" field\n');
        }
      } else {
        console.log('✅ Logos bucket has no MIME type restrictions\n');
      }
    } else {
      console.log('⚠️  Logos bucket not found (this is OK if you don\'t need it)\n');
    }

    // Step 4: Fix storage policies
    console.log('🔐 Step 4: Fixing storage policies...');
    const policiesSQL = readFileSync('fix-storage-policies-complete.sql', 'utf8');
    
    // Remove the SELECT queries at the beginning that are just for checking
    const sqlToExecute = policiesSQL
      .split('-- STEP 2:')[1] // Start from STEP 2 (drop policies)
      .split('-- STEP 1:')[0] // Remove STEP 1 queries
      .trim();

    try {
      // Split into individual statements and execute
      const statements = sqlToExecute
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('RAISE NOTICE'));

      for (const statement of statements) {
        if (statement.trim()) {
          await executeSQL(statement + ';');
        }
      }
      console.log('✅ Storage policies updated successfully!\n');
    } catch (error) {
      console.error('❌ Failed to update storage policies:', error);
      console.log('\n⚠️  Please run fix-storage-policies-complete.sql manually in Supabase SQL Editor\n');
    }

    console.log('🎉 Setup complete! You can now test the PDF/DOC upload.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();

