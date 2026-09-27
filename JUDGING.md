# Judging System & Normalization Engine — DOGFOOD 2026

## 1. Overview
The judging system evaluates submitted hackathon projects across configured criteria, applies weighted scoring, performs statistical cross-judge Z-score normalization to eliminate harshness/leniency bias, and calculates deterministic rankings with explicit tie-breaking rules.

---

## 2. Evaluation Weighted Scoring

Each evaluation is evaluated against an active rubric where criterion weights sum to $100\%$:
$$\sum_{c=1}^{K} \text{weight}_c = 100.0$$

For a given judge $j$, project $p$, and criterion $c$:
- $\text{score}_{j,p,c} \in [0, \text{max\_score}_c]$
- $\text{percentage}_{j,p,c} = \frac{\text{score}_{j,p,c}}{\text{max\_score}_c} \times 100$
- Criterion weighted contribution:
  $$\text{weighted\_contrib}_{j,p,c} = \frac{\text{score}_{j,p,c}}{\text{max\_score}_c} \times \text{weight}_c$$

Total Raw Weighted Evaluation Score $S_{j, p} \in [0, 100]$:
$$S_{j, p} = \sum_{c=1}^{K} \text{weighted\_contrib}_{j,p,c}$$

---

## 3. Cross-Judge Normalization Algorithm

Judges vary in their personal grading scales (some give scores between 80–100, others between 40–70). Cross-judge normalization adjusts for individual bias.

### Population Scope
Normalization is strictly evaluated within the scope of a single event $e$ across all submitted evaluations by judge $j$.

### Methodology
1. **Judge Mean ($\mu_j$):**
   $$\mu_j = \frac{1}{N_j} \sum_{i=1}^{N_j} S_{j, i}$$
2. **Judge Sample Standard Deviation ($\sigma_j$):**
   $$\sigma_j = \sqrt{\frac{\sum_{i=1}^{N_j} (S_{j, i} - \mu_j)^2}{N_j - 1}} \quad (\text{for } N_j > 1)$$

3. **Deterministic Fallbacks (Preventing Division by Zero):**
   - If $\sigma_j \le 10^{-6}$ (all scores given by the judge are identical, variance = 0) OR sample size $N_j \le 1$:
     $$S^{\text{norm}}_{j, p} = \text{clamp}(S_{j, p}, 0.0, 100.0)$$
     *(The raw weighted score is preserved deterministically without artifacting)*.

4. **Z-Score Calculation (when $\sigma_j > 10^{-6}$):**
   $$z_{j, p} = \frac{S_{j, p} - \mu_j}{\sigma_j}$$

5. **Normalized Score Transformation (Target Mean = 75.0, Target Std = 15.0):**
   $$S^{\text{norm}}_{j, p} = \text{clamp}\left( 75.0 + (z_{j, p} \times 15.0), 0.0, 100.0 \right)$$

---

## 4. Multi-Judge Aggregation

For project $p$ evaluated by $M_p$ assigned judges:
- **Final Normalized Score:**
  $$\text{FinalScore}_p = \frac{1}{M_p} \sum_{j=1}^{M_p} S^{\text{norm}}_{j, p}$$
- **Raw Average Score:**
  $$\text{RawAverage}_p = \frac{1}{M_p} \sum_{j=1}^{M_p} S_{j, p}$$

---

## 5. Ranking & Deterministic Tie-Breaking

Projects are ranked according to a deterministic multi-tier sorting key:
1. $\text{FinalScore}_p$ (Descending)
2. $\text{RawAverage}_p$ (Descending)
3. Total Evaluation Count $M_p$ (Descending)
4. $\text{ProjectID}_p$ (Ascending deterministic fallback)

Ranks $1, 2, \dots, N$ are assigned sequentially following this hierarchy.
