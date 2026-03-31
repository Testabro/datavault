import io

import pytest


class TestHealth:
    @pytest.mark.asyncio
    async def test_health(self, client):
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"
        assert res.json()["chain"] == "midnight"


class TestListings:
    @pytest.mark.asyncio
    async def test_create_listing(self, client, sample_csv_bytes):
        res = await client.post(
            "/api/listings",
            files={"file": ("health_data.csv", io.BytesIO(sample_csv_bytes), "text/csv")},
            data={
                "title": "Synthetic Healthcare Records",
                "description": "100 synthetic patient records with age, income, diagnosis",
                "category": "healthcare",
                "price_lovelace": "5000000",
                "provider_address": "addr_test1provider123",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "Synthetic Healthcare Records"
        assert data["metadata"]["row_count"] == 100
        assert data["proof"]["proof_hash"]
        assert data["encrypted_cid"]

    @pytest.mark.asyncio
    async def test_list_listings(self, client, sample_csv_bytes):
        # Create a listing first
        await client.post(
            "/api/listings",
            files={"file": ("data.csv", io.BytesIO(sample_csv_bytes), "text/csv")},
            data={
                "title": "Test Dataset",
                "description": "A test dataset for unit tests",
                "category": "tabular",
                "price_lovelace": "1000000",
                "provider_address": "addr_test1provider",
            },
        )

        res = await client.get("/api/listings")
        assert res.status_code == 200
        listings = res.json()
        assert len(listings) >= 1

    @pytest.mark.asyncio
    async def test_reject_non_csv(self, client):
        res = await client.post(
            "/api/listings",
            files={"file": ("data.txt", io.BytesIO(b"not csv"), "text/plain")},
            data={
                "title": "Bad Upload",
                "description": "This should fail because it's not a CSV",
                "category": "other",
                "price_lovelace": "1000000",
                "provider_address": "addr_test1provider",
            },
        )
        assert res.status_code == 400


class TestPurchases:
    @pytest.mark.asyncio
    async def test_create_purchase(self, client, sample_csv_bytes):
        # Create listing
        listing_res = await client.post(
            "/api/listings",
            files={"file": ("data.csv", io.BytesIO(sample_csv_bytes), "text/csv")},
            data={
                "title": "Purchasable Dataset",
                "description": "A dataset that can be purchased in tests",
                "category": "finance",
                "price_lovelace": "2000000",
                "provider_address": "addr_test1seller",
            },
        )
        listing_id = listing_res.json()["id"]

        # Create purchase
        res = await client.post(
            "/api/purchases",
            json={"listing_id": listing_id, "buyer_address": "addr_test1buyer"},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "pending"
        assert res.json()["listing_id"] == listing_id


class TestStats:
    @pytest.mark.asyncio
    async def test_marketplace_stats(self, client):
        res = await client.get("/api/stats")
        assert res.status_code == 200
        assert "total_listings" in res.json()
