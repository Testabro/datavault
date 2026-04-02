from fastapi import APIRouter, Query

from datavault.storage import database

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.get("/{address}/listings")
async def get_provider_listings(address: str, limit: int = Query(50, le=200)):
    """Get all listings by a specific provider."""
    all_listings = await database.get_listings(status="active", limit=limit)
    return [listing for listing in all_listings if listing.provider_address == address]


@router.get("/{address}/stats")
async def get_provider_stats(address: str):
    """Get provider statistics (listings, sales, reputation)."""
    all_listings = await database.get_listings(status="active", limit=1000)
    provider_listings = [listing for listing in all_listings if listing.provider_address == address]

    return {
        "address": address,
        "active_listings": len(provider_listings),
        "total_value_lovelace": sum(listing.price_lovelace for listing in provider_listings),
        "avg_reputation": (
            sum(listing.reputation_score for listing in provider_listings) / len(provider_listings)
            if provider_listings
            else 0.0
        ),
    }
