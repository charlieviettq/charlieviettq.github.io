---
name: personal-blog-writer
description: Use when writing, rewriting, reviewing, or planning Vietnamese-first personal technical blog posts, especially Data Science, Banking, Credit Risk, ML validation, data platforms, and GenAI posts for junior-to-mid practitioners. Applies to blog structure, wording, technical explanations, diagrams, code, formulas, tables, captions, and readability.
---

# Personal Blog Writer

## Goal

Write personal technical blog posts that sound like a senior practitioner explaining real project lessons to less experienced people in the industry.

Default audience:
- Vietnamese-speaking Data Scientists, analysts, risk analysts, and engineers.
- Junior-to-mid readers who know basic ML/data terms but may not know banking or credit-risk context.

Default style:
- Vietnamese-first.
- Practical, clear, field-tested.
- Explain industry terms when first introduced.
- Avoid sounding like internal documentation, textbook notes, or machine translation.

## Editorial Voice

Write like a mentor sharing experience:
- Start from a real problem or situation, not a definition.
- Use phrases like “trong dự án thật”, “khi review model”, “một lỗi tôi hay thấy”, “điểm cần nhớ”.
- Prefer natural Vietnamese before English terms.
- Keep English terms when common in the industry, but explain them briefly.

Avoid:
- Dense term chains without explanation.
- Mixed phrases like “model risk”, “model product”, “governance issue” when natural Vietnamese works.
- Headings that sound like internal notes, e.g. “Ý chính thực dụng”.
- Dropping tables, diagrams, formulas, or code without context.

Rewrite heuristics:
- Translate the intent, not the term.
- Do not force a one-to-one Vietnamese replacement when the English term is common in banking or data teams.
- Keep common terms such as `risk model`, `scorecard`, `PD`, `DPD`, `cohort`, `feature`, `calibration`, and `monitoring` when they read naturally.
- If a term is important but less common, keep the term and add a short explanation in parentheses.
- Choose wording based on sentence context: is the term a concept, a process, a control point, or a stakeholder-facing label?

Context-sensitive examples:
- `Ý chính thực dụng` often sounds stiff; use `Điểm cần nhớ`, `Tóm tắt nhanh`, or `Nếu chỉ nhớ vài điều`, depending on tone.
- `risk model` is common enough to keep as-is when writing for Data Science or Risk readers.
- `governance` can stay as `governance` when the audience knows the term; otherwise write `governance (risk management - quản lý rủi ro)` or explain it as `cơ chế kiểm soát / yêu cầu quản trị`.
- `label maturity` can stay as `label maturity` when the post is technical, then explain once as `cohort đã đủ thời gian để rủi ro xuất hiện`.
- `portfolio reporting` can become `báo cáo danh mục`, `báo cáo rủi ro toàn danh mục`, or `tổng hợp rủi ro theo portfolio`, depending on whether the audience is business, Risk, or Data Science.
- For less common terms, use parentheses instead of over-translating, e.g. `isotonic regression (một cách hiệu chỉnh xác suất linh hoạt hơn Platt)`.

## Blog Framework

Use this structure for Vietnamese technical posts unless the user asks otherwise:

```md
## Điểm cần nhớ

## 1. Tổng quan: ...

## 2. Vấn đề thường gặp: ...

## 3. Khái niệm cốt lõi: ...

### 3.1. ...
### 3.2. ...

## 4. Ví dụ thực tế: ...

## 5. Cách làm trong dự án thật: ...

## 6. Lỗi thường gặp

## 7. Gợi ý cho người mới

## 8. Hỏi đáp nhanh

## 9. Tài liệu tham khảo
```

Rules:
- Number main Vietnamese headings.
- Use subheadings only when they help scanning.
- Keep headings short and natural.
- Do not start a section with a table, code block, or diagram; introduce the idea first.
- Preserve bilingual split markers like `## VI` and `## EN` when present.

## Wording Rules

Explain terms on first use:
- `PD (Probability of Default - xác suất vỡ nợ)`
- `DPD (Days Past Due - số ngày quá hạn)`
- `OOT (Out-of-Time - tập kiểm tra theo thời gian)`
- `Calibration (hiệu chỉnh thang xác suất)`
- `Vintage (nhóm hồ sơ theo tháng giải ngân hoặc tháng mở tài khoản)`
- `Reliability diagram (biểu đồ so sánh PD dự báo với tỷ lệ bad thực tế)`

Reduce jargon density in summaries.

Bad:
```md
- Installment và revolving có đường cong DPD, tín hiệu utilization và maturity assumption rất khác nhau; gộp bừa sẽ làm label và monitoring lệch.
```

Better:
```md
- Khoản vay trả góp và hạn mức quay vòng tạo ra hành vi quá hạn rất khác nhau; nếu gộp bừa, nhãn rủi ro và báo cáo theo dõi sau này sẽ lệch.
```

Bad:
```md
- Trước khi dùng lại PD hoặc calibration giữa các sản phẩm, hãy kiểm tra population stability, label definition, outcome window và reliability theo từng segment.
```

Better:
```md
- Trước khi dùng lại PD (xác suất vỡ nợ) hoặc calibration (hiệu chỉnh xác suất) giữa các sản phẩm, hãy kiểm tra từng nhóm khách và từng loại sản phẩm riêng.
```

