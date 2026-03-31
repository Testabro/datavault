from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_prefix": "DATAVAULT_"}

    port: int = 8000
    host: str = "0.0.0.0"
    debug: bool = False
    db_path: str = "./data/datavault.db"
    ipfs_api_url: str = "http://localhost:5001"
    midnight_rpc_url: str = "https://rpc.midnight.network"
    encryption_key_bits: int = 2048
    max_upload_mb: int = 500


settings = Settings()
