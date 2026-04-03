import os
import tempfile

import pytest
from httpx import ASGITransport, AsyncClient

# Use a temp file DB so data persists across connections within a test
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["DATAVAULT_DB_PATH"] = _tmp.name


@pytest.fixture
def sample_csv_bytes() -> bytes:
    lines = ["id,age,income,diagnosis"]
    for i in range(100):
        lines.append(f"{i},{20 + i % 50},{30000 + i * 500},{'healthy' if i % 3 else 'condition_a'}")
    return "\n".join(lines).encode("utf-8")


@pytest.fixture
async def client():
    from datavault.api.app import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
