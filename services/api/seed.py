import sys
import os
from datetime import datetime, date, timedelta

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import (
    User,
    Goal,
    Milestone,
    Task,
    TaskDependency,
    Schedule,
    DailyProgress,
    ActivityLog,
    Notification,
    AIPlan,
)
from app.utils.security import hash_password


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Checking for existing demo user...")
        existing_user = db.query(User).filter(User.email == "demo@focusflow.dev").first()
        if existing_user:
            print("Cleaning up previous demo records to ensure fresh state...")
            db.delete(existing_user)
            db.commit()

        print("Creating demo user: demo@focusflow.dev / DemoPassword123!")
        demo_user = User(
            email="demo@focusflow.dev",
            hashed_password=hash_password("DemoPassword123!"),
            full_name="Alex Chen",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            timezone="America/New_York",
            daily_capacity_hours=2.5,
            preferred_days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
            current_skill_level="Advanced",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        today = date.today()
        now = datetime.utcnow()

        # =========================================================================
        # Goal 1: Software Engineering Interview Prep
        # =========================================================================
        print("Seeding Goal 1: Software Engineering Interview Prep...")
        g1 = Goal(
            user_id=demo_user.id,
            title="Prepare for Senior Full Stack Engineer Interview in 6 Weeks",
            description="Intensive mastery of algorithms, system design, and behavioral storytelling for tier-1 tech interviews.",
            category="Career",
            deadline=now + timedelta(days=42),
            target_hours=60.0,
            status="ACTIVE",
            current_skill="Advanced",
            preferred_days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
        )
        db.add(g1)
        db.commit()
        db.refresh(g1)

        # Milestone 1.1: Data Structures & Core Patterns
        m1_1 = Milestone(
            goal_id=g1.id,
            title="Data Structures & Core Patterns",
            description="Deep mastery of arrays, two pointers, trees, and dynamic programming.",
            order_index=1,
            target_date=now + timedelta(days=14),
            status="IN_PROGRESS",
        )
        db.add(m1_1)
        db.commit()
        db.refresh(m1_1)

        # Tasks for M1.1
        t1_1 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_1.id,
            title="Practice Two-Pointer & Sliding Window Problems",
            description="Solve 6 medium problems focusing on subarray sums and container problems.",
            priority="HIGH",
            status="COMPLETED",
            estimated_minutes=90,
            actual_minutes=85,
            scheduled_date=now - timedelta(days=3),
            completed_at=now - timedelta(days=3),
            order_index=1,
            tags="DSA, Arrays",
            notes="Mastered left/right pointer termination condition.",
        )
        t1_2 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_1.id,
            title="Binary Tree Traversals & LCA Implementation",
            description="Implement recursive and iterative BFS/DFS and Lowest Common Ancestor.",
            priority="CRITICAL",
            status="COMPLETED",
            estimated_minutes=80,
            actual_minutes=75,
            scheduled_date=now - timedelta(days=1),
            completed_at=now - timedelta(days=1),
            order_index=2,
            tags="DSA, Trees",
            notes="Reviewed iterative stack traversal.",
        )
        # OVERDUE TASK (demonstrates replanning)
        t1_3 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_1.id,
            title="Graph Algorithms: Dijkstra & Topological Sort",
            description="Implement topological sorting for course schedule and shortest path algorithms.",
            priority="HIGH",
            status="OVERDUE",
            estimated_minutes=90,
            actual_minutes=0,
            scheduled_date=now - timedelta(days=1),
            order_index=3,
            tags="DSA, Graphs",
            notes="Carried over from yesterday.",
        )
        # TODAY'S TASK
        t1_4 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_1.id,
            title="Dynamic Programming: 1D Knapsack & Coin Change",
            description="Solve 4 foundational 1D DP recurrence relation problems.",
            priority="CRITICAL",
            status="TODO",
            estimated_minutes=90,
            actual_minutes=0,
            scheduled_date=datetime.combine(today, datetime.min.time()),
            order_index=4,
            tags="DSA, DP",
            notes="Focus on state transition formulas.",
        )
        # FUTURE TASK
        t1_5 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_1.id,
            title="Disjoint Set Union (Union-Find) with Path Compression",
            description="Learn union by rank and path compression for connected components.",
            priority="MEDIUM",
            status="TODO",
            estimated_minutes=75,
            actual_minutes=0,
            scheduled_date=now + timedelta(days=2),
            order_index=5,
            tags="DSA, DSU",
        )
        db.add_all([t1_1, t1_2, t1_3, t1_4, t1_5])
        db.commit()

        # Milestone 1.2: System Design & Distributed Systems
        m1_2 = Milestone(
            goal_id=g1.id,
            title="System Design & Architecture",
            description="High-scale distributed systems, database scaling, caching, and rate limiting.",
            order_index=2,
            target_date=now + timedelta(days=28),
            status="PENDING",
        )
        db.add(m1_2)
        db.commit()
        db.refresh(m1_2)

        t1_6 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_2.id,
            title="Design a Distributed Rate Limiter with Redis",
            description="Architect sliding window rate limiting across multiple API gateways.",
            priority="CRITICAL",
            status="TODO",
            estimated_minutes=80,
            actual_minutes=0,
            scheduled_date=datetime.combine(today, datetime.min.time()),
            order_index=1,
            tags="System Design, Redis",
            notes="Consider race conditions and memory usage.",
        )
        t1_7 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_2.id,
            title="Database Sharding & Consistent Hashing Deep Dive",
            description="Compare range vs hash-based sharding and replica failover protocols.",
            priority="HIGH",
            status="TODO",
            estimated_minutes=90,
            actual_minutes=0,
            scheduled_date=now + timedelta(days=3),
            order_index=2,
            tags="System Design, Database",
        )
        db.add_all([t1_6, t1_7])
        db.commit()

        # Milestone 1.3: Behavioral & Mock Interviews
        m1_3 = Milestone(
            goal_id=g1.id,
            title="Behavioral & Mock Interviews",
            description="STAR method project breakdown and live coding simulations.",
            order_index=3,
            target_date=now + timedelta(days=42),
            status="PENDING",
        )
        db.add(m1_3)
        db.commit()
        db.refresh(m1_3)

        t1_8 = Task(
            user_id=demo_user.id,
            goal_id=g1.id,
            milestone_id=m1_3.id,
            title="Draft 6 STAR Leadership & Conflict Case Studies",
            description="Detail situations, metrics, technical decisions, and tangible outcomes.",
            priority="MEDIUM",
            status="TODO",
            estimated_minutes=60,
            actual_minutes=0,
            scheduled_date=now + timedelta(days=5),
            order_index=1,
            tags="Behavioral",
        )
        db.add(t1_8)
        db.commit()

        # =========================================================================
        # Goal 2: Build & Deploy Full-Stack SaaS
        # =========================================================================
        print("Seeding Goal 2: Build & Deploy SaaS...")
        g2 = Goal(
            user_id=demo_user.id,
            title="Build & Deploy Production SaaS with FastAPI & React",
            description="Engineer a cross-platform application with PostgreSQL, Redis, Docker, and CI/CD.",
            category="Learning",
            deadline=now + timedelta(days=28),
            target_hours=45.0,
            status="ACTIVE",
            current_skill="Advanced",
            preferred_days="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
        )
        db.add(g2)
        db.commit()
        db.refresh(g2)

        m2_1 = Milestone(
            goal_id=g2.id,
            title="Architecture & Authentication",
            description="Database schema, Alembic, JWT tokens, and CORS configuration.",
            order_index=1,
            target_date=now + timedelta(days=10),
            status="COMPLETED",
        )
        db.add(m2_1)
        db.commit()
        db.refresh(m2_1)

        t2_1 = Task(
            user_id=demo_user.id,
            goal_id=g2.id,
            milestone_id=m2_1.id,
            title="Relational Schema Design & Migration Setup",
            description="Build 11 normalized tables with indexes, foreign keys, and cascading rules.",
            priority="CRITICAL",
            status="COMPLETED",
            estimated_minutes=90,
            actual_minutes=95,
            scheduled_date=now - timedelta(days=4),
            completed_at=now - timedelta(days=4),
            order_index=1,
            tags="Backend, SQL",
        )
        t2_2 = Task(
            user_id=demo_user.id,
            goal_id=g2.id,
            milestone_id=m2_1.id,
            title="Implement JWT Auth with Token Rotation",
            description="Secure endpoints, hash passwords with bcrypt, handle refresh tokens.",
            priority="HIGH",
            status="COMPLETED",
            estimated_minutes=80,
            actual_minutes=70,
            scheduled_date=now - timedelta(days=2),
            completed_at=now - timedelta(days=2),
            order_index=2,
            tags="Backend, Security",
        )
        db.add_all([t2_1, t2_2])
        db.commit()

        # =========================================================================
        # Seed Past DailyProgress for Analytics & Streaks
        # =========================================================================
        print("Seeding DailyProgress history...")
        for i in range(6, 0, -1):
            past_date = today - timedelta(days=i)
            # simulate completed tasks on each day to establish a 6-day streak
            p = DailyProgress(
                user_id=demo_user.id,
                date=past_date,
                tasks_completed=2,
                tasks_missed=0 if i != 1 else 1,
                total_minutes_spent=160,
                focus_score=95.0 if i != 1 else 80.0,
                notes="Steady focus session.",
            )
            db.add(p)
        db.commit()

        # =========================================================================
        # Seed Notifications
        # =========================================================================
        print("Seeding notifications...")
        n1 = Notification(
            user_id=demo_user.id,
            title="Welcome to FocusFlow AI",
            message="Your account is initialized. AI Planner and smart scheduling are ready.",
            type="AI_RECOMMENDATION",
            is_read=True,
            link="/dashboard",
            created_at=now - timedelta(days=5),
        )
        n2 = Notification(
            user_id=demo_user.id,
            title="Task Reminder: Dynamic Programming",
            message="Upcoming high-priority task 'Dynamic Programming: 1D Knapsack' is scheduled today.",
            type="TASK_REMINDER",
            is_read=False,
            link="/dashboard",
            created_at=now - timedelta(hours=2),
        )
        n3 = Notification(
            user_id=demo_user.id,
            title="⚠ Missed Task Detected",
            message="Task 'Graph Algorithms: Dijkstra' was missed yesterday. Run Smart Replanning to balance your schedule.",
            type="OVERDUE_TASK",
            is_read=False,
            link=f"/goals/{g1.id}",
            created_at=now - timedelta(hours=5),
        )
        db.add_all([n1, n2, n3])
        db.commit()

        # =========================================================================
        # Seed Activity Logs
        # =========================================================================
        print("Seeding activity logs...")
        act1 = ActivityLog(
            user_id=demo_user.id,
            entity_type="GOAL",
            entity_id=g1.id,
            action="CREATED",
            details="Goal 'Prepare for Senior Full Stack Engineer Interview' created with AI Planner.",
            created_at=now - timedelta(days=5),
        )
        act2 = ActivityLog(
            user_id=demo_user.id,
            entity_type="TASK",
            entity_id=t1_1.id,
            action="COMPLETED",
            details="Completed 'Practice Two-Pointer & Sliding Window Problems' in 85 mins.",
            created_at=now - timedelta(days=3),
        )
        act3 = ActivityLog(
            user_id=demo_user.id,
            entity_type="TASK",
            entity_id=t1_2.id,
            action="COMPLETED",
            details="Completed 'Binary Tree Traversals & LCA Implementation' in 75 mins.",
            created_at=now - timedelta(days=1),
        )
        db.add_all([act1, act2, act3])
        db.commit()

        print("Database successfully seeded with rich demo data!")
        print(f"Demo Credentials -> Email: demo@focusflow.dev | Password: DemoPassword123!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
