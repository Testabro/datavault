# DataVault

Privacy-preserving AI data marketplace on Cardano Midnight.

Providers list datasets with ZK-verified properties. Buyers purchase access without seeing raw data. Encrypted delivery ensures only the buyer can decrypt. Payments via Midnight escrow with on-chain reputation tracking.

## The Problem

AI training data is a $3.6B market growing to $23B by 2034. But privacy regulations and IP concerns block enterprises from sharing valuable datasets. Buyers can't verify data quality before purchasing. Sellers can't prove properties without exposing the data.

DataVault solves this with zero-knowledge proofs: verify a dataset has 10,000 rows, 15 columns, and specific statistical properties — without ever seeing the data.

## Architecture

```
Provider                    DataVault                    Buyer
   │                           │                           │
   ├─ Upload dataset ─────────►│                           │
   │                    Extract metadata                   │
   │                    Generate ZK proof                  │
   │                    Encrypt dataset                    │
   │                    Store on IPFS                      │
   │                    List on Midnight ──────────────────►│ Browse & verify
   │                           │                           │
   │                           │◄──────── Purchase ────────┤
   │                           │     Escrow on Midnight    │
   │                           │                           │
   │◄── Deliver encrypted ─────│                           │
   │    dataset + key          │──── Encrypted key ───────►│ Decrypt
   │                           │                           │
   │    Collect payment ◄──────│◄──── Confirm delivery ────┤
   │    from escrow            │     Release escrow        │
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Midnight Compact (ZK-native) |
| Backend API | Python, FastAPI, SQLite |
| Encryption | AES-256-GCM + RSA-2048 (hybrid) |
| Storage | IPFS (encrypted datasets) |
| Blockchain | Cardano Midnight (ZK proofs, escrow, reputation) |

## Quick Start

```bash
cd backend
pip install -e .
datavault
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

Or with Docker:
```bash
docker-compose up
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service status |
| `/api/listings` | POST | Upload dataset + create listing |
| `/api/listings` | GET | Browse marketplace |
| `/api/listings/{id}` | GET | Listing details + proof |
| `/api/purchases` | POST | Initiate purchase |
| `/api/purchases/{id}/confirm` | POST | Confirm delivery |
| `/api/providers/{addr}/stats` | GET | Provider reputation |
| `/api/stats` | GET | Marketplace statistics |

## Smart Contracts (Midnight Compact)

Three contracts manage the on-chain state:

- **DataListing** — Stores proof hashes and metadata hashes for each listing. Buyers verify proofs before purchasing.
- **Escrow** — Holds buyer payment. Auto-refunds if provider doesn't deliver by deadline. Releases to provider on buyer confirmation.
- **Reputation** — Tracks provider reliability (1-5 ratings, dispute count). Public scores, private individual ratings via ZK.

## How Privacy Works

1. **Provider uploads** a dataset (CSV/Parquet)
2. **Metadata extracted** automatically (row count, columns, statistics)
3. **ZK proof generated** proving properties without revealing data
4. **Dataset encrypted** with AES-256-GCM (random key per dataset)
5. **Encrypted data stored** on IPFS (only ciphertext is public)
6. **On purchase**, the AES key is encrypted with buyer's RSA public key
7. **Only the buyer** can decrypt the AES key and access the dataset

## Sample Data

Two synthetic datasets are included for testing:
- `sample_data/synthetic_healthcare.csv` — 500 patient records (age, BMI, diagnosis, treatment cost)
- `sample_data/synthetic_finance.csv` — 500 transactions (amount, merchant, fraud flag, credit score)

## Project Structure

```
datavault/
├── contracts/              # Midnight Compact smart contracts
│   ├── data_listing.compact
│   ├── escrow.compact
│   └── reputation.compact
├── backend/                # Python FastAPI backend
│   ├── datavault/
│   │   ├── api/            # REST endpoints
│   │   ├── crypto/         # Encryption + ZK proofs
│   │   ├── storage/        # SQLite + IPFS
│   │   └── midnight/       # Blockchain client
│   └── tests/
├── frontend/               # React marketplace UI (Phase 2)
└── sample_data/            # Synthetic datasets for demo
```

## Roadmap

- [x] Backend API (listings, purchases, encryption, proofs)
- [x] Midnight Compact contracts (listing, escrow, reputation)
- [x] Encryption pipeline (AES-256-GCM + RSA hybrid)
- [x] IPFS integration with local fallback
- [ ] Midnight testnet deployment
- [ ] React marketplace frontend
- [ ] Wallet connection (Lace, Nami)
- [ ] Federated learning integration
- [ ] Differential privacy noise injection

## License

MIT
