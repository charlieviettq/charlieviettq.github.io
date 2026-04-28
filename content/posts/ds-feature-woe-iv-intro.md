---
title: "WOE và IV: Nghệ thuật 'gạn đục khơi trong' cho dữ liệu tín dụng"
date: "2026-03-18"
excerpt: "Làm sao để tìm ra những 'viên ngọc quý' trong đống dữ liệu thô? Công thức WOE, ngưỡng IV cụ thể, optimal binning, missing value treatment và cách kiểm tra stability của WOE bins theo thời gian."
category: data-science
---

## VI

### Tóm lược

- **WOE (Weight of Evidence):** `WOE_i = ln(%Good_i / %Bad_i)` — mã hóa từng bin thành một con số phản ánh mức độ rủi ro tương đối so với tổng thể.
- **IV (Information Value):** `IV = Σ (%Good_i − %Bad_i) × WOE_i` — thang đo cụ thể: < 0.02 = vô nghĩa, 0.02-0.1 = yếu, 0.1-0.3 = trung bình, 0.3-0.5 = mạnh, > 0.5 = nghi ngờ leakage.
- Dữ liệu **Missing** không phải trash — hãy cho nó một bin riêng, nó thường mang predictive power cao bất ngờ.
- **WOE stability** theo thời gian cũng quan trọng không kém IV cao: bin của năm ngoái có còn dùng được cho năm nay không?

### Giới thiệu

Hãy tưởng tượng bạn là người đãi vàng. Trước mắt là hàng tấn đất cát (dữ liệu thô). Làm sao biết đâu là vàng, đâu là sỏi?

Trong Credit Scoring, **WOE và IV** là bộ đôi sàng và cân chuyên dụng. Nhưng không giống như nhiều bài viết chỉ giải thích khái niệm, mình sẽ đi thẳng vào công thức, ngưỡng cụ thể, và những cạm bẫy mà ngay cả DS giàu kinh nghiệm cũng hay mắc phải.

### Công thức WOE và IV

**Convention:** Trong credit scoring, thường quy ước:
- **Good** = khách hàng không nợ xấu (target = 0)
- **Bad** = khách hàng nợ xấu (target = 1)

```
WOE_i = ln(Distribution_Good_i / Distribution_Bad_i)
       = ln(%Good_i / %Bad_i)

Trong đó:
  %Good_i = (số khách hàng Good trong bin i) / (tổng số khách hàng Good)
  %Bad_i  = (số khách hàng Bad  trong bin i) / (tổng số khách hàng Bad)

IV = Σ (%Good_i − %Bad_i) × WOE_i
```

**Đọc WOE:**
- WOE > 0: bin này có tỷ lệ Good cao hơn trung bình → **low risk**
- WOE < 0: bin này có tỷ lệ Bad cao hơn trung bình → **high risk**
- WOE ≈ 0: bin này không phân biệt được Good/Bad

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

### Ngưỡng IV cụ thể

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

# --- Cách 1: scorecardpy — chuẩn production ---
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
# ⚠️  QUAN TRỌNG: lock bảng bins này khi deploy
# Không recalculate lại trên data mới — WOE map phải được freeze

# --- Cách 2: optbinning — mạnh hơn, hỗ trợ nhiều constraint ---
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

### Python Implementation