## Technical Block Pattern

Every technical block needs three parts:
1. Context before the block: what to look at and why it matters.
2. The block itself: diagram, table, formula, or code.
3. Takeaway after the block: how to interpret it.

### Diagrams and Images

Pattern:

```md
Sơ đồ dưới đây giúp bạn nhìn nhanh cách rủi ro phát triển theo thời gian. Khi đọc hình, hãy chú ý phần outcome window, vì label không xuất hiện ngay tại thời điểm giải ngân.

:::diagram[Outcome window từ thời điểm giải ngân đến khi label mature]

![](/path/to/diagram.svg)

:::

**Hình 1.** Outcome window cho thấy feature được lấy tại thời điểm ra quyết định, còn label chỉ biết sau khi đủ thời gian quan sát.
```

Caption rules:
- Start with `**Hình N.**`.
- Caption should be smaller and centered if renderer styling is available.
- Caption explains the insight, not just the image name.

### Code

Use code only when it helps the reader do something.

Pattern:

```md
Đoạn code dưới đây minh họa cách kiểm tra cohort đã đủ mature chưa bằng vintage curve. Trong dự án thật, đây thường là chart đầu tiên tôi muốn xem trước khi tin một label.

```python
def plot_vintage_bad_rate(df, origination_col, mob_col, bad_col):
    """
    Vẽ bad rate tích lũy theo từng vintage.

    Input:
    - df: dữ liệu loan theo từng month-on-book
    - origination_col: tháng giải ngân hoặc tháng mở tài khoản
    - mob_col: MOB (Month on Book)
    - bad_col: cờ bad tích lũy tại từng MOB

    Output:
    - Biểu đồ bad rate tích lũy theo vintage
    """
```

Nếu các đường vintage vẫn tăng mạnh ở cuối trục MOB, cohort chưa mature. Khi đó, split train/test ngay sẽ làm mô hình học từ dữ liệu chưa đủ thời gian phát triển bad.
```

Rules:
- Explain purpose before code.
- Use Vietnamese comments/docstrings for input, output, and assumptions.
- Explain how to read output after code.

### Formulas

Pattern:

```md
Về mặt kỹ thuật, một mô hình được gọi là calibrated nếu:

```text
P(Y = 1 | f(X) = p) = p
```

Trong đó:

- `f(X)`: xác suất mô hình dự báo cho một hồ sơ.
- `p`: một mức PD cụ thể, ví dụ 8%.
- `Y = 1`: khách hàng trở thành bad theo định nghĩa đã thống nhất.

Diễn giải đời thường: trong nhóm hồ sơ được gán PD gần 8%, tỷ lệ bad thực tế cũng nên gần 8%.
```

Rules:
- Do not leave formulas alone.
- Add `Trong đó:` and explain variables.
- End with a plain-language interpretation.

### Tables

Pattern:

```md
Bảng dưới đây không nhằm phân loại sản phẩm theo tên gọi, mà giúp bạn nhìn nhanh cơ chế rủi ro phía sau từng nhóm.

| Nhóm sản phẩm | Cơ chế trả nợ | Rủi ro cần chú ý | Hàm ý khi model |
|---|---|---|---|
| Cash loan | Trả góp cố định | Default xuất hiện theo tenor | Outcome window phải đủ dài |
| Credit card | Hạn mức quay vòng | Utilization, minimum payment | Cần behavior features |
| BNPL | Trả ngắn theo giao dịch | Repeat usage, checkout fraud | Không gộp chung với cash loan |

Điểm cần nhớ: bảng này không thay thế product policy. Nó chỉ giúp Data Scientist biết nên hỏi Risk/Product câu gì trước khi build label.
```

Rules:
- Add a lead-in sentence before the table.
- Add a takeaway after the table.
- Use practical columns: `Khi nào dùng`, `Cần cẩn thận`, `Hàm ý khi model`, `Cách tránh`.

## Content Review Checklist

Before finishing a post or rewrite, check:
- Vietnamese headings are numbered and natural.
- `Điểm cần nhớ` is readable without expert context.
- Term density is reasonable; important terms are explained on first use.
- Each diagram/image has lead-in text and a centered caption.
- Each code block has purpose, Vietnamese comments/docstrings, and output interpretation.
- Each formula has `Trong đó:` and a plain-language explanation.
- Tables have practical decision columns and a takeaway.
- The post sounds like a practitioner explaining a real problem, not a glossary.
- Routes, slugs, front matter schema, diagram paths, and bilingual split markers are preserved unless explicitly changed.

## Common Banking/Data Science Angles

Credit labels:
- Start with the alignment problem: Data Science and Risk may not use the same definition of “bad”.
- Explain DPD, bad flag, outcome window, and maturity.
- Show why label spec should exist before EDA.

Retail credit products:
- Start with: `Đừng đánh giá rủi ro chỉ bằng tên sản phẩm`.
- Explain repayment mechanics before product names.
- Compare cash loan, credit card, BNPL, and ultra-short lending by modeling implications.

Model calibration:
- Start with: `Xếp hạng tốt chưa chắc xác suất đúng`.
- Explain AUC/Gini/KS vs calibrated PD.
- Use reliability diagrams with a simple one-bin example before advanced details.
