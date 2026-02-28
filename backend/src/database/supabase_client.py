import os
from supabase import create_client, Client

from backend.src.config import settings


def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL", settings.supabase_url)
    key = os.environ.get(
        "SUPABASE_SERVICE_ROLE_KEY", settings.supabase_service_role_key
    )

    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

    return create_client(url, key)


supabase: Client = get_supabase_client()
