---
title: "Labels trong Credit Risk: 'Bad' là gì, Outcome Window và Maturity"
date: "2026-04-30"
excerpt: >
  Trước khi train bất kỳ model nào, bạn cần trả lời một câu hỏi tưởng chừng
  đơn giản: ai là "bad"? Bài này giải thích DPD, outcome window, label maturity
  và những cạm bẫy phổ biến khi định nghĩa target (Ever-90, FPD/EPD, MOBx, roll-rate...).
category: banking
---

> **Series: Credit Scoring Foundation** — Bài 1 / 6  
> Xem thêm: [A2 — Data Split & Leakage](#) · [A3 — OOT Evaluation](#)

---

## TL;DR

- **"Bad"** trong credit risk thường được định nghĩa bằng **DPD ≥ threshold** trong một **outcome window** cố định.
- Ngoài “ever-30/60/90”, thị trường còn dùng **FPD/EPD**, **MOBx**, **roll-rate/next-cycle** tuỳ mục tiêu (application vs early-warning vs behavior).
- Outcome window quá ngắn → bạn bỏ sót bad thật; quá dài → cohort chưa mature, tỷ lệ bad bị underestimate.
- **Label maturity** là điều kiện tiên quyết trước khi chia train/test — không phải sau.
- Charge-off, write-off, settlement đều là bad nhưng **không tương đương nhau** về timing và business implication.

---

## VI

### Tại sao định nghĩa label lại khó?

Lần đầu tiên tôi build credit model, tôi nghĩ phần khó nhất là feature engineering hay hyperparameter tuning. Hóa ra không phải — phần khó nhất là ngồi với Risk team để thống nhất: **ai được gọi là "bad"?**

Câu hỏi đó dẫn đến vài cuộc họp, vài version document, và 1 lần phải retrain lại model vì nhóm business dùng definition khác nhóm data.

Bài này ghi lại những khái niệm cốt lõi để bạn tránh được vòng lặp đó.

---

### Khái niệm nền tảng

#### DPD — Days Past Due

DPD (số ngày quá hạn) là chỉ số đo lường mức độ trễ thanh toán so với due date.

```
DPD = Ngày hiện tại − Ngày đến hạn thanh toán gần nhất bị trễ
```

Ví dụ: due date là 1/3, đến 15/3 vẫn chưa thanh toán → DPD = 14.

**Convention phổ biến:**

| Label | Định nghĩa DPD | Ghi chú |
|-------|---------------|---------|
| Bad-30 | DPD ≥ 30 bất kỳ lúc nào trong window | Lenient hơn, bad rate cao hơn |
| Bad-60 | DPD ≥ 60 | Balance giữa signal và sample |
| Bad-90 | DPD ≥ 90 | Strict, gần với write-off policy |
| Ever-90 | Ever reach DPD 90+ | Không cần consecutive |

Không có định nghĩa nào đúng tuyệt đối — chọn dựa trên **portfolio risk appetite** và **business objective** của mô hình.

---

#### “Label zoo” trên thị trường: chọn gì cho đúng mục tiêu?

Trong thực tế, “bad” thường được đặt tên theo 3 trục: **(1) mức độ quá hạn**, **(2) horizon/window**, **(3) điểm quan sát** (application vs after-booking).

Dưới đây là các họ label phổ biến bạn sẽ gặp trong industry:

##### 1) Ever-delinquency trong outcome window (application PD style)

- **Ever-30/60/90 in 12M/24M**: trong vòng 12/24 tháng kể từ origination, có thời điểm DPD ≥ 30/60/90.
- Dùng khi mục tiêu là **application score** (ra quyết định phê duyệt) và bạn muốn dự báo “có rơi vào delinquency nặng không”.

##### 2) FPD / EPD (early-warning, early performance)

- **FPD (First Payment Default)**: borrower **fail first scheduled payment** theo một threshold DPD nhất định (nhiều nguồn public nói ngưỡng 30+ DPD cho “default” theo nghĩa industry/bureau).
- **EPD (Early Payment Default)**: default/delinquency xảy ra **rất sớm sau origination**, thường được mô tả trong khoảng **3–6 tháng** hoặc **90–180 ngày** đầu.

:::note[Về các biến kiểu FPD10/FPD15/FPT15]
Các tên như **FPD10/FPD15/FPT15** thường là **naming convention nội bộ**. Cách hiểu phổ biến trong team analytics là “first-payment delinquency ở ngưỡng \(x\)+ DPD” (ví dụ 10+ hoặc 15+ ngày trễ) hoặc “first payment test” theo rule của hệ thống. Khi viết document/hand-off, nên ghi **định nghĩa bằng lời + công thức** thay vì chỉ nêu tên.

Một vài **definition patterns** (dạng khung, bạn điền tham số theo sản phẩm):

- **FPD\(x\)** (first-installment delinquency threshold):
  - `FPD_x = 1` nếu **kỳ trả đầu tiên** đạt **DPD ≥ x** trong khoảng **[first_due_date, first_due_date + grace_days]**
  - Tham số: `x` (10/15/30…), `grace_days` (tuỳ policy), “có tính payment partial không?”
- **FPT\(x\)** (first-payment test / first-cycle test):
  - `FPT_x = 1` nếu đến **cutoff_date** (ví dụ end-of-cycle 1 hoặc due_date + k ngày) khách **chưa đáp ứng minimum payment** và trạng thái tương đương **x+ DPD** theo rule hệ thống
  - Tham số: `cutoff_date`, rule “minimum payment”, mapping trạng thái hệ thống → DPD bucket
- **MOBk_Ever\(t\)** (early performance in first k months):
  - `MOBk_Ever_t = 1` nếu trong **k tháng đầu sau booking** có thời điểm **DPD ≥ t**
  - Tham số: `k` (3/6/12), `t` (30/60/90), “cumulative” hay “point-in-time tại MOBk”
:::

##### 3) MOB-based labels (behavior/early performance by months-on-book)

- **MOB3 / MOB6 / MOB12**: gắn label dựa trên hành vi trong **3/6/12 tháng đầu** sau booking.
- Ví dụ thường gặp: “**Ever-30 within MOB3**” (có 30+ DPD trong 3 tháng đầu) hoặc “**60+ by MOB6**”.
- Dùng khi bạn muốn mô hình phản ánh **early performance** (nhất là sản phẩm tenor ngắn hoặc khi muốn feedback loop nhanh).

##### 4) Roll-rate / next-cycle delinquency (revolving / collection)

- **Roll rate**: % account chuyển từ bucket DPD này sang bucket DPD xấu hơn ở kỳ sau (30→60, 60→90, …). Phổ biến trong revolving/credit card và loss forecasting.
- Label dạng “**next-cycle 30+**” hoặc “**roll 30→60**” thường dùng cho **behavior score** và chiến lược collection (ai cần can thiệp sớm để không roll tiếp).

:::warning[Nguyên tắc vàng]
Đừng để “tên label” che mất bản chất. Luôn viết rõ: **observation point**, **window**, **threshold**, **cumulative vs point-in-time**, và **exclusion rules** (fraud, restructuring, settlement…).
:::

---

#### Outcome Window

Outcome window là khoảng thời gian từ **điểm quan sát** (thường là thời điểm phê duyệt hồ sơ) đến khi bạn **gắn label**.

```mermaid
flowchart LR
  A["Origination_date"] --> B["Label_date"]
  A -->|"Outcome_window"| B
```

Ví dụ với window 12 tháng: khách vay tháng 1/2023, bạn nhìn hành vi đến tháng 1/2024. Nếu trong period đó có DPD ≥ 60 → label = bad.

**Trade-off:**

- **Window ngắn (3–6 tháng)**: dữ liệu nhiều, train nhanh, nhưng bỏ sót default muộn. Phù hợp sản phẩm vay ngắn hạn (BNPL, vay tiêu dùng < 6 tháng).
- **Window dài (12–24 tháng)**: signal đầy đủ hơn, nhưng phải chờ data mature. Phù hợp tín dụng cá nhân, mortgage.

:::warning[Sai lầm phổ biến]
Dùng window ngắn cho sản phẩm có tenor dài. Ví dụ: label vay 24 tháng bằng window 6 tháng — bạn chỉ thấy một phần rủi ro.
:::

---

#### Label Maturity

Một cohort được gọi là **mature** khi phần lớn các case đã có đủ thời gian để thể hiện hành vi bad (nếu họ sẽ bad).

**Dấu hiệu cohort chưa mature:**

- Bad rate tăng đều theo tháng quan sát (chưa flatten).
- Số case "still open" / "pending outcome" còn cao.

**Cách kiểm tra:**

Vẽ bad rate theo vintages — mỗi đường là một origination cohort. Nếu các đường vẫn đang dốc lên ở cuối trục hoành → chưa mature.

```python
import matplotlib.pyplot as plt

def plot_vintage_bad_rate(df, origination_col, mob_col, bad_col):
    """
    df: one row per loan per month-on-book (MOB)
    mob_col: month-on-book (1, 2, 3, ...)
    bad_col: 1 nếu đã bad tại MOB đó (cumulative)
    """
    pivot = df.pivot_table(
        index=mob_col,
        columns=origination_col,
        values=bad_col,
        aggfunc="mean"
    )
    pivot.plot(figsize=(12, 5), alpha=0.7)
    plt.title("Vintage Cumulative Bad Rate by MOB")
    plt.xlabel("Month on Book")
    plt.ylabel("Cumulative Bad Rate")
    plt.legend(title="Origination Cohort", bbox_to_anchor=(1.05, 1))
    plt.tight_layout()
```

---

#### Các loại bad khác ngoài DPD

| Event | Ý nghĩa | Timing điển hình |
|-------|---------|-----------------|
| Charge-off | Ngân hàng xóa nợ khỏi sổ sách | Thường sau DPD 90–180 |
| Write-off | Tương tự charge-off, phụ thuộc policy | Varies |
| Settlement | Khách trả một phần, ngân hàng chấp nhận đóng | Sau khi đã bad nặng |
| Bankruptcy | Phá sản cá nhân / doanh nghiệp | Có thể xảy ra mà không qua DPD |
| Fraud | Gian lận, không phải credit default | Phải exclude khỏi label |

:::note[Lưu ý]
Fraud case cần được **exclude** trước khi gắn label credit. Model credit scoring dự báo *willingness + ability to pay*, không phải identity fraud.
:::

---

### Checklist trước khi gắn label

Trước khi bắt đầu train, trả lời đủ 7 câu hỏi này:

- [ ] Bad definition (DPD threshold) đã được Risk sign-off?
- [ ] Outcome window đã được chọn phù hợp với tenor sản phẩm?
- [ ] Cohort đã mature? (vẽ vintage curve kiểm tra)
- [ ] Fraud case đã được loại bỏ?
- [ ] Charge-off / write-off case đã được include hay exclude? (tùy định nghĩa)
- [ ] Definition đồng nhất giữa train set và monitoring (population stability)?
- [ ] Document lại definition và chia sẻ với cả team trước khi bắt đầu EDA

---

## EN

### Why is label definition so hard?

The first time I built a credit model, I assumed the hard parts would be feature engineering or hyperparameter tuning. It turned out the hardest part was agreeing with the Risk team on one deceptively simple question: **who counts as "bad"?**

That question led to multiple meetings, multiple document versions, and one full model retrain because the business team used a different definition from the data team.

This post documents the core concepts to help you avoid that cycle.

---

### Core Concepts

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

No definition is universally correct — choose based on your **portfolio's risk appetite** and **model objective**.

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

#### Outcome Window

The outcome window is the period from the **observation point** (usually loan origination) to when you **assign the label**.

```mermaid
flowchart LR
  A["Origination_date"] --> B["Label_date"]
  A -->|"Outcome_window"| B
```

Example with a 12-month window: a loan originated in Jan 2023 is observed through Jan 2024. If DPD ≥ 60 occurs during that period → label = bad.

**Trade-offs:**

- **Short window (3–6 months)**: More data, faster training, but misses late defaults. Suitable for short-tenor products (BNPL, sub-6-month consumer loans).
- **Long window (12–24 months)**: Richer signal, but you must wait for data to mature. Suitable for personal loans, mortgage.

:::warning[Common mistake]
Using a short window for long-tenor products. Example: labeling a 24-month loan with a 6-month window — you only observe part of the risk.
:::

---

#### Label Maturity

A cohort is considered **mature** when most cases have had sufficient time to exhibit bad behavior (if they are going to).

**Signs a cohort is not yet mature:**

- Bad rate is still rising steadily by observation month (not yet flattening).
- A high number of cases are still "open" or "pending outcome."

**How to check:** Plot bad rate by vintage — one curve per origination cohort. If curves are still sloping upward at the right edge, the cohort is not mature.

---

#### Other Types of "Bad" Beyond DPD

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

### Pre-labeling Checklist

Before starting model training, answer all 7 questions:

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

