from datavault.crypto.proofs import (
    extract_metadata,
    generate_proof,
    hash_dataset,
    verify_proof,
)


class TestProofs:
    def test_extract_metadata(self, sample_csv_bytes):
        meta = extract_metadata(sample_csv_bytes, "test.csv")
        assert meta.row_count == 100
        assert meta.column_count == 4
        assert "age" in meta.columns
        assert meta.file_format == "csv"
        assert meta.size_bytes == len(sample_csv_bytes)

    def test_extract_metadata_stats(self, sample_csv_bytes):
        meta = extract_metadata(sample_csv_bytes, "test.csv")
        assert "age" in meta.sample_stats
        assert "mean" in meta.sample_stats["age"]
        assert meta.sample_stats["age"]["min"] >= 20

    def test_generate_and_verify_proof(self, sample_csv_bytes):
        meta = extract_metadata(sample_csv_bytes, "test.csv")
        data_hash = hash_dataset(sample_csv_bytes)
        proof = generate_proof(meta, data_hash)

        assert proof.proof_hash
        assert proof.verified_properties["row_count"] == "100"
        assert verify_proof(proof)

    def test_tampered_proof_fails_verification(self, sample_csv_bytes):
        meta = extract_metadata(sample_csv_bytes, "test.csv")
        data_hash = hash_dataset(sample_csv_bytes)
        proof = generate_proof(meta, data_hash)

        # Tamper with a property
        proof.verified_properties["row_count"] = "999"
        assert not verify_proof(proof)

    def test_hash_deterministic(self, sample_csv_bytes):
        h1 = hash_dataset(sample_csv_bytes)
        h2 = hash_dataset(sample_csv_bytes)
        assert h1 == h2

    def test_hash_differs_for_different_data(self):
        h1 = hash_dataset(b"data_a")
        h2 = hash_dataset(b"data_b")
        assert h1 != h2
