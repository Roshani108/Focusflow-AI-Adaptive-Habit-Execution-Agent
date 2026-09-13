import logging
from typing import Dict, Any
from app.config import settings
from app.agents.base_provider import BaseAIProvider
from app.agents.mock_provider import MockProvider
from app.agents.openai_provider import OpenAIProvider
from app.agents.groq_provider import GroqProvider

logger = logging.getLogger("focusflow.ai.service")


class AIService:
    """
    Unified AI Service orchestrator. Selects provider based on configuration.
    Falls back gracefully to MockProvider if network, quota, or key errors occur.
    """

    def __init__(self):
        self.mock_provider = MockProvider()
        self.provider = self._resolve_provider()

    def _resolve_provider(self) -> BaseAIProvider:
        provider_name = settings.AI_PROVIDER.lower()
        if provider_name == "openai" and settings.OPENAI_API_KEY:
            logger.info("Using OpenAI AI Provider.")
            return OpenAIProvider()
        elif provider_name == "groq" and settings.GROQ_API_KEY:
            logger.info("Using Groq AI Provider.")
            return GroqProvider()
        
        logger.info("Using Deterministic Mock AI Provider (zero API key needed).")
        return self.mock_provider

    async def generate_plan(self, prompt: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return await self.provider.generate_plan(prompt, parameters)
        except Exception as e:
            logger.warning(f"Primary AI provider failed ({e}). Falling back to deterministic Mock Provider.")
            return await self.mock_provider.generate_plan(prompt, parameters)

    async def replan(self, missed_tasks: list, constraints: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return await self.provider.replan(missed_tasks, constraints)
        except Exception as e:
            logger.warning(f"Primary AI replanner failed ({e}). Falling back to Mock Provider.")
            return await self.mock_provider.replan(missed_tasks, constraints)


ai_service = AIService()
