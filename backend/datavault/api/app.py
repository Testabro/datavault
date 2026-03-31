from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from datavault.api.routes import listings, providers, purchases

app = FastAPI(
    title="DataVault",
    description="Privacy-preserving AI data marketplace on Cardano Midnight",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(purchases.router)
app.include_router(providers.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0", "chain": "midnight"}


@app.get("/api/stats")
async def marketplace_stats():
    """Global marketplace statistics."""
    from datavault.storage import database

    all_listings = await database.get_listings(limit=10000)
    return {
        "total_listings": len(all_listings),
        "total_value_lovelace": sum(l.price_lovelace for l in all_listings),
        "categories": list({l.category.value for l in all_listings}),
    }
