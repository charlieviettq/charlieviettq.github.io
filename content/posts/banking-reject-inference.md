---
title: "Reject Inference: Mô hình của bạn chưa bao giờ nhìn thấy người bị từ chối"
date: "2026-04-23"
excerpt: "Model học từ người được duyệt. Người bị từ chối? Model không biết họ sẽ trả nợ ra sao. Đây là bias có hệ thống — và hầu hết team không thừa nhận nó."
category: banking
---

## VI

### Tóm tắt

Mọi credit model đều được train trên **approved population** — những người đã được duyệt vay và có outcome thực tế (trả nợ đúng hạn hay quá hạn). Người bị từ chối? Không có outcome. Model không biết họ thuộc nhóm good hay bad.

Đây không phải lỗi kỹ thuật — đây là **cấu trúc cơ bản của bài toán credit scoring**. Và nó có hậu quả nghiêm trọng nếu bị bỏ qua.

---

### Bác sĩ chỉ biết bệnh của người đến phòng khám

Hãy tưởng tượng một bác sĩ chỉ điều trị người tự đến phòng khám. Sau 5 năm, bác sĩ đó có rất nhiều kinh nghiệm về người bệnh nhẹ đủ khỏe để đi lại. Nhưng người bệnh nặng nằm ở nhà không đến được — bác sĩ chưa bao giờ thấy họ.

Nếu bác sĩ đó bắt đầu chẩn đoán từ xa, mô hình của họ sẽ có systematic blind spot với các triệu chứng nặng, vì không bao giờ có training data về nhóm đó.

Credit scoring hoạt động y hệt:
- Ngân hàng approve 60% applicant
- 60% đó được theo dõi: ai trả nợ, ai không
- 40% bị reject: **không có outcome** — model không biết gì về họ
- Model tiếp theo được train trên 60% đó → tiếp tục reject 40% tương tự → vòng lặp

---

### Tại sao điều này nguy hiểm — ví dụ cụ thể

Giả sử trong 40% bị reject, thực ra có **20% là good borrowers** — người trả nợ tốt nếu được approve. Nhưng họ bị reject vì model học từ dữ liệu lịch sử thiên lệch.

Năm tiếp theo, model mới vẫn train trên approved population. 20% good borrowers đó vẫn bị reject. Năm sau nữa, tương tự. Ngân hàng đang **mất một lượng khách hàng tốt có hệ thống**, không phải ngẫu nhiên.

Chiều ngược lại cũng nguy hiểm: nếu ngân hàng nới lỏng policy (approve thêm nhóm borderline) mà không làm reject inference, model không biết gì về rủi ro thực tế của nhóm đó. Approval rate tăng, NPL tăng theo mà không có early warning.

---

### Ba cách tiếp cận reject inference

Không có giải pháp hoàn hảo — đây là ước lượng, không phải sự thật. Nhưng có ba cách tiếp cận phổ biến:

#### 1. Augmentation (Hard Augmentation)

**Cách làm:** Gán tất cả reject = bad, thêm vào training set, train lại model.

**Khi nào dùng:** Khi không có gì khác tốt hơn, khi reject rate thấp (<20%), khi model cần thiên về conservative.

**Nhược điểm:** Overestimate risk của reject population. Nếu 50% reject thực ra là good, bạn đang mislabel hàng loạt. Model sẽ conservative hơn cần thiết.

**Bias tạo ra:** Model ngày càng tight hơn theo thời gian vì nó "học" rằng reject = bad.

#### 2. Fuzzy Augmentation (Soft Augmentation)

**Cách làm:** Thay vì gán reject = bad, gán mỗi reject một xác suất bad dựa trên score hiện tại. Applicant có score thấp được gán xác suất bad cao; applicant score trung bình được gán xác suất thấp hơn.

**Khi nào dùng:** Khi có model cũ đủ tin cậy để estimate probability; khi reject rate vừa phải.

**Nhược điểm:** **Circular reasoning.** Bạn dùng score của model cũ (có bias) để label reject → train model mới → model mới cũng có bias đó → dùng model mới để label reject lần sau → ...

Fuzzy augmentation không loại bỏ bias — nó dilute nó, và đôi khi làm nó trở nên tinh vi hơn và khó phát hiện hơn.

#### 3. Parceling (Through-the-Door Approach)

**Cách làm:** Dùng external data (credit bureau, alternative data) để ước lượng outcome cho reject population mà không cần dựa vào score nội bộ.

