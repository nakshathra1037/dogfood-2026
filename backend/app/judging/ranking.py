from typing import List, Dict, Any
from app.schemas.result import ProjectResult, JudgeEvaluationSummary


def rank_and_aggregate_results(
    project_evaluations_map: Dict[int, Dict[str, Any]],
    normalized_scores_map: Dict[int, Dict[int, float]],
    raw_scores_map: Dict[int, Dict[int, float]],
    evaluation_summaries_map: Dict[int, List[JudgeEvaluationSummary]],
) -> List[ProjectResult]:
    """
    Aggregate project scores across multiple judges, perform deterministic tie-breaking, and assign ranks.
    
    Tie-breaking Hierarchy:
        1. Final score (descending)
        2. Raw average score (descending)
        3. Total evaluation count (descending)
        4. Project ID (ascending deterministic)
    """
    results: List[ProjectResult] = []

    for project_id, p_data in project_evaluations_map.items():
        eval_summaries = evaluation_summaries_map.get(project_id, [])
        eval_count = len(eval_summaries)

        if eval_count > 0:
            # Compute averages
            raw_avg = sum(e.raw_weighted_score for e in eval_summaries) / eval_count
            norm_avg = sum(e.normalized_score for e in eval_summaries) / eval_count
            final_score = norm_avg
        else:
            raw_avg = 0.0
            norm_avg = 0.0
            final_score = 0.0

        results.append(
            ProjectResult(
                project_id=project_id,
                project_name=p_data["project_name"],
                team_id=p_data["team_id"],
                team_name=p_data["team_name"],
                track_id=p_data.get("track_id"),
                track_name=p_data.get("track_name"),
                evaluation_count=eval_count,
                raw_average_score=round(raw_avg, 4),
                normalized_score=round(norm_avg, 4),
                final_score=round(final_score, 4),
                rank=0,  # Will be assigned below after sorting
                evaluations=eval_summaries,
            )
        )

    # Sort deterministically
    results.sort(
        key=lambda r: (
            -r.final_score,
            -r.raw_average_score,
            -r.evaluation_count,
            r.project_id,
        )
    )

    # Assign sequential ranks (handling ties explicitly)
    for idx, res in enumerate(results, start=1):
        res.rank = idx

    return results
