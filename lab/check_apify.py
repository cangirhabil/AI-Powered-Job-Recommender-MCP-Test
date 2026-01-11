
import os
from dotenv import load_dotenv
from apify_client import ApifyClient

# Start from current directory and go up to find .env if needed, but assuming running from root
load_dotenv()
# Also try loading from backend/.env if root .env is missing or doesn't have it
load_dotenv("backend/.env")

APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")

if not APIFY_API_TOKEN:
    print("No APIFY_API_TOKEN found")
    exit(1)

client = ApifyClient(APIFY_API_TOKEN)

run_input = {
    "title": "Software Engineer",
    "location": "Türkiye",
    "rows": 1,
    "proxy": {
        "useApifyProxy": True,
        "apifyProxyGroups": ["RESIDENTIAL"],
    }
}

print("Calling Apify...")
run = client.actor("BHzefUZlZRKWxkTck").call(run_input=run_input)
print("Run finished. Fetching dataset...")
items = list(client.dataset(run["defaultDatasetId"]).iterate_items())

if items:
    print("First item keys:", list(items[0].keys()))
    print("First item:", items[0])
else:
    print("No items returned")
