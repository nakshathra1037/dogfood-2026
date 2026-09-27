from typing import List, Dict, Tuple
from app.models.rubric_criterion import RubricCriterion
from app.models.evaluation_score import EvaluationScore
from app.schemas.result import CriterionScoreBreakdown


def calculate_evaluation_weighted_score(
    scores: List[EvaluationScore],
    criteria_map: Dict[int, RubricCriterion],
) -> Tuple[float, List[CriterionScoreBreakdown]]:
    """
    Calculate the total weighted score (0.0 to 100.0) for an evaluation.
    
    Formula:
        Weighted Score = sum( (score_i / max_score_i) * weight_i )
    Where:
        weight_i is percentage (e.g. 25.0 for 25%), and sum(weights) = 100.0.
    """
    total_weighted_score = 0.0
    breakdowns: List[CriterionScoreBreakdown] = []

    for s in scores:
        criterion = criteria_map.get(s.criterion_id)
        if not criterion:
            continue
        
        max_score = criterion.max_score if criterion.max_score > 0 else 10.0
        clamped_score = max(0.0, min(float(s.score), float(max_score)))
        normalized_pct = (clamped_score / max_score) * 100.0
        weighted_contrib = (clamped_score / max_score) * float(criterion.weight)
        total_weighted_score += weighted_contrib

        breakdowns.append(
            CriterionScoreBreakdown(
                criterion_id=criterion.id,
                criterion_name=criterion.name,
                weight=float(criterion.weight),
                max_score=float(max_score),
                raw_score=float(s.score),
                normalized_percentage=round(normalized_pct, 4),
                weighted_score=round(weighted_contrib, 4),
            )
        )

    return round(total_weighted_score, 4), breakdowns
