import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from app.config import settings

logger = logging.getLogger("focusflow.database")

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    # Check if we should attempt PostgreSQL or fall back to SQLite
    if db_url.startswith("postgresql"):
        try:
            # Test quick connection to postgres
            test_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 2}
            )
            with test_engine.connect() as conn:
                pass
            logger.info("Successfully connected to PostgreSQL database.")
            return test_engine
        except Exception as err:
            logger.warning(
                f"PostgreSQL connection failed ({err}). Falling back to local SQLite database for zero-config development."
            )
            sqlite_url = "sqlite:///./focusflow_dev.db"
            return create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )
    elif db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False}
        )
    return create_engine(db_url)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
