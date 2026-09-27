import pytest
from app.schemas.result import JudgeEvaluationSummary
from app.judging.ranking import rank_and_aggregate_results


def test_ranking_and_tie_breaking():
    project_data = {
        1: {"project_name": "Project Alpha", "team_id": 10, "team_name": "Team A"},
        2: {"project_name": "Project Beta", "team_id": 20, "team_name": "Team B"},
        3: {"project_name": "Project Gamma", "team_id": 30, "team_name": "Team C"},
    }

    eval_summaries = {
        1: [
            JudgeEvaluationSummary(judge_id=1, judge_name="J1", raw_weighted_score=90.0, normalized_score=90.0),
            JudgeEvaluationSummary(judge_id=2, judge_name="J2", raw_weighted_score=80.0, normalized_score=80.0),
        ],  # avg = 85.0
        2: [
            JudgeEvaluationSummary(judge_id=1, judge_name="J1", raw_weighted_score=95.0, normalized_score=95.0),
            JudgeEvaluationSummary(judge_id=2, judge_name="J2", raw_weighted_score=95.0, normalized_score=95.0),
        ],  # avg = 95.0
        3: [
            JudgeEvaluationSummary(judge_id=1, judge_name="J1", raw_weighted_score=70.0, normalized_score=70.0),
        ],  # avg = 70.0
    }

    norm_scores = {1: {1: 90.0, 2: 95.0, 3: 70.0}, 2: {1: 80.0, 2: 95.0}}
    raw_scores = {1: {1: 90.0, 2: 95.0, 3: 70.0}, 2: {1: 80.0, 2: 95.0}}

    ranked = rank_and_aggregate_results(project_data, norm_scores, raw_scores, eval_summaries)

    assert len(ranked) == 3
    assert ranked[0].project_id == 2
    assert ranked[0].rank == 1
    assert ranked[0].final_score == 95.0

    assert ranked[1].project_id == 1
    assert ranked[1].rank == 2
    assert ranked[1].final_score == 85.0

    assert ranked[2].project_id == 3
    assert ranked[2].rank == 3
    assert ranked[2].final_score == 70.0