```python
import pandas as pd
import numpy as np

def woe_iv(df: pd.DataFrame, feature: str, target: str,
           bins: int = 10, min_bin_pct: float = 0.05) -> tuple[pd.DataFrame, float]:
    """
    Compute WOE and IV for a numeric feature.
    target: 1 = Bad (default), 0 = Good (non-default)
    """
    df = df[[feature, target]].copy()

    # Handle missing values as a separate bin
    missing_mask = df[feature].isna()
    df_non_missing = df[~missing_mask].copy()
    df_missing = df[missing_mask].copy()

    # Bin non-missing values using quantile cuts
    df_non_missing['bin'] = pd.qcut(
        df_non_missing[feature], q=bins, duplicates='drop'
    )

    def compute_stats(subset):
        agg = subset.groupby('bin', observed=True)[target].agg(['sum', 'count'])
        agg.columns = ['bad', 'total']
        agg['good'] = agg['total'] - agg['bad']
        return agg

    stats = compute_stats(df_non_missing)

    # Add missing bin if it exists
    if len(df_missing) > 0:
        missing_stats = pd.DataFrame({
            'bad': [df_missing[target].sum()],
            'total': [len(df_missing)],
            'good': [len(df_missing) - df_missing[target].sum()],
        }, index=['MISSING'])
        stats = pd.concat([stats, missing_stats])

    total_good = stats['good'].sum()
    total_bad = stats['bad'].sum()

    stats['pct_good'] = stats['good'] / total_good
    stats['pct_bad']  = stats['bad']  / total_bad

    # Avoid log(0)
    stats['pct_good'] = stats['pct_good'].clip(lower=1e-4)
    stats['pct_bad']  = stats['pct_bad'].clip(lower=1e-4)

    stats['woe']    = np.log(stats['pct_good'] / stats['pct_bad'])
    stats['iv_bin'] = (stats['pct_good'] - stats['pct_bad']) * stats['woe']

    iv_total = stats['iv_bin'].sum()
    return stats, round(iv_total, 4)

# Usage
woe_table, iv = woe_iv(df, feature='monthly_income', target='is_default')
print(f"IV = {iv}")
print(woe_table[['bad', 'good', 'pct_bad', 'pct_good', 'woe', 'iv_bin']])
```

### Monotonicity: WOE phải mạch lạc

Sau khi binning, xu hướng WOE phải đơn điệu (monotonic). Ví dụ với `monthly_income`:

| Bin | Avg Income | WOE | Interpretation |
|-----|-----------|-----|----------------|
| 1 | < 3M | -1.82 | Very high risk |
| 2 | 3-5M | -0.94 | High risk |
| 3 | 5-8M | -0.21 | Moderate risk |
| 4 | 8-12M | +0.43 | Low risk |
| 5 | > 12M | +1.15 | Very low risk |

WOE tăng dần từ bin 1 đến 5 → monotonic → **binning hợp lý**.

Nếu WOE nhảy zig-zag (ví dụ: -1.2, +0.3, -0.8, +1.1): binning quá vụn, hoặc feature này không có mối quan hệ linear với risk. Giải pháp: coarsen bins, hoặc tạo feature mới (log transform, bucketing tay dựa trên domain knowledge).

### Missing Value Bin: Đừng bỏ qua

```python
# ĐỪNG làm thế này
df['monthly_income'].fillna(df['monthly_income'].median(), inplace=True)

# HÃY làm thế này
# Để WOE/IV tính separate bin cho missing
# Sau đó quyết định dựa trên WOE của MISSING bin

# Nếu WOE(MISSING) = -1.5 → khách hàng thiếu income data = high risk
# → Missing mang thông tin quan trọng, không được fill trước khi WOE

# Nếu WOE(MISSING) ≈ 0 → missing ngẫu nhiên, có thể fill sau
```

Trong thực tế tại digital bank: khách hàng **không khai báo thu nhập** thường có WOE rất âm (high risk) — vì họ không muốn lộ thu nhập thấp. Đây là signal mạnh mà fillna sẽ xóa sạch.

### WOE Stability: Bins năm ngoái dùng cho năm nay?

IV cao không đủ — cần kiểm tra WOE của từng bin có stable theo thời gian không. Dùng PSI trên WOE distribution (không phải raw feature):

```python
def woe_stability_check(dev_woe_table, prod_df, feature, target, bins=10):
    """Check if WOE table from dev period is still valid on current data."""
    # Apply dev bins to prod data
    prod_woe_table, _ = woe_iv(prod_df, feature, target, bins)

    # Compare WOE values per bin
    comparison = dev_woe_table[['woe']].rename(columns={'woe': 'woe_dev'}).join(
        prod_woe_table[['woe']].rename(columns={'woe': 'woe_prod'}),
        how='outer'
    )
    comparison['woe_shift'] = abs(comparison['woe_dev'] - comparison['woe_prod'])
    return comparison
```

Nếu WOE của một bin shift > 0.5 giữa dev và prod → bin đó không còn reliable → cần rebinning.

**Rule of thumb:** WOE table cần được rebuild ít nhất mỗi 12 tháng, hoặc bất cứ khi nào PSI của feature đó vượt 0.20.

### Leakage: Dấu hiệu nhận biết

