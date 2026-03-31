import uuid

from fastapi import APIRouter, HTTPException

from datavault.models import Purchase, PurchaseCreate, PurchaseStatus
from datavault.storage import database

router = APIRouter(prefix="/api/purchases", tags=["purchases"])


@router.post("", response_model=Purchase)
async def create_purchase(req: PurchaseCreate):
    """Initiate a dataset purchase.

    In production:
    1. Buyer submits payment to Midnight escrow contract
    2. Backend detects escrow tx and updates status
    3. Provider delivers encrypted dataset + decryption key
    4. Buyer confirms delivery, escrow releases to provider

    MVP: Creates a purchase record in pending state.
    """
    listing = await database.get_listing(req.listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    if listing.status != "active":
        raise HTTPException(400, "Listing is not active")

    purchase = Purchase(
        id=str(uuid.uuid4()),
        listing_id=req.listing_id,
        buyer_address=req.buyer_address,
        price_lovelace=listing.price_lovelace,
        status=PurchaseStatus.PENDING,
    )

    return await database.create_purchase(purchase)


@router.get("/{purchase_id}", response_model=Purchase)
async def get_purchase(purchase_id: str):
    """Get purchase status and details."""
    purchase = await database.get_purchase(purchase_id)
    if not purchase:
        raise HTTPException(404, "Purchase not found")
    return purchase


@router.post("/{purchase_id}/confirm")
async def confirm_delivery(purchase_id: str, buyer_address: str):
    """Buyer confirms dataset was received and decryptable.

    Releases escrow payment to the provider.
    """
    purchase = await database.get_purchase(purchase_id)
    if not purchase:
        raise HTTPException(404, "Purchase not found")
    if purchase.buyer_address != buyer_address:
        raise HTTPException(403, "Only the buyer can confirm")
    if purchase.status != PurchaseStatus.DELIVERED.value:
        raise HTTPException(400, f"Cannot confirm from status: {purchase.status}")

    await database.update_purchase_status(purchase_id, PurchaseStatus.COMPLETED)
    return {"status": "completed", "message": "Payment released to provider"}
