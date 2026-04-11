---
title: "dbt Testing & Docs: Bản hợp đồng của dữ liệu sạch"
date: "2026-03-22"
excerpt: "dbt biến SQL thành những sản phẩm có kiểm soát chất lượng. Hãy học cách dùng Test và Docs như một bản hợp đồng cam kết sự chính xác giữa kỹ sư dữ liệu và doanh nghiệp."
category: data-engineering
---

## VI

### Tóm lược

- Coi **dbt Test** là những điều khoản hợp đồng: Nếu dữ liệu không thỏa mãn (ví dụ bị trùng khóa, bị trống), Pipeline sẽ lập tức "đình công" thay vì âm thầm lưu dữ liệu sai.
- **Lineage (Sơ đồ phả hệ)** giúp bạn biết được một thay đổi nhỏ ở nguồn sẽ làm vỡ những báo cáo nào ở hạ nguồn, từ đó chủ động phòng tránh rủi ro.
- Đừng để các định nghĩa (logic) quan trọng nằm rải rác trong các công cụ báo cáo (BI). Hãy đưa chúng về một mối duy nhất tại dbt.

### Giới thiệu

Bạn đã bao giờ rơi vào cảnh dở khóc dở cười khi hai phòng ban đưa ra hai con số doanh thu khác nhau cho cùng một ngày chưa? Đó thường là kết quả của việc mỗi người tự viết một kiểu logic SQL trên công cụ báo cáo của riêng mình.

dbt sinh ra để giải quyết nỗi đau đó. Nó biến SQL thuần túy thành một sản phẩm kỹ thuật có quy trình kiểm soát chất lượng nghiêm ngặt. Bài viết này mình chia sẻ cách dùng dbt để tạo ra một "bản hợp đồng" về độ sạch của dữ liệu, giúp team Data và team Kinh doanh luôn tin tưởng lẫn nhau.

### Khái niệm cốt lõi: Những điều khoản cam kết

1. **Kiểm tra tự động (Generic Tests):** Những thứ cơ bản nhất nhưng lại dễ sai nhất: khóa chính có duy nhất không? có cột nào bị NULL vô lý không? Hãy để dbt tự động canh gác những cửa ngõ này.

2. **Kiểm tra nghiệp vụ (Singular Tests):** Dữ liệu có thể đúng định dạng nhưng vẫn sai ý nghĩa. Ví dụ: "Tổng tiền thu vào phải bằng tổng tiền khách hàng trả". Đây là nơi bạn viết các đoạn SQL để đối soát logic thực tế.

3. **Sơ đồ và Tài liệu (Lineage & Docs):** Một tấm bản đồ chi tiết cho thấy dữ liệu đi từ đâu đến đâu. Khi bạn sửa một cột, bạn sẽ biết ngay dashboard của Giám đốc tài chính có bị ảnh hưởng hay không.

### Chi tiết từ "hiện trường"

Hãy ưu tiên viết Test cho những dòng chảy "hái ra tiền" (Money path). Một lỗi ở bảng doanh thu quan trọng hơn nhiều so với một lỗi ở bảng log hành vi phụ. Trong quy trình CI (tự động hóa), hãy thiết lập để không ai có thể trộn (merge) code mới nếu các bài kiểm tra quan trọng chưa vượt qua.

**Bảng thứ tự ưu tiên:**

| Mức độ | Loại kiểm tra | Tại sao quan trọng? |
| ------- | --------- | ----- |
| Cấp bách (P0) | Khóa chính, tính duy nhất | Lỗi này sẽ làm sai lệch mọi con số tổng hợp phía sau |
| Quan trọng (P1) | Liên kết giữa các bảng | Đảm bảo không có dữ liệu "mồ côi" làm sai báo cáo |
| Cần thiết (P2) | Độ tươi của dữ liệu | Phát hiện ngay nếu dữ liệu hôm nay chưa đổ về kho |

### Những sai lầm thường gặp

- **Chỉ cảnh báo mà không chặn đứng:** Để chế độ `warn` quá nhiều cho những lỗi nghiêm trọng khiến hệ thống vẫn tiếp tục chạy với dữ liệu rác.
- **Tài liệu "đóng bụi":** Viết Docs một lần rồi bỏ mặc, trong khi code đã thay đổi hàng chục phiên bản.

### Kết luận

dbt không chỉ là một công cụ chạy SQL, nó là một tư duy làm việc chuyên nghiệp. Đầu tư vào Tests và Lineage là cách rẻ nhất để mua "bảo hiểm" cho lòng tin của doanh nghiệp vào dữ liệu. Hãy để dữ liệu của bạn luôn "có cam kết" rõ ràng nhé!

---

## EN

### At a glance

- Treat **dbt Tests** as contract clauses: If the data fails a condition (e.g., duplicate keys, unexpected NULLs), the pipeline "strikes" immediately instead of silently leaking garbage data.
- **Lineage maps** shrink incident times by showing exactly which downstream dashboards will break if a source schema changes.
- Anti-pattern: defining core business metrics inside BI tools. Keep the logic in dbt as the single source of truth.

### Introduction

Have you ever faced the awkward situation where two departments report different revenue numbers for the same day? This usually happens when logic is scattered across different BI tools.

dbt turns warehouse SQL into a **quality-managed product**. This post is about using tests and documentation as an **operating contract**, ensuring that Data and Business teams stay in sync and maintain trust.

### Takeaways

dbt turns SQL into a disciplined engineering process. Investing in tests and explicit lineage is the cheapest insurance for a shared data warehouse. Make sure your data signs a clean contract before it hits the dashboard!
