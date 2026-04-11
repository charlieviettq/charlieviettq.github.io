---
title: "BeGuru AI — Case study: Làm sao để AI không quên lời hứa? (Memory & Context)"
date: "2026-04-13"
excerpt: "Phần 3 chuỗi BeGuru: Khám phá bí mật giúp AI ghi nhớ những cuộc hội thoại dài dằng dặc mà không bị 'lú' qua hệ thống nén và ghim thông tin thông minh."
category: gen-ai
---

## VI

### Tóm lược

- AI cũng giống như con người, nếu nghe quá nhiều thông tin cùng lúc nó sẽ bị "ngợp". **ContextCompressor** chính là người thư ký tận tâm, giúp tóm tắt những ý cũ để nhường chỗ cho ý mới.
- Có những thứ quan trọng không được phép quên (như bản thiết kế hay tiến độ dự án), chúng được BeGuru "ghim" lại bằng các **Pins** bền vững.
- Cuối cùng, mọi thông tin quý giá nhất được lưu trữ vào "kho lưu trữ trung tâm" trên đĩa cứng, đảm bảo AI luôn có thể tra cứu lại bất cứ lúc nào.

### Giới thiệu

Bạn đã bao giờ tham gia một cuộc họp kéo dài 3 tiếng đồng hồ và đến cuối buổi thì chẳng ai nhớ rõ lúc đầu đã thống nhất cái gì chưa? AI cũng gặp vấn đề tương tự. Dù có thông minh đến đâu, mỗi Model AI đều có một giới hạn về lượng thông tin nó có thể "xử lý" trong một thời điểm (gọi là Context Window).

Nếu mình cứ nhồi nhét hàng ngàn dòng chat vào, AI sẽ bắt đầu "lú", nhầm lẫn giữa yêu cầu cũ và mới, hoặc tệ hơn là quên sạch những gì bạn đã dặn. Để giải quyết bài toán này, mình đã xây dựng cho **BeGuru AI** một hệ thống quản lý trí nhớ đa tầng. Hãy cùng mình xem cách BeGuru "học thuộc lòng" dự án của bạn nhé.

### Quy trình xử lý thông tin: Từ thô đến tinh

Hãy tưởng tượng luồng thông tin đi vào bộ não của BeGuru giống như một dây chuyền lọc nước:

```mermaid
flowchart TD
  RH[Dòng Chat Thô\nTin nhắn + file bạn gửi]
  CC[Máy Nén Ký Ức\n(ContextCompressor)]
  PH[Ký Ức Tinh Gọn\nTóm tắt ý chính + vài tin nhắn gần đây]
  PL[Tầng Ghim Thông Tin\n(PinnedLayer - Những thứ không được quên)]
  CP[Gói Ngữ Cảnh Hoàn Chỉnh\nĐưa cho Kỹ sư AI xử lý]

  RH --> CC
  CC --> PH
  PH --> PL
  PL --> CP
```

### Bốn "ngăn tủ" ký nhớ của BeGuru

1. **Trí nhớ ngắn hạn:** Là những tin nhắn bạn vừa gửi. Nếu đoạn chat quá dài, BeGuru sẽ tự động kích hoạt chế độ tóm tắt. Nó sẽ gom hàng chục tin nhắn cũ thành một đoạn `[CONTEXT_SUMMARY]` súc tích, chỉ giữ lại vài tin nhắn gần nhất nguyên văn để duy trì cảm xúc hội thoại.

2. **Những mẩu giấy ghi chú (Pins):** Đây là những thông tin "sống còn". Cho dù cuộc hội thoại có dài bao nhiêu, bản thiết kế (FE Spec), bảng màu (Master), hay tiến độ (Build State) luôn được ghim chặt ở một góc để AI không bao giờ làm sai.

3. **Kho lưu trữ trên đĩa:** Như mình đã nói ở [Phần 1](/blog/beguru-ai-case-study-design-system-disk/), đây là nơi lưu lại "hợp đồng". Khi Agent Kỹ sư bắt đầu viết code, nó sẽ không đọc lại toàn bộ lịch sử chat mà chỉ cần mở các file `PRODUCT_PLAN.md` hay `BUILD_STATE.md` ra là đủ hiểu mình cần làm gì.

4. **Cơ sở dữ liệu (DB):** BeGuru dùng SQLite để lưu lại các phiên làm việc. Một tính năng thú vị đang được phát triển là lưu lại các bản tóm tắt để lần sau bạn quay lại, AI vẫn nhận ra "người quen" ngay lập tức.

### Quản lý "tài nguyên" trí tuệ

