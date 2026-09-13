import json
import logging
import time
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger("focusflow.redis")


class InMemoryCache:
    """In-memory TTL cache fallback when Redis instance is unreachable."""
    def __init__(self):
        self._store = {}

    def get(self, key: str) -> Optional[str]:
        item = self._store.get(key)
        if not item:
            return None
        val, expiry = item
        if expiry and time.time() > expiry:
            del self._store[key]
            return None
        return val

    def set(self, key: str, val: str, ex: Optional[int] = None) -> bool:
        expiry = time.time() + ex if ex else None
        self._store[key] = (val, expiry)
        return True

    def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    def delete_prefix(self, prefix: str) -> int:
        keys_to_del = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_del:
            del self._store[k]
        return len(keys_to_del)


class RedisService:
    def __init__(self):
        self.client = None
        self.is_connected = False
        self._fallback = InMemoryCache()
        self._connect()

    def _connect(self):
        try:
            import redis
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=1)
            self.client.ping()
            self.is_connected = True
            logger.info("Connected to Redis cache.")
        except Exception as e:
            self.is_connected = False
            logger.warning(f"Redis not available ({e}). Using in-memory fallback cache.")

    def get_json(self, key: str) -> Optional[Any]:
        try:
            val = self.client.get(key) if self.is_connected else self._fallback.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.error(f"Error reading cache key {key}: {e}")
            val = self._fallback.get(key)
            if val:
                return json.loads(val)
        return None

    def set_json(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        try:
            val_str = json.dumps(value)
            if self.is_connected:
                self.client.set(key, val_str, ex=ttl_seconds)
            self._fallback.set(key, val_str, ex=ttl_seconds)
            return True
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            self._fallback.set(key, json.dumps(value), ex=ttl_seconds)
            return True

    def delete(self, key: str) -> bool:
        try:
            if self.is_connected:
                self.client.delete(key)
        except Exception:
            pass
        return self._fallback.delete(key)

    def invalidate_user_cache(self, user_id: int) -> None:
        """Invalidate all cached items for a user when their tasks or goals update."""
        prefix = f"user:{user_id}:"
        try:
            if self.is_connected:
                keys = self.client.keys(f"{prefix}*")
                if keys:
                    self.client.delete(*keys)
        except Exception:
            pass
        self._fallback.delete_prefix(prefix)


redis_service = RedisService()
