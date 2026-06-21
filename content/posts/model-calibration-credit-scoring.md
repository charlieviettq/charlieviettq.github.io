---
title: "Calibration Trong Credit Scoring: Khi AUC Đẹp Nhưng PD Không Đáng Tin"
date: "2026-05-27"
excerpt: >
  Một credit model có AUC/Gini tốt vẫn có thể làm sai pricing, hạn mức hoặc ECL nếu
  thang PD không đáng tin. Bài này giải thích vì sao rank tốt chưa đủ, cách đọc
  reliability diagram, fit Platt/isotonic đúng split và monitor sau deploy.
category: data-science
---

> **Series: Credit Risk Modeling & Decisioning** — Bài 5 / 8  
> Trước: [Bài 4 — Scorecard và PD band](/blog/scorecard-pd-band-credit-scoring/)  
> Tiếp: [Bài 6 — Cutoff simulation](/blog/cutoff-policy-simulation-credit-scoring/)  
> Nền tảng: [Bài 2 — Labels, outcome window và maturity](/blog/credit-labels-outcome-window/)

---

## Điểm cần nhớ

- AUC/Gini/KS cho biết mô hình xếp hạng rủi ro có tốt không. Chúng không chứng minh rằng PD 8% thật sự tương ứng với tỷ lệ bad 8%.
- Khi PD (xác suất vỡ nợ) đi vào pricing, hạn mức hoặc ECL, calibration trở thành vấn đề quản trị mô hình, không phải bước làm đẹp kết quả.
- Không hiệu chỉnh xác suất trên tập validation đã từng dùng để chọn feature, chọn tham số hoặc dừng training sớm.
- Với boosting model, hãy bắt đầu bằng Platt scaling, một cách hiệu chỉnh xác suất đơn giản và ít overfit hơn khi dữ liệu chưa quá lớn.
- Luôn kiểm tra trên test/OOT cuối cùng bằng reliability diagram, tức biểu đồ so sánh PD dự báo với tỷ lệ bad thực tế.

Sơ đồ dưới đây tóm tắt ba pattern calibration hay gặp. Khi đọc hình, hãy nhìn vị trí đường cong so với đường chéo: nằm dưới nghĩa là model đang overconfident, nằm trên nghĩa là model đang underconfident.

:::diagram[Reliability diagram — ba pattern calibration phổ biến]

![Reliability diagram — perfect, overconfident, underconfident](/blog/diagrams/model-calibration-credit-scoring/calibration-plot-patterns.svg)

:::

**Hình 1.** Reliability diagram giúp kiểm tra thang PD có đáng tin không; AUC cao không đảm bảo đường calibration nằm gần đường chéo.

---

## VI

## 1. Tổng quan: Xếp hạng tốt chưa chắc xác suất đúng

Một mô hình credit có thể xếp hạng khách rất tốt nhưng vẫn nói sai về xác suất tuyệt đối. Đây là điểm nhiều team bỏ qua: AUC đẹp giúp bạn biết ai rủi ro hơn ai, nhưng không đảm bảo con số PD đủ tin để đưa vào pricing, hạn mức hoặc ECL.

Nói đơn giản, nếu mô hình gán PD khoảng 8% cho một nhóm khách, thì sau khi outcome window đủ mature, bad rate thực tế của nhóm đó cũng nên quanh 8%. Nếu thực tế chỉ 3% hoặc lên 15%, con số PD đang không đáng tin.

Về mặt kỹ thuật, một mô hình `f` được gọi là calibrated nếu:

```
P(Y = 1 | f(X) = p) = p
```

Trong đó:

- `f(X)`: xác suất mô hình dự báo cho một hồ sơ.
- `p`: một mức PD cụ thể, ví dụ 8%.
- `Y = 1`: khách hàng trở thành bad theo định nghĩa đã thống nhất.

Diễn giải đời thường: trong nhóm hồ sơ được gán PD gần 8%, tỷ lệ bad thực tế cũng nên gần 8%.

**Ví dụ gần gũi — dự báo thời tiết**

| Ứng dụng | Dự báo | Theo dõi 100 ngày | Thực tế mưa | Kết luận |
|----------|--------|-------------------|-------------|----------|
| App A | 80% có mưa | 100 ngày báo 80% | 79 ngày | Calibrated — tin được |
| App B | 80% có mưa | 100 ngày báo 80% | 40 ngày | Miscalibrated — thổi phồng |

