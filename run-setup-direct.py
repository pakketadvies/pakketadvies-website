#!/usr/bin/env python3
"""
Direct database connection script to run setup-all-sql.sql
Uses connection details from .pgpass file
"""
import sys
import os

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
except ImportError:
    print("❌ psycopg2 is not installed. Installing...")
    os.system("pip3 install psycopg2-binary")
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connection details (from .pgpass format: hostname:port:database:username:password)
HOST = "aws-1-eu-north-1.pooler.supabase.com"
PORT = "6543"
DATABASE = "postgres"
USER = "postgres.dxztyhwiwgrxjnlohapm"
PASSWORD = "Ab49n805!"

def run_sql_script(sql_file):
    """Read and execute SQL script"""
    print(f"📖 Reading SQL script: {sql_file}")
    
    with open(sql_file, 'r') as f:
        sql = f.read()
    
    print("🔌 Connecting to database...")
    try:
        conn = psycopg2.connect(
            host=HOST,
            port=PORT,
            database=DATABASE,
            user=USER,
            password=PASSWORD
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        print("✅ Connected! Executing SQL script...\n")
        
        cursor = conn.cursor()
        
        # Execute the SQL script
        cursor.execute(sql)
        
        # Try to fetch results if any
        try:
            results = cursor.fetchall()
            if results:
                print("\n📊 Results:")
                for row in results:
                    print(f"  {row}")
        except:
            pass  # No results to fetch
        
        cursor.close()
        conn.close()
        
        print("\n✅✅✅ SETUP COMPLETE! ✅✅✅")
        print("\nYou can now test PDF/DOC uploads in the admin panel.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    sql_file = "setup-all-sql.sql"
    
    if not os.path.exists(sql_file):
        print(f"❌ SQL file not found: {sql_file}")
        sys.exit(1)
    
    run_sql_script(sql_file)

