# Hướng dẫn bước tiếp theo cho nhóm 4 người

## Hướng dẫn Commit và Pull Request (Cập nhật 09/10/2026)
Khi tạo Pull Request gộp nhánh `C-Tuấn` (Giai đoạn 2 UI Độc giả) vào `main`, bạn nên sử dụng nội dung sau để chốt:

**Tiêu đề PR:** `fix(ui): Hoàn thiện lỗi giao diện và logic phân trang, đếm sách`

**Nội dung PR:**
- **BookList.vue:** Sửa lỗi `Invalid end tag` do dư thẻ `</div>` khiến component bị lỗi hiển thị.
- **BookList.vue:** Điều chỉnh cấu hình phân trang từ 12 sách/trang về 10 sách/trang.
- **AuthorList.vue & PublisherList.vue:** Sửa lỗi đếm sai số lượng sách của từng tác giả/nhà xuất bản do tham chiếu nhầm ID của MongoDB (`_id`) thay vì khóa chính của MySQL (`maTacGia`, `maNXB`).

### Prompt gợi ý cho phiên làm việc tiếp theo:
```text
Bạn hãy đọc lại các file trong thư mục Cores để nắm ngữ cảnh hiện tại. Nhánh của thành viên C vừa được merge vào main, hoàn thiện toàn bộ Giai đoạn 2 cho Giao diện Độc giả (bộ lọc, phân trang 10 sách, lịch sử mượn, fix bug hiển thị số lượng sách). 

Nhiệm vụ tiếp theo của chúng ta là bắt đầu công việc của thành viên D trong Giai đoạn 2: bổ sung tính năng Import/Export CSV danh mục sách cho Admin. Hãy giúp tôi thiết kế luồng Import/Export sách và viết mã cho tính năng này. Nhớ chú ý các yêu cầu về validate từng dòng và định dạng CSV (UTF-8 BOM).
```

---

Tài liệu này là kịch bản thực thi nối tiếp, không phải danh sách việc làm một lần. Mỗi giai đoạn có đầu ra nhìn thấy được, điều kiện qua cổng và prompt sẵn dùng. Chỉ bắt đầu giai đoạn sau khi trưởng nhóm xác nhận giai đoạn trước đạt.

## Việc ưu tiên cho phiên kế tiếp — làm mới giao diện mã nguồn có sẵn

Người dùng hiện muốn sửa/tùy biến dự án của bạn mình và cải thiện giao diện. Đây là nhánh việc frontend có thể thực hiện song song với việc rà soát backend, miễn là không đổi hợp đồng API hoặc logic mượn/trả. Đọc `Cores/checkpoint.md` trước: các trạng thái chạy, migration và tài khoản ở đó là ghi chép trước đây, chưa được kiểm tra lại ngày 2026-09-30. Kế hoạch bốn giai đoạn dưới đây vẫn giữ để xử lý nghiệp vụ và tiêu chí môn học; không coi mốc thời gian là tiến độ đã đạt.

**Điểm bắt đầu:** kiểm tra giao diện thực tế tại `/`, `/login`, `/reader`, `/admin` nếu môi trường chạy được; lập danh sách vấn đề có ảnh hoặc mô tả cụ thể. Nếu thiếu DB hoặc không đăng nhập được, vẫn có thể cải thiện shell, trang khách và các component độc lập, đồng thời ghi rõ màn hình nào chưa xem được. Kiểm tra nội dung mang tên/thông tin chủ source cũ để người dùng quyết định thay bằng nội dung nào. Chọn hướng thiết kế phù hợp một thư viện học thuật, thống nhất màu, chữ, khoảng cách và cách dùng card/bảng/form. Bắt đầu từ các file `frontend/src/App.vue`, `frontend/src/views/*`, `frontend/src/components/reader/*`, `frontend/src/components/admin/*`; xem thực tế trước khi thay.

**Đầu ra cần có:** giao diện đã sửa trực tiếp trong repo, ảnh hoặc mô tả trước/sau ở desktop và mobile, `npm run build` tại `frontend` chạy thành công, và ghi rõ các luồng đã/ chưa thể kiểm tra. Cập nhật `Cores/checkpoint.md` với tiến độ thật. Chỉ cập nhật README nếu hướng dẫn sử dụng hoặc tên hiển thị đã thay đổi.

### Prompt sẵn dùng cho phiên triển khai giao diện

