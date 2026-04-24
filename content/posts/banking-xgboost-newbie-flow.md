---
title: "XGBoost cho newbie: 1 input đi qua tree như thế nào?"
date: "2026-04-17"
excerpt: "Giải thích XGBoost theo kiểu 'UI step-by-step': một hồ sơ khách hàng đi qua node (Yes/No/Missing), rơi vào leaf, rồi được cộng dồn qua nhiều cây để ra score/probability."
category: banking
---

## VI

### Tóm lược

- XGBoost (gbtree) dự đoán bằng cách **cho input đi qua nhiều cây**; mỗi cây trả về một **leaf_value** rồi **cộng dồn**.
- Với `binary:logistic`, thứ bạn tự cộng ra thường là **score/margin**; muốn ra **probability** thì qua sigmoid.
- Trong credit scoring, **ML score ≠ quyết định**: policy/cutoff mới là “tay lái”.

### Hình minh hoạ (mở bằng trình duyệt)

- Sơ đồ HTML/SVG: `/diagrams/xgboost_flow.html`

:::tip[Tip]
Nếu bạn muốn “nhìn như một UI”, hãy mở link trên ở tab riêng rồi kéo qua lại theo flow từ trái sang phải: Input → Tree → Accumulate → Sigmoid → Output.
:::

### 1) Input là gì?

Trong credit scoring, 1 input thường là **một khách hàng tại thời điểm ra quyết định** (point-in-time). Sau khi dựng feature, bạn có vector:

\[
x = [x_0, x_1, ..., x_{d-1}]
\]

Trong dump của cây, bạn sẽ thấy dạng `f27 < 0.1424` — nghĩa là model đang check “feature #27 có < 0.1424 không?”.

### 2) Một cây (decision tree) xử lý 1 input như thế nào?

Một cây là một chuỗi câu hỏi dạng:

```text
if x[j] is missing: go Missing
else if x[j] < split: go Yes
else: go No
```

Bạn bắt đầu ở **root node**, rẽ nhánh cho tới khi rơi vào **leaf**. Leaf trả về một số thực:

\[
tree_i(x) \rightarrow leaf\_value
\]

Điểm quan trọng: leaf_value **không phải** 0/1. Nó là “một phần đóng góp” để cộng dồn.

> Tham khảo (chính thống): ý nghĩa `Split`, `Yes`, `No`, `Missing` khi parse dump.  
> `https://xgboost.readthedocs.io/en/latest/r_docs/R-package/docs/reference/xgb.model.dt.tree.html`

### 3) XGBoost: nhiều cây cộng dồn → ra score (margin)

Giả sử model có \(n\) cây:

\[
score(x)=base\_score+\sum_{i=1}^{n} tree_i(x)
\]

Diễn giải như code:
- `score = base_score`
- for mỗi tree i: `score += tree_i(x)`

### 4) Score vs Probability (chỗ newbie hay đặt sai threshold)

Với logistic, thường bạn cần:

\[
prob(x)=\sigma(score)=\frac{1}{1+e^{-score}}
\]

Vậy:
- Threshold trên probability: `prob > 0.5`
- Tương đương threshold trên margin: `score > 0` (vì sigmoid(0)=0.5)

> Tham khảo (chính thống): `output_margin` để tránh transformation (lấy raw margin).  
> `https://xgboost.readthedocs.io/en/stable/prediction.html`

### 5) “Bỏ 1 cây” ảnh hưởng gì?

Vì score là tổng:

\[
score'(x)=score(x)-tree_k(x)
\]

Nên bỏ cây \(k\) sẽ làm score đổi đúng bằng phần đóng góp của cây đó.

Để demo “đúng bài”, XGBoost có `iteration_range` (model slicing) và ví dụ chính thống về việc cộng dồn prediction theo từng cây.

> `https://xgboost.readthedocs.io/en/latest/python/examples/individual_trees.html`

### 5b) Code thực tế: Xem từng cây đóng góp ra sao

