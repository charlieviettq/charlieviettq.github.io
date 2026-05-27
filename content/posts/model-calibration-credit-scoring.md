---
title: "Model Calibration trong Credit Scoring: khi nào PD là xác suất thật?"
date: "2026-05-27"
excerpt: >
  AUC và Gini đo khả năng xếp hạng rủi ro; calibration đảm bảo PD dự báo khớp tần suất
  default thực tế. Bài này giải thích khi nào cần calibrate, cách đọc reliability diagram,
  phương pháp Platt/isotonic, metrics (Brier, ECE), split data đúng, và monitoring sau deploy.
category: data-science
---

> **Series: Credit Scoring Foundation** — Bài 4 / 6  
> Đã có: [A1 — Labels, outcome window và maturity](/blog/credit-labels-outcome-window/)  
> Đồng hành: [Retail credit products — taxonomy theo cơ chế trả nợ](/blog/retail-credit-products-overview/)

---

Nội dung mang tính **giáo dục và model governance**: không thay thế chính sách Risk, pricing, hay yêu cầu báo cáo pháp lý của từng tổ chức. Ví dụ số liệu minh họa là illustrative.

## TL;DR

- **Calibration** nghĩa là trong mỗi nhóm khách có cùng PD dự báo, tỷ lệ default thực tế phải gần với PD đó (ví dụ predict 8% thì khoảng 8% thực sự default).
- **AUC / Gini / KS** trả lời câu hỏi *ai rủi ro hơn ai*; **Brier Score / ECE / reliability diagram** trả lời *PD có đúng thang xác suất không*.
- Cần **calibrated PD** khi score đi vào **pricing, hạn mức, ECL (IFRS 9), aggregation portfolio**, hoặc so sánh PD giữa model/sản phẩm.
- **Không cần** calibration cho approve/reject thuần rank, model selection, hay SHAP — miễn là không dùng PD tuyệt đối trong business logic.
- **Platt Scaling** (sigmoid trên raw score) là default thực dụng cho boosting; **isotonic** khi calibration set lớn và distortion phức tạp.
- **Calibration set** phải **hoàn toàn unseen** (hoặc OOT): không dùng validation đã qua early stopping, RFE, hay hyperparameter tuning.

:::diagram[Reliability diagram — ba pattern calibration phổ biến]

![Reliability diagram — perfect, overconfident, underconfident](/blog/diagrams/model-calibration-credit-scoring/calibration-plot-patterns.svg)

:::

---

## VI

### Calibration là gì?

**Model calibration** là quá trình đảm bảo xác suất dự đoán của model phản ánh đúng tần suất thực tế của sự kiện. Định nghĩa kỹ thuật: model `f` được gọi là *calibrated* nếu với mọi `p` trong `[0, 1]`:

```
P(Y = 1 | f(X) = p) = p
```

Nói đơn giản: trong tập khách mà model gán PD khoảng 8%, thì khoảng 8% trong số họ phải thực sự default (theo định nghĩa bad đã thống nhất — xem [A1](/blog/credit-labels-outcome-window/)).

**Analogy — dự báo thời tiết**

| Ứng dụng | Dự báo | Theo dõi 100 ngày | Thực tế mưa | Kết luận |
|----------|--------|-------------------|-------------|----------|
| App A | 80% có mưa | 100 ngày báo 80% | 79 ngày | Calibrated — tin được |
| App B | 80% có mưa | 100 ngày báo 80% | 40 ngày | Miscalibrated — thổi phồng |

App B không “sai thứ tự” ngày nào mưa nhiều hơn — nhưng **con số 80% không có nghĩa thống kê**. Credit scoring gặp tình huống tương tự khi boosting model cho AUC cao nhưng PD scale lệch.

---

### Hai mục đích khác nhau: RANK vs ESTIMATE PD

:::diagram[Hai câu hỏi — rank (discrimination) vs estimate PD (calibration)]

![Rank vs calibrated PD — metrics and when calibration is required](/blog/diagrams/model-calibration-credit-scoring/rank-vs-pd-purpose.svg)

:::

| Mục đích | Câu hỏi | Metric phù hợp | Cần calibration? |
|----------|---------|----------------|-------------------|
| **A — Rank** | Ai rủi ro hơn ai? | AUC, Gini, KS | Không |
| **B — Estimate PD** | Xác suất vỡ nợ là bao nhiêu %? | Brier Score, ECE, reliability diagram | Có |