```text
Bạn đang làm việc trên LibraryManagement, một dự án có sẵn của bạn tôi. Hãy đọc Cores/checkpoint.md, Cores/Tieuchiduan.md, Cores/Chienluoc.md và Cores/next_step_guide.md trước khi sửa. Tôi muốn tùy biến và hoàn thiện giao diện vì giao diện hiện tại chưa đẹp/phù hợp.

Hãy kiểm tra mã frontend và, nếu chạy được, xem giao diện thực tế của các tuyến /, /login, /reader, /admin ở desktop và mobile. Nêu ngắn gọn những vấn đề cụ thể; chọn một hướng thiết kế thống nhất, phù hợp hệ thống thư viện học thuật; triển khai trực tiếp vào mã hiện có. Ưu tiên bố cục, màu/chữ, khoảng cách, điều hướng, nút, form, bảng/card, trạng thái tải/rỗng/lỗi và responsive. Kiểm tra các tên, liên hệ hoặc định danh từ source cũ; nếu chưa biết nội dung thay thế, dùng nội dung trung tính và ghi rõ chỗ cần tôi chốt.

Giữ nguyên API, phân quyền và hành vi nghiệp vụ khi làm UI; không viết lại ứng dụng chỉ để đổi hình thức. Không coi ghi chép môi trường cũ là trạng thái chạy hiện tại. Sau khi sửa, chạy npm run build trong frontend, kiểm tra trực quan các màn hình có thể truy cập, báo cáo thay đổi/kết quả/giới hạn, rồi cập nhật Cores/checkpoint.md (chỉ sửa file hiện có). Nếu cần tôi chọn nhận diện cụ thể, hãy hỏi ngắn gọn nhưng vẫn tiến hành các phần không phụ thuộc câu trả lời.
```

## 0. Quy ước làm việc chung

### Vai trò và vùng sở hữu

| Người | Vùng sở hữu | Sản phẩm bàn giao |
|---|---|---|
| A | `backend/migrations`, `backend/controllers/borrowController.js`, route/API thống kê | CSDL đúng, luồng mượn-trả nhất quán, API số liệu |
| B | `frontend/src/components/admin`, module store/API thống kê | Dashboard quản trị trực quan |
| C | `frontend/src/components/reader`, store mượn, UX catalogue | Luồng độc giả trực quan |
| D | CRUD quản trị sách/danh mục, dữ liệu demo, README, kiểm thử | Nhập/xuất, dữ liệu demo, tài liệu nộp bài |

Không sửa trực tiếp file thuộc vùng người khác. Nếu bắt buộc thay đổi hợp đồng API hoặc model, tạo một issue ngắn nêu: endpoint/trường thay đổi, người bị ảnh hưởng và ví dụ request/response. A là người chốt hợp đồng của API mượn-trả và thống kê.

### Definition of Done cho mọi việc

Một việc chỉ được coi là xong khi có đủ: mã nguồn, cách kiểm tra, ảnh/screenshot hoặc response API mẫu, và không làm hỏng luồng cũ. Commit nên có dạng `feat(stats): add dashboard summary` hoặc `fix(borrow): prevent duplicate stock update`.

### Prompt nền — dán trước mọi prompt bên dưới

> **Đọc `Cores/checkpoint.md` trước** để nắm trạng thái mới nhất của dự án (môi trường, lỗi đã gặp, migration đã chạy).

