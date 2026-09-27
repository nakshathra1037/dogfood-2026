import pytest
from app.models.rubric_criterion import RubricCriterion
from app.models.evaluation_score import EvaluationScore
from app.judging.scoring import calculate_evaluation_weighted_score


def test_calculate_evaluation_weighted_score():
    c1 = RubricCriterion(id=1, name="Innovation", weight=30.0, max_score=10.0)
    c2 = RubricCriterion(id=2, name="Technical", weight=30.0, max_score=10.0)
    c3 = RubricCriterion(id=3, name="Impact", weight=20.0, max_score=10.0)
    c4 = RubricCriterion(id=4, name="Presentation", weight=20.0, max_score=10.0)

    criteria_map = {1: c1, 2: c2, 3: c3, 4: c4}

    scores = [
        EvaluationScore(criterion_id=1, score=10.0),  # (10/10)*30 = 30.0
        EvaluationScore(criterion_id=2, score=8.0),   # (8/10)*30 = 24.0
        EvaluationScore(criterion_id=3, score=5.0),   # (5/10)*20 = 10.0
        EvaluationScore(criterion_id=4, score=9.0),   # (9/10)*20 = 18.0
    ]

    total, breakdowns = calculate_evaluation_weighted_score(scores, criteria_map)

    # 30 + 24 + 10 + 18 = 82.0
    assert total == 82.0
    assert len(breakdowns) == 4
    assert breakdowns[0].weighted_score == 30.0
    assert breakdowns[1].weighted_score == 24.0
    assert breakdowns[2].weighted_score == 10.0
    assert breakdowns[3].weighted_score == 18.0


def test_score_clamping_to_max_score():
    c1 = RubricCriterion(id=1, name="Innovation", weight=100.0, max_score=10.0)
    criteria_map = {1: c1}

    # Score beyond max_score
    scores = [EvaluationScore(criterion_id=1, score=15.0)]
    total, breakdowns = calculate_evaluation_weighted_score(scores, criteria_map)
    assert total == 100.0
