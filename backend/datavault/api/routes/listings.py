import uuid

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from datavault.crypto.encryption import encrypt_dataset
from datavault.crypto.proofs import extract_metadata, generate_proof, hash_dataset
from datavault.models import DataCategory, Listing, ListingCreate, ListingStatus
from datavault.storage import database, ipfs

router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.post("", response_model=Listing)
async def create_listing(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    category: DataCategory = Form(...),
    price_lovelace: int = Form(..., gt=0),
    provider_address: str = Form(...),
):
    """Upload a dataset and create a marketplace listing.

    1. Extract metadata from the dataset
    2. Generate a cryptographic proof of properties
    3. Encrypt the dataset
    4. Upload encrypted data to IPFS
    5. Store listing in database
    """
    if not file.filename:
        raise HTTPException(400, "File must have a name")
    if not file.filename.endswith((".csv", ".parquet")):
        raise HTTPException(400, "File must be .csv or .parquet")

    data = await file.read()
    if not data:
        raise HTTPException(400, "File is empty")

    # Extract metadata and generate proof
    try:
        metadata = extract_metadata(data, file.filename)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse dataset: {e}")

    data_hash = hash_dataset(data)
    proof = generate_proof(metadata, data_hash)

    # Encrypt and store
    encrypted_data, _aes_key = encrypt_dataset(data)
    cid = await ipfs.upload_to_ipfs(encrypted_data)

    # Create listing
    listing = Listing(
        id=str(uuid.uuid4()),
        provider_address=provider_address,
        title=title,
        description=description,
        category=category,
        price_lovelace=price_lovelace,
        metadata=metadata,
        proof=proof,
        encrypted_cid=cid,
    )

    return await database.create_listing(listing)


@router.get("", response_model=list[Listing])
async def list_listings(
    category: DataCategory | None = Query(None),
    limit: int = Query(50, le=200),
):
    """Browse active marketplace listings."""
    return await database.get_listings(
        category=category.value if category else None,
        limit=limit,
    )


@router.get("/{listing_id}", response_model=Listing)
async def get_listing(listing_id: str):
    """Get details of a specific listing."""
    listing = await database.get_listing(listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    return listing


@router.delete("/{listing_id}")
async def delist(listing_id: str, provider_address: str = Query(...)):
    """Remove a listing from the marketplace."""
    listing = await database.get_listing(listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    if listing.provider_address != provider_address:
        raise HTTPException(403, "Only the provider can delist")
    await database.update_listing_status(listing_id, ListingStatus.DELISTED)
    return {"status": "delisted"}