App B có thể vẫn xếp đúng ngày nào nhiều khả năng mưa hơn, nhưng **con số 80% không còn đáng tin**. Credit scoring gặp tình huống tương tự khi boosting model cho AUC cao nhưng PD scale bị đẩy quá tự tin.

## 2. Vấn đề thường gặp: Dùng PD raw cho pricing hoặc ECL

Lỗi tôi hay thấy khi review model là team chọn mô hình bằng AUC/Gini, sau đó dùng thẳng output probability cho pricing, hạn mức hoặc ECL. Về mặt kỹ thuật, output đó có thể chỉ tốt để xếp hạng, chưa chắc đã là một xác suất đáng tin.

Hậu quả không nhỏ:

- **Risk-based pricing:** PD bị thổi phồng làm lãi suất bị đẩy lên, dễ tạo adverse selection.
- **Credit limit:** hạn mức có thể bị siết quá mạnh hoặc nới quá rộng.
- **ECL:** công thức `ECL = PD × LGD × EAD` sẽ sai nếu PD sai scale.
- **Portfolio reporting:** mean predicted PD không khớp với bad rate thực tế.

## 3. Khái niệm cốt lõi: AUC, Gini, KS và calibration đo những thứ khác nhau

Trước khi calibrate, hãy tách hai câu hỏi. Một câu hỏi nói về thứ tự rủi ro; câu còn lại nói về xác suất tuyệt đối.

:::diagram[Hai câu hỏi — rank (discrimination) vs estimate PD (calibration)]

![Rank vs calibrated PD — metrics and when calibration is required](/blog/diagrams/model-calibration-credit-scoring/rank-vs-pd-purpose.svg)

:::

**Hình 2.** Rank metric trả lời “ai rủi ro hơn ai”, còn calibration trả lời “con số PD có đúng thang xác suất không”.

| Mục đích | Câu hỏi | Metric phù hợp | Cần calibration? |
|----------|---------|----------------|-------------------|
| **A — Rank** | Ai rủi ro hơn ai? | AUC, Gini, KS | Không |
| **B — Estimate PD** | Xác suất vỡ nợ là bao nhiêu %? | Brier Score, ECE, reliability diagram | Có |

Bảng dưới đây giúp bạn dự đoán vì sao một số model family thường bị lệch calibration. Đây không phải lỗi code; đó là tính chất của cách model học score.

| Model family | Xu hướng | Ghi chú |
|--------------|----------|---------|
| Gradient boosting (XGBoost, LightGBM, CatBoost) | Overconfident | Leaf values cực đoan → PD đẩy về 0/1 |
| Random Forest | Underconfident | Averaging kéo xác suất về 0.5 |
| Logistic Regression | Gần calibrated | Optimize log-loss trực tiếp |
| Neural networks | Thường overconfident | Cần temperature scaling hoặc Platt |

`scale_pos_weight` / class weight trong training **không thay thế calibration** — chỉ cân bằng class trong loss, không sửa probability scale trên population thực.

## 4. Ví dụ thực tế: Model nói PD 10%, thực tế bad rate chỉ 6%

Giả sử sau outcome window, bạn gom 2.000 hồ sơ có PD dự báo trung bình 10%. Nếu có 120 hồ sơ bad, observed bad rate là 6%. Điểm này nằm dưới đường chéo trong reliability diagram, nghĩa là mô hình đang nói rủi ro cao hơn thực tế.

Trước khi đọc cả đường cong, hãy tập đọc một điểm như ví dụ dưới đây.

:::diagram[Một bin = một điểm (0.10, 0.06) dưới đường chéo perfect calibration]

![Reading one reliability diagram point — predicted 10% vs observed 6%](/blog/diagrams/model-calibration-credit-scoring/reliability-read-one-point.svg)

:::

**Hình 3.** Một điểm trên reliability diagram tương ứng với một nhóm hồ sơ; nếu predicted PD là 10% nhưng observed bad rate là 6%, model đang overestimate risk trong nhóm đó.

Để vẽ đường cong đầy đủ, ta thường chia test set thành các bin theo PD. Với credit scoring, equal-frequency bin thường dễ đọc hơn vì mỗi bin có số hồ sơ gần bằng nhau.

:::diagram[Equal-frequency bins — từ PD sort tới điểm trên reliability diagram]

![Quantile binning for calibration curve — four bins with equal N](/blog/diagrams/model-calibration-credit-scoring/calibration-binning-quantile.svg)