**Khi nào dùng:** Khi có access vào bureau data quality tốt; khi reject rate cao (>30%); khi muốn đánh giá toàn bộ "through-the-door" population.

**Ưu điểm:** Phá vỡ vòng circular reasoning vì dùng nguồn data độc lập.

**Nhược điểm:** Tốn kém (bureau data có giá); không phải thị trường nào cũng có bureau coverage tốt; vẫn là ước lượng.

---

### Circular reasoning trap — minh hoạ

Đây là vòng lặp nguy hiểm nhất trong reject inference:

```
Score v1 được deploy → reject 40% applicant
↓
Dùng score v1 để fuzzy-label reject
↓
Train score v2 trên approved + fuzzy-labeled reject
↓
Score v2 cũng reject xấp xỉ 40% tương tự
↓
Dùng score v2 để fuzzy-label reject mới
↓
Train score v3 ... (lặp lại)
```

Mỗi iteration, model học bias của iteration trước. Sau 3–4 cycle, model đã "quên" mất rằng nó ban đầu không biết gì về reject population — nó chỉ biết những gì chính nó đã assume về họ.

Cách phát hiện: so sánh reject rate và score distribution của từng model generation. Nếu reject rate ngày càng tăng và score distribution ngày càng tight, đó là dấu hiệu của circular bias tích lũy.

---

### Khi nào reject inference quan trọng nhất

Không phải lúc nào cũng cần làm reject inference đầy đủ. Ưu tiên khi:

| Tình huống | Mức độ cần thiết |
|---|---|
| Reject rate > 30% | 🔴 Cao — phần lớn population không được observe |
| Mở segment hoặc product mới | 🔴 Cao — không có historical data cho segment mới |
| Policy nới lỏng đáng kể | 🔴 Cao — approve nhóm trước đây bị reject |
| Reject rate < 15%, policy ổn định | ⚠️ Trung bình — bias nhỏ, impact có thể chấp nhận được |
| Chỉ update features, không thay đổi population | 🟢 Thấp — bias tương đối ổn định |

---

### Code thực tế: Ba cách tiếp cận reject inference với Python

```python
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression

approved = df[df['decision'] == 'approved'].copy()
rejected = df[df['decision'] == 'rejected'].copy()
features = ['monthly_income', 'age', 'dpd_max_6m', 'job_tenure_months']

# --- Cách 1: Hard Augmentation ---
# Đơn giản nhất, luôn khả thi, conservative
rejected_hard = rejected.copy()
rejected_hard['bad_flag'] = 1   # gán tất cả reject = bad

train_hard = pd.concat([approved, rejected_hard], ignore_index=True)
model_hard = LogisticRegression(C=0.1, max_iter=500)
model_hard.fit(train_hard[features], train_hard['bad_flag'])

# --- Cách 2: Fuzzy Augmentation ---
# Dùng score của model hiện tại để estimate bad probability cho reject
# ⚠️  Cảnh báo: circular reasoning nếu dùng lặp lại nhiều chu kỳ
rejected_fuzzy = rejected.copy()
rejected_fuzzy['bad_prob'] = model_v1.predict_proba(rejected[features])[:, 1]

X_augmented = pd.concat([approved[features], rejected_fuzzy[features]])
y_augmented = pd.concat([approved['bad_flag'],
                          pd.Series(np.ones(len(rejected_fuzzy)))])
# Dùng bad_prob làm sample_weight, không hard-label
weights = pd.concat([pd.Series(np.ones(len(approved))),
                     rejected_fuzzy['bad_prob']])

model_fuzzy = LogisticRegression(C=0.1, max_iter=500)
model_fuzzy.fit(X_augmented, y_augmented, sample_weight=weights)

# --- Monitor circular bias qua các generation ---
# Nếu reject rate tăng dần → dấu hiệu bias tích lũy
for gen_name, model in [('v1', model_v1), ('hard_aug', model_hard), ('fuzzy', model_fuzzy)]:
    scores   = model.predict_proba(applicant_pool[features])[:, 1]
    rej_rate = (scores > cutoff_threshold).mean()
    print(f"Model {gen_name}: reject rate = {rej_rate:.2%}")

# --- Cách 3: Parceling — dùng bureau data để break circular reasoning ---
# Nếu có credit bureau score cho rejected applicants
rejected_parceling = rejected.copy()
rejected_parceling['bad_flag'] = (rejected_parceling['bureau_score'] < 500).astype(int)

train_parceling = pd.concat([approved, rejected_parceling], ignore_index=True)
model_parceling = LogisticRegression(C=0.1, max_iter=500)
model_parceling.fit(train_parceling[features], train_parceling['bad_flag'])
```

