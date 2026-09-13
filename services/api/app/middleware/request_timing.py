import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("focusflow.access")


class RequestTimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        response = await call_next(request)
        
        process_time = (time.perf_counter() - start_time) * 1000.0  # in ms
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        
        # Structured logging: exclude query params with potential secrets
        path = request.url.path
        method = request.method
        status_code = response.status_code
        logger.info(f"{method} {path} -> {status_code} ({process_time:.2f}ms)")
        
        return response
