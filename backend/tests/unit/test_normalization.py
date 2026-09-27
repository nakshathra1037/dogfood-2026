import pytest
from app.judging.normalization import calculate_judge_statistics, normalize_judge_scores


def test_calculate_judge_statistics():
    scores = [70.0, 80.0, 90.0]
    mean, std = calculate_judge_statistics(scores)
    assert mean == 80.0
    assert round(std, 4) == 10.0


def test_zero_variance_fallback():
    # If all scores are identical, standard deviation is 0.0
    scores = [85.0, 85.0, 85.0]
    mean, std = calculate_judge_statistics(scores)
    assert mean == 85.0
    assert std == 0.0

    judge_map = {1: {101: 85.0, 102: 85.0, 103: 85.0}}
    norm_map = normalize_judge_scores(judge_map)
    # Should safely fallback to raw score without division by zero
    assert norm_map[1][101] == 85.0
    assert norm_map[1][102] == 85.0
    assert norm_map[1][103] == 85.0


def test_single_sample_fallback():
    # Only one project scored by this judge
    judge_map = {1: {101: 92.0}}
    norm_map = normalize_judge_scores(judge_map)
    assert norm_map[1][101] == 92.0


def test_cross_judge_z_score_normalization():
    # Judge 1 gives generous scores: 80, 90, 100 (mean 90, std 10)
    # Judge 2 gives harsh scores: 40, 50, 60 (mean 50, std 10)
    judge_map = {
        1: {101: 80.0, 102: 90.0, 103: 100.0},
        2: {101: 40.0, 102: 50.0, 103: 60.0},
    }

    norm_map = normalize_judge_scores(judge_map, target_mean=75.0, target_std=15.0)

    # For project 102: both judges gave their respective mean score (z=0)
    # Target mean is 75.0, so normalized score for project 102 from both judges should be 75.0!
    assert norm_map[1][102] == 75.0
    assert norm_map[2][102] == 75.0

    # For project 103: both gave +1 std dev above their mean (z=+1)
    # Target is 75 + 15 = 90.0
    assert norm_map[1][103] == 90.0
    assert norm_map[2][103] == 90.0

    # For project 101: both gave -1 std dev below their mean (z=-1)
    # Target is 75 - 15 = 60.0
    assert norm_map[1][101] == 60.0
    assert norm_map[2][101] == 60.0