### Điều honest cần nói

Reject inference không phải là vấn đề có solution hoàn hảo. Mọi approach đều là ước lượng với các assumption khác nhau. Điều quan trọng không phải là "giải quyết" hoàn toàn — mà là:

1. **Acknowledge** vấn đề trong model documentation
2. **Document** approach được chọn và lý do
3. **Monitor** reject rate và score distribution theo thời gian
4. **Sensitize** kết quả: "Nếu 20% reject thực ra là good, impact lên model là gì?"

Một model documentation viết "chúng tôi biết reject inference bias tồn tại, đây là cách chúng tôi handle và monitor nó" credible hơn rất nhiều so với documentation không đề cập gì đến reject population.

---

### Pitfalls phổ biến

**Bỏ qua hoàn toàn.** "Chúng ta không có data về reject nên không làm gì được." Sai. Hard augmentation là đơn giản nhất và luôn khả thi.

**Dùng fuzzy augmentation mà không nhận ra circular reasoning.** Kết quả trông "đẹp" vì model mới consistent với model cũ — nhưng đó là vì chúng cùng học một bias.

**Không document approach.** 18 tháng sau, model mới được train. Người mới không biết reject được handle như thế nào trong cycle trước. Inconsistency tích lũy.

**Không theo dõi reject rate theo thời gian.** Nếu reject rate tăng dần từ 30% lên 45% qua các năm mà không có lý do kinh doanh rõ ràng, đó là tín hiệu của circular bias tích lũy.

---

### Takeaway

Mọi credit model đều có selection bias — đây không phải điều đáng xấu hổ, nó là đặc tính cơ bản của bài toán.

Practitioner giỏi là người **biết điều đó, quantify nó, document nó, và monitor nó** — không phải người nghĩ model của mình "sạch" chỉ vì AUC trên approved population trông tốt.

Reject inference là bài kiểm tra về intellectual honesty của một data scientist trong credit risk: bạn có sẵn sàng thừa nhận những gì model của mình không biết không?

---

## EN

### At a Glance

Every credit model is trained on the **approved population** — applicants who were granted credit and generated observable outcomes (repaid or defaulted). Rejected applicants have no outcomes. The model has never seen them and doesn't know whether they would have been good or bad borrowers.

This isn't a technical flaw — it's a **structural feature of the credit scoring problem**. And it has serious consequences if left unacknowledged.

---

### The Doctor Who Only Sees Patients Who Can Walk In

Imagine a physician who only treats patients who can walk into the clinic. After five years, they have extensive experience with people healthy enough to travel. But severely ill patients who stay home — they've never been observed.

If that physician builds a diagnostic model, it has a systematic blind spot for severe cases. Not because of bad methodology, but because of who was in the training data.

Credit scoring works the same way: the model learns from approved applicants, is deployed to score all applicants, rejects a portion, and those rejected applicants never generate outcomes. The next model is trained on the same approved population, inheriting the same blind spot.

---

### The Three Approaches

**1. Hard Augmentation** — Label all rejects as bad, add to training set, retrain. Simple, conservative, always feasible. Best when reject rate is low (<20%). Systematically overestimates risk for the reject population.

**2. Fuzzy Augmentation** — Assign each reject a probability of being bad, based on their score from the current model. More nuanced than hard augmentation, but introduces **circular reasoning**: you use a biased model to label rejects, train a new model on those labels, and that new model inherits the previous model's bias — just more subtly.

**3. Parceling (Through-the-Door)** — Use external data (credit bureau, alternative data) to estimate outcomes for rejected applicants independently of the internal score. Breaks the circular reasoning loop. Requires good-quality external data, which isn't always available or affordable.

### Code Reference — Three Approaches in Python

