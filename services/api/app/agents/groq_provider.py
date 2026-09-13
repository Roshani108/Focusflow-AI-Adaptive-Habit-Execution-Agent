import json
import logging
from typing import Dict, Any
import httpx
from app.agents.base_provider import BaseAIProvider
from app.config import settings

logger = logging.getLogger("focusflow.ai.groq")


class GroqProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_plan(self, prompt: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured.")

        system_prompt = (
            "You are FocusFlow AI, an expert goal breakdown and productivity architect. "
            "You decompose high-level goals into realistic milestones and tasks. "
            "Respond strictly in JSON format with keys: goal_title, duration_weeks, total_estimated_hours, "
            "feasibility_score, clarification_notes, milestones (with tasks array), recommendations."
        )

        user_content = (
            f"Goal: {prompt}\n"
            f"Deadline Days: {parameters.get('deadline_days', 30)}\n"
            f"Daily Available Hours: {parameters.get('daily_available_hours', 2.0)}\n"
            f"Skill Level: {parameters.get('current_skill', 'Intermediate')}\n"
            f"Preferred Days: {parameters.get('preferred_days', 'Monday-Saturday')}\n"
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return json.loads(data["choices"][0]["message"]["content"])

    async def replan(self, missed_tasks: list, constraints: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured.")

        system_prompt = (
            "You are FocusFlow AI Replanner. Redistribute overdue/missed tasks across remaining days. "
            "Return JSON with: missed_tasks_count, summary, rescheduled_tasks, recommendations."
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps({"missed_tasks": missed_tasks, "constraints": constraints})},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return json.loads(data["choices"][0]["message"]["content"])
