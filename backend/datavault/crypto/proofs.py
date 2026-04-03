"""Dataset property verification via cryptographic proofs.

In production, this will generate Midnight ZK proofs via the Compact runtime.
For MVP, we generate a deterministic hash-based proof of dataset properties
that can be verified independently. The Midnight integration will replace
the hash with an actual ZK proof once contracts are deployed.
"""

import hashlib
import json
from datetime import datetime

import pandas as pd

from datavault.models import DatasetMetadata, ZKProof


def extract_metadata(data: bytes, filename: str) -> DatasetMetadata:
    """Extract verifiable metadata from a dataset file."""
    import io

    if filename.endswith(".parquet"):
        df = pd.read_parquet(io.BytesIO(data))
    else:
        df = pd.read_csv(io.BytesIO(data))

    column_types = {col: str(dtype) for col, dtype in df.dtypes.items()}

    sample_stats = {}
    for col in df.select_dtypes(include=["number"]).columns:
        sample_stats[col] = {
            "mean": round(float(df[col].mean()), 4),
            "std": round(float(df[col].std()), 4),
            "min": round(float(df[col].min()), 4),
            "max": round(float(df[col].max()), 4),
        }

    return DatasetMetadata(
        row_count=len(df),
        column_count=len(df.columns),
        columns=list(df.columns),
        column_types=column_types,
        size_bytes=len(data),
        file_format="parquet" if filename.endswith(".parquet") else "csv",
        sample_stats=sample_stats,
    )


def generate_proof(metadata: DatasetMetadata, data_hash: str) -> ZKProof:
    """Generate a verifiable proof of dataset properties.

    MVP: deterministic hash proof. Production: Midnight ZK proof via Compact.
    """
    # Properties we're proving
    verified_properties = {
        "row_count": str(metadata.row_count),
        "column_count": str(metadata.column_count),
        "size_bytes": str(metadata.size_bytes),
        "file_format": metadata.file_format,
        "data_hash": data_hash,
    }

    # Deterministic proof hash (sortable, reproducible)
    proof_input = json.dumps(verified_properties, sort_keys=True)
    proof_hash = hashlib.sha256(proof_input.encode()).hexdigest()

    return ZKProof(
        proof_hash=proof_hash,
        verified_properties=verified_properties,
        proof_timestamp=datetime.utcnow(),
    )


def verify_proof(proof: ZKProof) -> bool:
    """Verify a proof is internally consistent."""
    proof_input = json.dumps(proof.verified_properties, sort_keys=True)
    expected_hash = hashlib.sha256(proof_input.encode()).hexdigest()
    return proof.proof_hash == expected_hash


def hash_dataset(data: bytes) -> str:
    """SHA-256 hash of the raw dataset for integrity verification."""
    return hashlib.sha256(data).hexdigest()
