import uvicorn

from datavault.config import settings


def main():
    uvicorn.run(
        "datavault.api.app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )


if __name__ == "__main__":
    main()
