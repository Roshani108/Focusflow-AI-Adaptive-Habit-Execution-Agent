from typing import Dict, Any
from app.agents.ai_service import ai_service


class TaskDecomposer:
    """
    Step 2 in the AI Pipeline:
    Invokes the AI provider abstraction to decompose the validated goal
    into structured milestones and task candidates.
    """

    async def decompose(self, goal: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        raw_plan = await ai_service.generate_plan(goal, parameters)
        return raw_plan