```text
Bạn đang làm việc trong workspace LibraryManagement tại D:\Project\CT467\LibraryManagement.
Stack: Node.js v26 / Express / Sequelize 6 / MySQL 8.0.46 (port 3306) + Vue 3 / Vite / Vuex.
Yêu cầu môn học: Cores/Tieuchiduan.md | Chiến lược: Cores/Chienluoc.md | Hướng dẫn: Cores/next_step_guide.md | Trạng thái hiện tại: Cores/checkpoint.md.
Đây là mã nguồn có sẵn của bạn người dùng; mục tiêu là sửa, tùy biến và hoàn thiện, trong đó cải thiện giao diện là yêu cầu hiện tại. Chỉ áp dụng phân công A/B/C/D khi thực sự làm việc theo nhóm.

Ghi chép môi trường từ 2026-09-28 (cần xác minh lại trước khi dùng):
- Backend từng chạy ở http://localhost:5000 (npm run dev trong thư mục backend)
- Frontend từng chạy ở http://localhost:5173 (npm run dev trong thư mục frontend)
- Database từng được cấu hình: library_db, host: 127.0.0.1:3306; xem file cấu hình cục bộ để chạy
- sequelize-cli đọc cấu hình từ backend/config/config.json (KHÔNG phải .env)
- Migration và seed-admin được ghi là đã chạy ở lần trước; xác minh lại môi trường hiện tại

Quy tắc bắt buộc:
1) Đọc Cores/checkpoint.md và các file liên quan trước khi sửa. Giữ nguyên thay đổi không liên quan.
2) Chỉ thực hiện phạm vi được giao bên dưới; không tự ý đổi API/schema của người khác.
3) Dùng migration MỚI cho mọi thay đổi CSDL; không sửa migration cũ và không dùng sequelize.sync({ alter: true }) như cơ chế migration.
4) Sau khi sửa, chạy các kiểm tra phù hợp, báo cáo file đã đổi, lệnh đã chạy, kết quả và các rủi ro còn lại.
5) Không chỉ đề xuất: hãy trực tiếp triển khai phần việc nếu không cần quyền truy cập ngoài workspace.
6) Cập nhật Cores/checkpoint.md sau khi hoàn tất một giai đoạn hoặc sửa một lỗi quan trọng.
```

---

## Giai đoạn 1 — Khóa lỗi dữ liệu lõi (ngày 1–5)

### Mục tiêu chung

Làm cho số lượng sách không bao giờ âm, không thay đổi hai lần, và trạng thái phiếu mượn hợp lệ. Đây là giai đoạn duy nhất được phép sửa logic tồn kho.

### A — sửa nghiệp vụ/CSDL

**Việc làm:**

1. Đọc toàn bộ migration routine hiện tại và `borrowController`.
2. Chọn một nguồn cập nhật tồn kho: khuyến nghị transaction trong backend khi `Chờ duyệt → Đã duyệt` và `Đã duyệt → Đã trả`; gỡ trigger tăng/giảm tồn bằng migration mới. Giữ trigger tính phạt.
3. Áp dụng state machine: `Chờ duyệt → Đã duyệt | Từ chối`; `Đã duyệt → Đã trả`. Từ chối không được khôi phục tồn nếu tồn chỉ giảm lúc duyệt.
4. Dùng transaction và lock phù hợp khi duyệt để hai yêu cầu đồng thời không thể vượt tồn kho.
5. Sửa routine “phiếu chưa trả” theo trạng thái chuẩn `Đã duyệt`.

**Kết quả nhìn thấy được:**

- Trong giao diện quản trị, nhập một cuốn có tồn `2`, tạo yêu cầu mượn `1`, duyệt, trả: số tồn hiển thị lần lượt `2 → 1 → 2`.
- Bấm trả lần hai hoặc duyệt phiếu đã duyệt: nhận HTTP 409/400 với thông báo rõ, số tồn không đổi.
- Chạy SQL/API danh sách chưa trả sau khi duyệt thấy phiếu; sau khi trả không còn thấy.

**Prompt cho A:**

```text
[DÁN PROMPT NỀN]

Bạn là thành viên A, chỉ phụ trách backend CSDL và luồng mượn-trả.
Hãy triển khai Giai đoạn 1 trong Cores/next_step_guide.md.

Yêu cầu kỹ thuật: tạo migration mới để loại bỏ đúng hai trigger tăng/giảm tồn kho cũ, giữ trigger tính phạt; cập nhật procedure phiếu chưa trả theo enum trạng thái thực tế; sửa borrowController theo transaction và state machine. Không cập nhật tồn kho ở hai nơi. Khi duyệt, phải kiểm tra tồn trong transaction; khi trả/từ chối lặp phải trả lỗi hợp lý.

Viết hoặc cập nhật một kịch bản kiểm thử có thể chạy được cho chuỗi: tạo yêu cầu → duyệt → trả → thử trả lại. Cuối cùng đưa bảng before/after tồn kho và các endpoint đã kiểm thử.
```

### B — chuẩn bị dashboard không chạm logic

**Việc làm:** tạo khung dashboard gồm ba card: “Sách mượn tháng này”, “Độc giả đã mượn năm nay”, “Phiếu chưa trả”; chuẩn bị loading, lỗi và empty state. Dùng fixture cục bộ, tách riêng khỏi API thật để không chặn A.

**Kết quả nhìn thấy được:** vào `/admin` thấy 3 card nhất quán, không còn card bị comment; khi fixture rỗng hiện “Chưa có dữ liệu”.

