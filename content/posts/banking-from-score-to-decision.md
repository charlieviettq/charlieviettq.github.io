---
title: "Từ con số đến quyết định: Khi dữ liệu bắt đầu 'nói chuyện' với tiền"
date: "2026-04-09"
excerpt: "Scorecard hay Boosting chỉ là khởi đầu. Khám phá cách những con số biến thành quyết định duyệt vay thực tế qua lớp Policy, Champion-Challenger, và hệ thống giám sát chặt chẽ."
category: banking
---

## VI

### Tóm lược

- Con số điểm (Score) không phải là tất cả. Chính **Policy (Chính sách)** và các ngưỡng (**Cutoff**) mới là thứ thực sự quyết định tiền của ngân hàng sẽ đi đâu.
- Thay đổi một con số ngưỡng (Cutoff) cũng quan trọng y như việc thay đổi cả một Model AI — hãy đánh số phiên bản và log `policy_version` song song với `model_version`.
- **Champion-Challenger** là framework để thử nghiệm policy mới an toàn: split 5% traffic cho Challenger, so sánh performance trước khi promote.
- Đừng chỉ nhìn vào AUC. Hãy theo dõi: phân phối score, tỷ lệ override, vintage bad rate theo cohort.

### Giới thiệu

**Disclaimer:** Bài viết này tập trung vào khía cạnh **kỹ thuật và quản trị (governance)** đằng sau quá trình từ điểm số tới quyết định. Không đưa ra ngưỡng cụ thể hay lời khuyên đầu tư cho bất kỳ dự án nào nhé.

Dành cho các bạn Data Scientist đang làm mô hình chấm điểm (Scorecard / Boosting): Bạn đã bao giờ cảm thấy hụt hẫng khi Model của mình đạt AUC cực cao nhưng khi triển khai thực tế, tỷ lệ duyệt vay lại không như ý? Đó là vì giữa Model và Quyết định còn một lớp màn mang tên **Policy**. Hãy cùng vén bức màn đó lên.

### Khái niệm cốt lõi: Cỗ máy ra quyết định

**1. Điểm số đầu ra (Score) và Calibration**

Model trả về xác suất nợ xấu (PD — Probability of Default) hoặc một điểm số đã được scaling. Vấn đề: raw output từ XGBoost thường không "well-calibrated" — tức là `predict_proba = 0.3` không có nghĩa là 30% khách hàng trong nhóm này thực sự sẽ nợ xấu.

Hai kỹ thuật calibration phổ biến:
- **Platt Scaling:** Fit một logistic regression trên top của model predictions
- **Isotonic Regression:** Non-parametric, tốt hơn khi calibration curve phức tạp

```python
from sklearn.calibration import CalibratedClassifierCV
from sklearn.isotonic import IsotonicRegression

# Platt scaling
calibrated = CalibratedClassifierCV(base_model, method='sigmoid', cv='prefit')
calibrated.fit(X_val, y_val)

# Check calibration: mean predicted PD vs actual default rate per bucket
buckets = pd.cut(calibrated.predict_proba(X_val)[:, 1], bins=10)
calib_check = pd.DataFrame({
    'predicted_pd': calibrated.predict_proba(X_val)[:, 1],
    'actual_default': y_val
}).groupby(buckets)['actual_default'].agg(['mean', 'count'])
```

**2. Lớp Chính sách (Policy Layer): Decision Matrix**

Score chỉ là đầu vào. Policy Layer mới là nơi ra quyết định thực sự, thường có dạng:

| Band | Score Range | Điều kiện bổ sung | Quyết định |
|------|-------------|-------------------|------------|
| A | > 700 | Income ≥ 10M | AUTO_APPROVE |
| B | 550-700 | Income ≥ 7M | AUTO_APPROVE |
| C | 400-549 | — | REFER (manual review) |
| D | < 400 | — | HARD_DECLINE |
| — | Any | Tuổi < 20 hoặc CIC blacklist | HARD_DECLINE |

Trong code, policy layer thường là một SQL rule engine hoặc decision table:

```sql
SELECT
  application_id,
  score,
  CASE
    -- Hard cutoff rules (override score)
    WHEN age < 20 OR cic_flag = 'BLACKLIST'        THEN 'HARD_DECLINE'
    WHEN score < 400                                THEN 'HARD_DECLINE'
    -- Score + income matrix
    WHEN score >= 700 AND monthly_income >= 10000000 THEN 'AUTO_APPROVE'
    WHEN score BETWEEN 550 AND 699
         AND monthly_income >= 7000000               THEN 'AUTO_APPROVE'
    WHEN score BETWEEN 400 AND 549                  THEN 'REFER'
    ELSE 'HARD_DECLINE'
  END AS decision,
  'v2.3.1'        AS policy_version,
  'xgb_ntb_v4'   AS model_version,
  CURRENT_TIMESTAMP AS decision_ts
FROM scoring_results
```

**3. Champion-Challenger (C/C): Thử nghiệm an toàn**

Thay vì deploy policy mới ngay lập tức cho toàn bộ traffic, C/C framework cho phép thử nghiệm song song:

- **Champion:** Policy hiện tại (95% traffic)
- **Challenger:** Policy mới muốn thử (5% traffic)

Sau 4-8 tuần (tùy loan cycle), so sánh: approval rate, expected loss, vintage bad rate của hai nhóm. Nếu Challenger tốt hơn → promote lên Champion.

```python
import random

def assign_variant(application_id: str, challenger_pct: float = 0.05) -> str:
    """Deterministic assignment based on application_id hash."""
    hash_val = int(hashlib.md5(application_id.encode()).hexdigest(), 16)
    return "CHALLENGER" if (hash_val % 100) < (challenger_pct * 100) else "CHAMPION"
```

**4. Giám sát thực địa (Monitoring)**

Khi hệ thống chạy, cần theo dõi 3 lớp:

| Tín hiệu | Metric | Alert threshold |
|----------|--------|-----------------|
| Population shift | PSI trên score distribution | > 0.20 |
| Approval rate | Tỷ lệ AUTO_APPROVE / tổng | ± 5% so với baseline |
| Override rate | % REFER được approve thủ công | > 15% |
| Vintage bad rate | Bad rate của cohort T-3M | > expected + 1.5σ |

### Chi tiết vận hành: Logging và Audit Trail

Trong mọi bảng quyết định, **không được chỉ lưu score**. Cần log đầy đủ để audit và học từ exceptions:

```python
# Decision log schema
decision_log = {
    "application_id": "APP_20260409_001",
    "customer_id": "CUST_123456",
    "model_version": "xgb_ntb_v4",
    "policy_version": "v2.3.1",
    "raw_score": 487,
    "calibrated_pd": 0.142,
    "decision": "REFER",
    "hard_decline_reason": None,
    "decision_ts": "2026-04-09T10:23:45Z",
    "experiment_variant": "CHAMPION",
}

# Override log (khi có manual review)
override_log = {
    "application_id": "APP_20260409_001",
    "original_decision": "REFER",
    "override_decision": "APPROVE",
    "override_reason_code": "RC_04",   # e.g., RC_04 = "Customer has government salary"
    "override_reason_text": "Verified government employee, salary slip attached",
    "reviewer_id": "RM_0045",
    "override_ts": "2026-04-09T14:10:00Z",
}
```

Override reason codes quan trọng vì chúng là tín hiệu để cải thiện model và policy ở iteration sau. Nếu RC_04 xuất hiện > 20% overrides, đó là hint để bổ sung `is_government_employee` vào policy matrix.

### Những rủi ro "chết người"

- **Thờ phụng AUC:** Mải mê tối ưu AUC trong lab mà quên mất các ngưỡng Cutoff đang drift tự do ngoài production.
- **Policy drift ngầm:** Ai đó thay đổi income threshold mà không update `policy_version` → mất khả năng audit.
- **Ghi đè tùy tiện:** Override không có reason code = mất dữ liệu học. Sau 6 tháng bạn không còn biết tại sao override rate tăng đột biến.
- **Champion-Challenger bias:** Quên kiểm tra xem assignment có truly random không — systematic bias trong hash function dẫn đến kết quả C/C vô nghĩa.

### Kết luận

Vận hành một hệ thống chấm điểm an toàn giống như lái một chiếc máy bay: Model là động cơ, Policy là hệ thống điều hướng, và Monitoring là bảng đồng hồ buồng lái. Champion-Challenger là wind tunnel để test cánh mới trước khi gắn lên máy bay thật. Thiếu bất kỳ thành phần nào, bạn đang bay mù.

---

## EN

### At a glance

