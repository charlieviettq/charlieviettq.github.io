---
title: "OOT và Stability: 'Phanh an toàn' của mô hình rủi ro"
date: "2026-04-01"
excerpt: "Đừng để mô hình của bạn 'đẹp trên giấy, gãy ngoài đời'. Tìm hiểu OOT window selection, công thức PSI, CSI, Calibration drift, và cách xây dựng Monitoring pipeline thực chiến."
category: data-science
---

## VI

### Tóm lược

- **OOT (Out-of-Time)** là bài thi "thực tế" nhất: cho model đoán data của tương lai mà nó chưa từng thấy lúc học. OOT window lý tưởng cho digital bank là **3-6 tháng** sau development window.
- **PSI (Population Stability Index)** đo độ lệch phân phối điểm số. Ngưỡng cụ thể: PSI < 0.10 = ổn định, 0.10-0.20 = cần theo dõi, > 0.20 = cảnh báo nghiêm trọng.
- **CSI (Characteristic Stability Index)** là PSI tính ở cấp độ feature — giúp chẩn đoán feature nào đang drift, không chỉ biết "model đang drift".
- Feature drift ≠ Concept drift: cách phân biệt và respond khác nhau hoàn toàn.

### Giới thiệu

Hãy tưởng tượng bạn vừa build một model chấm điểm đạt AUC 0.81 trên development data. Sau 6 tháng production, AUC livetracking chỉ còn 0.69. Điều gì đã xảy ra?

Có thể là: (1) tệp khách hàng thực tế khác với tệp train (population drift), (2) hành vi khách hàng thay đổi sau một sự kiện vĩ mô (concept drift), (3) có leakage trong training data tạo ra OOT inflated. Làm sao phân biệt? PSI, CSI, và OOT analysis là câu trả lời.

### OOT: Bài thi của tương lai

**Cách chia data đúng:**

Thay vì random split 80/20 (train/test), OOT dành riêng một khoảng thời gian sau cùng làm validation:

```
Development window:  [T-18M → T-3M]   → Train + In-Time Test
OOT window:          [T-3M  → T]       → Out-of-Time Test (3 tháng)
Buffer:              [T-1M  → T]       → Loại bỏ (tránh label contamination)
```

**Tại sao cần buffer 1 tháng?**

Với loan 30 ngày, khách hàng nộp đơn ngày T-15 nhưng chưa thể biết họ có nợ xấu vào ngày T không (outcome chưa mature). Dùng data này để test = label contamination.

**OOT window selection cho digital bank:**

- Sản phẩm vay ngắn hạn (< 3 tháng): OOT window = 3M
- Sản phẩm vay trung hạn (3-12 tháng): OOT window = 6M
- Digital bank với product changes nhanh: xem xét rolling OOT (mỗi quý re-evaluate)

**Gatekeeper rule:** Nếu OOT AUC < In-Time AUC - 0.03 → không deploy. Investigate leakage trước.

### PSI: Công thức và Ngưỡng

**Công thức PSI:**

```
PSI = Σ (Actual_i% - Expected_i%) × ln(Actual_i% / Expected_i%)

Trong đó:
- Expected_i% = % điểm số nằm trong bin i tại thời điểm development
- Actual_i%   = % điểm số nằm trong bin i tại thời điểm production/OOT
```

**Ngưỡng chuẩn:**

| PSI | Ý nghĩa | Hành động |
|-----|---------|-----------|
| < 0.10 | Ổn định | Tiếp tục theo dõi bình thường |
| 0.10 – 0.20 | Thay đổi nhỏ | Điều tra nguyên nhân, tăng tần suất monitor |
| > 0.20 | Thay đổi lớn | Alert ngay, họp DS + Risk, xem xét retrain |

```python
import numpy as np
import pandas as pd

def calc_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    """
    Calculate PSI between expected (dev) and actual (prod) score distributions.
    Both arrays should be raw scores or probabilities in [0, 1].
    """
    # Build breakpoints from expected distribution
    breakpoints = np.percentile(expected, np.linspace(0, 100, bins + 1))
    breakpoints = np.unique(breakpoints)  # handle duplicates

    exp_counts = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    act_counts = np.histogram(actual, bins=breakpoints)[0] / len(actual)

    # Avoid log(0) with small epsilon
    exp_counts = np.where(exp_counts == 0, 1e-4, exp_counts)
    act_counts = np.where(act_counts == 0, 1e-4, act_counts)

    psi = np.sum((act_counts - exp_counts) * np.log(act_counts / exp_counts))
    return round(psi, 4)

# Usage
psi_val = calc_psi(dev_scores, prod_scores)
print(f"PSI = {psi_val} → {'STABLE' if psi_val < 0.1 else 'MONITOR' if psi_val < 0.2 else 'ALERT'}")
```

