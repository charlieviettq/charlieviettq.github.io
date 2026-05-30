---
title: "Nhãn Rủi Ro Tín Dụng: Trước Khi Train Model, Hãy Thống Nhất “Bad” Là Gì"
date: "2026-04-30"
excerpt: >
  Credit model không bắt đầu từ XGBoost hay feature engineering. Nó bắt đầu từ một
  thỏa thuận rất cụ thể: ai được xem là “bad”, quan sát trong bao lâu, và cohort
  đã đủ mature để dùng làm dữ liệu huấn luyện hay chưa.
category: banking
---

> **Series: Credit Scoring Foundation** — Bài 1 / 6  
> Xem thêm: [A2 — Data Split & Leakage](#) · [A3 — OOT Evaluation](#)

---

## Điểm cần nhớ

- Hãy xem nhãn rủi ro tín dụng như một **thỏa thuận nghiệp vụ**, không phải chỉ là một cột `bad_flag`.
- Một label tốt luôn cần bốn phần: **điểm quan sát**, **sự kiện bad**, **outcome window** và **quy tắc maturity**.
- Không dùng chung một khoảng thời gian quan sát cho mọi sản phẩm. BNPL, cash loan, thẻ tín dụng và behavior scorecard có nhịp rủi ro rất khác nhau.
- Kiểm tra cohort đã đủ mature, tức đã đủ thời gian để rủi ro xuất hiện, **trước khi** chia train/test.
- Gian lận, tất toán thỏa thuận, xóa nợ và tái cơ cấu cần rule riêng; nhét tất cả vào một flag “bad” sẽ gây khó khi theo dõi và review chính sách.

Sơ đồ dưới đây là cách nhìn tối thiểu về một label tín dụng. Điểm cần chú ý là label không xuất hiện ngay lúc giải ngân; bạn phải chờ đủ outcome window để rủi ro có cơ hội bộc lộ.

:::diagram[Outcome window — từ origination (T₀) đến label maturity]

![Outcome window — origination to label maturity](/blog/diagrams/credit-labels-outcome-window/outcome-window.svg)

:::

**Hình 1.** Outcome window nối thời điểm quan sát với thời điểm label đủ mature; nếu chốt label quá sớm, dữ liệu huấn luyện sẽ thiếu bad thật.

---

## VI

## 1. Tổng quan: Label là nền móng của credit model

Lần đầu tiên tôi build credit model, tôi nghĩ phần khó nhất sẽ là feature engineering, chọn model, hoặc tuning tham số. Hóa ra phần làm chậm dự án nhiều nhất lại là một câu hỏi nghe rất đơn giản: **ai được gọi là "bad"?**

Câu hỏi đó thường kéo theo vài cuộc họp với Risk, vài version document, và đôi khi một lần retrain không cần thiết vì business đang dùng definition khác data team. Với credit scoring, label không chỉ là target variable. Nó là cách tổ chức định nghĩa rủi ro để đưa vào quyết định thật.

Bài này đi qua các khái niệm tối thiểu cần chốt trước khi train model: DPD, bad flag, outcome window, label maturity, các họ label như Ever-90/FPD/MOB/roll-rate, và những lỗi khiến mô hình nhìn ổn trong notebook nhưng sai khi đưa vào policy.

## 2. Vấn đề thường gặp: Data Science và Risk không dùng cùng một định nghĩa

Một tình huống tôi gặp khá nhiều là Data Science train model bằng một định nghĩa, còn Risk hoặc Product lại ra quyết định bằng một định nghĩa khác. Ví dụ, team model dùng `DPD >= 30` trong 6 tháng, nhưng policy review lại quan tâm `DPD >= 60` trong 12 tháng. Hai thứ này không tương đương.

Vấn đề không nằm ở thuật toán. Vấn đề là mô hình đang học một câu hỏi khác với câu hỏi mà business thật sự cần trả lời. Khi đó, dù AUC đẹp, model vẫn có thể khó dùng trong phê duyệt, pricing, limit hoặc collection.

## 3. Khái niệm cốt lõi: DPD, bad flag, outcome window và label maturity

### 3.1. DPD là gì?

DPD (Days Past Due - số ngày quá hạn) đo số ngày khách hàng trễ thanh toán so với ngày đến hạn. Đây là ngôn ngữ nền tảng của rất nhiều credit label.

```
DPD = Ngày hiện tại − Ngày đến hạn thanh toán gần nhất bị trễ
```

Ví dụ: due date là 1/3, đến 15/3 vẫn chưa thanh toán → DPD = 14.

Bảng dưới đây không nói label nào “đúng nhất”. Nó cho thấy mỗi ngưỡng DPD đại diện cho một mức độ rủi ro khác nhau.

| Label | Định nghĩa DPD | Ghi chú |
|-------|---------------|---------|
| Bad-30 | DPD ≥ 30 bất kỳ lúc nào trong window | Nhạy hơn, bad rate cao hơn |
| Bad-60 | DPD ≥ 60 | Thường cân bằng hơn giữa signal và sample |
| Bad-90 | DPD ≥ 90 | Nặng hơn, gần với write-off/charge-off policy |
| Ever-90 | Từng đạt DPD 90+ trong window | Không yêu cầu liên tục |

Không có định nghĩa nào đúng trong chân không. Một label chỉ đúng khi nó khớp với **risk appetite**, product mechanics, và decision mà model sẽ phục vụ.

### 3.2. Bad flag là gì?

Bad flag là cột target mà mô hình học, thường có giá trị `1` nếu hồ sơ trở thành bad và `0` nếu không. Nhưng đừng để cái tên đơn giản này đánh lừa bạn. Đằng sau một `bad_flag` tốt phải có đủ bốn phần:

- **Observation point:** bạn bắt đầu quan sát từ đâu? Origination, approval date, statement date hay MOB cụ thể?
- **Bad event:** sự kiện nào được xem là bad? DPD 30, DPD 60, charge-off hay restructuring?
- **Outcome window:** bạn chờ bao lâu để rủi ro xuất hiện?
- **Maturity rule:** cohort nào đã đủ thời gian để kết luận good/bad?

Nếu thiếu một trong bốn phần này, label spec chưa đủ để train model một cách nghiêm túc.

### 3.3. Outcome window là gì?

Outcome window là khoảng thời gian từ **điểm quan sát** đến khi bạn gắn label. Ví dụ với window 12 tháng: khách vay tháng 1/2023, bạn nhìn hành vi đến tháng 1/2024. Nếu trong period đó có DPD ≥ 60, label = bad.

Hình dưới đây mô tả cách outcome window hoạt động trong một bài toán application score. Khi đọc hình, hãy để ý rằng feature được lấy tại thời điểm quan sát, còn label chỉ biết sau khi window kết thúc.

:::diagram[Từ origination (quan sát) tới ngày gắn nhãn]

![](/blog/diagrams/credit-labels-outcome-window/outcome-window-section.svg)

:::

**Hình 2.** Feature và label không đến từ cùng một thời điểm; feature nhìn tại lúc ra quyết định, còn label cần thời gian để mature.

Window là một trade-off thật sự, không phải tham số chọn đại:

- **Window ngắn (3-6 tháng):** dữ liệu mature nhanh hơn, nhưng có thể bỏ sót default muộn. Phù hợp hơn với BNPL hoặc khoản vay ngắn.
- **Window dài (12-24 tháng):** tín hiệu đầy đủ hơn, nhưng phải chờ lâu hơn. Phù hợp hơn với cash loan, personal loan hoặc mortgage.

### 3.4. Label maturity là gì?

Một cohort được gọi là mature khi phần lớn hồ sơ đã có đủ thời gian để thể hiện hành vi bad nếu họ sẽ bad. Nếu cohort chưa mature, bad rate thường vẫn tiếp tục tăng theo tháng quan sát.

Đây là lỗi rất dễ gặp: lấy cohort quá mới, gắn những hồ sơ chưa đủ thời gian là good, rồi train model. Khi đó, mô hình học từ outcome chưa hoàn chỉnh.

## 4. Ví dụ thực tế: Ever-30, Ever-60, FPD và MOB khác nhau thế nào?

Trong thực tế, “bad” thường được đặt tên theo ba trục: mức độ quá hạn, window, và điểm quan sát. Bảng dưới đây giúp bạn đọc nhanh ý nghĩa của từng họ label.

| Họ label | Cách hiểu | Khi nào dùng | Cần cẩn thận |
|---|---|---|---|
| Ever-30/60/90 in 12M | Trong 12 tháng, khách từng đạt DPD 30/60/90 | Application score, phê duyệt hồ sơ | Window phải đủ dài so với tenor |
| FPD / EPD | Khách trễ ngay kỳ đầu hoặc rất sớm sau giải ngân | Early warning, fraud/quality check channel | Dễ lẫn credit risk với fraud hoặc onboarding issue |
| MOB3 / MOB6 / MOB12 | Gắn label theo hành vi trong k tháng đầu sau booking | Sản phẩm ngắn hạn, feedback loop nhanh | Cần định nghĩa cumulative hay point-in-time |
| Roll-rate | Tài khoản chuyển từ bucket DPD này sang bucket xấu hơn | Card, revolving, collection | Phù hợp behavior score hơn application score |

Điểm quan trọng không phải thuộc tên label. Điểm quan trọng là đọc được câu hỏi nghiệp vụ phía sau label đó.

:::note[Về các biến kiểu FPD10/FPD15/FPT15]
Các tên như **FPD10/FPD15/FPT15** thường là naming convention nội bộ. Khi hand-off, đừng chỉ ghi tên biến; hãy ghi định nghĩa bằng lời và công thức.

- **FPD(x):** `1` nếu kỳ trả đầu tiên đạt DPD ≥ x trong khoảng quan sát đã thống nhất.
- **FPT(x):** `1` nếu đến cutoff date, khách chưa đáp ứng minimum payment theo rule hệ thống.
- **MOBk_Ever(t):** `1` nếu trong k tháng đầu sau booking có thời điểm DPD ≥ t.
:::

## 5. Cách làm trong dự án thật: Viết label spec trước khi EDA

Trước khi EDA, tôi muốn có một label spec ngắn. Không cần dài, nhưng phải đủ rõ để Risk, Product, Data và DS cùng hiểu một nghĩa.

Một label spec tối thiểu nên trả lời:

- Observation point là ngày nào?
- Bad event là DPD bao nhiêu, charge-off hay event khác?
- Outcome window dài bao lâu?
- Cohort nào được xem là mature?
- Fraud, settlement, restructuring, write-off xử lý thế nào?
- Train set và monitoring có dùng cùng định nghĩa không?

Để kiểm tra maturity, đoạn code dưới đây vẽ vintage bad rate. Đây thường là chart đầu tiên tôi muốn xem trước khi tin một label.

```python
import matplotlib.pyplot as plt

def plot_vintage_bad_rate(df, origination_col, mob_col, bad_col):
    """
    Vẽ bad rate tích lũy theo từng vintage.

    Input:
    - df: dữ liệu loan theo từng month-on-book
    - origination_col: tháng giải ngân hoặc tháng mở tài khoản
    - mob_col: MOB (Month on Book), ví dụ 1, 2, 3...
    - bad_col: cờ bad tích lũy tại từng MOB

    Output:
    - Biểu đồ bad rate tích lũy theo vintage
    """
    pivot = df.pivot_table(
        index=mob_col,
        columns=origination_col,
        values=bad_col,
        aggfunc="mean",
    )

    pivot.plot(figsize=(12, 5), alpha=0.7)
    plt.title("Vintage Cumulative Bad Rate by MOB")
    plt.xlabel("Month on Book")
    plt.ylabel("Cumulative Bad Rate")
    plt.legend(title="Origination Cohort", bbox_to_anchor=(1.05, 1))
    plt.tight_layout()
```

Nếu các đường vintage vẫn tăng mạnh ở cuối trục MOB, cohort chưa mature. Khi đó, split train/test ngay sẽ làm mô hình học từ dữ liệu chưa đủ thời gian phát triển bad.

## 6. Lỗi thường gặp khi gắn nhãn rủi ro

| Lỗi | Dấu hiệu | Hệ quả | Cách tránh |
|---|---|---|---|
| Dùng window quá ngắn | Bad rate vẫn tăng sau cutoff | Gắn nhầm good cho hồ sơ chưa đủ thời gian bad | Kiểm vintage maturity |
| Không thống nhất DPD threshold | Risk nói Bad-60, DS train Bad-30 | Model trả lời sai câu hỏi nghiệp vụ | Sign-off label spec trước EDA |
| Gộp fraud vào credit bad | Bad sớm bất thường theo channel | Model học fraud/onboarding thay vì credit risk | Exclude hoặc tách fraud label |
| Dùng cùng label cho mọi sản phẩm | BNPL, card, cash loan có curve khác nhau | Monitoring lệch theo product | Chọn window theo tenor và product mechanics |

:::note[Lưu ý]
Fraud case cần được xử lý riêng trước khi gắn label credit. Credit scoring dự báo willingness và ability to pay, không phải identity fraud.
:::

## 7. Gợi ý cho người mới

Nếu bạn mới làm credit scoring, hãy tập thói quen viết label spec trước khi viết notebook. Chỉ cần một trang cũng được, miễn là đủ rõ: bad là gì, quan sát từ đâu, chờ bao lâu, case nào exclude, và cohort nào đủ mature.

Khi ngồi với Risk hoặc Product, đừng hỏi “anh/chị muốn AUC bao nhiêu?”. Hãy hỏi trước: “Hồ sơ nào được xem là bad, và sau bao lâu thì mình chắc điều đó?”.

## 8. Hỏi đáp nhanh

**DPD 30 hay DPD 60 tốt hơn?**  
Không có câu trả lời chung. DPD 30 nhạy hơn nhưng noisy hơn; DPD 60 thường nghiêm hơn nhưng bad rate thấp hơn.

**Outcome window có nên dùng 12 tháng cho mọi sản phẩm không?**  
Không nên. Window phải đi theo tenor, sản phẩm và quyết định mà model phục vụ.

**Cohort chưa mature có dùng để train được không?**  
Không nên dùng như dữ liệu đã hoàn chỉnh. Nếu bắt buộc dùng, cần xử lý censoring hoặc thiết kế bài toán khác.

**Fraud có nên tính là bad không?**  
Thông thường không nên gộp trực tiếp vào credit bad. Fraud nên có rule hoặc model riêng.

## 9. Tài liệu tham khảo

Các tài liệu tham khảo chi tiết nằm ở phần cuối bài.

---

## EN

### The uncomfortable first question: who counts as bad?

The first time I built a credit model, I assumed the hard parts would be feature engineering, model selection, or hyperparameter tuning. The harder part was aligning with Risk on one deceptively simple question: **who counts as "bad"?**

That question can lead to multiple meetings, several document versions, and sometimes a full retrain because business policy and data logic are not using the same target. In credit scoring, a label is not just a machine-learning target. It is the institution's operational definition of risk.

This post covers the minimum set of decisions to settle before modeling: DPD, outcome windows, label maturity, Ever-90/FPD/MOB/roll-rate labels, and the traps that make a model look clean in a notebook but fail policy review.

---

### A credit label is a contract, not a column

In a dataset, the label may look like a simple `bad_flag`. In production, that flag represents an agreement: where observation starts, how long outcomes are measured, which event counts as bad, and which cases should be excluded from credit-risk modeling.

#### DPD — Days Past Due

DPD measures how many days a borrower is overdue relative to their payment due date.

```
DPD = Current date − Most recent missed due date
```

Example: due date is March 1st; as of March 15th, no payment has been made → DPD = 14.

**Common conventions:**

| Label | DPD Definition | Notes |
|-------|---------------|-------|
| Bad-30 | DPD ≥ 30 at any point in window | More lenient; higher bad rate |
| Bad-60 | DPD ≥ 60 | Balanced between signal and sample |
| Bad-90 | DPD ≥ 90 | Strict; near write-off policy |
| Ever-90 | Ever reached DPD 90+ | Does not require consecutive |

No definition is correct in isolation. A label is only correct when it matches the **portfolio risk appetite**, product mechanics, and decision the model will support.

---

#### The “label zoo” in practice: choosing the right target

In real projects, “bad” is usually defined along three axes: **(1) delinquency severity**, **(2) horizon/window**, and **(3) observation point** (application vs after-booking).

Here are the most common label families you’ll see in the market:

##### 1) Ever-delinquency within an outcome window (application PD-style)

- **Ever-30/60/90 in 12M/24M**: within 12/24 months from origination, the account reaches DPD ≥ 30/60/90 at least once.
- Used when the main objective is **application scoring** (approval decisions).

##### 2) FPD / EPD (early-warning / early performance)

- **FPD (First Payment Default)**: the borrower fails to make the **first scheduled payment** within a delinquency threshold (public sources often describe default in a 30+ DPD sense).
- **EPD (Early Payment Default)**: delinquency/default occurring **very early after origination**, commonly described as within the first **3–6 months** or **90–180 days**.

:::note[On names like FPD10/FPD15/FPT15]
Labels such as **FPD10/FPD15/FPT15** are often **internal naming conventions**. A common interpretation is “first-payment delinquency at \(x\)+ DPD” (e.g., 10+ or 15+ days late) or a “first payment test” rule specific to a platform. In documentation, always include the **plain-language definition + formula**, not just the label name.

A few **definition patterns** (templates; fill parameters per product):

- **FPD\(x\)** (first-installment delinquency threshold):
  - `FPD_x = 1` if the **first installment** reaches **DPD ≥ x** within **[first_due_date, first_due_date + grace_days]**
  - Parameters: `x` (10/15/30…), `grace_days` (policy-dependent), and whether partial payments count
- **FPT\(x\)** (first-payment test / first-cycle test):
  - `FPT_x = 1` if by a **cutoff_date** (e.g., end of cycle 1 or due_date + k days) the borrower **has not met minimum payment**, mapping to an **x+ DPD-equivalent** status under platform rules
  - Parameters: `cutoff_date`, minimum-payment rules, and platform-status → DPD-bucket mapping
- **MOBk_Ever\(t\)** (early performance in first k months):
  - `MOBk_Ever_t = 1` if within the **first k months on book** the account ever reaches **DPD ≥ t**
  - Parameters: `k` (3/6/12), `t` (30/60/90), and whether the label is cumulative vs point-in-time at MOBk
:::

##### 3) MOB-based labels (months-on-book)

- **MOB3 / MOB6 / MOB12**: assign labels based on behavior within the first 3/6/12 months on book.
- Typical examples: “**Ever-30 within MOB3**” or “**60+ by MOB6**”.
- Useful when you need faster feedback loops or you want a model aligned to **early performance**.

##### 4) Roll rate / next-cycle delinquency (revolving / collections)

- **Roll rate** measures the % of accounts that migrate from one delinquency bucket to a worse one in the next cycle (30→60, 60→90, etc.). This is common in credit cards and loss forecasting.
- Targets like “**next-cycle 30+**” or “**roll 30→60**” are often used for **behavior scoring** and collection strategies.

:::warning[Rule of thumb]
Never let label names hide the actual definition. Always specify **observation point**, **window**, **threshold**, **cumulative vs point-in-time**, and **exclusion rules** (fraud, restructuring, settlement, etc.).
:::

---

#### Outcome window: how long are you waiting for risk to show up?

The outcome window is the period from the **observation point** (usually loan origination) to when you **assign the label**.

:::diagram[Observation point to label date]

![](/blog/diagrams/credit-labels-outcome-window/outcome-window-section.svg)

:::

Example with a 12-month window: a loan originated in Jan 2023 is observed through Jan 2024. If DPD ≥ 60 occurs during that period → label = bad.

This is a real modeling trade-off, not a cosmetic parameter:

- **Short window (3–6 months)**: More data, faster training, but misses late defaults. Suitable for short-tenor products (BNPL, sub-6-month consumer loans).
- **Long window (12–24 months)**: Richer signal, but you must wait for data to mature. Suitable for personal loans, mortgage.

:::warning[Common mistake]
Using a short window for long-tenor products. Example: labeling a 24-month loan with a 6-month window — you only observe part of the risk.
:::

---

#### Label maturity: do not split data before outcomes are ready

A cohort is considered **mature** when most cases have had sufficient time to exhibit bad behavior (if they are going to).

**Signs a cohort is not yet mature:**

- Bad rate is still rising steadily by observation month (not yet flattening).
- A high number of cases are still "open" or "pending outcome."

**Practical check:** Plot bad rate by vintage — one curve per origination cohort. If curves are still sloping upward at the right edge, the cohort is not mature.

---

#### Other bad events: do not hide everything inside one flag

| Event | Meaning | Typical Timing |
|-------|---------|---------------|
| Charge-off | Bank writes the debt off its books | Usually after DPD 90–180 |
| Write-off | Similar to charge-off; policy-dependent | Varies |
| Settlement | Borrower pays partial; bank closes account | After serious delinquency |
| Bankruptcy | Personal/corporate insolvency | May occur without DPD history |
| Fraud | Identity fraud, not a credit default | Must be excluded from label |

:::note[Note]
Fraud cases must be **excluded** before assigning credit labels. A credit scoring model predicts *willingness and ability to pay*, not identity fraud.
:::

---

### Pre-label checklist before modeling

Before starting model training, answer all 7 questions. If the answers are unclear, the problem is not the algorithm yet.

- [ ] Bad definition (DPD threshold) signed off by Risk?
- [ ] Outcome window chosen to match product tenor?
- [ ] Cohort is mature? (verify with vintage curve)
- [ ] Fraud cases removed?
- [ ] Charge-off / write-off cases: include or exclude? (per definition)
- [ ] Definition consistent between training set and monitoring (population stability)?
- [ ] Definition documented and shared with the full team before EDA begins?

---

## Tham khảo / References

- Siddiqi, N. (2017). *Intelligent Credit Scoring*, 2nd ed. — Ch. 3: Bad Definition.
- Thomas, L. C. et al. (2017). *Credit Scoring and Its Applications*, 2nd ed. — Ch. 2.
- Anderson, R. (2007). *The Credit Scoring Toolkit* — Ch. 7: Data Preparation.
- Experian. *What Lenders Need to Know About First Payment Default (FPD).* https://experian.com/blogs/insights/first-payment-default
- CreditCards.com Glossary. *Roll rate definition.* https://www.creditcards.com/glossary/term-roll-rate/
- Oracle OFS Analytical Applications Docs. *Delinquent Roll Rate Computation.* https://docs.oracle.com/en/industries/financial-services/ofs-analytical-applications/loan-loss-forecasting/8.1.2.0.0/llfpug/delinquent-roll-rate-computation.html
- Bank of England (2024). *Credit risk: definition of default (Supervisory Statement).* https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2024/credit-risk-definition-of-default-supervisory-statement.pdf
