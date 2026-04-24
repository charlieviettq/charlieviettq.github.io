---
title: "WOE và IV: Nghệ thuật 'gạn đục khơi trong' cho dữ liệu tín dụng"
date: "2026-03-18"
excerpt: "Làm sao để tìm ra những 'viên ngọc quý' trong đống dữ liệu thô? Hãy học cách dùng WOE và IV để sàng lọc và chuẩn hóa đặc trưng cho các mô hình chấm điểm tín dụng."
category: data-science
---

## VI

### Tóm lược

- **WOE (Weight of Evidence)** giúp bạn biến những dữ liệu hỗn loạn thành những con số có quy luật, đồng thời kiểm tra xem quy luật đó có hợp lý (đơn điệu) hay không.
- **IV (Information Value)** giống như một cái cân, giúp bạn sàng lọc xem biến nào có giá trị dự báo cao, biến nào chỉ là "nhiễu".
- Hãy cảnh giác với IV quá cao — thường đó là dấu hiệu của việc "lộ đề" (Leakage) chứ không phải bạn vừa tìm ra một siêu tính năng đâu.

### Giới thiệu

Hãy tưởng tượng bạn là một người đãi vàng. Trước mắt bạn là hàng tấn đất cát (dữ liệu thô). Làm sao để bạn biết đâu là những mẩu vàng quý giá, đâu là sỏi đá vô tri? Trong giới làm mô hình chấm điểm tín dụng (Credit Scoring), **WOE và IV** chính là những cái sàng và cái cân chuyên dụng nhất của người thợ đãi vàng.

Bài viết này mình dành cho các bạn Data Scientist muốn làm chủ bộ công cụ này: biết khi nào nó hữu ích, khi nào nó lừa dối, và làm sao để không biến AI thành một "kẻ ăn may" nhờ những biến số ảo.

### Khái niệm cốt lõi: Sàng lọc và Định lượng

1. **WOE (Trọng số của bằng chứng):** Thay vì để các nhóm dữ liệu rời rạc, WOE mã hóa chúng dựa trên tỷ lệ "người tốt" và "người xấu". Nó giúp bạn thấy rõ: "Nhóm khách hàng này có khả năng nợ xấu cao gấp bao nhiêu lần mức trung bình?".

2. **IV (Giá trị thông tin):** Đây là con số tổng hợp từ WOE. Nó cho bạn biết sức mạnh tổng thể của một biến số. Một biến có IV thấp giống như một người nói chuyện mông lung, chẳng cung cấp được thông tin gì hữu ích để ra quyết định.

3. **Tính đơn điệu (Monotonicity):** Sau khi gom nhóm, xu hướng của WOE phải mạch lạc. Ví dụ: Thu nhập càng cao thì WOE phải tăng dần (hoặc giảm dần). Nếu nó nhảy zig-zag, chứng tỏ cách chia nhóm của bạn đang có vấn đề.

### Chi tiết từ "hiện trường"

Đừng chia nhóm (binning) quá vụn vặt. Hãy bắt đầu với những nhóm lớn, sau đó mới tinh chỉnh. Riêng với những dữ liệu bị thiếu (Missing), đừng vội vàng điền đại một con số nào đó. Hãy cho nó một "phòng riêng" (bin riêng) để xem bản thân việc "thiếu dữ liệu" có mang lại thông tin gì không.

**Ví dụ tính WOE và IV với số cụ thể:**

Giả sử biến `thu nhập hàng tháng` với tổng 5,000 khách hàng (1,000 bad, 4,000 good):

| Bin | Bad trong bin | Good trong bin | % Bad | % Good | WOE | IV contribution |
|---|---|---|---|---|---|---|
| 0 – 5 triệu | 400 | 600 | 40% | 15% | ln(40%/15%) = **+0.98** | (0.40−0.15)×0.98 = **0.245** |
| 5 – 15 triệu | 450 | 2,100 | 45% | 52.5% | ln(45%/52.5%) = **−0.15** | (0.45−0.525)×(−0.15) = **0.011** |
| > 15 triệu | 150 | 1,300 | 15% | 32.5% | ln(15%/32.5%) = **−0.77** | (0.15−0.325)×(−0.77) = **0.135** |
| **Tổng IV** | | | | | | **0.391** |

