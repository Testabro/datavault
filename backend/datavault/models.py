from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ListingStatus(str, Enum):
    ACTIVE = "active"
    SOLD = "sold"
    DELISTED = "delisted"


class PurchaseStatus(str, Enum):
    PENDING = "pending"
    ESCROWED = "escrowed"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    DISPUTED = "disputed"


class DataCategory(str, Enum):
    HEALTHCARE = "healthcare"
    FINANCE = "finance"
    NLP = "nlp"
    COMPUTER_VISION = "computer_vision"
    TABULAR = "tabular"
    TIME_SERIES = "time_series"
    OTHER = "other"


class DatasetMetadata(BaseModel):
    """Extracted metadata from an uploaded dataset — public, verifiable."""
    row_count: int
    column_count: int
    columns: list[str]
    column_types: dict[str, str]
    size_bytes: int
    file_format: str
    sample_stats: dict[str, dict[str, float]] = Field(
        default_factory=dict,
        description="Per-column statistics (mean, std, min, max) for numeric columns",
    )


class ZKProof(BaseModel):
    """Zero-knowledge proof of dataset properties."""
    proof_hash: str
    verified_properties: dict[str, str]  # property_name -> proven_value
    proof_timestamp: datetime
    midnight_tx_hash: Optional[str] = None


class Listing(BaseModel):
    id: str
    provider_address: str
    title: str
    description: str
    category: DataCategory
    price_lovelace: int  # Price in lovelace (1 ADA = 1,000,000 lovelace)
    metadata: DatasetMetadata
    proof: Optional[ZKProof] = None
    encrypted_cid: Optional[str] = None  # IPFS CID of encrypted dataset
    status: ListingStatus = ListingStatus.ACTIVE
    reputation_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Purchase(BaseModel):
    id: str
    listing_id: str
    buyer_address: str
    price_lovelace: int
    status: PurchaseStatus = PurchaseStatus.PENDING
    escrow_tx_hash: Optional[str] = None
    delivery_tx_hash: Optional[str] = None
    decryption_key_encrypted: Optional[str] = None  # Encrypted for buyer's public key
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ListingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=2000)
    category: DataCategory
    price_lovelace: int = Field(gt=0)
    provider_address: str


class PurchaseCreate(BaseModel):
    listing_id: str
    buyer_address: str
