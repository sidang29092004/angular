
# spotife — Bài test Lab 1, 2, 3

Website âm nhạc Angular, thiết kế cho mobile. Giao diện rộng tối đa 430px và nằm giữa màn hình trên desktop.

## Chạy dự án

```bash
npm install
npm start
```

Mở `http://localhost:4200`. Trên PowerShell nếu `npm.ps1` bị chặn, dùng `npm.cmd start`.

## Nội dung theo đề

- Trang chủ giữ các section hiện có: hero, playlist, hai banner, bài hát và nghệ sĩ.
- **Feedback:** hiển thị tối đa hai nhận xét mới nhất trong nhóm có số sao cao nhất. Hàm `getLatestTopRatedFeedbacks()` lọc theo `rating`, sắp xếp `createdAt` giảm dần rồi lấy hai phần tử.
- **Newsletter:** form email với kiểm tra bắt buộc, định dạng email, thông báo lỗi và xác nhận tại chỗ.
- **Data dạng mảng:** `playlists`, `tracks`, `artists`, `feedbacks` trong `src/app/data/music-data.ts`; interface nằm trong `src/app/models/music.ts`.
- Các component hiển thị danh sách bằng `@for`; footer có liên kết đến feedback và newsletter.

Đây là website minh họa tĩnh, không gọi API hay gửi email. Newsletter chỉ ghi nhận email trong bộ nhớ của component; rời trang hoặc tải lại sẽ xóa thông tin. Trình phát nhạc vẫn là giao diện minh họa.

## Kiểm tra và xuất bài

```bash
npm test -- --watch=false
npm run build
npm run export:lab1
```

Lệnh cuối xuất bản HTML/CSS vào `dist/lab1-spotife`. Mở `index.html` trong trình duyệt để xem. Bản này không có JavaScript nên nút đăng ký bị vô hiệu hóa; dùng bản Angular để thử kiểm tra email.

Xem [LAB1.md](LAB1.md) để biết cấu trúc component và nguồn tài nguyên.