:::

**Hình 4.** Equal-frequency binning giúp mỗi điểm trên reliability diagram có đủ số hồ sơ để so sánh predicted PD và observed bad rate.

Test set **4.000** hồ sơ, bad rate tổng **7.5%**. Bảng dưới đây minh họa một mô hình raw boosting bị overconfident.

| Bin | N | Mean pred PD | Observed bad rate | Cách đọc |
|-----|---|--------------|-------------------|----------|
| 1 | 1.000 | 2.0% | 0.8% | Gần chéo, lệch nhẹ |
| 2 | 1.000 | 5.0% | 3.5% | Overestimate |
| 3 | 1.000 | 10.0% | 8.2% | Overestimate |
| 4 | 1.000 | 22.0% | 17.5% | Overestimate mạnh ở đuôi |

Thứ tự bin vẫn đúng, nên AUC/Gini có thể đẹp. Nhưng nếu PD dùng cho số tuyệt đối, bảng này nói rằng thang xác suất cần được chỉnh.

## 5. Cách làm trong dự án thật: Tách train, calibration và test đúng cách

Workflow an toàn nhất là tách riêng ba phần dữ liệu: train để học model, calibration để fit lớp hiệu chỉnh xác suất, và test/OOT để đánh giá cuối cùng.

:::diagram[Luồng offline: split, train, calibrate, deploy hai output]

![Calibration workflow — train, calibration set, test, production outputs](/blog/diagrams/model-calibration-credit-scoring/calibration-workflow.svg)

:::

**Hình 5.** Calibration nên được fit trên tập riêng; test/OOT chỉ dùng để đánh giá cuối cùng, không dùng để chọn lại mô hình nhiều lần.

Các bước triển khai:

1. Tách test/OOT trước mọi tuning.
2. Train base model trên train set.
3. Fit Platt hoặc isotonic trên calibration set chưa từng dùng cho tuning.
4. Đánh giá trên test/OOT: AUC, Brier, ECE và reliability diagram.
5. Deploy hai output: `raw_score` cho ranking, `calibrated_pd` cho pricing/ECL.
6. Monitor mean PD vs actual sau khi label đủ mature.

Đoạn code dưới đây minh họa cách tách train, calibration và test. Điểm quan trọng là calibration set không được dùng cho early stopping, feature selection hoặc hyperparameter tuning.

```python
from sklearn.model_selection import train_test_split

X_trainval, X_test, y_trainval, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42,
)

X_train, X_calib, y_train, y_calib = train_test_split(
    X_trainval,
    y_trainval,
    test_size=0.25,  # 25% cua trainval = 20% tong data
    stratify=y_trainval,
    random_state=42,
)
```

Sau bước này, `X_calib` chỉ dùng để fit calibration. Nếu nó đã tham gia tuning trước đó, calibration plot đẹp hơn trên paper nhưng dễ fail khi deploy.

Với boosting model, tôi thường bắt đầu bằng Platt scaling vì đơn giản và ít overfit hơn isotonic khi số positive chưa lớn.

```python
from sklearn.calibration import CalibratedClassifierCV

calibrated = CalibratedClassifierCV(
    base_model,
    method="sigmoid",  # Platt scaling
    cv="prefit",       # model da train; chi fit lop calibration
)
calibrated.fit(X_calib, y_calib)
```

Sau khi fit, vẽ lại reliability diagram trên test/OOT. AUC thường gần như không đổi; Brier Score và ECE nên cải thiện nếu calibration thật sự giúp ích.

:::diagram[Cùng test: raw boosting vs sau Platt — xanh ôm sát đường chéo hơn]

![Reliability diagram before and after Platt scaling on test set](/blog/diagrams/model-calibration-credit-scoring/reliability-raw-vs-platt.svg)

:::

**Hình 6.** Sau Platt scaling, đường calibration nên tiến gần đường chéo hơn trên test/OOT; nếu chỉ đẹp trên calibration set thì chưa đủ.

```python
from sklearn.calibration import calibration_curve

frac_pos_raw, mean_pred_raw = calibration_curve(
    y_test, prob_raw, n_bins=10, strategy="quantile"
)
frac_pos_cal, mean_pred_cal = calibration_curve(
    y_test, prob_cal, n_bins=10, strategy="quantile"
)
# Ve mean_pred_* tren truc X va frac_pos_* tren truc Y
```

