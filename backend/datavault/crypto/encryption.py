"""Dataset encryption for privacy-preserving delivery.

Datasets are encrypted with AES-256-GCM (symmetric), and the AES key is
encrypted with the buyer's RSA public key. Only the buyer can decrypt.
"""
import os

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def generate_keypair() -> tuple[bytes, bytes]:
    """Generate an RSA keypair. Returns (private_pem, public_pem)."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


def encrypt_dataset(data: bytes) -> tuple[bytes, bytes]:
    """Encrypt dataset with AES-256-GCM. Returns (encrypted_data, aes_key)."""
    key = AESGCM.generate_key(bit_length=256)
    nonce = os.urandom(12)
    aead = AESGCM(key)
    encrypted = aead.encrypt(nonce, data, None)
    # Prepend nonce to ciphertext for self-contained decryption
    return nonce + encrypted, key


def decrypt_dataset(encrypted_data: bytes, aes_key: bytes) -> bytes:
    """Decrypt dataset with AES-256-GCM."""
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    aead = AESGCM(aes_key)
    return aead.decrypt(nonce, ciphertext, None)


def encrypt_key_for_buyer(aes_key: bytes, buyer_public_pem: bytes) -> bytes:
    """Encrypt the AES key with the buyer's RSA public key."""
    public_key = serialization.load_pem_public_key(buyer_public_pem)
    return public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )


def decrypt_key_with_private(encrypted_key: bytes, private_pem: bytes) -> bytes:
    """Decrypt the AES key with the buyer's RSA private key."""
    private_key = serialization.load_pem_private_key(private_pem, password=None)
    return private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