IV > 0.5 thường là dấu hiệu leakage. Các leakage patterns phổ biến trong credit:

| Pattern | Ví dụ | Tại sao sai |
|---------|-------|-------------|
| Post-outcome feature | `days_overdue_at_observation` | Chỉ có sau khi nợ xấu xảy ra |
| Future feature | `balance_next_month` | Dùng thông tin tương lai để predict quá khứ |
| Proxy feature | `collection_flag` | Trực tiếp reflect outcome |

```python
# Kiểm tra leakage đơn giản: correlation với target
suspicious = df.corrwith(df['is_default']).abs()
high_corr = suspicious[suspicious > 0.5]
print("Suspicious high-correlation features:")
print(high_corr.sort_values(ascending=False))
```

### Kết luận

WOE và IV là kính lúp, không phải kính thiên văn. Chúng không thấy được quan hệ nhân quả, nhưng cực kỳ tốt ở việc cho bạn biết: "Feature này có predictive power không, và mối quan hệ có mạch lạc không?" Kết hợp với kiến thức nghiệp vụ và stability check theo thời gian — đây là bộ công cụ không thể thiếu cho bất kỳ credit scoring project nào.

---

## EN

### At a glance

- **WOE formula:** `WOE_i = ln(%Good_i / %Bad_i)` — encodes each bin as a log-odds ratio relative to the overall population.
- **IV thresholds:** < 0.02 = useless | 0.02–0.1 = weak | 0.1–0.3 = medium | 0.3–0.5 = strong | > 0.5 = **check for leakage**.
- **Missing values** deserve their own bin — they often carry strong predictive signal in credit data.
- High IV is necessary but not sufficient: WOE bins must also be **stable over time**.

### Introduction

WOE (Weight of Evidence) and IV (Information Value) are standard tools in the credit scoring toolkit — but most explanations stop at the concept. This post goes straight to formulas, concrete thresholds, implementation, and the failure modes that experienced practitioners still hit.

### WOE and IV: The Formulas

**Convention:** Good = non-default (target = 0); Bad = default (target = 1).

```
WOE_i = ln(Distribution_Good_i / Distribution_Bad_i)
       = ln(%Good_i / %Bad_i)

IV = Σ (%Good_i − %Bad_i) × WOE_i
```

**Reading WOE:**
- WOE > 0: bin has more Goods than average → lower risk
- WOE < 0: bin has more Bads than average → higher risk
- WOE ≈ 0: bin provides no discriminatory power

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

**Practical tip:** A variable like `time_on_book` often shows very high IV — long-tenure customers are inherently lower risk by selection. But it risks encoding approval history bias rather than genuine creditworthiness signal. Always ask: "Does this variable measure the customer, or our previous decisions about the customer?"

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

### Monotonicity Check

WOE values should increase (or decrease) monotonically across bins for numeric features. If WOE zigzags (e.g., -1.2, +0.3, -0.8), either your bins are too granular or the feature has a non-linear relationship with risk. Fix: coarsen bins or apply a domain-driven transformation (log, square root, manual bucketing).

### Missing Values: Don't Impute Before WOE

A common mistake: imputing median before computing WOE. This destroys the signal that "missing income" carries.

In digital banking: customers who skip income fields tend to be higher risk. Their WOE bin often shows WOE = −1.5 or lower — a strong predictor. Imputing median makes them indistinguishable from mid-income customers.

**Rule:** Always compute WOE on the raw data with `MISSING` as a separate bin. Decide on imputation strategy *after* seeing the bin's WOE.

### WOE Stability Over Time

High IV at development time doesn't guarantee the WOE table remains valid 12 months later. Monitor with PSI per bin:

- If a bin's WOE shifts > 0.5 between dev and production → that bin is unreliable
- Rebuild WOE tables at least annually, or whenever the feature's PSI exceeds 0.20

### Pitfalls and Failure Modes

- **Leakage:** Accidentally using information known only *after* the outcome (e.g., "number of overdue calls received") to predict the starting state.
- **Stale Maps:** Reusing last year's WOE encoding tables on this year's population when economic behaviors have shifted. Bins and WOE values must be recomputed when you retrain.
- **Non-monotone bins accepted silently:** If WOE zigzags (high income → higher bad rate than medium income), the variable encoding is wrong.

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
