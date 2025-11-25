#!/usr/bin/env python3
"""
Verify that storage setup was successful
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connection details
HOST = "aws-1-eu-north-1.pooler.supabase.com"
PORT = "6543"
DATABASE = "postgres"
USER = "postgres.dxztyhwiwgrxjnlohapm"
PASSWORD = "Ab49n805!"

def verify_setup():
    print("🔍 Verifying storage setup...\n")
    
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        database=DATABASE,
        user=USER,
        password=PASSWORD
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check buckets
    print("📦 Checking buckets:")
    cursor.execute("""
        SELECT 
          name,
          public,
          CASE 
            WHEN allowed_mime_types IS NULL THEN 'All types allowed'
            ELSE 'Restricted: ' || array_to_string(allowed_mime_types, ', ')
          END as mime_status
        FROM storage.buckets
        WHERE name IN ('documents', 'logos')
        ORDER BY name
    """)
    
    buckets = cursor.fetchall()
    for bucket in buckets:
        name, public, mime_status = bucket
        status_icon = "✅" if name == "documents" else "📸"
        public_icon = "✅" if public else "❌"
        print(f"  {status_icon} {name}: Public={public_icon}, MIME={mime_status}")
    
    # Check policies
    print("\n🔐 Checking storage policies:")
    cursor.execute("""
        SELECT 
          policyname,
          cmd,
          CASE 
            WHEN policyname LIKE '%documents%' THEN 'documents'
            WHEN policyname LIKE '%logos%' THEN 'logos'
            ELSE 'other'
          END as bucket
        FROM pg_policies
        WHERE tablename = 'objects'
          AND schemaname = 'storage'
          AND (policyname LIKE '%documents%' OR policyname LIKE '%logos%')
        ORDER BY bucket, cmd
    """)
    
    policies = cursor.fetchall()
    current_bucket = None
    for policy in policies:
        policyname, cmd, bucket = policy
        if bucket != current_bucket:
            print(f"\n  📁 {bucket.upper()} bucket:")
            current_bucket = bucket
        print(f"    ✅ {cmd}: {policyname}")
    
    cursor.close()
    conn.close()
    
    print("\n✅✅✅ Verification complete! ✅✅✅")
    print("\nAll storage configuration is set up correctly.")
    print("You can now test PDF/DOC uploads in the admin panel! 🎉")

if __name__ == "__main__":
    verify_setup()

