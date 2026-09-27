import math
from typing import Dict, List, Tuple


def calculate_judge_statistics(scores: List[float]) -> Tuple[float, float]:
    """
    Calculate the arithmetic mean and sample standard deviation for a judge's score list.
    If sample size N < 2 or variance is zero, returns (mean, 0.0).
    """
    n = len(scores)
    if n == 0:
        return 0.0, 0.0
    if n == 1:
        return scores[0], 0.0

    mean = sum(scores) / n
    variance = sum((x - mean) ** 2 for x in scores) / (n - 1)
    std_dev = math.sqrt(variance)
    return mean, std_dev


def normalize_judge_scores(
    judge_scores_map: Dict[int, Dict[int, float]],
    target_mean: float = 75.0,
    target_std: float = 15.0,
) -> Dict[int, Dict[int, float]]:
    """
    Apply Cross-Judge Z-Score normalization within an event scope.
    
    Parameters:
        judge_scores_map: Dict mapping judge_id -> {project_id: raw_weighted_score}
        target_mean: Standard baseline mean for normalized distribution (default 75.0)
        target_std: Standard baseline standard deviation for normalized distribution (default 15.0)

    Returns:
        Dict mapping judge_id -> {project_id: normalized_score}
        
    Mathematical Methodology:
        1. For each judge j, compute mean μ_j and sample standard deviation σ_j across all their evaluations.
        2. If σ_j <= 1e-6 (zero standard deviation or N <= 1):
           - Fallback: Return raw score directly (or clamp between 0 and 100).
        3. If σ_j > 1e-6:
           - Z-score: z_jp = (raw_score_jp - μ_j) / σ_j
           - Normalized score: S_norm = clamp(target_mean + z_jp * target_std, 0.0, 100.0)
    """
    normalized_results: Dict[int, Dict[int, float]] = {}

    for judge_id, project_scores in judge_scores_map.items():
        normalized_results[judge_id] = {}
        score_list = list(project_scores.values())
        mean_j, std_j = calculate_judge_statistics(score_list)

        for project_id, raw_score in project_scores.items():
            if std_j < 1e-6:
                # Deterministic zero-variance fallback: maintain raw score
                norm_score = max(0.0, min(100.0, raw_score))
            else:
                z_score = (raw_score - mean_j) / std_j
                norm_score = target_mean + (z_score * target_std)
                norm_score = max(0.0, min(100.0, norm_score))
            
            normalized_results[judge_id][project_id] = round(norm_score, 4)

    return normalized_results
