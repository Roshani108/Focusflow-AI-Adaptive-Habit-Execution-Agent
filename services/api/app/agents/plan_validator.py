from typing import Dict, Any, Tuple
from pydantic import ValidationError
from app.schemas.ai_plan import StructuredPlan


class PlanValidator:
    """
    Step 5 in the AI Pipeline:
    Strictly validates AI-generated outputs using Pydantic schemas
    and architectural business rules before saving or returning.
    """

    def validate(self, plan_data: Dict[str, Any]) -> Tuple[bool, StructuredPlan, str]:
        try:
            validated = StructuredPlan(**plan_data)
            
            # Structural constraint verification
            if not validated.milestones:
                return False, validated, "Plan contains no milestones."

            for m in validated.milestones:
                if not m.tasks:
                    return False, validated, f"Milestone '{m.title}' contains no tasks."

            return True, validated, "Validation successful."
        except ValidationError as e:
            return False, None, f"Schema validation error: {e}"
        except Exception as e:
            return False, None, f"Unexpected validation error: {e}"
