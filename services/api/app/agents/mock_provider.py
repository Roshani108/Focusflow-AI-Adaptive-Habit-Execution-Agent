from typing import Dict, Any, List
from app.agents.base_provider import BaseAIProvider


class MockProvider(BaseAIProvider):
    """
    Deterministic, heuristic-based AI Provider.
    Generates production-quality structured plans and replanning responses
    even when no OpenAI or Groq API key is present.
    """

    async def generate_plan(self, prompt: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        goal = prompt.lower()
        duration_weeks = max(1, parameters.get("deadline_days", 30) // 7)
        daily_hours = parameters.get("daily_available_hours", 2.0)
        total_hours = round(duration_weeks * 6 * daily_hours * 0.85, 1)

        # Domain-specific intelligent decomposition heuristics
        if any(w in goal for w in ["interview", "leetcode", "dsa", "algorithm"]):
            milestones = [
                {
                    "title": "Data Structures & Core Patterns",
                    "description": "Master array manipulation, two pointers, sliding window, and hash tables.",
                    "order_index": 1,
                    "estimated_days": 10,
                    "tasks": [
                        {
                            "title": "Practice Two-Pointer & Sliding Window Problems",
                            "description": "Solve 5 medium LeetCode problems covering subarray sums and container with most water.",
                            "priority": "HIGH",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 1,
                            "tags": "DSA, Array",
                            "notes": "Focus on space complexity analysis.",
                        },
                        {
                            "title": "Tree Traversals & Binary Search Trees",
                            "description": "Implement recursive and iterative BFS/DFS on binary search trees.",
                            "priority": "HIGH",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 3,
                            "tags": "DSA, Trees",
                            "notes": "Review pre-order, in-order, and post-order.",
                            "depends_on_task_title": "Practice Two-Pointer & Sliding Window Problems",
                        },
                        {
                            "title": "Graph Algorithms & Shortest Path",
                            "description": "Practice Dijkstra and topological sort for course schedule problems.",
                            "priority": "MEDIUM",
                            "estimated_minutes": 100,
                            "scheduled_day_offset": 6,
                            "tags": "DSA, Graphs",
                            "notes": "Draw dependency graphs to visualize.",
                        },
                    ],
                },
                {
                    "title": "System Design & Architecture Fundamentals",
                    "description": "Scale web architectures, caching strategies, and database partitioning.",
                    "order_index": 2,
                    "estimated_days": 10,
                    "tasks": [
                        {
                            "title": "Design a Distributed Rate Limiter",
                            "description": "Design token bucket and sliding log rate limiter using Redis and API gateway.",
                            "priority": "CRITICAL",
                            "estimated_minutes": 80,
                            "scheduled_day_offset": 9,
                            "tags": "System Design, Redis",
                            "notes": "Discuss concurrency and race conditions.",
                        },
                        {
                            "title": "Database Scaling: Sharding vs Read Replicas",
                            "description": "Study CAP theorem, master-replica replication lag, and consistent hashing.",
                            "priority": "HIGH",
                            "estimated_minutes": 75,
                            "scheduled_day_offset": 12,
                            "tags": "System Design, DB",
                            "notes": "Prepare trade-off comparisons.",
                        },
                    ],
                },
                {
                    "title": "Behavioral Preparation & Mock Interviews",
                    "description": "Synthesize STAR stories and execute timed peer mock interviews.",
                    "order_index": 3,
                    "estimated_days": 10,
                    "tasks": [
                        {
                            "title": "Draft 6 STAR Method Project Stories",
                            "description": "Document leadership, conflict resolution, technical hurdles, and outcomes.",
                            "priority": "MEDIUM",
                            "estimated_minutes": 60,
                            "scheduled_day_offset": 16,
                            "tags": "Behavioral",
                            "notes": "Quantify business impact in dollars or percentages.",
                        },
                        {
                            "title": "Complete 2 Full Mock Technical Interviews",
                            "description": "Run 45-minute live coding session under interview pressure.",
                            "priority": "CRITICAL",
                            "estimated_minutes": 120,
                            "scheduled_day_offset": 20,
                            "tags": "Mock Interview",
                            "notes": "Record sessions and review communication pacing.",
                        },
                    ],
                },
            ]
        elif any(w in goal for w in ["full stack", "react", "fastapi", "web app"]):
            milestones = [
                {
                    "title": "Architecture & API Contract Setup",
                    "description": "Define database schemas, auth tokens, and OpenAPI specifications.",
                    "order_index": 1,
                    "estimated_days": 7,
                    "tasks": [
                        {
                            "title": "Model Relational Schema & Alembic Migrations",
                            "description": "Implement Users, Goals, Tasks, and Dependency tables with foreign keys and indexes.",
                            "priority": "CRITICAL",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 1,
                            "tags": "Backend, DB",
                            "notes": "Verify ON DELETE CASCADE constraints.",
                        },
                        {
                            "title": "Build JWT Auth & Protected Route Middleware",
                            "description": "Issue access and refresh tokens, hash passwords with bcrypt, add auth dependencies.",
                            "priority": "HIGH",
                            "estimated_minutes": 80,
                            "scheduled_day_offset": 3,
                            "tags": "Security, Auth",
                            "notes": "Validate expiration headers.",
                        },
                    ],
                },
                {
                    "title": "Core Frontend UI & State Management",
                    "description": "Assemble React dashboard, forms, and responsive components.",
                    "order_index": 2,
                    "estimated_days": 10,
                    "tasks": [
                        {
                            "title": "Develop Interactive Goal Breakdown Wizard",
                            "description": "Create step-by-step goal builder with AI plan preview, edit, and approval states.",
                            "priority": "HIGH",
                            "estimated_minutes": 100,
                            "scheduled_day_offset": 6,
                            "tags": "Frontend, React",
                            "notes": "Use Zod schemas for client-side form validation.",
                        },
                        {
                            "title": "Implement Analytics Dashboard with Recharts",
                            "description": "Render task velocity, completion streaks, and workload distribution charts.",
                            "priority": "MEDIUM",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 9,
                            "tags": "Frontend, Recharts",
                            "notes": "Ensure mobile responsive viewport.",
                        },
                    ],
                },
                {
                    "title": "Deployment, Testing & Verification",
                    "description": "Dockerize microservices, configure CI/CD workflows, and run integration tests.",
                    "order_index": 3,
                    "estimated_days": 8,
                    "tasks": [
                        {
                            "title": "Write Comprehensive Pytest & API Tests",
                            "description": "Test auth endpoints, goal generation, task state transitions, and replanning.",
                            "priority": "HIGH",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 13,
                            "tags": "Testing, Pytest",
                            "notes": "Aim for >85% route coverage.",
                        },
                        {
                            "title": "Docker Compose Orchestration & CI Pipelines",
                            "description": "Build multi-stage Dockerfiles and GitHub Actions automated test workflows.",
                            "priority": "MEDIUM",
                            "estimated_minutes": 75,
                            "scheduled_day_offset": 16,
                            "tags": "DevOps, Docker",
                            "notes": "Check container healthcheck intervals.",
                        },
                    ],
                },
            ]
        else:
            # Generic smart decomposition
            milestones = [
                {
                    "title": "Discovery & Foundation",
                    "description": "Establish baseline requirements, research materials, and setup routines.",
                    "order_index": 1,
                    "estimated_days": 7,
                    "tasks": [
                        {
                            "title": f"Audit Resources & Baseline Assessment for '{prompt[:40]}'",
                            "description": "Define scope, eliminate distractions, and collect reference guides.",
                            "priority": "HIGH",
                            "estimated_minutes": 60,
                            "scheduled_day_offset": 1,
                            "tags": "Foundation",
                            "notes": "Write measurable success criteria.",
                        },
                        {
                            "title": "Set Up Daily Tracking & Milestone Checklist",
                            "description": "Map daily time slots and remove friction from study schedule.",
                            "priority": "MEDIUM",
                            "estimated_minutes": 45,
                            "scheduled_day_offset": 3,
                            "tags": "Setup",
                            "notes": "Reserve uninterrupted focus blocks.",
                        },
                    ],
                },
                {
                    "title": "Core Execution & Skill Building",
                    "description": "Deliberate practice and deep work on core competencies.",
                    "order_index": 2,
                    "estimated_days": 12,
                    "tasks": [
                        {
                            "title": "Intensive Deep-Work Block 1",
                            "description": "Execute targeted exercises and practical application.",
                            "priority": "CRITICAL",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 6,
                            "tags": "Deep Work",
                            "notes": "Track focus minutes.",
                        },
                        {
                            "title": "Intermediate Checkpoint & Self-Assessment",
                            "description": "Evaluate progress against milestone targets, review missed concepts.",
                            "priority": "HIGH",
                            "estimated_minutes": 60,
                            "scheduled_day_offset": 10,
                            "tags": "Review",
                            "notes": "Refine approach based on speed and comprehension.",
                        },
                    ],
                },
                {
                    "title": "Consolidation & Final Review",
                    "description": "Synthesize learnings, simulate real conditions, and finalize deliverables.",
                    "order_index": 3,
                    "estimated_days": 8,
                    "tasks": [
                        {
                            "title": "Final Simulated Challenge",
                            "description": "Execute end-to-end evaluation under strict constraints.",
                            "priority": "HIGH",
                            "estimated_minutes": 90,
                            "scheduled_day_offset": 15,
                            "tags": "Evaluation",
                            "notes": "Simulate exact deadline conditions.",
                        },
                    ],
                },
            ]

        return {
            "goal_title": prompt,
            "duration_weeks": duration_weeks,
            "total_estimated_hours": total_hours,
            "feasibility_score": 92.0,
            "clarification_notes": f"Plan structured for {daily_hours}h/day capacity over {duration_weeks} weeks.",
            "milestones": milestones,
            "recommendations": [
                f"Maintain your target of {daily_hours} hours daily in consistent time blocks.",
                "Review tasks every morning and mark completed promptly to calibrate the AI replanner.",
                "Take a 10-minute rest between 45-minute focus intervals.",
            ],
        }

    async def replan(self, missed_tasks: list, constraints: Dict[str, Any]) -> Dict[str, Any]:
        count = len(missed_tasks)
        daily_limit = constraints.get("daily_capacity_hours", 3.0)
        
        rescheduled = []
        for i, task in enumerate(missed_tasks):
            rescheduled.append({
                "task_id": task.get("id", i + 1),
                "task_title": task.get("title", f"Task {i + 1}"),
                "previous_date": task.get("scheduled_date", "yesterday"),
                "new_scheduled_date": task.get("new_date", "tomorrow"),
                "reason": "Redistributed to balance daily capacity without exceeding deadline.",
            })

        return {
            "missed_tasks_count": count,
            "summary": (
                f"You had {count} missed or overdue task{'s' if count != 1 else ''}. "
                f"I've redistributed them across upcoming days without exceeding your "
                f"daily capacity limit of {daily_limit}h."
            ),
            "rescheduled_tasks": rescheduled,
            "recommendations": [
                "Focus on the highest-priority rescheduled task first.",
                "If feeling overloaded, consider reducing non-essential tasks to prevent burnout.",
            ],
        }
