from datavault.crypto.encryption import (
    decrypt_dataset,
    decrypt_key_with_private,
    encrypt_dataset,
    encrypt_key_for_buyer,
    generate_keypair,
)


class TestEncryption:
    def test_encrypt_decrypt_roundtrip(self):
        data = b"sensitive patient records here"
        encrypted, key = encrypt_dataset(data)
        decrypted = decrypt_dataset(encrypted, key)
        assert decrypted == data

    def test_encrypted_differs_from_plaintext(self):
        data = b"this should not be readable"
        encrypted, _ = encrypt_dataset(data)
        assert encrypted != data
        assert len(encrypted) > len(data)  # Includes nonce + auth tag

    def test_keypair_encrypt_decrypt(self):
        private_pem, public_pem = generate_keypair()
        aes_key = b"0123456789abcdef0123456789abcdef"  # 32 bytes

        encrypted_key = encrypt_key_for_buyer(aes_key, public_pem)
        decrypted_key = decrypt_key_with_private(encrypted_key, private_pem)
        assert decrypted_key == aes_key

    def test_full_flow(self):
        """End-to-end: encrypt dataset, encrypt key for buyer, buyer decrypts."""
        private_pem, public_pem = generate_keypair()
        data = b"row1,col1\nrow2,col2"

        # Provider encrypts dataset
        encrypted_data, aes_key = encrypt_dataset(data)

        # Provider encrypts AES key for buyer's public key
        encrypted_key = encrypt_key_for_buyer(aes_key, public_pem)

        # Buyer decrypts AES key with their private key
        recovered_key = decrypt_key_with_private(encrypted_key, private_pem)

        # Buyer decrypts dataset
        recovered_data = decrypt_dataset(encrypted_data, recovered_key)
        assert recovered_data == data