Đoạn code trên chỉ tạo dữ liệu để vẽ plot. Khi đọc plot, hãy hỏi: đường sau calibration có sát đường chéo hơn không, và improvement đó có xảy ra trên test/OOT không.

## 6. Lỗi thường gặp khi calibrate model

| Lỗi | Dấu hiệu | Hệ quả | Cách tránh |
|---|---|---|---|
| Calibrate trên validation đã “seen” | Plot đẹp bất thường trên validation | Overfit calibration | Dùng holdout/OOT riêng |
| Kỳ vọng AUC tăng sau calibrate | Team thất vọng vì AUC không đổi | Hiểu sai mục tiêu | Chỉ kỳ vọng Brier/ECE cải thiện |
| Chỉ check overall | Overall tốt, segment xấu | PD lệch ở NTB/ETB, product hoặc channel | Vẽ reliability theo slice |
| Calibrate trên downsampled data | PD bị inflate/deflate | Pricing/ECL sai scale | Calibrate trên population rate hoặc correct prior |
| Dùng raw score cho pricing | Giá/hạn mức sai | Governance risk | Deploy riêng `raw_score` và `calibrated_pd` |

## 7. Gợi ý cho người mới

Nếu bạn mới làm credit model, đừng xem calibration là bước nâng cao xa vời. Chỉ cần nhớ một nguyên tắc: nếu output model đi vào công thức tiền thật, hãy kiểm tra thang xác suất.

Checklist tối thiểu trước khi đưa PD vào policy:

- PD có dùng cho pricing, limit, ECL hoặc reporting không?
- Calibration set có thật sự unseen không?
- Reliability diagram trên test/OOT có ổn không?
- Brier Score và ECE có cải thiện không?
- Segment quan trọng như product, channel, NTB/ETB có lệch không?
- Production có tách `raw_score` và `calibrated_pd` không?

## 8. Hỏi đáp nhanh

**AUC cao có cần calibration không?**  
Có, nếu PD được dùng như xác suất tuyệt đối. AUC cao chỉ nói mô hình rank tốt.

**Calibration có làm AUC tăng không?**  
Thường không. Calibration sửa thang xác suất, không nhằm cải thiện thứ tự ranking.

**Nên bắt đầu bằng Platt hay isotonic?**  
Với boosting model, tôi thường bắt đầu bằng Platt. Isotonic linh hoạt hơn nhưng cần nhiều positive hơn và dễ overfit hơn.

**Có cần calibration theo từng segment không?**  
Có thể cần. Nếu NTB/ETB, product hoặc channel có reliability curve khác nhau, overall calibration là chưa đủ.

## 9. Tài liệu tham khảo

Các tài liệu tham khảo chi tiết nằm ở phần cuối bài.

---

## EN

### The problem: ranking is not probability

A credit model can rank borrowers well and still give the wrong absolute probability. A strong AUC tells you who is riskier than whom; it does not guarantee that PD 8% means an 8% realized default rate.

A model is **calibrated** when, among all cases with predicted probability `p`, the fraction of positives is approximately `p`. Formally: `P(Y=1 | f(X)=p) = p`.

Discrimination metrics (AUC, Gini, KS) answer **who is riskier than whom**. Calibration metrics (Brier, ECE, reliability plots) answer **whether the probability scale is honest**.

### When calibration matters

**Skip calibration** for pure ranking: model selection, approve/reject thresholds, SHAP.

**Require calibration** when PD enters formulas: risk-based pricing, credit limits, IFRS 9 ECL (`PD × LGD × EAD`), portfolio PD aggregation, or cross-model PD comparison. At that point calibration is governance, not cosmetic cleanup.

### Practical methods and metrics

- **Platt scaling** (`method='sigmoid'`, `cv='prefit'`): default for gradient boosting.
- **Isotonic**: more flexible; needs a large calibration set (many positives).
- **Brier Score**: primary scalar KPI for probability quality.
- **ECE / MCE**: bin-wise gaps; useful for monitoring and regulatory views.
- **Reliability diagram**: diagnostic; overconfident curves sit **below** the diagonal.

### Reliability diagram — worked example

Static diagrams in the VI section cover: **quantile binning**, **one point (0.10, 0.06)**, **four-bin overconfident boosting**, and **raw vs Platt** on the same test set. Use `calibration_curve(..., strategy="quantile")` for equal-frequency bins.

### Implementation essentials I would check in review

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
