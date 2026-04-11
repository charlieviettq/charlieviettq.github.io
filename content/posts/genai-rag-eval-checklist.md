---
title: "Đừng để AI nói dối: Câu chuyện về một 'Biên tập viên' RAG khó tính"
date: "2026-04-05"
excerpt: "Hallucination (ảo giác) là kẻ thù số một của RAG. Hãy học cách xây dựng một hệ thống đánh giá khắt khe để đảm bảo AI luôn nói có sách, mách có chứng."
category: gen-ai
---

## VI

### Tóm lược

- Đừng đánh giá AI bằng "cảm giác". Bạn cần những tiêu chí Pass/Fail rõ ràng như một bài thi thực thụ (**Grounding**).
- Mỗi khi thay đổi bất cứ thứ gì (từ cách cắt nhỏ văn bản đến lời nhắc prompt), hãy cho AI thi lại đúng bộ đề cũ (**Golden Set**).
- Biết nói "Tôi không biết" là một đức tính tốt của AI. Đừng ép nó phải trả lời khi không có bằng chứng (**Abstain**).

### Giới thiệu

Bạn đã bao giờ thấy một con Chatbot hùng hồn khẳng định một điều hoàn toàn không có trong tài liệu của bạn chưa? Đó chính là ảo giác — "cơn ác mộng" của mọi kỹ sư làm RAG. 

Xây dựng một hệ thống RAG không khó, cái khó là giữ cho nó luôn nói thật sau mỗi lần mình nâng cấp. Bài viết này mình dành cho những ai đang triển khai RAG nội bộ, giúp bạn đóng vai một "biên tập viên" khó tính để kiểm soát chất lượng đầu ra của AI.

### Khái niệm cốt lõi: Bộ khung kiểm soát

1. **Nói có sách, mách có chứng (Grounding):** Mọi câu trả lời của AI phải bám sát trích dẫn. Nếu tài liệu không nói, AI không được phép tự ý thêm thắt. 

2. **Bộ đề thi vĩnh cửu (Golden Set):** Đây là tập hợp những câu hỏi quan trọng nhất kèm theo đáp án mẫu. Bạn phải "đóng băng" bộ đề này để so sánh xem sau khi cập nhật, AI giỏi lên hay kém đi.

3. **Ghi nhật ký phiên bản (Versioning):** RAG là một chuỗi các thành phần: từ cách chunking, model embedding đến prompt. Hãy đánh số phiên bản cho tất cả để biết chính xác "thủ phạm" gây lỗi là ai.

### Chi tiết và thực hành: Nghệ thuật chấm điểm

Đừng chỉ nhìn vào một vài kết quả demo đẹp mắt. Hãy xây dựng một ma trận các loại câu hỏi: câu hỏi về sự thật, câu hỏi tính toán số liệu, và cả những câu hỏi "bẫy" không có trong tài liệu.

**Bảng tiêu chí chấm điểm (Rubric mẫu):**

| Loại câu hỏi | Thế nào là Pass? |
| ---- | -------- |
| Sự thật hiển nhiên | Trích đúng đoạn văn; không bịa thêm chi tiết |
| Tính toán / Tổng hợp | Khớp con số hoặc từ chối nếu không tính được |
| Ngoài phạm vi | AI phải lịch sự nói "Tôi không biết" |

### Checklist cho "Biên tập viên"

- [ ] Bạn đã lưu bộ Golden Set vào kho lưu trữ chưa?
- [ ] Hệ thống có tự động chấm điểm mỗi khi bạn đổi Prompt không?
- [ ] Bạn có đang theo dõi tỷ lệ AI nói "Tôi không biết" không? (Tỷ lệ này quá thấp thường là dấu hiệu AI đang "bịa").

### Những lỗi sơ đẳng (Rủi ro)

- **Bộ đề quá dễ:** Nếu bài thi chỉ toàn câu hỏi hiển nhiên, bạn sẽ không bao giờ phát hiện được điểm yếu của AI.
- **Giám khảo lỏng tay:** Dùng một Model AI khác để chấm điểm (LLM Judge) mà không có tiêu chí (rubric) rõ ràng sẽ dẫn đến kết quả nhảy múa lung tung.
- **Quên cập nhật Index:** Đổi cách cắt văn bản nhưng quên không chạy lại Embedding cho toàn bộ kho dữ liệu.

### Kết luận

Một hệ thống RAG bền vững không đến từ may mắn. Nó đến từ việc **đánh giá có kỷ luật** và **quản lý phiên bản chặt chẽ**. Đừng chỉ hài lòng với một demo đẹp, hãy biến AI của bạn thành một nhân viên trung thực và đáng tin cậy.

---

## EN

### At a glance

- Don't evaluate AI based on "vibes." You need explicit Pass/Fail criteria just like a real exam (**Grounding**).
- Every time you change something (from chunking to prompts), re-test the AI with the same fixed set of questions (**Golden Set**).
- Knowing how to say "I don't know" is a virtue. Don't force the AI to answer when evidence is missing (**Abstention**).

### Introduction

Have you ever seen a chatbot confidently claim something that is absolutely not in your documents? That's a hallucination — the number one enemy of RAG.

Building a RAG system is easy; keeping it honest after every update is the hard part. This post is for those shipping internal RAG, helping you play the "strict editor" to ensure high-quality outputs.

### Core Concepts: The Control Framework

1. **Grounding:** Every answer must be tied to citations. If it's not in the text, the AI isn't allowed to make it up.
2. **Golden Set:** A frozen collection of your most important questions and reference answers. Use this to measure if your AI is getting smarter or dumber after an update.
3. **Versioning:** Snapshot everything: your corpus, embedding models, and prompt hashes. Know exactly which change caused a regression.

### Pitfalls and Failure Modes

- **Easy Benchmarks:** If your test is too simple, you'll never find the AI's weaknesses.
- **Vague Judges:** Using an LLM to grade another LLM without clear rubrics leads to unreliable scores.
- **Inconsistent Indexing:** Changing your chunking logic without re-embedding the entire corpus.

### Takeaways

Durable RAG requires **disciplined evaluation** and **strict versioning** — not just demo-driven luck.
