---
title: "Routing multi-agent: Người điều phối thông minh trong tòa nhà văn phòng"
date: "2026-03-30"
excerpt: "Đừng để một Agent đơn độc làm hết mọi việc. Hãy học cách xây dựng một 'người điều phối' thông minh để dẫn dắt yêu cầu đến đúng chuyên gia và công cụ cần thiết."
category: gen-ai
---

## VI

### Tóm lược

- Thay vì dùng một "siêu Agent" ôm đồm mọi việc, hãy dùng **Router** để phân luồng yêu cầu đến đúng chuyên gia (RAG, Tool, hoặc Agent khác).
- Mỗi công cụ (Tool) cần có một "phạm vi làm việc" rõ ràng: có chìa khóa riêng (quyền truy cập), thời gian làm việc (timeout) và nhật ký công việc (log).
- Luôn đặt ra giới hạn số bước đi (max_steps) để tránh việc các Agent dắt nhau đi vòng quanh mãi không có hồi kết.

### Giới thiệu

Hãy tưởng tượng bạn bước vào một tòa nhà văn phòng khổng lồ để giải quyết công việc. Bạn chắc chắn không muốn gặp một người duy nhất vừa làm bảo vệ, vừa làm kế toán, lại vừa là giám đốc kỹ thuật đúng không? Kết quả chắc chắn sẽ là một sự hỗn loạn.

Trong thế giới AI cũng vậy. Một Agent "vạn năng" thường sẽ rất đắt đỏ, chậm chạp và dễ nhầm lẫn. Bài viết này mình dành cho những bạn đang thiết kế hệ thống **Multi-Agent**, giúp bạn tạo ra một "người điều phối" (Router) thông minh để mọi thứ vận hành trơn tru và an toàn.

### Khái niệm cốt lõi: Bộ máy điều phối

1. **Người lễ tân (Router):** Khi nhận yêu cầu, Router không tự làm mà sẽ quyết định xem ai là người giỏi nhất để xử lý. Kết quả trả về phải rõ ràng: "Đi hướng A, vì lý do B".

2. **Cánh cửa văn phòng (Tool Boundary):** Mỗi công cụ giống như một phòng ban. Bạn phải quy định rõ: Ai được vào? (Quyền đọc/ghi), Được làm trong bao lâu? (Timeout) và Tuyệt đối không được làm gì? (Rate limit).

3. **Chiếc cặp tài liệu (Handoff):** Khi chuyển việc từ Agent này sang Agent khác, đừng đưa nguyên một xấp lịch sử chat dày cộp. Hãy chỉ đưa một "bản tóm tắt trạng thái" gọn nhẹ để Agent tiếp theo bắt tay vào việc ngay.

### Chi tiết và thực hành: Nghệ thuật điều tiết

Với những yêu cầu đơn giản và lặp đi lặp lại, đừng lãng phí tiền cho LLM. Hãy dùng những bộ lọc (Classifier) truyền thống kết hợp với luật (Rule). Chỉ dùng "bộ não" LLM cho những trường hợp phức tạp, khó đoán.

**Bảng quy tắc phân quyền (Ví dụ thực tế):**

| Phòng ban (Tool) | Chìa khóa (Quyền) | Lưu ý từ "quản lý" |
| ---- | --------- | ------- |
| Đọc dữ liệu | Chỉ được đọc trong kho | Bắt buộc phải có điều kiện lọc |
| Ghi dữ liệu | Cần sếp duyệt | Tuyệt đối không mở khi đang thử nghiệm |
| Gửi Email | Chỉ gửi trong nội bộ | Tránh để lộ thông tin khách hàng |

### Checklist cho "người quản lý"

- [ ] Bạn đã có bản mô tả rõ ràng cho Router chưa?
- [ ] Bạn có đang theo dõi được yêu cầu đang ở "văn phòng" nào không? (Tracing)
- [ ] Bạn đã cài đặt chế độ tự ngắt nếu Agent đi lạc quá lâu chưa? (Max steps)

### Những bài học đau thương (Rủi ro)

- **Giao chìa khóa vạn năng:** Để Agent có quyền quá rộng vào Database là cách nhanh nhất để dẫn đến thảm họa dữ liệu.
- **Không ghi nhật ký:** Khi hệ thống lỗi mà không có nhật ký (trace), bạn sẽ chỉ có thể ngồi đoán xem Agent nào đã làm sai.
- **Agent ôm đồm:** Càng nhồi nhét nhiều tính năng vào một Agent, hóa đơn tiền điện (token) của bạn càng tăng vọt.

### Kết luận

Hệ thống Multi-Agent chỉ thực sự mạnh mẽ khi bạn xem **Router, Tool và Handoff** như những dịch vụ chuyên nghiệp, có kỷ luật và báo cáo rõ ràng. Đừng chỉ xếp chồng các đoạn prompt lên nhau và cầu nguyện nhé!

---

## EN

### At a glance

- Instead of a "mega-agent" doing everything, use a **Router** to direct requests to the right specialist (RAG, Tools, or other agents).
- Every **Tool** needs a clear scope: its own keys (permissions), working hours (timeouts), and a job log.
- Always set a **max_steps** limit to prevent agents from wandering in circles forever.

### Introduction

Imagine walking into a massive office building. You wouldn't want to meet a single person who acts as the security guard, the accountant, and the CTO all at once, would you? Chaos would ensue.

The AI world is no different. An "omnipotent" agent is usually expensive, slow, and prone to hallucinations. This post is for those designing **Multi-Agent** systems, helping you create a smart "receptionist" (Router) to keep everything smooth and safe.

### Core Concepts: The Coordination Engine

1. **The Receptionist (Router):** When a request arrives, the Router decides who is best to handle it. The output must be structured: "Go to Route A, because of Reason B."

2. **Office Doors (Tool Boundaries):** Each tool is like a department. Define clearly: Who can enter? (Read/Write), How long can they stay? (Timeout), and what is strictly forbidden? (Rate limits).

3. **The Briefcase (Handoff):** When passing work between agents, don't hand over an infinite chat transcript. Just provide a compact "state object" so the next agent can get straight to work.

### Pitfalls: Lessons from the Office

- **Handing out Master Keys:** Giving an agent broad access to your DB is the fastest way to a data disaster.
- **No Paper Trail:** When things fail without Tracing, you're just guessing which agent made the mistake.
- **The Omnibus Agent:** The more you stuff into one agent, the more your "utility bill" (token cost) explodes.

### Takeaways

Multi-agent systems only shine when you treat **routers, tools, and handoffs** like professional services with strict SLAs and budgets — not just prompt spaghetti.