- **Scores** are rarely the final word. **Policies**, **Thresholds**, and decision matrices decide where the bank's money actually flows.
- A Cutoff change is as impactful as a new model release — version it, log it, and audit it with the same rigor.
- **Champion-Challenger** lets you safely test a new policy on 5% of traffic before promoting it.
- Monitor beyond AUC: score distribution shift (PSI), override rate, and vintage bad rate by cohort.

### Introduction

**Disclaimer:** This article covers **technical governance** concepts — not prescriptive thresholds, business strategy, or legal advice.

For Data Scientists building scorecards: a high AUC is necessary, but not sufficient. The gap between model output and business outcome is filled by the **Policy Layer**. Understanding this layer separates engineers who build models from engineers who build risk systems.

### Core Concepts: The Decision Engine

**1. Score Calibration**

Raw model outputs (e.g., XGBoost `predict_proba`) are often not well-calibrated. A raw score of 0.3 does not guarantee that 30% of that population will actually default. Calibration bridges the gap between model probability and real-world default rates.

Common approaches:
- **Platt Scaling** (sigmoid): simple, works well when the model is roughly calibrated
- **Isotonic Regression**: non-parametric, better for complex miscalibration patterns

After calibration, run a reliability diagram: bucket predicted PD vs actual default rate per bucket. If they're on the diagonal, you're calibrated.

**2. Policy Layer: The Decision Matrix**

The Policy Layer translates score + business rules into three outcomes: **Auto-Approve**, **Refer** (manual review), or **Hard Decline**.

```sql
SELECT
  application_id,
  score,
  CASE
    WHEN age < 20 OR cic_flag = 'BLACKLIST'          THEN 'HARD_DECLINE'
    WHEN score < 400                                  THEN 'HARD_DECLINE'
    WHEN score >= 700 AND monthly_income >= 10000000  THEN 'AUTO_APPROVE'
    WHEN score BETWEEN 550 AND 699
         AND monthly_income >= 7000000                THEN 'AUTO_APPROVE'
    WHEN score BETWEEN 400 AND 549                    THEN 'REFER'
    ELSE 'HARD_DECLINE'
  END AS decision,
  'v2.3.1'      AS policy_version,
  'xgb_ntb_v4' AS model_version
FROM scoring_results
```

Key principle: **policy_version must be logged alongside model_version** on every decision record. When a bad debt spike appears 6 months later, you need to know whether to blame the model or the policy.

**3. Champion-Challenger Testing**

Deploying a new policy directly to 100% of traffic is how mistakes become disasters. Champion-Challenger (C/C) splits production traffic:

- **Champion** (95%): current policy
- **Challenger** (5%): candidate new policy

After one loan cycle (typically 4–8 weeks for short-term consumer credit), compare: approval rate, expected loss, early delinquency rate. If Challenger outperforms → promote to Champion.

Use a deterministic hash on `application_id` for assignment — this ensures the same customer always goes to the same variant, preventing contamination.

**4. Override Governance**

Manual overrides (human approving a REFER case) are gold mines for model improvement — but only if logged correctly:

```python
override_log = {
    "application_id": "APP_001",
    "original_decision": "REFER",
    "override_decision": "APPROVE",
    "reason_code": "RC_04",          # structured taxonomy
    "reason_text": "Government employee, salary verified",
    "reviewer_id": "RM_0045",
    "timestamp": "2026-04-09T14:10Z",
}
```

If reason code `RC_04` ("government employee") appears in >20% of overrides, that's a model signal: add `is_government_employee` to your feature set or policy matrix.

**5. Monitoring KPIs**

| Signal | Metric | Threshold |
|--------|--------|-----------|
| Population shift | PSI on score distribution | > 0.20 → major alert |
| Approval rate | Auto-approve / total | ± 5% vs baseline |
| Override rate | Manual approvals / REFER | > 15% → policy review |
| Vintage performance | Bad rate of T-3M cohort | > expected + 1.5σ |

### Pitfalls

- **AUC Worship:** Optimizing offline metrics while cutoffs drift silently in production.
- **Silent Policy Drift:** Threshold changes without version bumps make audit impossible.
- **Unstructured Overrides:** No reason codes = no learning signal from human judgment.
- **C/C Bias:** Non-random assignment contaminates experiment results.

### Takeaways

The credit decision engine is a system, not a model. **Model + Policy + Monitoring**, all version-controlled and auditable. Champion-Challenger is your wind tunnel — test new wings before flying. Without this trinity, you're flying blind.