:::warning[Vấn đề cốt lõi]
Hầu hết model được train và chọn bằng metric **rank** (AUC/Gini), nhưng output **PD** lại được đưa vào công thức **pricing, provisioning, regulatory**. Đó là lý do calibration là bước governance bắt buộc — không phải “nice to have”.
:::

**Hậu quả khi PD lệch scale (minh họa)**

- **Risk-based pricing:** `Lãi suất ≈ Base rate + Risk premium × PD`. PD model 15% thay vì PD thực 5% → overcharge → adverse selection.
- **Expected Credit Loss:** `ECL = PD × LGD × EAD`. PD sai → trích lập dự phòng sai ở cấp portfolio.
- **Portfolio aggregation:** `mean(PD_predicted)` phải gần default rate thực nếu dùng cho báo cáo tổng rủi ro.

**Model family và xu hướng miscalibration (không phải lỗi code)**

| Model family | Xu hướng | Ghi chú |
|--------------|----------|---------|
| Gradient boosting (XGBoost, LightGBM, CatBoost) | Overconfident | Leaf values cực đoan → PD đẩy về 0/1 |
| Random Forest | Underconfident | Averaging kéo xác suất về 0.5 |
| Logistic Regression | Gần calibrated | Optimize log-loss trực tiếp |
| Neural networks | Thường overconfident | Cần temperature scaling hoặc Platt |

`scale_pos_weight` / class weight trong training **không thay thế calibration** — chỉ cân bằng class trong loss, không sửa probability scale trên population thực.

---

### Khi nào CẦN và KHÔNG CẦN calibration

**Không cần (rank-only)**

- So sánh model / A-B test (AUC, Gini đủ).
- Approve/reject: `IF score > threshold THEN approve`.
- Feature importance / SHAP (không phụ thuộc scale PD tuyệt đối).
- Fraud flag binary khi không đưa probability vào pricing.

**Bắt buộc hoặc nên có**

| Use case | Lý do |
|----------|-------|
| Risk-based pricing | PD trong công thức lãi suất |
| Credit limit | Hạn mức tỷ lệ nghịch với PD |
| IFRS 9 / ECL | PD × LGD × EAD |
| Basel IRB (nếu áp dụng) | PD là long-run average default rate |
| Cross-product PD comparison | Chỉ so sánh được khi cùng thang calibrated |
| Monitoring mean PD vs actual | Phát hiện drift scale |

---

### Reliability diagram (calibration plot)

- **Trục X:** mean predicted probability trong từng bin (thường 10 bin).
- **Trục Y:** observed default rate trong bin đó.
- **Đường chéo 45°:** perfect calibration.

| Pattern | Vị trí curve | Ý nghĩa |
|---------|--------------|---------|
| Perfect | Trên đường chéo | Predicted ≈ actual |
| Overconfident | **Dưới** đường chéo | Model thổi phồng PD |
| Underconfident | **Trên** đường chéo | Model quá thận trọng |

Với boosting trong credit scoring, **overconfident** là pattern gặp nhiều nhất — đừng nhầm AUC tốt với PD đúng.

#### Cách gom bin (trước khi vẽ)

1. Lấy tập đánh giá (thường **test** hoặc **OOT** — không phải train/calibration).
2. Sắp xếp theo `PD_predicted` tăng dần.
3. Chia thành `n_bins` nhóm (hay dùng 10):
   - **Equal-frequency (quantile):** mỗi bin gần bằng số hồ sơ — ổn khi PD lệch (credit scoring thường dùng cách này).
   - **Equal-width:** chia theo khoảng PD (0–0.1, 0.1–0.2, …) — bin vùng thấp có thể rất ít case.

Với mỗi bin `b`:

- `conf_b` = mean(PD predicted) trong bin  
- `acc_b` = tỷ lệ bad thực tế trong bin (= số bad / N bin)

Điểm `(conf_b, acc_b)` là một điểm trên reliability diagram. Nối các điểm theo thứ tự PD tăng dần → đường calibration của model.

:::diagram[Equal-frequency bins — từ PD sort tới điểm trên reliability diagram]

![Quantile binning for calibration curve — four bins with equal N](/blog/diagrams/model-calibration-credit-scoring/calibration-binning-quantile.svg)

:::

#### Ví dụ đọc **một** điểm trên đồ thị

:::diagram[Một bin = một điểm (0.10, 0.06) dưới đường chéo perfect calibration]

![Reading one reliability diagram point — predicted 10% vs observed 6%](/blog/diagrams/model-calibration-credit-scoring/reliability-read-one-point.svg)