```python
import xgboost as xgb
import numpy as np

# Train một model đơn giản để minh hoạ
model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=4,
    objective='binary:logistic',
    random_state=42
)
model.fit(X_train, y_train)

# --- Cách 1: Lấy raw margin (log-odds) — KHÔNG qua sigmoid ---
# output_margin=True trả về score trước sigmoid; đây là thứ bạn cộng dồn từng cây
margins = model.get_booster().predict(xgb.DMatrix(X_test), output_margin=True)

# Chuyển sang probability thủ công
probs_manual = 1 / (1 + np.exp(-margins))
# So sánh với predict_proba — phải giống hệt
probs_api = model.predict_proba(X_test)[:, 1]
assert np.allclose(probs_manual, probs_api, atol=1e-5), “Should be identical”

# --- Cách 2: Cộng dồn từng cây — minh hoạ “boosting = cộng dồn” ---
booster = model.get_booster()

# Dùng iteration_range để lấy margin sau k cây đầu tiên
margins_10  = booster.predict(xgb.DMatrix(X_test), output_margin=True,
                               iteration_range=(0, 10))
margins_50  = booster.predict(xgb.DMatrix(X_test), output_margin=True,
                               iteration_range=(0, 50))
margins_100 = booster.predict(xgb.DMatrix(X_test), output_margin=True,
                               iteration_range=(0, 100))

# Xem score của 1 applicant tiến hoá theo số cây
print(f”After  10 trees: margin={margins_10[0]:.4f}  → prob={1/(1+np.exp(-margins_10[0])):.3f}”)
print(f”After  50 trees: margin={margins_50[0]:.4f}  → prob={1/(1+np.exp(-margins_50[0])):.3f}”)
print(f”After 100 trees: margin={margins_100[0]:.4f} → prob={1/(1+np.exp(-margins_100[0])):.3f}”)
# Score hội tụ dần — đây là bản chất của “boosting = correction”

# --- Cách 3: Set threshold đúng cách cho credit ---
# KHÔNG dùng 0.5 làm default — chọn dựa trên approval rate target
sorted_probs = np.sort(probs_api)
target_approval_rate = 0.70  # muốn approve 70% applicants
cutoff = np.percentile(probs_api, (1 - target_approval_rate) * 100)
print(f”Cutoff for {target_approval_rate:.0%} approval rate: {cutoff:.4f}”)
# Cutoff này có thể là 0.12, không phải 0.5
```

### 6) Credit scoring note: ML score ≠ policy decision

Trong thực tế:
- **Model** cho ra `prob/score` (PD estimate hoặc ranking)
- **Policy** (cutoff + rules) quyết định approve/reject/limit

Đừng nhầm “`prob > 0.5` là approve” — cutoff thường được chọn theo trade-off (approval rate, bad rate, expected loss, exposure…).

---

## EN

### At a Glance

- XGBoost predicts by sending one input through **many trees**; each tree outputs a **leaf value**; the booster **accumulates them** into a score.
- For `binary:logistic`, that accumulated score is a **log-odds margin** — apply sigmoid to get probability.
- In credit scoring, **the model score is not the decision**: a policy layer (cutoffs, business rules) makes the final call.

---

### How One Input Travels Through XGBoost

Think of XGBoost as a committee of simple decision-makers. Each member (tree) looks at the same applicant and writes down a number. The final answer is the sum of all those numbers — not a vote, an addition.

**Step 1 — Input vector.** At prediction time, one applicant becomes a row of numbers: `income = 8,000,000`, `age = 32`, `days_past_due_6m = 0`, `employment_months = 14`, ...

This vector is passed — simultaneously and identically — to every tree in the ensemble.

**Step 2 — Traversing a single tree.** Each tree is a series of binary splits:

```
Is income ≤ 6,500,000?
  YES → Is days_past_due_6m > 0?
          YES → leaf_value = −0.18   (higher risk)
          NO  → leaf_value = −0.03
  NO  → Is employment_months ≤ 6?
          YES → leaf_value = +0.04
          NO  → leaf_value = +0.12   (lower risk)
```

Every input lands in exactly one leaf per tree. That leaf has a pre-learned `leaf_value`.

**Step 3 — Accumulation across all trees.**

```
final_score = base_score + leaf_value(tree_1) + leaf_value(tree_2) + ... + leaf_value(tree_N)
```

With 100 trees and a `base_score` of 0.5, the score is the sum of 100 small leaf values plus the base. Each tree corrects the residual error left by the previous trees — that's what "boosting" means.

**Step 4 — Score to probability (for binary:logistic).**