Việc cho AI đọc quá nhiều không chỉ làm nó chậm đi mà còn tốn kém. Vì vậy, BeGuru có những quy tắc quản lý rất chặt chẽ:
- **Giới hạn ký tự:** Mình đặt ra các ngưỡng như `freetext_build_state_max_chars` để đảm bảo AI không đọc những file nhật ký quá khổng lồ.
- **Ước lượng token:** Hệ thống luôn tính toán xem mình đã dùng hết bao nhiêu "dung lượng bộ não" để cảnh báo kịp thời.

### Roadmap: Trí nhớ siêu việt trong tương lai

Mình đang nghiên cứu các công nghệ như **pgvector** hay **LangGraph** (nhắc đến trong tài liệu **ADR-0002**) để giúp BeGuru có một trí nhớ dài hạn thực sự, có thể nhớ lại những dự án bạn đã làm từ... năm ngoái. Nhưng đó là câu chuyện của tương lai, khi sản phẩm cần sự phức tạp đó.

### Ảnh minh họa — Thử tài Gemini nhé!

1. **Minh họa “Tầng ký ức”** — *“Một sơ đồ cắt ngang: bốn lớp nằm ngang được dán nhãn từ dưới lên trên: ‘Kho lưu trữ đĩa’, ‘Cơ sở dữ liệu’, ‘Thông tin ghim’, ‘Lịch sử đã nén’, với các mũi tên mảnh chỉ lên trên; bảng màu xanh xám dịu, phong cách đồ họa thông tin báo chí.”*
2. **Minh họa “Phễu lọc thông tin”** — *“Một cái phễu rộng ở phía trên dán nhãn ‘tin nhắn thô’ thu hẹp qua một biểu tượng bánh răng ‘nén’ vào một ống dẫn hẹp ‘gói ngữ cảnh cho model’; minh họa phẳng trừu tượng, tối giản.”*

### Hẹn gặp bạn ở phần sau!

Chúng ta đã đi qua 3 phần quan trọng nhất: Từ những file trên đĩa, đến bộ máy vận hành và cách ghi nhớ. Ở phần tiếp theo, mình sẽ kể cho bạn nghe về **Sprint 2** — nơi BeGuru học cách tự kiểm tra lỗi (Static Check) và cách mình quan sát (Observability) mọi hành động của các Agent.

---

## EN

### At a glance

- AI is just like us: if it hears too much at once, it gets overwhelmed. **ContextCompressor** acts as a diligent secretary, summarizing old ideas to make room for new ones.
- Some things are too important to forget (like the design or project progress); BeGuru "pins" these using permanent **Pins**.
- Finally, all precious information is stored in a "central archive" on the hard drive, ensuring the AI can always look it up.

### Introduction

Have you ever been in a 3-hour meeting and by the end, no one remembers exactly what was agreed upon at the start? AI has the same problem. No matter how smart, every AI model has a "Context Window" — a limit on how much information it can process at one time.

If we keep stuffing thousands of chat lines in, the AI starts getting confused between old and new requests, or worse, forgets what you told it entirely. To solve this, I built a multi-layered memory management system for **BeGuru AI**. Let's see how BeGuru "memorizes" your project.

### Information Processing: From Raw to Refined

Imagine the flow of information into BeGuru's brain like a water filtration line:

(Mermaid diagram same as above)

### BeGuru's Four Memory "Cabinets"

1. **Short-term Memory:** These are the messages you just sent. If the chat gets too long, BeGuru automatically activates compression mode. It collapses dozens of old messages into a concise `[CONTEXT_SUMMARY]`, keeping only the last few messages verbatim to maintain the conversational flow.

2. **Sticky Notes (Pins):** This is "survival" information. No matter how long the conversation gets, the design (FE Spec), palette (Master), or progress (Build State) are always pinned in a corner so the AI never gets them wrong.

3. **On-Disk Archive:** As mentioned in [Part 1](/blog/beguru-ai-case-study-design-system-disk/), this is where the "contracts" live. When the Engineer Agent starts writing code, it doesn't need to re-read the entire chat history; it just opens files like `PRODUCT_PLAN.md` or `BUILD_STATE.md` to understand what to do.

4. **Database (DB):** BeGuru uses SQLite to save sessions. An exciting feature in development is persisting summaries so when you return, the AI recognizes you instantly.

### Managing Intellectual "Resources"

Giving an AI too much to read not only slows it down but also gets expensive. Therefore, BeGuru has strict management rules:
- **Character Caps:** I've set limits like `freetext_build_state_max_chars` to ensure the AI doesn't read massive log files.
- **Token Estimation:** The system constantly calculates how much "brain capacity" has been used to provide timely warnings.

### Next in the Series

We've covered the three most important parts: from files on disk to the operating engine and memory. In the next part, I'll tell you about **Sprint 2** — where BeGuru learns to self-check for errors (Static Check) and how I observe (Observability) every move the Agents make.
