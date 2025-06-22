# Functional Requirements cho MVP của LMS (Learning Management System)

## Tính năng chung cho tất cả người dùng

| ID   | Nhóm tính năng | Tính năng              | Mô tả                                                            | Độ ưu tiên | Dependencies |
| ---- | -------------- | ---------------------- | ---------------------------------------------------------------- | ---------- | ------------ |
| FR01 | Xác thực       | Đăng ký tài khoản      | Cho phép người dùng tạo tài khoản học viên hoặc admin            | Cao        | Không có     |
| FR02 | Xác thực       | Đăng nhập/Xác thực     | Cho phép người dùng đăng nhập vào hệ thống với vai trò tương ứng | Cao        | FR01         |
| FR03 | Xác thực       | Quản lý hồ sơ cá nhân  | Cho phép người dùng xem và chỉnh sửa thông tin cá nhân           | Cao        | FR01, FR02   |
| FR04 | Khóa học       | Xem danh sách khóa học | Hiển thị danh sách các khóa học có sẵn với phân trang            | Cao        | Không có     |
| FR05 | Khóa học       | Xem chi tiết khóa học  | Hiển thị thông tin chi tiết khóa học, mô tả, danh sách video     | Cao        | FR04         |
| FR06 | Khóa học       | Tìm kiếm khóa học      | Cho phép tìm kiếm khóa học theo tên, chủ đề                      | Cao        | FR04         |

## Tính năng dành cho Học viên

| ID   | Nhóm tính năng | Tính năng                 | Mô tả                                                         | Độ ưu tiên | Dependencies |
| ---- | -------------- | ------------------------- | ------------------------------------------------------------- | ---------- | ------------ |
| FR07 | Đăng ký học    | Đăng ký khóa học          | Cho phép học viên đăng ký tham gia khóa học                   | Cao        | FR05         |
| FR08 | Đăng ký học    | Xem khóa học đã đăng ký   | Hiển thị danh sách các khóa học đã đăng ký và trạng thái      | Cao        | FR07         |
| FR09 | Học tập        | Xem video bài học         | Truy cập và xem video bài học với trình phát video tích hợp   | Cao        | FR07         |
| FR10 | Học tập        | Theo dõi tiến độ xem      | Tự động lưu thời điểm đã xem và tiến độ hoàn thành video      | Cao        | FR09         |
| FR11 | Học tập        | Đánh dấu hoàn thành video | Đánh dấu video đã xem hoàn thành để cập nhật tiến độ khóa học | Cao        | FR09         |
| FR12 | Học tập        | Xem tiến độ khóa học      | Xem tổng quan tiến độ hoàn thành toàn bộ khóa học             | Cao        | FR11         |

## Tính năng dành cho Quản trị viên/Admin

| ID   | Nhóm tính năng     | Tính năng                    | Mô tả                                                           | Độ ưu tiên | Dependencies |
| ---- | ------------------ | ---------------------------- | --------------------------------------------------------------- | ---------- | ------------ |
| FR13 | Quản lý người dùng | Quản lý tài khoản            | Xem, tạo, chỉnh sửa, vô hiệu hóa tài khoản người dùng           | Cao        | FR01         |
| FR14 | Quản lý người dùng | Phân quyền người dùng        | Gán và thay đổi vai trò (học viên, admin)                       | Cao        | FR13         |
| FR15 | Quản lý khóa học   | Tạo khóa học mới             | Tạo khóa học với thông tin cơ bản: tên, mô tả, mục tiêu         | Cao        | FR03         |
| FR16 | Quản lý khóa học   | Chỉnh sửa thông tin khóa học | Cập nhật thông tin, mô tả, yêu cầu của khóa học                 | Cao        | FR15         |
| FR17 | Quản lý khóa học   | Xóa khóa học                 | Xóa khóa học khỏi hệ thống                                      | Cao        | FR15         |
| FR18 | Quản lý video      | Thêm video vào khóa học      | Upload và thêm video bài học với tiêu đề, mô tả, thứ tự         | Cao        | FR15         |
| FR19 | Quản lý video      | Chỉnh sửa thông tin video    | Cập nhật tiêu đề, mô tả, thứ tự của video trong khóa học        | Cao        | FR18         |
| FR20 | Quản lý video      | Xóa video                    | Xóa video khỏi khóa học                                         | Cao        | FR18         |
| FR21 | Quản lý video      | Sắp xếp thứ tự video         | Thay đổi thứ tự hiển thị của các video trong khóa học           | Cao        | FR18         |
| FR22 | Quản lý học viên   | Xem danh sách học viên       | Xem danh sách học viên đã đăng ký các khóa học                  | Cao        | FR07         |
| FR23 | Quản lý học viên   | Theo dõi tiến độ học viên    | Xem tiến độ xem video của từng học viên trong từng khóa học     | Cao        | FR22         |
| FR24 | Quản lý danh mục   | Quản lý chủ đề khóa học      | Thêm, sửa, xóa danh mục chủ đề khóa học                         | Cao        | FR02         |
| FR25 | Báo cáo thống kê   | Xem báo cáo hệ thống         | Xem thống kê số lượng người dùng, khóa học, thời gian xem video | Trung bình | FR02         |
