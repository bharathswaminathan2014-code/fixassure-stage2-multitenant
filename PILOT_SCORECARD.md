# Pilot Evaluation Scorecard

These are proposed acceptance criteria, not industry benchmarks. Agree targets and methodology with the pilot customer before evaluation.

| Metric | Proposed target | Measurement |
|---|---:|---|
| Detection precision | >= 80% | Valid flagged findings / all flagged findings reviewed |
| Critical-gap recall | >= 90% | Reference critical gaps detected / all reference critical gaps |
| Evidence traceability | 100% | Material findings with accessible source references / all material findings |
| Unsupported causes stated as facts | 0 | Human-reviewed material AI claims |
| Manual analysis time saved | >= 30% | Relative reduction against measured manual baseline |
| Actionable findings | >= 70% | Reviewed findings accepted as actionable / findings reviewed |

## Evaluation method
1. Define the qualifying population and sample selection.
2. Have experienced practitioners label a reference set before examining model outputs where practical.
3. Run the platform in shadow mode; no writes to production.
4. Report counts, percentages, sample size and uncertainty.
5. Classify false positives, missed critical gaps, ambiguous records and data-quality limitations.
6. Review disagreements and update rules transparently.
7. Measure operational usefulness separately from model accuracy.

## Longer-term outcome metrics
- Repeat incidents per service and period
- Median age of unresolved problems
- Workaround duration
- Verified remediation rate
- Recurrence after claimed fixes
- Accepted actions and customer impact

Do not claim that a short pilot proves annual recurrence reduction. Long-term outcome claims require an adequate observation period and a defensible baseline.
