# Lab 1, 2, 3 — spotife

Giao diện web âm nhạc lấy cảm hứng từ Spotify, thiết kế riêng cho mobile.
Trên desktop, trang giữ chiều rộng tối đa 430px và nằm giữa màn hình.

## Cách xem bài

- Dự án Angular: chạy `npm install`, sau đó `npm start` và mở `http://localhost:4200`.
- Xuất bản HTML/CSS: chạy `npm run export:lab1`. Kết quả nằm ở `dist/lab1-spotife`.
- Bản HTML/CSS: mở `index.html` trong thư mục kết quả, không cần máy chủ.
- PowerShell chặn `npm.ps1`: dùng `npm.cmd` thay cho `npm`.

## Nội dung đáp ứng đề bài

1. Header: thương hiệu spotife, biểu tượng tìm kiếm và các liên kết điều hướng.
2. Hero: playlist tiêu điểm với ảnh nền, tiêu đề và liên kết đến mục bài hát.
3. Section playlist: bốn playlist, bố cục hai cột.
4. Banner xanh xen giữa playlist và bài hát nổi bật.
5. Section bài hát: bốn ca khúc, ảnh bìa, nghệ sĩ và thời lượng minh họa.
6. Banner tím xen giữa bài hát và nghệ sĩ.
7. Section nghệ sĩ: ba ảnh đại diện hình tròn.
8. Feedback: tối đa hai nhận xét mới nhất trong nhóm có số sao cao nhất, kèm đánh giá sao và thông tin người nghe.
9. Newsletter: form đăng ký email có nhãn, kiểm tra dữ liệu và thông báo kết quả.
10. Footer: thương hiệu, liên kết đến các section và thông tin cuối trang.
11. Thanh trình phát minh họa và điều hướng cố định phía dưới.
12. Dữ liệu playlist, bài hát, nghệ sĩ, feedback được tổ chức dưới dạng mảng TypeScript.

## Tổ chức mã nguồn

| Thành phần      | Vị trí / Nội dung                                                                    |
| --------------- | ------------------------------------------------------------------------------------ |
| Home            | `src/app/pages/home`: sắp xếp các section của trang chủ                              |
| Data            | `src/app/data/music-data.ts`: các mảng `playlists`, `tracks`, `artists`, `feedbacks` |
| Models          | `src/app/models/music.ts`: interface cho dữ liệu                                     |
| Header          | Header và các tab điều hướng                                                         |
| Hero            | Playlist tiêu điểm                                                                   |
| PlaylistSection | Danh sách playlist, hiển thị bằng `@for`                                             |
| PromoBanner     | Banner dùng lại hai lần, truyền HTML qua `ng-content`                                |
| TracksSection   | Danh sách bài hát, hiển thị bằng `@for`                                              |
| ArtistsSection  | Danh sách nghệ sĩ, hiển thị bằng `@for`                                              |
| FeedbackSection | Lọc số sao cao nhất, sắp xếp ngày giảm dần và lấy hai nhận xét mới nhất bằng `@for`  |
| Newsletter      | Form email dùng `FormsModule`, `ngModel` và `NgForm`                                 |
| Footer          | Footer và các liên kết đến section                                                   |
| BottomNav       | Trình phát minh họa dùng bài đầu tiên trong mảng, điều hướng dưới                    |

Các component dùng chung nằm tại `src/app/shared/components`.
Bản xuất HTML/CSS kèm bản sao `src/app` trong thư mục `source-components` để đối chiếu.

## Newsletter và dữ liệu tĩnh

Form Angular kiểm tra email bắt buộc, định dạng email và độ dài tối đa 254 ký tự.
Email hợp lệ chỉ được ghi nhận trong bộ nhớ của component và hiện thông báo xác nhận.
Không gửi dữ liệu lên máy chủ, không gửi bản tin; rời trang hoặc tải lại sẽ xóa email.
Feedback, tên bài hát và nghệ sĩ đều là dữ liệu mẫu.

Bản `index.html` xuất ra chỉ dùng HTML/CSS, không chứa thẻ `script`,
không cần Angular runtime và vẫn xem được khi tắt JavaScript.
Form trong bản này chỉ minh họa giao diện, nút đăng ký bị vô hiệu hóa.
Chạy bản Angular để thử tương tác và kiểm tra email.
Trình phát, thanh thời lượng và thông tin bài hát là nội dung minh họa cho layout.

## Tài nguyên

Ảnh được lưu cục bộ trong `assets/images`, lấy từ Unsplash:

- [Phố đêm](https://unsplash.com/photos/Rz8_cOtL5Co).
- [Người đeo tai nghe](https://unsplash.com/photos/Mwa8-6H9QPk) — Yohan Marion.
- Các ảnh biển, hoàng hôn và chân dung: ID `photo-1518837695005-2083093ee35b`,
  `photo-1475924156734-496f6cac6ec1`, `photo-1524504388940-b1c1722653e1`,
  `photo-1506794778202-cad84cf45f1d`, `photo-1534528741775-53994a69daeb`.

Font Manrope được lưu cục bộ, giấy phép SIL Open Font License nằm trong
`assets/fonts/OFL.txt`. Logo, biểu tượng SVG và đĩa vinyl CSS được dựng trong mã nguồn.