### CSI: Chẩn đoán Feature-Level Drift

PSI cho biết "model đang drift", nhưng không nói feature nào gây ra. CSI (Characteristic Stability Index) = PSI tính cho từng feature:

```python
def calc_csi_report(dev_df: pd.DataFrame, prod_df: pd.DataFrame,
                    features: list, bins: int = 10) -> pd.DataFrame:
    """Calculate CSI for each feature and return summary report."""
    results = []
    for feat in features:
        csi = calc_psi(dev_df[feat].dropna(), prod_df[feat].dropna(), bins)
        results.append({
            "feature": feat,
            "csi": csi,
            "status": "STABLE" if csi < 0.1 else "MONITOR" if csi < 0.2 else "DRIFT"
        })
    return pd.DataFrame(results).sort_values("csi", ascending=False)
```

Kết quả CSI report cho phép triage: feature `avg_balance_6m` có CSI = 0.35 nhưng `app_session_count_7d` chỉ 0.05 → drift đến từ ETB behavioral features, không phải app usage.

### Feature Drift vs Concept Drift

Đây là phân biệt quan trọng nhất khi respond to monitoring alerts:

| | Feature Drift (PSI cao) | Concept Drift (OOT AUC giảm) |
|--|------------------------|------------------------------|
| Triệu chứng | PSI > 0.20, CSI report chỉ ra feature cụ thể | AUC livetracking giảm, PSI bình thường |
| Nguyên nhân | Tệp khách hàng thay đổi (kênh mới, product thay đổi) | Mối quan hệ input-output thay đổi (kinh tế vĩ mô) |
| Respond | Investigate kênh mới, có thể cần rebinning | Retrain với data mới, feature engineering mới |
| Urgency | Medium (tùy mức PSI) | High (ảnh hưởng trực tiếp đến decision quality) |

### Calibration Check

Sau khi deploy model mới, cần verify calibration không drift theo thời gian:

```sql
-- Expected PD vs Actual default rate by month (BigQuery)
SELECT
  DATE_TRUNC(decision_date, MONTH) AS month,
  ROUND(AVG(predicted_pd), 4)      AS avg_predicted_pd,
  ROUND(AVG(actual_default), 4)    AS actual_default_rate,
  COUNT(*)                          AS loan_count
FROM model_predictions p
LEFT JOIN loan_outcomes o USING (application_id)
GROUP BY 1
ORDER BY 1
```

Nếu `avg_predicted_pd` ngày càng thấp hơn `actual_default_rate` → model đang underestimating risk → cần recalibration hoặc retrain.

### Monitoring Pipeline: Từ Alert đến Action

Một Airflow DAG điển hình cho weekly model monitoring:

```
weekly_model_monitor_dag
├── compute_psi              # So sánh score dist với dev baseline
├── compute_csi_report       # PSI per feature
├── check_approval_rate      # Detect policy drift
├── check_calibration        # Expected PD vs actual DR
├── evaluate_oot_rolling     # Rolling OOT AUC (last 4 weeks)
└── send_alert               # Slack/PagerDuty nếu bất kỳ metric nào vượt ngưỡng
```

**Playbook khi alert:**

| Alert | Bước tiếp theo |
|-------|---------------|
| PSI > 0.20 | 1. CSI report → tìm feature gốc; 2. Check kênh marketing mới; 3. Họp DS + Risk trong 24h |
| OOT AUC drop > 0.03 | 1. Check leakage trong dev data; 2. Retrain với data window gần nhất; 3. C/C testing |
| Calibration drift > 1.5σ | 1. Platt scaling recalibration; 2. Notify Risk team về limit adjustment |

**Playbook mẫu khi PSI > 0.25:**

```
Bước 1: Feature-level PSI
  → Tính PSI cho từng feature riêng lẻ
  → Xác định biến nào thay đổi nhiều nhất

Bước 2: Kiểm tra nguyên nhân
  → Có campaign marketing mới không?
  → Có thay đổi policy trong period đó không?
  → Có seasonal effect (Tết, mùa mưa) không?

Bước 3: Đánh giá impact
  → Chạy OOT trên 3 tháng gần nhất
  → Nếu OOT Gini giảm > 5pt → escalate
  → Nếu OOT Gini ổn định → document và monitor

Bước 4: Quyết định
  → Gini ổn + nguyên nhân rõ ràng → document, tiếp tục monitor
  → Gini giảm + nguyên nhân không rõ → trigger model review
```