**Prompt cho B:**

```text
[DÁN PROMPT NỀN]

Bạn là thành viên B, chỉ làm giao diện dashboard quản trị trong frontend/src/components/admin và module store/API mới nếu cần. Trong Giai đoạn 1, hãy tạo UI sẵn sàng cho ba chỉ số bắt buộc: sách mượn tháng này, độc giả đã mượn năm nay, phiếu chưa trả. Chưa gọi endpoint chưa tồn tại; dùng một service/fixture tách biệt để có thể thay bằng API ở giai đoạn 2. Có loading, error, empty state, responsive Bootstrap. Không sửa controller/migration/borrow flow.

Hãy chạy frontend build và báo cáo ảnh hưởng cùng hướng dẫn cách xem ở /admin.
```

### C — rà soát UX độc giả

**Việc làm:** bổ sung validation giỏ mượn ở client: không trùng sách, số lượng nguyên dương, không vượt tồn hiển thị; hiển thị rõ “chờ duyệt, không làm giảm tồn cho đến khi duyệt”. Chưa đổi API.

**Kết quả nhìn thấy được:** thêm sách trùng không tạo dòng thứ hai; nhập `0`, số âm hoặc lớn hơn tồn bị chặn/báo lỗi.

**Prompt cho C:**

```text
[DÁN PROMPT NỀN]

Bạn là thành viên C, chỉ làm frontend dành cho độc giả. Triển khai Giai đoạn 1: rà soát BookList và giỏ mượn, đảm bảo không thêm trùng sách, chỉ nhận số lượng nguyên dương không vượt tồn hiển thị, và hiển thị thông báo rằng yêu cầu ở trạng thái Chờ duyệt. Không đổi endpoint, schema hay code dashboard admin.

Hãy kiểm tra build và mô tả thao tác UI để người khác xác minh các tình huống hợp lệ/lỗi.
```

### D — dữ liệu demo và checklist

**Việc làm:** tạo tài liệu dữ liệu demo tối thiểu: 1 admin, 2 độc giả, 3 sách (trong đó có sách tồn 2), tác giả/NXB/thể loại tương ứng. Tạo checklist test thủ công cho A chạy.

**Kết quả nhìn thấy được:** một file hướng dẫn dữ liệu/demo và checklist có ô PASS/FAIL; demo được lặp lại trên database sạch.

**Prompt cho D:**

```text
[DÁN PROMPT NỀN]

Bạn là thành viên D, phụ trách dữ liệu demo, tài liệu và QA; không sửa logic mượn-trả của A. Triển khai Giai đoạn 1: bổ sung vào README hoặc tài liệu mới một bộ dữ liệu demo tối thiểu và checklist test thủ công cho luồng tạo yêu cầu → duyệt → trả → thao tác lặp. Dữ liệu phải giúp quan sát tồn kho 2 → 1 → 2. Nếu dự án chưa có seed, đề xuất hoặc thêm script seed riêng, an toàn, có hướng dẫn chạy từ database sạch.
```

### Cổng nghiệm thu 1

Trưởng nhóm cùng A chạy checklist của D. Chỉ qua khi có ảnh trước/sau số tồn và response lỗi của thao tác lặp. B và C không được tích hợp dữ liệu thật trước cổng này.

---

## Giai đoạn 2 — Hoàn thành yêu cầu thống kê và chức năng thấy được (ngày 6–12)

### A — API thống kê chuẩn

**Việc làm:** tạo API admin `GET /api/thong-ke/tong-quan` trả về `{ sachMuonThang, docGiaMuonNam, phieuChuaTra }`, và `GET /api/thong-ke/phieu-chua-tra` trả danh sách chi tiết. Sửa/thêm procedure để `docGiaMuonNam = COUNT(DISTINCT maDocGia)` theo năm mượn; đảm bảo controller đọc đúng kết quả Sequelize.

**Kết quả nhìn thấy được:** Postman/browser với token admin hiển thị số liệu JSON; thay đổi một phiếu trong tháng làm card `sachMuonThang` đổi tương ứng.

**Prompt cho A:**