**Đọc kết quả:**
- Bin 0–5tr có WOE = **+0.98** → nhóm này có tỷ lệ bad cao hơn trung bình 2.7 lần (e^0.98 ≈ 2.7)
- Bin >15tr có WOE = **−0.77** → nhóm này bad ít hơn trung bình đáng kể
- IV tổng = **0.391** → biến mạnh, đáng đưa vào model (nhưng cần check leakage)
- WOE giảm dần từ bin thấp đến cao → **monotone** ✅ — hợp logic nghiệp vụ

**Thang đo sức mạnh IV (chuẩn ngành):**

| Chỉ số IV | Ý nghĩa thực sự | Hành động |
|---|---|---|
| < 0.02 | Biến mờ nhạt, ít giá trị | Loại bỏ |
| 0.02 – 0.10 | Yếu — có thể đưa vào pool | Xem xét kỹ |
| 0.10 – 0.30 | Trung bình — có triển vọng | Kiểm tra monotonicity và stability |
| 0.30 – 0.50 | Mạnh — candidate tốt | Kiểm tra leakage |
| > 0.50 | Rất mạnh — **đáng nghi** | **Kiểm tra nguồn data ngay** |

### Code thực tế: Tính WOE/IV với Python

Hai thư viện phổ biến nhất trong ngành: `scorecardpy` (đơn giản, phổ biến tại châu Á) và `optbinning` (nghiêm ngặt hơn, hỗ trợ monotonicity constraint).

```python
import numpy as np
import pandas as pd
import scorecardpy as sc

# --- Cách 1: Tính thủ công để hiểu công thức ---
def calc_woe_iv(df: pd.DataFrame, feature: str, target: str) -> pd.DataFrame:
    total_bad  = df[target].sum()
    total_good = (df[target] == 0).sum()

    grouped = df.groupby(feature)[target].agg(['sum', 'count'])
    grouped.columns = ['bad', 'total']
    grouped['good'] = grouped['total'] - grouped['bad']

    grouped['pct_bad']  = grouped['bad']  / total_bad
    grouped['pct_good'] = grouped['good'] / total_good

    eps = 1e-6  # tránh log(0)
    grouped['WOE'] = np.log((grouped['pct_bad'] + eps) / (grouped['pct_good'] + eps))
    grouped['IV']  = (grouped['pct_bad'] - grouped['pct_good']) * grouped['WOE']
    grouped['IV_total'] = grouped['IV'].sum()
    return grouped

# --- Cách 2: scorecardpy — chuẩn production ---
# Tự động binning + enforce monotonicity
bins = sc.woebin(
    df, y='bad_flag',
    x=['monthly_income', 'dpd_max_6m', 'job_tenure_months'],
    bin_num_limit=6,
    # monotonic_binning=True  # bật nếu muốn enforce
)

# Tóm tắt IV của tất cả biến
iv_table = pd.DataFrame({
    col: {'IV': bins[col]['total_iv'].iloc[0]}
    for col in bins
}).T.sort_values('IV', ascending=False)
print(iv_table)
# monthly_income    0.391
# dpd_max_6m        0.312
# job_tenure_months 0.087

# Transform sang WOE values để đưa vào Logistic Regression
train_woe = sc.woebin_ply(train_df, bins)
# ⚠️  QUAN TRỌNG: dùng đúng bảng bins này trên production
# Không recalculate lại trên data mới — WOE map phải được lock khi deploy

# --- Cách 3: optbinning — mạnh hơn, hỗ trợ nhiều constraint ---
from optbinning import BinningProcess

binning_process = BinningProcess(
    variable_names=['monthly_income', 'dpd_max_6m'],
    categorical_variables=[],
    max_n_bins=6,
    min_bin_size=0.05,   # mỗi bin tối thiểu 5% population
    monotonic_trend='auto'
)
binning_process.fit(X_train, y_train)
print(binning_process.summary()[['name', 'iv', 'js']].sort_values('iv', ascending=False))
```

