import json
import os
from datetime import datetime

import aiosqlite

from datavault.config import settings
from datavault.models import (
    DatasetMetadata,
    Listing,
    ListingStatus,
    Purchase,
    PurchaseStatus,
    ZKProof,
)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    provider_address TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price_lovelace INTEGER NOT NULL,
    metadata_json TEXT NOT NULL,
    proof_json TEXT,
    encrypted_cid TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    reputation_score REAL NOT NULL DEFAULT 0.0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL REFERENCES listings(id),
    buyer_address TEXT NOT NULL,
    price_lovelace INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    escrow_tx_hash TEXT,
    delivery_tx_hash TEXT,
    decryption_key_encrypted TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_purchases_listing ON purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_address);
"""


async def _get_db() -> aiosqlite.Connection:
    os.makedirs(os.path.dirname(settings.db_path) or ".", exist_ok=True)
    db = await aiosqlite.connect(settings.db_path)
    db.row_factory = aiosqlite.Row
    await db.executescript(_SCHEMA)
    return db


def _listing_from_row(row: aiosqlite.Row) -> Listing:
    return Listing(
        id=row["id"],
        provider_address=row["provider_address"],
        title=row["title"],
        description=row["description"],
        category=row["category"],
        price_lovelace=row["price_lovelace"],
        metadata=DatasetMetadata(**json.loads(row["metadata_json"])),
        proof=ZKProof(**json.loads(row["proof_json"])) if row["proof_json"] else None,
        encrypted_cid=row["encrypted_cid"],
        status=ListingStatus(row["status"]),
        reputation_score=row["reputation_score"],
        created_at=datetime.fromisoformat(row["created_at"]),
    )


def _purchase_from_row(row: aiosqlite.Row) -> Purchase:
    return Purchase(
        id=row["id"],
        listing_id=row["listing_id"],
        buyer_address=row["buyer_address"],
        price_lovelace=row["price_lovelace"],
        status=PurchaseStatus(row["status"]),
        escrow_tx_hash=row["escrow_tx_hash"],
        delivery_tx_hash=row["delivery_tx_hash"],
        decryption_key_encrypted=row["decryption_key_encrypted"],
        created_at=datetime.fromisoformat(row["created_at"]),
    )


# ── Listings ──────────────────────────────────────────

async def create_listing(listing: Listing) -> Listing:
    db = await _get_db()
    try:
        await db.execute(
            """INSERT INTO listings (id, provider_address, title, description, category,
               price_lovelace, metadata_json, proof_json, encrypted_cid, status,
               reputation_score, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                listing.id,
                listing.provider_address,
                listing.title,
                listing.description,
                listing.category.value,
                listing.price_lovelace,
                listing.metadata.model_dump_json(),
                listing.proof.model_dump_json() if listing.proof else None,
                listing.encrypted_cid,
                listing.status.value,
                listing.reputation_score,
                listing.created_at.isoformat(),
            ),
        )
        await db.commit()
        return listing
    finally:
        await db.close()


async def get_listing(listing_id: str) -> Listing | None:
    db = await _get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM listings WHERE id = ?", (listing_id,)
        )
        return _listing_from_row(rows[0]) if rows else None
    finally:
        await db.close()


async def get_listings(
    category: str | None = None,
    status: str = "active",
    limit: int = 50,
) -> list[Listing]:
    db = await _get_db()
    try:
        query = "SELECT * FROM listings WHERE status = ?"
        params: list = [status]
        if category:
            query += " AND category = ?"
            params.append(category)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        rows = await db.execute_fetchall(query, params)
        return [_listing_from_row(r) for r in rows]
    finally:
        await db.close()


async def update_listing_status(listing_id: str, status: ListingStatus) -> None:
    db = await _get_db()
    try:
        await db.execute(
            "UPDATE listings SET status = ? WHERE id = ?",
            (status.value, listing_id),
        )
        await db.commit()
    finally:
        await db.close()


# ── Purchases ─────────────────────────────────────────

async def create_purchase(purchase: Purchase) -> Purchase:
    db = await _get_db()
    try:
        await db.execute(
            """INSERT INTO purchases (id, listing_id, buyer_address, price_lovelace,
               status, escrow_tx_hash, delivery_tx_hash, decryption_key_encrypted, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                purchase.id,
                purchase.listing_id,
                purchase.buyer_address,
                purchase.price_lovelace,
                purchase.status.value,
                purchase.escrow_tx_hash,
                purchase.delivery_tx_hash,
                purchase.decryption_key_encrypted,
                purchase.created_at.isoformat(),
            ),
        )
        await db.commit()
        return purchase
    finally:
        await db.close()


async def get_purchase(purchase_id: str) -> Purchase | None:
    db = await _get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM purchases WHERE id = ?", (purchase_id,)
        )
        return _purchase_from_row(rows[0]) if rows else None
    finally:
        await db.close()


async def get_purchases_for_listing(listing_id: str) -> list[Purchase]:
    db = await _get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM purchases WHERE listing_id = ? ORDER BY created_at DESC",
            (listing_id,),
        )
        return [_purchase_from_row(r) for r in rows]
    finally:
        await db.close()


async def update_purchase_status(
    purchase_id: str,
    status: PurchaseStatus,
    **extra_fields: str,
) -> None:
    db = await _get_db()
    try:
        sets = ["status = ?"]
        params: list = [status.value]
        for field, value in extra_fields.items():
            sets.append(f"{field} = ?")
            params.append(value)
        params.append(purchase_id)

        await db.execute(
            f"UPDATE purchases SET {', '.join(sets)} WHERE id = ?",
            params,
        )
        await db.commit()
    finally:
        await db.close()
