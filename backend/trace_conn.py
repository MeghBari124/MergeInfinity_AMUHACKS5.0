print("Step 1: Importing modules...")
import os
from dotenv import load_dotenv
print("Step 2: Loading .env...")
load_dotenv()

print("Step 3: Creating Supabase client...")
from supabase import create_client, Client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
print(f"URL: {url[:20]}...")
supabase = create_client(url, key)

print("Step 4: Querying Supabase...")
try:
    # Use a simpler query with a shorter timeout if possible (not directly available in supabase-py easily)
    res = supabase.table('users').select('count', count='exact').execute()
    print(f"Success: {res}")
except Exception as e:
    print(f"Failed: {e}")