The accumulated score is a **log-odds value** (margin), not a probability. To convert:

```
probability = 1 / (1 + e^(−score))
```

A score of 0 → 50% probability. Score of +2 → ~88%. Score of −2 → ~12%.

**Step 5 — Probability is not the decision.**

The probability tells you the model's estimate of default risk. The business then applies:
- A **cutoff** (e.g., approve if probability < 0.15)
- **Hard rules** (e.g., never approve if any DPD90 in past 12 months)
- **Policy overrides** (e.g., VIP customers get manual review)

`predict_proba(X) < 0.15` is not a credit policy. It's an input to one.

---

### When Banks Use XGBoost vs Scorecards

XGBoost and scorecards are not competitors — they serve different roles in a credit operation:

| Use case | Preferred model | Why |
|---|---|---|
| Regulated final approve/decline | **Scorecard** | Must explain each decision; adverse action notice requirement |
| Pre-screening, risk tiering | **XGBoost** | Higher AUC; don't need per-decision explainability |
| Fraud detection | **XGBoost + rules** | Speed and pattern complexity matter more than interpretability |
| Portfolio analytics, pricing | Either | No regulatory requirement on the model form |

A common production setup: XGBoost filters the top 80% of applicants into a fast-approval lane; the remaining 20% goes through a scorecard that can produce a written explanation for each case.

---

### The Threshold Trap

One of the most common mistakes when deploying XGBoost in credit:

> "We approve if `predict_proba > 0.5`."

This is almost never right. The model's default 0.5 threshold was not calibrated to your portfolio's bad rate target. If your portfolio has a 5% bad rate, the "neutral" probability isn't 50% — it's somewhere much lower.

Cutoff setting requires a trade-off analysis:
- What approval rate does the business need?
- What bad rate is acceptable at that approval rate?
- What's the expected loss per approved account?

Set the cutoff on **business logic applied to a sorted score distribution**, not on the model's raw probability threshold.

---

### Key Takeaways

- XGBoost sums leaf values across all trees — each tree corrects the residual error of the previous one.
- The output for `binary:logistic` is a log-odds margin; sigmoid converts it to probability.
- Score ≠ probability ≠ decision. Each conversion step involves a separate design choice.
- In credit, XGBoost is most powerful as a pre-screener or risk-tiering tool — not as the sole, directly explainable decision engine.

### Code Reference — XGBoost Prediction Internals

```python
import xgboost as xgb
import numpy as np

model = xgb.XGBClassifier(n_estimators=100, max_depth=4,
                           objective='binary:logistic', random_state=42)
model.fit(X_train, y_train)
booster = model.get_booster()

# Raw margin (log-odds sum across all trees) — the number you're accumulating
margins = booster.predict(xgb.DMatrix(X_test), output_margin=True)
probs   = 1 / (1 + np.exp(-margins))   # sigmoid → probability
# Identical to: model.predict_proba(X_test)[:, 1]

# Watch the score converge tree-by-tree
for k in [1, 10, 30, 50, 100]:
    m = booster.predict(xgb.DMatrix(X_test[:1]),
                        output_margin=True, iteration_range=(0, k))[0]
    print(f"After {k:3d} trees: margin={m:+.4f}  prob={1/(1+np.exp(-m)):.3f}")

# Credit-appropriate threshold — never use default 0.5
target_approval = 0.70
cutoff = np.percentile(probs, (1 - target_approval) * 100)
print(f"Cutoff for {target_approval:.0%} approval rate: prob < {cutoff:.4f}")
```

**References:**
- XGBoost Prediction API (`output_margin`, `iteration_range`): [xgboost.readthedocs.io/en/stable/prediction.html](https://xgboost.readthedocs.io/en/stable/prediction.html)
- Individual tree accumulation example: [xgboost.readthedocs.io/en/latest/python/examples/individual_trees.html](https://xgboost.readthedocs.io/en/latest/python/examples/individual_trees.html)
- Chen, T. & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. *Proceedings of KDD 2016*. [doi:10.1145/2939672.2939785](https://doi.org/10.1145/2939672.2939785) — Original paper; Section 2 explains the additive model formulation (tree accumulation) formally.
- `sklearn.metrics.roc_auc_score` for threshold analysis: [scikit-learn.org](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html)