```text
[DÁN PROMPT NỀN]

Bạn là A. Giai đoạn 1 đã được nghiệm thu. Hãy triển khai Giai đoạn 2 phần backend thống kê: migration mới sửa/thêm stored procedure cho (1) tổng số sách đã mượn trong tháng hiện tại, (2) COUNT DISTINCT độc giả đã mượn trong năm hiện tại, (3) danh sách phiếu chưa trả theo trạng thái Đã duyệt. Thêm route/controller admin-only GET /api/thong-ke/tong-quan và GET /api/thong-ke/phieu-chua-tra.

Kiểm tra cẩn thận kiểu kết quả sequelize.query, không dùng destructuring khiến giá trị undefined. Cung cấp ví dụ JSON thật hoặc fixture từ test, và kiểm tra 401/403 khi không phải admin.
```

### B — tích hợp dashboard và biểu đồ

**Việc làm:** thay fixture bằng API của A; thêm bảng phiếu chưa trả, badge quá hạn, biểu đồ số lượt mượn theo tháng nếu API có dữ liệu. Không tự tính thống kê từ danh sách frontend.

**Kết quả nhìn thấy được:** `/admin` đổi từ fixture sang dữ liệu thật; loading rồi hiện ba số; bảng phiếu chưa trả có tên độc giả, hạn trả, số ngày quá hạn.

**Prompt cho B:**

```text
[DÁN PROMPT NỀN]

Bạn là B. A đã công bố GET /api/thong-ke/tong-quan và GET /api/thong-ke/phieu-chua-tra. Hãy tích hợp các endpoint này vào dashboard admin, bỏ fixture nhưng giữ empty/loading/error state. Hiển thị ba chỉ số bắt buộc, bảng phiếu chưa trả (độc giả, sách, hạn trả, quá hạn), và chỉ dùng dữ liệu server làm nguồn sự thật. Không sửa backend.

Hãy kiểm tra bằng tài khoản admin và nêu chính xác những gì người dùng thấy ở /admin khi có dữ liệu, không có dữ liệu và API lỗi.
```

### C — catalogue hữu dụng

**Việc làm:** thêm lọc theo thể loại/tác giả/NXB, sắp xếp và phân trang frontend; lịch sử mượn thể hiện hạn trả/quá hạn cùng các phiếu PDF hiện có.

**Kết quả nhìn thấy được:** người đọc gõ/lọc, số thẻ sách giảm đúng; đổi trang không mất điều kiện lọc; lịch sử hiện badge “quá hạn” nếu ngày hiện tại vượt hạn và chưa trả.

**Prompt cho C:**

```text
[DÁN PROMPT NỀN]

Bạn là C. Hãy triển khai Giai đoạn 2 cho giao diện độc giả: lọc sách theo thể loại, tác giả, NXB; sắp xếp và phân trang client-side từ danh sách hiện có; lịch sử mượn hiển thị hạn trả, trạng thái và badge quá hạn khi phiếu Đã duyệt đã quá ngày trả. Giữ tương thích endpoint hiện tại, không đổi backend/admin. Đảm bảo reset/trang hiện tại hợp lý khi điều kiện lọc đổi.

Hãy chạy build và nêu kịch bản trực quan để kiểm tra từng lọc, phân trang và badge quá hạn.
```

### D — import/export danh mục

**Việc làm:** chỉ bổ sung import/export CSV cho sách. Import phải validate trước, báo rõ dòng lỗi, không insert một phần mơ hồ; export tải danh sách hiện tại. Không đụng schema/luồng của A.

**Kết quả nhìn thấy được:** admin tải CSV mẫu, sửa một dòng sai thấy báo “dòng 3 thiếu tên sách”, sửa lại thì import thành công và sách mới xuất hiện trong danh sách.

**Prompt cho D:**

```text
[DÁN PROMPT NỀN]

Bạn là D. Hãy triển khai Giai đoạn 2: import/export CSV sách cho admin. Phạm vi chỉ là sách và các file CRUD sách/tài liệu liên quan. Import cần template CSV, validation đầy đủ theo từng dòng (tên, năm, số lượng, giá, mã tác giả/NXB/thể loại), response báo rõ dòng và lý do lỗi, và transaction để không nhập dở dang. Export phải tạo CSV UTF-8 có BOM để mở Excel tiếng Việt. Không sửa migration hay borrow flow.

Sau khi triển khai, cho ví dụ CSV hợp lệ, CSV lỗi và hướng dẫn kiểm tra bằng giao diện.
```

### Cổng nghiệm thu 2

Chụp một ảnh `/admin` có ba chỉ số và bảng chưa trả; một ảnh catalogue đã lọc; một ảnh/bằng chứng import CSV. Đối chiếu hai thống kê với truy vấn SQL/procedure của A.

