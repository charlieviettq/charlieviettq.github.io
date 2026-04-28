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

### Ngưỡng IV cụ thể

| IV | Ý nghĩa | Hành động |
|----|---------|-----------|
| < 0.02 | Vô nghĩa | Loại bỏ feature |
| 0.02 – 0.1 | Yếu | Có thể giữ nếu stable, kết hợp với feature khác |
| 0.1 – 0.3 | Trung bình | Feature tốt, giữ lại |
| 0.3 – 0.5 | Mạnh | Feature rất tốt |
| > 0.5 | Nghi ngờ | Kiểm tra leakage ngay! |

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

### IV Thresholds

| IV Range | Interpretation | Action |
|----------|----------------|--------|
| < 0.02 | Useless | Drop the feature |
| 0.02 – 0.1 | Weak predictor | Keep if stable; combine with others |
| 0.1 – 0.3 | Medium predictor | Good feature, keep |
| 0.3 – 0.5 | Strong predictor | Excellent feature |
| > 0.5 | Suspicious | Check for data leakage immediately |

### Python Implementation

```python
def woe_iv(df, feature, target, bins=10):
    df = df[[feature, target]].copy()
    missing_mask = df[feature].isna()

    df_nm = df[~missing_mask].copy()
    df_nm['bin'] = pd.qcut(df_nm[feature], q=bins, duplicates='drop')

    agg = df_nm.groupby('bin', observed=True)[target].agg(['sum','count'])
    agg.columns = ['bad', 'total']
    agg['good'] = agg['total'] - agg['bad']

    if missing_mask.any():
        miss = df[missing_mask]
        agg.loc['MISSING'] = [miss[target].sum(), len(miss),
                               len(miss) - miss[target].sum()]

    total_good = agg['good'].sum()
    total_bad  = agg['bad'].sum()
    agg['pct_good'] = (agg['good'] / total_good).clip(lower=1e-4)
    agg['pct_bad']  = (agg['bad']  / total_bad ).clip(lower=1e-4)
    agg['woe']      = np.log(agg['pct_good'] / agg['pct_bad'])
    agg['iv_bin']   = (agg['pct_good'] - agg['pct_bad']) * agg['woe']

    return agg, round(agg['iv_bin'].sum(), 4)
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

### Leakage Red Flags

| Pattern | Example | Why it's wrong |
|---------|---------|----------------|
| Post-outcome feature | `days_overdue_at_observation` | Only observable after default occurs |
| Future feature | `balance_next_month` | Uses future information to predict the past |
| Direct proxy | `collection_flag` | Directly encodes the outcome |

IV > 0.5 is your strongest hint that something is wrong. Always trace the feature's data lineage before celebrating a "super-predictive" variable.

### Takeaways

WOE/IV are powerful lenses — not causal tools. They tell you: "Does this feature have discriminatory power, and does that relationship make business sense?" Pair them with monotonicity checks, missing-value analysis, and stability tracking over time. That combination is the foundation of sound credit feature engineering.
