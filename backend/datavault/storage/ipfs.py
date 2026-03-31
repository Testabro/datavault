"""IPFS integration for encrypted dataset storage.

Datasets are encrypted before upload. The IPFS CID references only ciphertext.
For MVP, falls back to local file storage if no IPFS node is available.
"""
import hashlib
import os
from pathlib import Path

import httpx

from datavault.config import settings

LOCAL_STORAGE_DIR = Path("./data/encrypted_datasets")


async def upload_to_ipfs(encrypted_data: bytes) -> str:
    """Upload encrypted data to IPFS. Returns CID.

    Falls back to local storage if IPFS node is unavailable.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.ipfs_api_url}/api/v0/add",
                files={"file": ("dataset.enc", encrypted_data)},
            )
            response.raise_for_status()
            return response.json()["Hash"]
    except (httpx.ConnectError, httpx.HTTPError):
        # Fallback: store locally with content-addressed filename
        return await _store_locally(encrypted_data)


async def download_from_ipfs(cid: str) -> bytes:
    """Download encrypted data from IPFS by CID.

    Falls back to local storage if IPFS node is unavailable.
    """
    # Check local storage first
    local_path = LOCAL_STORAGE_DIR / cid
    if local_path.exists():
        return local_path.read_bytes()

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ipfs_api_url}/api/v0/cat",
                params={"arg": cid},
            )
            response.raise_for_status()
            return response.content
    except (httpx.ConnectError, httpx.HTTPError) as e:
        raise FileNotFoundError(f"Cannot retrieve CID {cid}: {e}")


async def _store_locally(data: bytes) -> str:
    """Store data locally with a content-addressed filename (SHA-256 hash)."""
    os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)
    cid = "local_" + hashlib.sha256(data).hexdigest()[:32]
    path = LOCAL_STORAGE_DIR / cid
    path.write_bytes(data)
    return cid