---

## Giai đoạn 3 — Tăng độ tin cậy và hoàn thiện UX (ngày 13–17)

### Việc theo người

- **A:** test transaction/tồn kho trong các ca cạnh tranh, bảo vệ route thống kê, bỏ `sequelize.sync({ alter: true })` khỏi startup production.
- **B:** rà soát responsive, trạng thái API chậm/lỗi và tính nhất quán card–bảng–biểu đồ.
- **C:** accessibility cơ bản: focus, nhãn form, thông báo lỗi không chỉ dựa màu sắc; kiểm thử luồng trên màn hình hẹp.
- **D:** smoke test CRUD và import/export; rà soát không trả password hash trong API/login; cập nhật tài liệu cài đặt.

**Kết quả nhìn thấy được:** mở giao diện ở độ rộng mobile vẫn thao tác được; API trái quyền nhận 403; database mới migrate được; smoke checklist toàn PASS.

**Prompt chung giai đoạn 3 (thay `[VAI TRÒ]` và `[PHẠM VI]`):**

```text
[DÁN PROMPT NỀN]

Bạn là [VAI TRÒ]. Hãy triển khai Giai đoạn 3 trong Cores/next_step_guide.md, chỉ trong phạm vi [PHẠM VI]. Trước tiên kiểm tra các thay đổi Giai đoạn 1–2 để tránh ghi đè. Tập trung vào độ tin cậy, quyền truy cập, trạng thái lỗi và khả năng demo; không thêm chức năng lớn. Hãy tạo/chạy các kiểm tra phù hợp và cung cấp bằng chứng nhìn thấy được (response HTTP, ảnh giao diện hoặc checklist PASS/FAIL).
```

### Cổng nghiệm thu 3

Không còn lỗi blocker, không còn cập nhật tồn kho sai, frontend build thành công và một người không trực tiếp lập trình có thể chạy được checklist.

---

## Giai đoạn 4 — Đóng gói bài nộp và bảo vệ (ngày 18–20)

### Phân việc

| Người | Việc chốt | Bằng chứng bàn giao |
|---|---|---|
| A | Chạy migration database sạch, xuất script/routine để trình bày | Log migration và bộ truy vấn SQL demo function/trigger/procedure |
| B | Chốt dashboard, ảnh screenshot và slide số liệu | Ảnh dashboard cùng dữ liệu nguồn |
| C | Chốt kịch bản độc giả: đăng ký/đăng nhập/mượn/xem lịch sử | Video hoặc chuỗi ảnh thao tác |
| D | Chốt README, ERD, tài khoản demo, checklist regression | Hướng dẫn một lệnh/một chuỗi lệnh để chạy từ đầu |

**Kết quả nhìn thấy được:** một máy/database sạch có thể setup theo README, chạy ứng dụng, đăng nhập tài khoản demo, hoàn tất một chuỗi mượn-trả và thấy thống kê thay đổi.

**Prompt kết thúc cho trưởng nhóm:**

```text
[DÁN PROMPT NỀN]

Bạn là người review cuối cho đồ án. Không thêm tính năng. Hãy kiểm tra Cores/Tieuchiduan.md và đối chiếu từng tiêu chí với migration, backend API, frontend và README. Chạy các kiểm tra an toàn có thể chạy trong workspace, liệt kê PASS/FAIL kèm file hoặc endpoint làm bằng chứng. Đặc biệt kiểm tra đủ 7 bảng, function kiểm tra tồn, trigger phạt trễ, procedure phiếu chưa trả, thống kê sách mượn tháng, thống kê DISTINCT độc giả mượn năm, và luồng tồn kho không cập nhật hai lần. Nếu phát hiện lỗi, chỉ đưa bản vá tối thiểu cần thiết và kiểm tra lại.
```

## Bảng điều hành hằng ngày

Mỗi cuối ngày, mỗi người ghi 4 dòng trong issue/nhóm chat:

```text
Hôm nay: [đã hoàn thành gì]
Bằng chứng: [link PR / ảnh / lệnh và kết quả]
Đang chờ: [ai hoặc thông tin gì]
Ngày mai: [một việc cụ thể]
```

Nếu một cổng nghiệm thu FAIL, quay lại đúng chủ sở hữu của giai đoạn đó; các thành viên khác chỉ tiếp tục phần không phụ thuộc. Điều này giữ tiến độ song song mà không che lấp lỗi CSDL lõi.
