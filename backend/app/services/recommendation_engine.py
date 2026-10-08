from typing import List, Dict, Any

def generate_recommendations(weak_areas: List[str], overall_score: float) -> List[str]:
    recs = []
    for area in weak_areas[:3]:
        recs.append(f"Dedicate 30 mins to deep dive into {area}: practice implementation patterns and common edge cases.")

    if overall_score < 60:
        recs.append("Structure answers systematically using STAR (Situation, Task, Action, Result) for behavioral questions.")
        recs.append("Revise basic algorithmic time & space complexity fundamentals.")
    elif overall_score < 80:
        recs.append("Elaborate on production considerations: monitoring, database indexing, caching, and resiliency.")
    else:
        recs.append("Outstanding performance! Practice mock interviews under strict 2-minute time constraints to master executive communication.")

    return recs

def build_dashboard_summary(sessions: List[Dict[str, Any]], user_name: str, target_role: str) -> Dict[str, Any]:
    if not sessions:
        # Default starter baseline
        return {
            "user_name": user_name,
            "target_role": target_role,
            "total_interviews": 0,
            "average_score": 0.0,
            "highest_score": 0.0,
            "latest_resume_match": 78.0,
            "radar_scores": {
                "Technical": 70.0,
                "Communication": 65.0,
                "Relevance": 75.0,
                "Completeness": 60.0,
                "Problem Solving": 68.0
            },
            "score_history": [],
            "weak_areas": [
                {"skill": "System Design", "score": 55.0, "recommendation": "Review caching, microservices, and load balancing."},
                {"skill": "Database Indexing", "score": 62.0, "recommendation": "Practice B-Tree mechanics and query plan analysis."},
                {"skill": "Cloud / AWS", "score": 58.0, "recommendation": "Learn serverless, S3, and ECS fundamentals."}
            ],
            "recommended_topics": ["System Design Architecture", "REST vs gRPC", "Database Normalization & Indexing", "JWT Security Patterns"]
        }

    total = len(sessions)
    scores = [s.get("overall_score", 0.0) for s in sessions if s.get("status") == "completed"]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    max_score = round(max(scores), 1) if scores else 0.0

    # Build history
    history = []
    for i, s in enumerate(reversed(sessions[-6:])):
        history.append({
            "attempt": i + 1,
            "date": s.get("created_at", "")[:10],
            "overall_score": float(s.get("overall_score", 0.0)),
            "technical_score": float(s.get("technical_score", 0.0)),
            "communication_score": float(s.get("communication_score", 0.0))
        })

    # Radar scores
    tech_avg = round(sum(s.get("technical_score", 70.0) for s in sessions) / total, 1)
    comm_avg = round(sum(s.get("communication_score", 70.0) for s in sessions) / total, 1)
    rel_avg = round(sum(s.get("relevance_score", 70.0) for s in sessions) / total, 1)
    comp_avg = round(sum(s.get("completeness_score", 70.0) for s in sessions) / total, 1)

    return {
        "user_name": user_name,
        "target_role": target_role,
        "total_interviews": total,
        "average_score": avg_score,
        "highest_score": max_score,
        "latest_resume_match": 82.0,
        "radar_scores": {
            "Technical": tech_avg,
            "Communication": comm_avg,
            "Relevance": rel_avg,
            "Completeness": comp_avg,
            "Problem Solving": round((tech_avg + rel_avg) / 2, 1)
        },
        "score_history": history,
        "weak_areas": [
            {"skill": "System Design", "score": min(65.0, tech_avg - 10), "recommendation": "Practice distributed systems trade-offs."},
            {"skill": "Database Optimization", "score": min(70.0, tech_avg - 5), "recommendation": "Study slow query logs and index design."},
            {"skill": "Behavioral STAR", "score": min(75.0, comm_avg), "recommendation": "Structure stories with quantified impacts."}
        ],
        "recommended_topics": ["Microservices Communication", "Concurrency & Async/Await", "Docker & Kubernetes Deployment"]
    }
