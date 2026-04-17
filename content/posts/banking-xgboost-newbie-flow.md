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

### 6) Credit scoring note: ML score ≠ policy decision

Trong thực tế:
- **Model** cho ra `prob/score` (PD estimate hoặc ranking)
- **Policy** (cutoff + rules) quyết định approve/reject/limit

Đừng nhầm “`prob > 0.5` là approve” — cutoff thường được chọn theo trade-off (approval rate, bad rate, expected loss, exposure…).

---

## EN

### At a glance

- XGBoost predicts by sending one input through **many trees**; each tree outputs a **leaf value**; the booster **adds them up**.
- For `binary:logistic`, the accumulated value is usually the **margin/score**; apply sigmoid to obtain **probability**.
- In credit scoring, **model output is not the final decision**: policy/cutoffs drive approvals.

### Diagram (open in browser)

- HTML/SVG diagram: `/diagrams/xgboost_flow.html`

### References

- Prediction options (`output_margin`, `iteration_range`): `https://xgboost.readthedocs.io/en/stable/prediction.html`
- Individual trees accumulation demo: `https://xgboost.readthedocs.io/en/latest/python/examples/individual_trees.html`
- Dump parse fields (`Split`, `Yes/No/Missing`): `https://xgboost.readthedocs.io/en/latest/r_docs/R-package/docs/reference/xgb.model.dt.tree.html`

