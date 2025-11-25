#!/usr/bin/env python3
"""
Run maatwerk migration directly against Supabase database
"""
import psycopg2
import sys

# Database credentials
DB_HOST = "aws-1-eu-north-1.pooler.supabase.com"
DB_PORT = "6543"
DB_NAME = "postgres"
DB_USER = "postgres.dxztyhwiwgrxjnlohapm"
DB_PASSWORD = "Ab49n805!"

SQL_FILE = "supabase/migrations/023_maatwerk_identical_to_vast.sql"

def run_migration():
    try:
        # Read SQL file
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print(f"📖 Reading migration file: {SQL_FILE}")
        print(f"📝 SQL content length: {len(sql_content)} characters")
        
        # Connect to database
        print(f"🔌 Connecting to database...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            connect_timeout=10
        )
        
        print("✅ Connected successfully!")
        
        # Create cursor
        cursor = conn.cursor()
        
        # Execute SQL
        print("🚀 Executing migration...")
        cursor.execute(sql_content)
        
        # Commit transaction
        conn.commit()
        
        print("✅ Migration completed successfully!")
        
        # Close connection
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        if conn:
            conn.rollback()
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

