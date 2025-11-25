import os
from supabase import create_client, Client

# Supabase credentials
url = "https://dxztyhwiwgrxjnlohapm.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTIyODUsImV4cCI6MjA3OTAyODI4NX0.TDv9_TJlZ0uhMar3LPKE6paRr1wa5zTUEweS5ibK_yc"

supabase: Client = create_client(url, key)

print("=== Checking Netbeheerders ===")
netbeheerders = supabase.table('netbeheerders').select('*').eq('actief', True).execute()
print(f"Found {len(netbeheerders.data)} active netbeheerders:")
for nb in netbeheerders.data:
    print(f"  - {nb['naam']} ({nb['code']}): id={nb['id']}")

print("\n=== Checking Coteq Netbeheer Tarieven (Elektriciteit) ===")
coteq_id = next((nb['id'] for nb in netbeheerders.data if nb['code'] == 'COTEQ'), None)
if coteq_id:
    print(f"Coteq ID: {coteq_id}")
    
    # Check tarieven without join first
    tarieven_raw = supabase.table('netbeheer_tarieven_elektriciteit').select('*').eq('netbeheerder_id', coteq_id).eq('jaar', 2025).eq('actief', True).execute()
    print(f"Found {len(tarieven_raw.data)} tarieven (raw query):")
    for t in tarieven_raw.data:
        print(f"  - ID: {t['id']}, jaar: {t['jaar']}, actief: {t['actief']}, aansluitwaarde_id: {t['aansluitwaarde_id']}, all_in_tarief: {t.get('all_in_tarief_jaar', 'NULL')}")
    
    # Check with join (like the admin page does)
    print("\n=== Trying query with join (like admin page) ===")
    tarieven_with_join = supabase.table('netbeheer_tarieven_elektriciteit').select('*, aansluitwaarde:aansluitwaarden_elektriciteit(*)').eq('netbeheerder_id', coteq_id).eq('jaar', 2025).eq('actief', True).execute()
    print(f"Found {len(tarieven_with_join.data)} tarieven (with join):")
    for t in tarieven_with_join.data:
        print(f"  - ID: {t['id']}, aansluitwaarde: {t.get('aansluitwaarde', {})}")
        
    # Check aansluitwaarden
    print("\n=== Checking aansluitwaarden_elektriciteit ===")
    aansluitwaarden = supabase.table('aansluitwaarden_elektriciteit').select('*').execute()
    print(f"Found {len(aansluitwaarden.data)} aansluitwaarden")
    
else:
    print("Coteq Netbeheer not found!")

print("\n=== Checking all netbeheer tarieven (summary) ===")
all_elektriciteit = supabase.table('netbeheer_tarieven_elektriciteit').select('id, netbeheerder_id, jaar, actief').eq('jaar', 2025).eq('actief', True).execute()
print(f"Total elektriciteit tarieven (2025, actief): {len(all_elektriciteit.data)}")