:::

Giả sử sau outcome window, bạn gom **2.000** hồ sơ có PD dự báo trung bình **10%** và **120** bad → observed **6%**. Điểm **(0.10, 0.06)** nằm **dưới** đường chéo: model **nói rủi ro cao hơn thực tế** trong nhóm này. Ngược lại **(0.08, 0.11)** nằm **trên** chéo → underconfident cục bộ.

#### Ví dụ 4 bin — boosting chưa calibrate

:::diagram[Bốn bin quantile trên test — đường đỏ lệch dưới đường chéo (overconfident)]

![Four-bin reliability diagram — raw boosting below diagonal](/blog/diagrams/model-calibration-credit-scoring/reliability-four-bin-boosting.svg)

:::

Test set **4.000** hồ sơ, bad rate tổng **7.5%** (illustrative). Bảng chi tiết:

| Bin | N | Mean pred PD | Observed | vs chéo |
|-----|---|--------------|----------|---------|
| 1 | 1.000 | 2.0% | 0.8% | Gần chéo |
| 2 | 1.000 | 5.0% | 3.5% | Dưới |
| 3 | 1.000 | 10.0% | 8.2% | Dưới |
| 4 | 1.000 | 22.0% | 17.5% | Dưới (đuôi) |

:::note[Cùng data, AUC vẫn tốt]
Thứ tự bin vẫn đúng (bin 4 xấu hơn bin 1) nên **AUC/Gini có thể đẹp**, trong khi diagram vẫn báo **miscalibration** — cần khi PD dùng cho số tuyệt đối.
:::

#### Trước và sau Platt (cùng test set)

:::diagram[Cùng test: raw boosting vs sau Platt — xanh ôm sát đường chéo hơn]

![Reliability diagram before and after Platt scaling on test set](/blog/diagrams/model-calibration-credit-scoring/reliability-raw-vs-platt.svg)

:::

Platt fit trên **calibration set** riêng; vẽ lại trên **test** một lần. Bin 2–4: mean PD raw kéo xuống gần observed (ví dụ 5.0% → ~3.8% khi actual 3.5%). **AUC** trên test thường gần như không đổi; **Brier / ECE** nên cải thiện nếu calibration đúng.

```python
from sklearn.calibration import calibration_curve

frac_pos_raw, mean_pred_raw = calibration_curve(
    y_test, prob_raw, n_bins=10, strategy="quantile"
)
frac_pos_cal, mean_pred_cal = calibration_curve(
    y_test, prob_cal, n_bins=10, strategy="quantile"
)
# Plot mean_pred_* vs frac_pos_* — same logic as SVG above
```

#### Checklist đọc nhanh khi review diagram

- Điểm có nằm **dưới** chéo ở đại đa số bin không? → cân nhắc Platt/isotonic.
- Lệch tập trung ở **đuôi PD cao** hay **vùng PD thấp**? → quyết định có cần **calibration theo segment** (NTB/ETB, product).
- Sau calibrate, đường có sát chéo hơn **và** Brier/ECE giảm trên test không?
- AUC thay đổi > ~0.01 không? → kiểm tra lại pipeline (hiếm khi là do calibration đúng).

---

### Phương pháp calibration phổ biến

#### Platt Scaling (default cho boosting)

Fit logistic regression trên raw score:

```
P_calibrated = sigmoid(a × f(x) + b)
```

| | |
|--|--|
| Tham số | 2 (a, b) |
| Data | ~500–1000+ positive trong calibration set |
| Ưu | Nhanh, ít data, phù hợp boosting |
| Nhược | Giả định distortion dạng sigmoid |

```python
from sklearn.calibration import CalibratedClassifierCV

calibrated = CalibratedClassifierCV(
    base_model,
    method="sigmoid",  # Platt
    cv="prefit",       # model da train; chi fit lop calibration
)
calibrated.fit(X_calib, y_calib)
```

#### Isotonic regression

Non-parametric, monotone step function — linh hoạt hơn nhưng cần nhiều positive (lý tưởng 5000+).

#### Temperature scaling

Một scalar `T` chia logit: `sigmoid(logit(f(x)) / T)`. Đơn giản, **không đổi rank** (AUC giữ nguyên). Hay dùng cho neural nets.

#### Beta calibration

Beta CDF với 2 tham số — tốt khi score dồn sát 0 và 1.