```python
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression

approved = df[df['decision'] == 'approved'].copy()
rejected = df[df['decision'] == 'rejected'].copy()
features = ['monthly_income', 'age', 'dpd_max_6m', 'job_tenure_months']

# --- Approach 1: Hard Augmentation (always feasible baseline) ---
rejected_hard = rejected.assign(bad_flag=1)
train_hard = pd.concat([approved, rejected_hard])
model_hard = LogisticRegression(C=0.1, max_iter=500).fit(
    train_hard[features], train_hard['bad_flag']
)

# --- Approach 2: Fuzzy Augmentation (use with caution — circular risk) ---
reject_bad_prob = model_v1.predict_proba(rejected[features])[:, 1]
X_aug = pd.concat([approved[features], rejected[features]])
y_aug = pd.concat([approved['bad_flag'], pd.Series(np.ones(len(rejected)))])
w_aug = pd.concat([pd.Series(np.ones(len(approved))), pd.Series(reject_bad_prob)])
model_fuzzy = LogisticRegression(C=0.1, max_iter=500).fit(X_aug, y_aug, sample_weight=w_aug)

# --- Approach 3: Parceling (external data breaks circular loop) ---
# Requires bureau data for rejected applicants
rejected_parceling = rejected.assign(
    bad_flag=(rejected['bureau_score'] < bureau_cutoff).astype(int)
)
train_parceling = pd.concat([approved, rejected_parceling])
model_parceling = LogisticRegression(C=0.1, max_iter=500).fit(
    train_parceling[features], train_parceling['bad_flag']
)

# --- Monitor for circular bias accumulation across model generations ---
for label, model in [('v1 (original)', model_v1),
                     ('v2 hard_aug',   model_hard),
                     ('v2 fuzzy',      model_fuzzy)]:
    reject_rate = (model.predict_proba(applicant_pool[features])[:, 1] > threshold).mean()
    print(f"{label:20s}: reject_rate = {reject_rate:.2%}")
# Rising reject rate across generations without business reason → circular bias signal
```

---

### The Circular Reasoning Trap

The most dangerous failure mode in reject inference:

```
Score v1 deployed → rejects 40%
Use score v1 to fuzzy-label rejects
Train score v2 on approved + fuzzy-labeled rejects
Score v2 also rejects ~40% of similar applicants
Use score v2 to fuzzy-label new rejects
Train score v3 ...
```

Each iteration, the model learns the bias of the previous iteration. After 3–4 cycles, the model has "forgotten" that it originally knew nothing about the reject population — it only knows what it assumed about them.

Detection signal: if reject rate trends upward across model generations without a business reason, and score distributions become progressively tighter, circular bias accumulation is a likely cause.

---

### When It Matters Most

| Situation | Priority |
|---|---|
| Reject rate > 30% | 🔴 High — majority of population unobserved |
| New segment or product launch | 🔴 High — no historical data for new population |
| Significant policy loosening | 🔴 High — approving previously-rejected segments |
| Reject rate < 15%, stable policy | ⚠️ Medium — bias exists but impact is smaller |
| Feature update only, same population | 🟢 Low — bias relatively stable |

---

### The Honest Position

Reject inference has no perfect solution. Every approach rests on assumptions that may not hold. What matters is:

1. **Acknowledge** the problem in model documentation
2. **Document** the approach chosen and why
3. **Monitor** reject rate and score distribution trends over time
4. **Sensitivity test**: "If 20% of rejects are actually good borrowers, what's the model impact?"

A model documentation that says "we recognize reject inference bias exists, here's how we handle and monitor it" is far more credible than documentation that doesn't mention the reject population at all.

---

### Takeaway

Every credit model has selection bias — this isn't something to be ashamed of, it's a structural feature of the problem.

A skilled practitioner is one who **knows this, quantifies it, documents it, and monitors it** — not one who assumes their model is "clean" because AUC on the approved population looks good.

Reject inference is a test of intellectual honesty: are you willing to acknowledge what your model doesn't know?

---

**References**
- Kozodoi, N., Lessmann, S., Alamgir, M., Moreira-Matias, L., & Papakonstantinou, K. (2025). Fighting sampling bias: A framework for training and evaluating credit scoring models. *European Journal of Operational Research*, 324(2), 616–628. [ideas.repec.org](https://ideas.repec.org/a/eee/ejores/v324y2025i2p616-628.html) — The most current EJOR paper directly addressing reject inference; proposes evaluation frameworks that account for the truncated sample problem.
- EBA (November 2025). *AI Act: Implications for the EU Banking and Payments Sector*. European Banking Authority. [eba.europa.eu](https://www.eba.europa.eu/sites/default/files/2025-11/d8b999ce-a1d9-4964-9606-971bbc2aaf89/AI%20Act%20implications%20for%20the%20EU%20banking%20sector.pdf) — Supervisory focus on bias and fairness in credit AI directly links to reject inference as a systemic source of discriminatory outcomes.
- Bücker, M., Szepannek, G., Gosiewska, A., & Biecek, P. (2022). Transparency, Auditability, and eXplainability of Machine Learning Models in Credit Scoring. *Journal of the Operational Research Society*, 73(1), 70–90. — Covers selection bias as an interpretability failure mode in ML-based credit models.