:::note[Lưu ý quan trọng]
PSI cao ≠ model kém. PSI đo **population shift**, không đo model performance. Một model hoàn hảo vẫn có PSI cao nếu khách hàng thay đổi. Luôn pair PSI với Gini/KS để có bức tranh đầy đủ.
:::

### Code thực tế: Tính PSI với Python

```python
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score
from scipy.stats import ks_2samp

def calc_psi(expected: pd.Series, actual: pd.Series, n_bins: int = 10) -> float:
    """
    PSI theo chuẩn ngành.
    expected = score distribution lúc training (baseline).
    actual   = score distribution hiện tại (monitoring window).
    """
    # Tính breakpoints từ expected — KHÔNG dùng actual để tránh look-ahead bias
    breakpoints = np.nanpercentile(expected, np.linspace(0, 100, n_bins + 1))
    breakpoints = np.unique(breakpoints)

    exp_counts, _ = np.histogram(expected, bins=breakpoints)
    act_counts, _ = np.histogram(actual,   bins=breakpoints)

    # Thay 0 bằng epsilon nhỏ để tránh log(0)
    exp_pct = np.where(exp_counts == 0, 1e-4, exp_counts / len(expected))
    act_pct = np.where(act_counts == 0, 1e-4, act_counts / len(actual))

    psi = float(np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct)))
    return psi

def calc_gini(y_true, y_score) -> float:
    return 2 * roc_auc_score(y_true, y_score) - 1

def calc_ks(y_true, y_score) -> float:
    bads  = y_score[y_true == 1]
    goods = y_score[y_true == 0]
    ks_stat, _ = ks_2samp(bads, goods)
    return ks_stat

# --- Ví dụ sử dụng trong monitoring pipeline ---
# train_scores: Series — score của population lúc training
# live_scores:  Series — score của applicants tuần này
# y_true, y_pred: arrays với outcome đã materialise (approved customers only)

psi   = calc_psi(train_scores, live_scores, n_bins=10)
gini  = calc_gini(y_true, y_pred)
ks    = calc_ks(y_true, y_pred)

print(f"PSI  : {psi:.4f}  {'✅ Stable' if psi < 0.10 else '⚠️ Investigate' if psi < 0.25 else '🔴 Retrain'}")
print(f"Gini : {gini:.3f}")
print(f"KS   : {ks:.3f}")

# --- Feature-level PSI khi score PSI cao ---
feature_psi = {
    col: calc_psi(train_df[col].dropna(), live_df[col].dropna())
    for col in model_features
}
top_drifters = sorted(feature_psi.items(), key=lambda x: -x[1])[:5]
print("Top drifting features:", top_drifters)
```

### Những rủi ro thường trực

- **Leakage trong OOT:** Nếu buffer window không đủ, OOT AUC sẽ inflated — cho bạn sự tự tin giả.
- **Alert fatigue:** Monitor quá nhiều metrics với threshold quá nhạy → team bị "lờn thuốc". Tốt hơn là 3 metrics quan trọng với ngưỡng rõ ràng.
- **Static baseline:** Đừng dùng dev distribution làm PSI baseline mãi mãi. Sau 6-12 tháng, cần rebenchmark baseline với data gần hơn.

### Kết luận

OOT và PSI là "bộ đôi kiểm toán" của mọi risk model. Nhưng giá trị thực sự không nằm ở việc tính được công thức — mà ở việc có một Playbook rõ ràng: khi PSI vượt ngưỡng, team biết làm gì trong vòng 24 giờ tiếp theo. Đó mới là sự khác biệt giữa model monitoring và model governance.

---

## EN

### At a glance

- **OOT (Out-of-Time):** Reserve the most recent time window as a held-out test set. For digital banks, an OOT window of **3–6 months** is standard, with a 1-month buffer to avoid label contamination.
- **PSI thresholds:** < 0.10 = stable | 0.10–0.20 = monitor | > 0.20 = major alert.
- **CSI (Characteristic Stability Index)** = PSI computed per feature — tells you *which* feature is drifting, not just that the model is drifting.
- Feature drift vs. Concept drift: different root causes, different responses.

### Introduction

You ship a model with AUC 0.81 on development data. Six months later, live AUC is 0.69. What happened?

Three candidates: (1) the incoming population shifted (population drift), (2) the relationship between features and outcomes changed (concept drift), (3) there was leakage in the training data that inflated dev/OOT metrics. PSI, CSI, and proper OOT design help you tell these apart.