### Những rủi ro cần cảnh giác

- **Lộ đề (Leakage):** Bạn vô tình dùng những thông tin chỉ có được *sau khi* khách hàng đã nợ xấu để dự báo cho lúc họ mới nộp đơn.
- **Dùng lại bản đồ cũ:** Sử dụng bảng mã hóa WOE của năm ngoái cho tệp khách hàng của năm nay, trong khi hành vi tiêu dùng đã thay đổi hoàn toàn.

### Kết luận

WOE và IV giống như chiếc kính lúp giúp bạn soi rõ từng đặc trưng của dữ liệu. Nhưng hãy nhớ, chúng không chứng minh được quan hệ nhân quả. Bạn cần kết hợp với kiến thức nghiệp vụ và những bài kiểm tra thực tế khác để tạo ra một mô hình "vàng ròng" thực thụ.

---

## EN

### At a glance

- **WOE (Weight of Evidence)** transforms messy categories into logical numbers and checks if your predictive trends make sense (**Monotonicity**).
- **IV (Information Value)** acts like a scale, helping you sift high-value predictors from background "noise."
- Beware of extreme IV scores — they usually signal **Data Leakage** rather than a "silver bullet" feature.

### Introduction

Imagine you're a gold miner. You're faced with tons of raw dirt (raw data). How do you know which buckets contain gold and which are just gravel? In the world of Credit Scoring, **WOE and IV** are your professional sieves and scales.

This post is for Data Scientists who want to master this toolkit: knowing when it helps, when it misleads, and how to avoid letting "lucky" variables ruin your model's integrity.

### A Worked Example With Real Numbers

Suppose you have `monthly_income` as a variable, with 5,000 total customers (1,000 bad, 4,000 good):

| Bin | Bad | Good | % Bad | % Good | WOE | IV contribution |
|---|---|---|---|---|---|---|
| 0 – 5M VND | 400 | 600 | 40% | 15% | ln(0.40/0.15) = **+0.98** | (0.40−0.15)×0.98 = **0.245** |
| 5 – 15M VND | 450 | 2,100 | 45% | 52.5% | ln(0.45/0.525) = **−0.15** | (0.45−0.525)×(−0.15) = **0.011** |
| > 15M VND | 150 | 1,300 | 15% | 32.5% | ln(0.15/0.325) = **−0.77** | (0.15−0.325)×(−0.77) = **0.135** |
| **Total IV** | | | | | | **0.391** |

**Reading the results:**
- Bin 0–5M: WOE = +0.98 → this group has 2.7× the bad rate of the overall population
- Bin >15M: WOE = −0.77 → this group has significantly lower bad rates
- WOE decreases consistently as income rises → **monotone** ✅ — logically consistent
- Total IV = 0.391 → strong predictor candidate; worth including but check for leakage

**IV Strength Reference:**

| IV Range | Assessment | Action |
|---|---|---|
| < 0.02 | Too weak | Drop |
| 0.02 – 0.10 | Weak | Consider in pool, review PSI |
| 0.10 – 0.30 | Medium | Check monotonicity and stability |
| 0.30 – 0.50 | Strong | Good candidate; check for leakage |
| > 0.50 | Suspiciously strong | **Investigate data source immediately** |

**Practical tip:** A variable like `time_on_book` (how long the customer has been a client) often shows very high IV — because long-tenure customers are inherently lower risk by selection. But using it as a feature risks encoding approval history bias rather than genuine creditworthiness signal. Always ask: "Does this variable measure the customer, or does it measure our previous decisions about the customer?"

### Code Reference — WOE/IV in Python

Two production-grade options: `scorecardpy` (concise, widely adopted across Asian banking teams) and `optbinning` (rigorous monotonicity enforcement, preferred in Basel-governed environments).

