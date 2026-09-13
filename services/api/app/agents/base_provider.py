from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_plan(self, prompt: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structured goal decomposition and milestone plan."""
        pass

    @abstractmethod
    async def replan(self, missed_tasks: list, constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Replan and redistribute overdue/missed tasks."""
        pass