### OOT: Designing the Time-Based Split

Standard random 80/20 splits are insufficient for time-series credit data. The correct structure:

```
Development window:  [T-18M → T-3M]  → Train + In-Time validation
OOT window:          [T-3M  → T]     → Out-of-Time test (3 months)
Buffer:              [T-1M  → T]     → Excluded (outcome not yet mature)
```

The 1-month buffer prevents **label contamination**: loans originated near the observation cutoff haven't had enough time to manifest defaults, so their labels are unreliable.

**Gatekeeper rule:** If OOT AUC < In-Time AUC − 0.03, don't deploy. Investigate leakage first.

### PSI: Formula and Thresholds

```
PSI = Σ (Actual_i% − Expected_i%) × ln(Actual_i% / Expected_i%)

Where:
  Expected_i% = % of scores in bin i at development time
  Actual_i%   = % of scores in bin i at production/OOT time
```

```python
def calc_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    breakpoints = np.unique(np.percentile(expected, np.linspace(0, 100, bins + 1)))
    exp_counts = np.histogram(expected, bins=breakpoints)[0] / len(expected)
    act_counts = np.histogram(actual, bins=breakpoints)[0] / len(actual)
    exp_counts = np.where(exp_counts == 0, 1e-4, exp_counts)
    act_counts = np.where(act_counts == 0, 1e-4, act_counts)
    return round(np.sum((act_counts - exp_counts) * np.log(act_counts / exp_counts)), 4)
```

### CSI: Feature-Level Drift Diagnosis

PSI tells you the model is drifting. CSI tells you which feature is the cause.

```python
def calc_csi_report(dev_df, prod_df, features, bins=10):
    results = []
    for feat in features:
        csi = calc_psi(dev_df[feat].dropna().values,
                       prod_df[feat].dropna().values, bins)
        results.append({"feature": feat, "csi": csi,
                        "status": "STABLE" if csi < 0.1 else
                                  "MONITOR" if csi < 0.2 else "DRIFT"})
    return pd.DataFrame(results).sort_values("csi", ascending=False)
```

If `avg_balance_6m` has CSI = 0.35 but `app_session_count_7d` has CSI = 0.05, the drift originates from ETB behavioral features — a product or policy change worth investigating.

### Feature Drift vs. Concept Drift

| | Feature Drift (high PSI) | Concept Drift (AUC decay) |
|--|--------------------------|---------------------------|
| Symptom | PSI > 0.20; CSI points to specific features | Live AUC drops; PSI normal |
| Root cause | Population mix changed (new channel, product change) | Input-output relationship changed (macro event) |
| Response | Investigate new channels; possible rebinning | Retrain with recent data; new feature engineering |
| Urgency | Medium | High |

### Monitoring Pipeline

A minimal Airflow DAG for weekly model monitoring:

```
weekly_model_monitor_dag
├── compute_psi            # Score dist vs dev baseline
├── compute_csi_report     # PSI per feature
├── check_approval_rate    # Detect policy drift
├── check_calibration      # Expected PD vs actual default rate
└── send_alert             # Slack/PagerDuty if any threshold breached
```

**Response playbook:**

| Alert | Response |
|-------|----------|
| PSI > 0.20 | CSI report → root-cause feature; check new acquisition channels; DS + Risk sync within 24h |
| OOT AUC drop > 0.03 | Check leakage in dev data; retrain on recent window; run C/C |
| Calibration drift > 1.5σ | Platt scaling recalibration; notify Risk for limit review |

### Pitfalls

- **Insufficient buffer:** Leads to label contamination and inflated OOT AUC — false confidence.
- **Alert fatigue:** Too many metrics with over-sensitive thresholds → team starts ignoring alerts. Three well-chosen metrics beat thirty noisy ones.
- **Stale baseline:** Don't use the dev distribution as the PSI baseline indefinitely. Rebenchmark every 6–12 months.

### PSI Thresholds — Industry Standard

| PSI | Signal | Action |
|---|---|---|
| < 0.10 | ✅ Stable | Routine monitoring |
| 0.10 – 0.25 | ⚠️ Investigate | Find root cause before acting |
| > 0.25 | 🔴 Significant shift | Model review, consider retraining |

### Model Degradation vs Population Shift — A Critical Distinction

When PSI spikes, two very different things could be happening:

**Population shift (PSI's job to detect):** The applicant mix changed — new channel, seasonal effect, marketing campaign. The model may still be perfectly valid for the *original* population. The right response is to understand the shift, not immediately retrain.

**Model degradation (Gini/KS's job to detect):** The model's discriminatory power on *any* population has declined — features lost predictive power, the economic environment changed fundamentally. The right response is model review and potential retraining.

Always diagnose which one you're facing before deciding on action.

### Sample Playbook When PSI > 0.25

```
Step 1: Feature-level PSI
  → Calculate PSI for each feature individually
  → Identify which variables are driving the shift

Step 2: Investigate root cause
  → Any new marketing campaigns or channels?
  → Any policy changes during the period?
  → Seasonal effects (holidays, economic events)?

Step 3: Assess model performance impact
  → Run OOT on the most recent 3 months
  → If OOT Gini drops > 5pt → escalate to model review
  → If OOT Gini holds → document cause and continue monitoring

Step 4: Decision
  → Gini stable + clear cause identified → document, continue monitoring
  → Gini declining + unclear cause → trigger formal model review
```

### Code Reference — PSI, Gini, KS in Python

```python
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score
from scipy.stats import ks_2samp

def calc_psi(expected: pd.Series, actual: pd.Series, n_bins: int = 10) -> float:
    """
    Population Stability Index — industry standard implementation.
    Breakpoints are derived from `expected` only (training baseline).
    Never use actual distribution to set breakpoints — that's look-ahead bias.
    """
    breakpoints = np.nanpercentile(expected, np.linspace(0, 100, n_bins + 1))
    breakpoints = np.unique(breakpoints)

    exp_counts, _ = np.histogram(expected, bins=breakpoints)
    act_counts, _ = np.histogram(actual,   bins=breakpoints)

    exp_pct = np.where(exp_counts == 0, 1e-4, exp_counts / len(expected))
    act_pct = np.where(act_counts == 0, 1e-4, act_counts / len(actual))

    return float(np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct)))

# Gini and KS
gini = 2 * roc_auc_score(y_true, y_score) - 1
ks, _ = ks_2samp(y_score[y_true == 1], y_score[y_true == 0])

# Weekly monitoring report
psi = calc_psi(train_scores, live_scores)
status = "✅ Stable" if psi < 0.10 else ("⚠️ Investigate" if psi < 0.25 else "🔴 Review")
print(f"PSI={psi:.4f} ({status})  Gini={gini:.3f}  KS={ks:.3f}")

# When PSI > 0.25 — drill down to feature level
feature_psi = {
    col: calc_psi(train_df[col].dropna(), live_df[col].dropna())
    for col in model_features
}
top_drifters = sorted(feature_psi, key=lambda c: -feature_psi[c])[:5]
print("Top drifting features:", [(c, round(feature_psi[c], 4)) for c in top_drifters])
```

### Takeaways

OOT and PSI are the audit layer of every risk model. Their real value isn't in computing the formula — it's in having a clear Playbook: when PSI crosses the threshold, the team knows exactly what to do in the next 24 hours. That's the difference between model monitoring and model governance.

The most important discipline: distinguish between "the model got worse" and "the customers changed." PSI tells you the latter. Gini and KS tell you the former. You need both signals before making any decision about retraining.

---

**References**
- ECB (July 2025). *Revised Guide to Internal Models — Chapter 9: Machine Learning Models*. ECB Banking Supervision. [bankingsupervision.europa.eu](https://www.bankingsupervision.europa.eu/ecb/pub/pdf/ssm.supervisory_guide202507.en.pdf) — Formally requires auditability infrastructure (versioning, logging, replication) and at least annual assessment of explainability tools for ML models.
- FSB (October 2025). *Monitoring Adoption of Artificial Intelligence and Related Vulnerabilities in the Financial Sector*. Financial Stability Board. [fsb.org](https://www.fsb.org/2025/10/monitoring-adoption-of-artificial-intelligence-and-related-vulnerabilities-in-the-financial-sector/) — Identifies model risk and data quality as key AI vulnerabilities; recommends enhanced monitoring frameworks.
- Gonçalves, P., et al. (2024). Evolving Strategies in Machine Learning: A Systematic Review of Concept Drift Detection. *Information*, 15(12), 786. MDPI. [mdpi.com](https://www.mdpi.com/2078-2489/15/12/786) — PRISMA-based review of concept drift detection methodologies; provides theoretical grounding for why PSI alone is insufficient.
- `scipy.stats.ks_2samp`: [docs.scipy.org](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ks_2samp.html)
- `sklearn.metrics.roc_auc_score`: [scikit-learn.org](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html)
