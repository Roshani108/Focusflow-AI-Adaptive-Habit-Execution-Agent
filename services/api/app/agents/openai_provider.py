import json
import logging
from typing import Dict, Any
import httpx
from app.agents.base_provider import BaseAIProvider
from app.config import settings

logger = logging.getLogger("focusflow.ai.openai")


class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def generate_plan(self, prompt: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")

        system_prompt = (
            "You are FocusFlow AI, an expert goal breakdown and productivity architect. "
            "You must decompose the user's goal into realistic milestones and actionable tasks. "
            "Return strictly valid JSON matching this schema:\n"
            "{\n"
            '  "goal_title": string,\n'
            '  "duration_weeks": integer,\n'
            '  "total_estimated_hours": float,\n'
            '  "feasibility_score": float (0-100),\n'
            '  "clarification_notes": string,\n'
            '  "milestones": [\n'
            "    {\n"
            '      "title": string,\n'
            '      "description": string,\n'
            '      "order_index": integer,\n'
            '      "estimated_days": integer,\n'
            '      "tasks": [\n'
            "        {\n"
            '          "title": string,\n'
            '          "description": string,\n'
            '          "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
            '          "estimated_minutes": integer,\n'
            '          "scheduled_day_offset": integer,\n'
            '          "tags": string,\n'
            '          "notes": string,\n'
            '          "depends_on_task_title": string or null\n'
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ],\n"
            '  "recommendations": [string]\n'
            "}"
        )

        user_content = (
            f"Goal: {prompt}\n"
            f"Deadline Days: {parameters.get('deadline_days', 30)}\n"
            f"Daily Available Hours: {parameters.get('daily_available_hours', 2.0)}\n"
            f"Current Skill Level: {parameters.get('current_skill', 'Intermediate')}\n"
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
            "temperature": 0.3,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)

    async def replan(self, missed_tasks: list, constraints: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")

        system_prompt = (
            "You are FocusFlow AI Replanner. The user has overdue or missed tasks. "
            "Redistribute them intelligently without violating their daily capacity or deadline. "
            "Return strictly valid JSON with keys: missed_tasks_count, summary, rescheduled_tasks, recommendations."
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
            "temperature": 0.3,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
