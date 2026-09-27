from sqlalchemy.ext.asyncio import AsyncSession
from app.services.result_service import ResultService
from app.utils.csv import generate_csv_stream


class ExportService:
    @staticmethod
    async def export_results_csv(db: AsyncSession, event_id: int) -> str:
        results_resp = await ResultService.calculate_event_results(db, event_id)
        
        headers = [
            "Rank",
            "Final Normalized Score",
            "Raw Average Score",
            "Project ID",
            "Project Name",
            "Team ID",
            "Team Name",
            "Track",
            "Evaluations Count",
            "Judges",
        ]
        
        rows = []
        for r in results_resp.results:
            judge_list = ", ".join([e.judge_name for e in r.evaluations]) if r.evaluations else "None"
            rows.append([
                r.rank,
                f"{r.final_score:.2f}",
                f"{r.raw_average_score:.2f}",
                r.project_id,
                r.project_name,
                r.team_id,
                r.team_name,
                r.track_name or "General",
                r.evaluation_count,
                judge_list,
            ])
            
        return generate_csv_stream(headers, rows)

    @staticmethod
    async def export_detailed_evaluations_csv(db: AsyncSession, event_id: int) -> str:
        results_resp = await ResultService.calculate_event_results(db, event_id)
        
        headers = [
            "Rank",
            "Project ID",
            "Project Name",
            "Team Name",
            "Judge ID",
            "Judge Name",
            "Criterion ID",
            "Criterion Name",
            "Weight (%)",
            "Max Score",
            "Raw Score",
            "Normalized (%)",
            "Weighted Score Contribution",
            "Judge Raw Total",
            "Judge Normalized Total",
        ]
        
        rows = []
        for r in results_resp.results:
            for eval_summary in r.evaluations:
                for crit in eval_summary.criteria_scores:
                    rows.append([
                        r.rank,
                        r.project_id,
                        r.project_name,
                        r.team_name,
                        eval_summary.judge_id,
                        eval_summary.judge_name,
                        crit.criterion_id,
                        crit.criterion_name,
                        f"{crit.weight:.1f}",
                        f"{crit.max_score:.1f}",
                        f"{crit.raw_score:.2f}",
                        f"{crit.normalized_percentage:.2f}",
                        f"{crit.weighted_score:.2f}",
                        f"{eval_summary.raw_weighted_score:.2f}",
                        f"{eval_summary.normalized_score:.2f}",
                    ])
                    
        return generate_csv_stream(headers, rows)