**Khuyến nghị thực dân:** bắt đầu **Platt** → vẽ reliability diagram + Brier trên test → chỉ chuyển **isotonic** nếu Platt chưa đủ và calibration set đủ lớn.

---

### Metrics đánh giá calibration

| Metric | Range | Mục đích |
|--------|-------|----------|
| **Brier Score** | 0 (tốt) → 1 (xấu) | KPI tổng thể probability quality |
| **ECE** | 0 → 1 | Monitoring: weighted gap theo bin |
| **MCE** | 0 → 1 | Worst bin — hữu ích regulatory |
| **Reliability diagram** | Visual | Chẩn đoán + trình bày stakeholder |

**Brier Score:** `(1/n) Σ (y_i - p_i)²` — proper scoring rule. Thấp hơn = tốt hơn. ~0.25 thường là no-skill (predict = base rate).

**ECE:** weighted average `|acc_b - conf_b|` qua bins. Rule of thumb: `< 0.01` excellent; `0.01–0.05` acceptable; `> 0.05` cần calibrate. Luôn report cùng `n_bins`; ưu tiên equal-frequency bins khi PD skewed.

```python
from sklearn.metrics import brier_score_loss
from sklearn.calibration import calibration_curve

bs = brier_score_loss(y_true, y_proba)
frac_pos, mean_pred = calibration_curve(y_true, y_proba, n_bins=10)
```

:::note[Lưu ý]
Calibration **không** cải thiện AUC/Gini — chỉ sửa scale xác suất. AUC trước và sau calibration phải gần bằng nhau. Model rank kém (AUC < 0.65) cần cải thiện feature/model, không phải chỉ calibrate.
:::

---

### Flow triển khai thực tế

:::diagram[Luồng offline: split, train, calibrate, deploy hai output]

![Calibration workflow — train, calibration set, test, production outputs](/blog/diagrams/model-calibration-credit-scoring/calibration-workflow.svg)

:::

#### Data split — bước quan trọng nhất

:::warning[Sai lầm phổ biến nhất]
Dùng **validation set** đã tham gia early stopping, feature selection (RFE), hoặc hyperparameter tuning để **fit calibration**. Kết quả: calibration overfit — đẹp trên paper, tệ trên production.
:::

| Set | Tỷ lệ gợi ý | Dùng cho |
|-----|-------------|----------|
| Train | ~60% | Feature engineering, selection, train base model |
| Calibration | ~20% | Fit Platt/isotonic — **unseen** |
| Test | ~20% | Đánh giá cuối **một lần** |

**OOT calibration (khuyến nghị khi có vintage đủ dài)**

| Period | Dùng cho |
|--------|----------|
| T1–T12 | Train + feature selection |
| T13–T15 | Fit calibration (OOT) |
| T16–T18 | Test (OOT) |

Phản ánh phân phối thời gian production; tránh leakage với random split in-sample.

#### End-to-end steps

1. **Tách test (và calibration) trước** mọi processing.
2. **Train base model** chỉ trên train set.
3. **Fit calibration** trên calibration set (`cv='prefit'`).
4. **Evaluate** trên test: Brier, ECE, reliability plot, AUC (ổn định).
5. **Deploy** hai output: `raw_score` (rank) và `calibrated_pd` (pricing/ECL).
6. **Monitor** monthly mean PD vs actual (sau vintage 3–6 tháng).

```python
from sklearn.model_selection import train_test_split

X_trainval, X_test, y_trainval, y_test = train_test_split(
    X, y, test_size=0.20, stratify=y, random_state=42
)
X_train, X_calib, y_train, y_calib = train_test_split(
    X_trainval, y_trainval, test_size=0.25, stratify=y_trainval, random_state=42
)
```

```python
def score_customer(features):
    X = feature_pipeline.transform(features)
    return {
        "raw_score": base_model.predict_proba(X)[:, 1],
        "calibrated_pd": calibrated_model.predict_proba(X)[:, 1],
    }
```

---

### Lỗi phổ biến cần tránh

| Lỗi | Hậu quả | Fix |
|-----|---------|-----|
| Calibrate trên validation đã “seen” | Overfit calibration | Holdout/OOT riêng |
| Kỳ vọng AUC tăng sau calibrate | Hiểu nhầm mục tiêu | Chỉ kỳ vọng Brier/ECE cải thiện |
| Calibrate trên downsampled data không correct prior | PD inflate/deflate | Prior correction hoặc calibrate trên population rate |
| Dùng raw score cho pricing | Giá sai, adverse selection | Luôn `calibrated_pd` cho công thức tuyệt đối |
| Chỉ check overall, bỏ segment | NTB/ETB hoặc product lệch | Reliability diagram theo slice |
| `cv=5` thay vì `cv='prefit'` | Retrain model, mất tuning | `cv='prefit'` khi model đã fit |