```python
import numpy as np
import pandas as pd
import scorecardpy as sc

# --- Option A: scorecardpy (fast iteration) ---
bins = sc.woebin(
    df, y='bad_flag',
    x=['monthly_income', 'dpd_max_6m', 'job_tenure_months'],
    bin_num_limit=6,
)

# IV summary across all variables
iv_summary = pd.DataFrame({
    col: {'IV': bins[col]['total_iv'].iloc[0]}
    for col in bins
}).T.sort_values('IV', ascending=False)
print(iv_summary)
# monthly_income    0.391   ← strong; check for leakage
# dpd_max_6m        0.312
# job_tenure_months 0.087   ← weak; consider dropping

# Transform to WOE-encoded features for Logistic Regression
train_woe = sc.woebin_ply(train_df, bins)
# ⚠️  CRITICAL: save and freeze `bins` at deployment time.
# Never recalculate WOE bins on production data — the encoding map must be locked.

# --- Option B: optbinning (strict monotonicity, Basel-aligned) ---
from optbinning import BinningProcess

binning_process = BinningProcess(
    variable_names=['monthly_income', 'dpd_max_6m'],
    categorical_variables=[],
    max_n_bins=6,
    min_bin_size=0.05,       # at least 5% of population per bin
    monotonic_trend='auto'   # auto-detect increasing or decreasing
)
binning_process.fit(X_train, y_train)
print(binning_process.summary()[['name', 'iv', 'js']].sort_values('iv', ascending=False))
```

### Pitfalls and Failure Modes

- **Leakage:** Accidentally using information known only *after* the outcome (e.g., "number of overdue calls received") to predict the starting state.
- **Stale Maps:** Reusing last year's WOE encoding tables on this year's population when economic behaviors have shifted. The bins and WOE values must be recomputed when you retrain — never carry them across model generations without validation.
- **Non-monotone bins accepted silently:** If WOE zigzags (high income → higher bad rate than medium income), the variable encoding is wrong. Don't include it until you understand why.

### Takeaways

WOE and IV are the most practical tools for feature screening in credit scoring — not because they're the most sophisticated, but because every number they produce has a direct business interpretation. A WOE of +0.98 for low-income borrowers is something you can explain to a risk officer, a regulator, and a junior analyst in the same sentence.

Pair them with domain knowledge and stability testing. The sieve finds the gold; judgment tells you whether it's actually gold.

---

**References**
- Kalatzis, A.E.G. et al. (2025). Machine learning powered financial credit scoring: a systematic literature review. *Artificial Intelligence Review*, 58, 144. [link.springer.com](https://link.springer.com/article/10.1007/s10462-025-11416-2) — Reviews 63 papers (2018–2024) on ML credit scoring methods; covers WOE-based feature engineering across approaches.
- Chen, S., Calabrese, R., & Martin-Barragan, B. (2024). Interpretable machine learning for imbalanced credit scoring datasets. *European Journal of Operational Research*, 312(1), 357–372. [ideas.repec.org](https://ideas.repec.org/a/eee/ejores/v312y2024i1p357-372.html) — Analyses how class imbalance degrades SHAP/LIME stability; reinforces the practical robustness advantage of WOE-based encodings.
- EBA (November 2025). *AI Act: Implications for the EU Banking and Payments Sector*. [eba.europa.eu](https://www.eba.europa.eu/sites/default/files/2025-11/d8b999ce-a1d9-4964-9606-971bbc2aaf89/AI%20Act%20implications%20for%20the%20EU%20banking%20sector.pdf) — Classifies ML-based credit scoring as high-risk AI; WOE+LogReg scorecards with fixed weights may be exempt.
- `scorecardpy`: [github.com/ShichenLiu/scorecardpy](https://github.com/ShichenLiu/scorecardpy)
- `optbinning`: [gnpalencia.org/optbinning](https://gnpalencia.org/optbinning/)