---

### Monitoring sau deploy

| Zone | Điều kiện (minh họa) | Hành động |
|------|----------------------|-----------|
| Green | `\|mean_PD - actual\| / actual < 10%` | Tiếp tục monitor |
| Yellow | 10%–20% | Review slice, kiểm tra drift |
| Red | > 20% | Recalibrate, báo Risk |

**Trigger recalibrate:** ECE tăng > 0.03 so với baseline; Brier tăng > 10% relative; mean PD drift > 20%; quarterly routine.

:::note[Recalibration]
Thường **không cần retrain base model** — chỉ fit lại lớp calibration trên OOT gần đây, version artifact mới, giữ bản cũ cho audit trail.
:::

---

### Checklist trước khi đưa PD vào pricing / ECL

- [ ] Đã xác định use case cần calibrated PD (không chỉ rank)?
- [ ] Calibration set hoàn toàn unseen hoặc OOT?
- [ ] Đã vẽ reliability diagram trên test set?
- [ ] Brier / ECE cải thiện so với raw score; AUC ~unchanged?
- [ ] Đã kiểm slice quan trọng (NTB/ETB, product, channel)?
- [ ] Production tách `raw_score` vs `calibrated_pd`?
- [ ] Monitoring mean PD vs actual đã có owner?

---

## EN

### What is calibration?

A model is **calibrated** when, among all cases with predicted probability `p`, the fraction of positives is approximately `p`. Formally: `P(Y=1 | f(X)=p) = p`.

Discrimination metrics (AUC, Gini, KS) answer **who is riskier than whom**. Calibration metrics (Brier, ECE, reliability plots) answer **whether the probability scale is honest**.

### When you need it

**Skip calibration** for pure ranking: model selection, approve/reject thresholds, SHAP.

**Require calibration** when PD enters formulas: risk-based pricing, credit limits, IFRS 9 ECL (`PD × LGD × EAD`), portfolio PD aggregation, or cross-model PD comparison.

### Methods and metrics

- **Platt scaling** (`method='sigmoid'`, `cv='prefit'`): default for gradient boosting.
- **Isotonic**: more flexible; needs a large calibration set (many positives).
- **Brier Score**: primary scalar KPI for probability quality.
- **ECE / MCE**: bin-wise gaps; useful for monitoring and regulatory views.
- **Reliability diagram**: diagnostic; overconfident curves sit **below** the diagonal.

### Reliability diagram — worked example (see SVG figures in VI)

Static diagrams in the VI section cover: **quantile binning**, **one point (0.10, 0.06)**, **four-bin overconfident boosting**, and **raw vs Platt** on the same test set. Use `calibration_curve(..., strategy="quantile")` for equal-frequency bins.

### Implementation essentials

1. Hold out a **calibration set** that was never used for training, early stopping, or feature selection.
2. Prefer **out-of-time** calibration when vintages allow.
3. Evaluate on a **test set** used only once at the end.
4. Deploy **two outputs**: `raw_score` for ranking; `calibrated_pd` for pricing and provisioning.
5. Monitor `mean(PD)` vs realized default rate after labels mature.

:::warning[Do not calibrate on contaminated validation]
If the same validation fold drove RFE or early stopping, it is not a valid calibration set. Use a fresh holdout or OOT window.
:::

---

## Tham khảo / References

- Platt, J. (1999). Probabilistic outputs for SVMs. *Advances in large margin classifiers*.
- Zadrozny, B., & Elkan, C. (2002). Transforming classifier scores into accurate probability estimates. *KDD*.
- Guo, C., et al. (2017). On calibration of modern neural networks. *ICML*.
- Niculescu-Mizil, A., & Caruana, R. (2005). Predicting good probabilities with supervised learning. *ICML*.
- scikit-learn: [Probability calibration](https://scikit-learn.org/stable/modules/calibration.html)
- IFRS Foundation. *IFRS 9 Financial Instruments* (ECL framework).
- Basel Committee. *International Convergence of Capital Measurement and Capital Standards* (Basel II/III context for PD).
- European Parliament. Regulation (EU) No 575/2013 (CRR) — Article 179 (PD as long-run default rate, where IRB applies).
