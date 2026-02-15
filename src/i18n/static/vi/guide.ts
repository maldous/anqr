import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Hướng dẫn sử dụng ANQR',
  description: 'Hướng dẫn đầy đủ về cách sử dụng ANQR để tạo mã QR.',
  lastUpdated: 'ngày 1 tháng 2 năm 2026',
  breadcrumb: ['hướng dẫn'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Duyệt tìm hiểu bài viết', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Bắt đầu',
      paragraphs: [
        'ANQR là một trình tạo mã QR với cách tiếp cận ưu tiên khách hàng. Theo mặc định, mã QR được tạo cục bộ trong trình duyệt của bạn - không cần có tài khoản và dữ liệu của bạn vẫn ở chế độ riêng tư. Để nhúng chuyên nghiệp, bạn cũng có thể sử dụng API phía máy chủ.',
        'Giao diện có ba cấp độ giao diện: Cơ bản, Nâng cao và Chuyên nghiệp. Chọn cấp độ của bạn bằng cách sử dụng các tab trong tiêu đề. Mỗi cấp độ sẽ mở khóa các tính năng bổ sung trong khi vẫn giữ giao diện tập trung vào những gì bạn cần.',
      ],
      bullets: [
        'Cơ bản: Tạo mã QR đơn giản với nội dung văn bản/URL thuần túy và lớp phủ hình ảnh.',
        'Nâng cao: Tùy chọn mã hóa QR, kiểu hiển thị, hoạt ảnh, định dạng đầu ra, loại nội dung mở rộng và tùy chỉnh lớp phủ.',
        'Chuyên nghiệp: Hình mờ, siêu dữ liệu, chia sẻ, phân tích an toàn, mã QR thanh toán và các tính năng dành cho doanh nghiệp.',
      ],
      links: [{ href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' }],
    },
    {
      heading: 'Bắt đầu nhanh',
      paragraphs: ['Để tạo mã QR đầu tiên của bạn:'],
      bullets: [
        '1. Chọn loại nội dung (URL, văn bản, WiFi, v.v.) từ danh sách thả xuống Loại nội dung.',
        '2. Nhập dữ liệu của bạn vào các trường được cung cấp.',
        '3. Tùy chọn tùy chỉnh màu sắc, kiểu dáng và thêm hình ảnh lớp phủ.',
        '4. Nhấp vào Xuất để tải xuống mã QR của bạn dưới dạng PNG, GIF, WebP hoặc SVG.',
      ],
      links: [
        {
          href: '/?lang=${lang}',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Tính năng cơ bản',
      paragraphs: [
        'Cấp độ Cơ bản cung cấp giao diện hợp lý để tạo mã QR với nội dung tải trọng và lớp phủ hình ảnh. Đây là cách đơn giản nhất để bắt đầu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Các loại nội dung (Cơ bản)',
      paragraphs: [
        'Văn bản thuần túy: Mã hóa bất kỳ văn bản nào đến giới hạn dung lượng mã QR. Lý tưởng cho các tin nhắn ngắn, mã hoặc số nhận dạng.',
        'URL: Mã hóa địa chỉ web. Mã QR sẽ mở URL khi được quét. Hỗ trợ các giao thức http:// và https://.',
      ],
    },
    {
      heading: 'Lớp phủ hình ảnh (Cơ bản)',
      paragraphs: [
        'Tải lên hình ảnh (JPG, PNG, GIF, WebP) để trộn với mã QR của bạn. Các tính năng lớp phủ cơ bản bao gồm:',
      ],
      bullets: [
        'Tải lên từ tập tin: Chọn một hình ảnh từ thiết bị của bạn.',
        'Tải từ URL: Nhập URL hình ảnh (phải cho phép CORS).',
        'Center Logo: Đặt hình ảnh ở giữa, tùy vào việc sửa lỗi.',
        'Trộn: Trộn alpha đơn giản của hình ảnh với mẫu QR.',
        'Cường độ: Kiểm soát mức độ ảnh hưởng của lớp phủ đến mã QR (0-100%).',
        'Chế độ màu: Đủ màu, Thang độ xám hoặc Đen trắng.',
        'Bảo toàn các mẫu Finder: Giữ các mẫu góc không bị sửa đổi để quét đáng tin cậy.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Tính năng nâng cao',
      paragraphs: [
        'Cấp độ Nâng cao mở khóa các tùy chọn mã hóa QR, kiểu hiển thị, hoạt ảnh, định dạng đầu ra, loại nội dung mở rộng và tùy chỉnh lớp phủ nâng cao.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cài đặt mã hóa QR',
      paragraphs: [
        'Phiên bản: Mã QR có các phiên bản từ 1 đến 40, với các phiên bản cao hơn chứa nhiều dữ liệu hơn nhưng kích thước lớn hơn. Đặt thành 0 (Tự động) để ANQR chọn phiên bản nhỏ nhất phù hợp với nội dung của bạn.',
        'Sửa lỗi: Xác định mức độ thiệt hại mà mã QR có thể chịu đựng trong khi vẫn có thể quét được.',
      ],
      bullets: [
        'L (Thấp): Sửa lỗi 7% - kích thước nhỏ nhất, ít dư thừa nhất.',
        'M (Trung bình): Sửa lỗi 15% - tùy chọn cân bằng.',
        'Q (Phần tư): Sửa lỗi 25% - tốt cho mã in.',
        'H (Cao): Sửa lỗi 30% - tốt nhất cho các mã có lớp phủ hoặc trong điều kiện khắc nghiệt.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Vùng yên tĩnh (Ký quỹ)',
      paragraphs: [
        'Vùng yên tĩnh là khoảng trắng xung quanh mã QR. Máy quét cần lề này để phát hiện nơi mã bắt đầu. Tiêu chuẩn khuyến nghị ít nhất 4 mô-đun. Giảm xuống dưới 4 có thể gây ra sự cố quét.',
      ],
    },
    {
      heading: 'Kiểu mô-đun',
      paragraphs: ['Mô-đun là các ô vuông riêng lẻ tạo nên mã QR. ANQR cung cấp năm kiểu:'],
      bullets: [
        'Hình vuông: Kiểu dáng QR cổ điển với các góc nhọn.',
        'Bo tròn: Các góc được làm mềm để trông thân thiện hơn.',
        'Dấu chấm: Mô-đun tròn mang lại tính thẩm mỹ hiện đại.',
        'Kim cương: hình vuông xoay 45° để tạo hoa văn đặc biệt.',
        'Đã kết nối: Các mô-đun hợp nhất khi liền kề, tạo ra các hình dạng hữu cơ.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kiểu mẫu tìm kiếm',
      paragraphs: [
        'Mẫu công cụ tìm kiếm là ba hình vuông lớn ở các góc QR giúp máy quét định hướng mã. Phong cách có sẵn:',
      ],
      bullets: [
        'Hình vuông: Các góc vuông tiêu chuẩn.',
        'Bo tròn: Các góc được làm mềm phù hợp với kiểu mô-đun bo tròn.',
        'Vòng tròn: Các mẫu tìm kiếm hình tròn cho mã kiểu dấu chấm.',
      ],
    },
    {
      heading: 'Mẫu căn chỉnh và thời gian',
      paragraphs: [
        'Các mẫu căn chỉnh xuất hiện trong mã QR lớn hơn (phiên bản 2+) để giúp chỉnh sửa độ méo. Các mẫu thời gian là các đường xen kẽ kết nối các mẫu công cụ tìm kiếm.',
      ],
      bullets: [
        'Kiểu căn chỉnh: Match Finder, Square, Round hoặc Circle.',
        'Kiểu thời gian: Mô-đun khớp, liền nét hoặc nét đứt.',
      ],
    },
    {
      heading: 'Màu sắc',
      paragraphs: [
        'Tiền cảnh: Màu của mô-đun QR. Màu đen (#000000) là tiêu chuẩn nhưng bất kỳ màu tối nào cũng được.',
        'Background: Màu nền. Màu trắng (#ffffff) là tiêu chuẩn. Đảm bảo đủ độ tương phản với tiền cảnh.',
        'Nền trong suốt: Loại bỏ hoàn toàn nền để sử dụng trên các bề mặt có màu. Đảm bảo bề mặt cung cấp độ tương phản đầy đủ.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Kích thước & khoảng cách mô-đun',
      paragraphs: [
        'Kích thước mô-đun: Kiểm soát độ lớn của mỗi mô-đun được hiển thị bằng pixel. Giá trị lớn hơn tạo ra mã lớn hơn, dễ quét hơn.',
        'Khoảng cách mô-đun: Thêm khoảng cách giữa các mô-đun dưới dạng phần trăm. Những khoảng trống nhỏ (5-15%) có thể cải thiện khả năng quét trong một số điều kiện nhưng những khoảng trống quá mức sẽ làm giảm độ tin cậy.',
      ],
    },
    {
      heading: 'Cài đặt đầu ra',
      paragraphs: ['Định dạng: Chọn định dạng xuất của bạn dựa trên trường hợp sử dụng.'],
      bullets: [
        'PNG: Định dạng raster không mất dữ liệu, lý tưởng cho hầu hết các mục đích sử dụng. Tốt nhất cho in ấn và kỹ thuật số.',
        'WebP: Định dạng hiện đại với kích thước tệp nhỏ hơn. Tốt cho việc sử dụng web.',
        'GIF: Bắt buộc đối với mã QR động. Hỗ trợ tính minh bạch.',
        'SVG: Định dạng vector có tỷ lệ vô hạn. Tốt nhất cho bản in lớn hoặc khi bạn cần chỉnh sửa mã.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-3',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Kích thước đầu ra',
      paragraphs: [
        'Chiều rộng/Chiều cao: Đặt kích thước đầu ra tính bằng pixel. Để in, hãy tính toán dựa trên chỉ số dpi (ví dụ: 300 dpi ở 1 inch = 300px). Kích thước lớn hơn quét đáng tin cậy hơn ở khoảng cách xa.',
      ],
    },
    {
      heading: 'Cài đặt hoạt ảnh (Nâng cao)',
      paragraphs: ['Kiểm soát hành vi mã QR động:'],
      bullets: [
        'Tốc độ: Tốc độ khung hình hoạt hình tính bằng mili giây.',
        'Vòng lặp: Hoạt ảnh liên tục hoặc chơi một lần.',
        'Bounce: Hướng hoạt hình bóng bàn.',
        'Khung bắt đầu: Bắt đầu hoạt ảnh từ khung hình cụ thể.',
        'Max Frames: Giới hạn tổng số khung hình trong ảnh động.',
        'Bước khung: Bỏ qua các khung để có hoạt ảnh nhanh hơn.',
        'Nội suy: Không có, Làm mờ chéo hoặc Biến đổi giữa các khung.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Các loại nội dung (Nâng cao)',
      paragraphs: ['Cấp độ nâng cao mở khóa các định dạng tải trọng bổ sung:'],
      bullets: [
        'Số điện thoại (tel:): Tạo liên kết điện thoại có thể gọi được.',
        'Email (mailto:): Mở ứng dụng email với chủ đề và nội dung tùy chọn.',
        'SMS: Tin nhắn văn bản được điền sẵn tới một số điện thoại.',
        'vCard: Thẻ liên lạc đầy đủ tên, tổ chức, điện thoại, email, địa chỉ.',
        'MeCard: Định dạng liên lạc nhỏ gọn phổ biến ở Nhật Bản.',
        'BizCard: Định dạng danh thiếp kế thừa.',
        'Vị trí địa lý: Tọa độ GPS mở trên bản đồ.',
        'WiFi: Thông tin xác thực mạng để kết nối tự động (SSID, mật khẩu, loại bảo mật).',
        'Sự kiện lịch: định dạng iCalendar với tiêu đề, địa điểm, ngày/giờ.',
        'Event RSVP: Link tới trang đăng ký sự kiện.',
        'Đăng ký lịch: Đăng ký nguồn cấp dữ liệu ICS/WebCal.',
        'URL tệp/tài liệu: Liên kết trực tiếp đến các tệp có thể tải xuống.',
        'Cloud Storage Link: Liên kết tới Google Drive, Dropbox, OneDrive, v.v.',
        'Hồ sơ xã hội: Liên kết đến LinkedIn, Twitter, Instagram, v.v.',
        'Liên kết nhắn tin: WhatsApp, Telegram, liên kết sâu Signal.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tính năng lớp phủ nâng cao',
      paragraphs: ['Khả năng lớp phủ bổ sung:'],
      bullets: [
        'Cắt: Cho phép cắt xén để chọn một vùng hình vuông trên hình ảnh của bạn.',
        'Bán sắc: Mẫu chấm kiểu in cổ điển dựa trên độ sáng của hình ảnh.',
        'Dithered: Phối màu khuếch tán lỗi để tái tạo chi tiết.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Chế độ hòa trộn lớp phủ (Nâng cao)',
      paragraphs: ['Các chế độ hòa trộn bổ sung ở cấp độ Nâng cao:'],
      bullets: [
        'Subpixel: Chia mỗi mô-đun thành các pixel phụ để có độ chi tiết cao hơn.',
        'Tiếng ồn xanh: Sử dụng phối màu tiếng ồn xanh cho các mẫu không có tạo tác.',
        'Khảm: Hiệu ứng dựa trên ô bảo tồn cấu trúc hình ảnh.',
        'Gap Fill: Đặt hình ảnh vào khoảng trống giữa các mô-đun.',
        'Độ sáng: Thay đổi kích thước mô-đun dựa trên độ sáng của hình ảnh.',
        'Duotone: Ánh xạ hình ảnh thành hai màu để có độ tương phản nổi bật.',
      ],
    },
    {
      heading: 'Cường độ lớp phủ',
      paragraphs: [
        'Kiểm soát mức độ ảnh hưởng của lớp phủ đến mã QR (0-100%). Giá trị cao hơn hiển thị nhiều chi tiết hình ảnh hơn nhưng có thể làm giảm khả năng quét được. Bắt đầu khoảng 70% và điều chỉnh dựa trên thử nghiệm.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Chế độ màu',
      paragraphs: ['Cách xử lý hình ảnh lớp phủ:'],
      bullets: [
        'Full Color: Giữ nguyên màu ảnh gốc.',
        'Grayscale: Chuyển sang tông màu đen trắng.',
        'Đen trắng: Chuyển đổi nhị phân có độ tương phản cao.',
      ],
    },
    {
      heading: 'Bảo tồn các mẫu Finder',
      paragraphs: [
        'Khi được bật, lớp phủ sẽ giữ cho ba mẫu công cụ tìm góc không bị sửa đổi. Khuyến khích mạnh mẽ để quét đáng tin cậy.',
      ],
    },
    {
      heading: 'Tiền xử lý ảnh',
      paragraphs: [
        'Áp dụng các bộ lọc cho hình ảnh lớp phủ của bạn trước khi trộn. Những điều chỉnh này có thể cải thiện cách hình ảnh xuất hiện trong mã QR cuối cùng.',
      ],
      bullets: [
        'Độ sáng (-100 đến +100): Làm sáng hoặc làm tối hình ảnh.',
        'Độ tương phản (-100 đến +100): Tăng hoặc giảm dải âm.',
        'Gamma (0,2 đến 3,0): Điều chỉnh độ sáng phi tuyến tính. Các giá trị dưới 1 làm sáng các tông trung tính, trên 1 làm tối chúng.',
        'Độ bão hòa (-100 đến +100): Cường độ màu. -100 là thang độ xám, +100 là quá bão hòa.',
        'Hue Rotate (0-360°): Dịch chuyển tất cả các màu xung quanh bánh xe màu.',
        'Blur (0-20px): Làm mềm chi tiết hình ảnh.',
        'Làm sắc nét (0-100%): Tăng cường các cạnh và chi tiết.',
        'Posterize (cấp độ 0-16): Giảm mức độ màu để tạo hiệu ứng áp phích.',
        'Ngưỡng (0-255): Chuyển đổi sang đen/trắng nhị phân tại điểm cắt.',
        'Phát hiện cạnh: Thuật toán Sobel hoặc Canny để chỉ hiển thị các cạnh.',
        'Đảo ngược: Đảo ngược tất cả các màu.',
      ],
    },
    {
      heading: 'Chế độ vừa vặn',
      paragraphs: ['Cách hình ảnh lớp phủ phù hợp với vùng mã QR:'],
      bullets: [
        'Ảnh bìa: Hình ảnh lấp đầy toàn bộ khu vực, cắt xén nếu cần.',
        'Chứa: Toàn bộ hình ảnh hiển thị, có thể có lề.',
        'Kéo giãn: Hình ảnh bị biến dạng để lấp đầy chính xác.',
      ],
    },
    {
      heading: 'Tùy chọn chuyển đổi',
      paragraphs: [
        'Xoay: Xoay lớp phủ theo gia số 90°.',
        'Lật X/Y: Phản chiếu hình ảnh theo chiều ngang hoặc chiều dọc.',
      ],
    },
    {
      heading: 'Thuật toán phối màu',
      paragraphs: [
        'Phối màu chuyển đổi hình ảnh có tông màu liên tục thành các mẫu mà mã QR có thể biểu thị. Có sẵn khi sử dụng các chế độ hòa trộn Dithered, Blue Noise hoặc True Dither.',
      ],
      bullets: [
        'Khuếch tán lỗi: Phong cách Floyd-Steinberg cổ điển. Lan truyền lỗi lượng tử hóa sang các pixel lân cận.',
        'Đã đặt hàng (Bayer): Sử dụng ma trận ngưỡng cho các mẫu thông thường.',
        'Cụm chấm: Mô phỏng in bán sắc.',
        'Void & Cluster: Phối màu theo thứ tự được tối ưu hóa.',
        'Tiếng ồn xanh: Mẫu trông ngẫu nhiên dễ chịu về mặt thị giác.',
        'Ngưỡng nhiễu xanh: Ngưỡng phối màu với kết cấu nhiễu xanh.',
        'Tiếng ồn trắng: Phối màu ngưỡng ngẫu nhiên.',
        'Nhiễu Gaussian/Tam giác: Nhiễu có phân bố khác nhau.',
        'Tiếng ồn xanh + Khuếch tán lỗi: Kết hợp cả hai kỹ thuật.',
        'Tiếng ồn xanh được sàng lọc: Kiểu nhiễu xanh giống như màn hình.',
        'Cảm nhận: Độ sáng được điều chỉnh theo trọng số để có kết quả hình ảnh tốt hơn.',
        'Edge-Aware: Giữ nguyên các cạnh của hình ảnh trong quá trình phối màu.',
        'Ngưỡng thích ứng: Ngưỡng thích ứng cục bộ.',
        'Nhiễu xanh tạm thời: Đối với ảnh GIF động, mẫu khác nhau trên mỗi khung hình.',
      ],
    },
    {
      heading: 'Hạt nhân khuếch tán',
      paragraphs: ['Khi sử dụng phối màu Khuếch tán Lỗi, hãy chọn cách phân phối lỗi:'],
      bullets: [
        'Floyd-Steinberg: Khuếch tán 4 lân cận cổ điển. Lựa chọn chung tốt.',
        'Jarvis-Judice-Ninke: 12 người hàng xóm, mượt mà hơn nhưng chậm hơn.',
        'Stucki: Tương tự như JJN nhưng có trọng lượng khác nhau.',
        'Burkes: JJN đơn giản hóa, nhanh hơn.',
        'Sierra: Dòng hạt nhân cân bằng giữa chất lượng và tốc độ.',
        'Atkinson: Khuếch tán ánh sáng, giữ được chi tiết nhưng có thể bị nhiễu hạt.',
      ],
    },
    {
      heading: 'Sức mạnh hoà sắc',
      paragraphs: [
        'Kiểm soát mức độ phối màu được áp dụng (0-100%). Giá trị thấp hơn giữ lại nhiều mẫu ban đầu hơn, giá trị cao hơn hiển thị nhiều chi tiết hình ảnh hơn.',
      ],
    },
    {
      heading: 'Cài đặt pixel phụ',
      paragraphs: ['Khi sử dụng chế độ hòa trộn Subpixel:'],
      bullets: [
        'Kích thước lưới: 2×2, 3×3 hoặc 4×4 pixel phụ trên mỗi mô-đun. Cao hơn = chi tiết hơn.',
        'Quy tắc trung tâm: Nghiêm ngặt yêu cầu pixel phụ trung tâm để khớp với mô-đun. Trung tâm Halftone cho phép biến đổi.',
        'Màu trung tính: Màu được sử dụng cho các pixel phụ không xác định.',
        'Ghi đè Trình tìm kiếm: Cách hiển thị các mẫu của công cụ tìm kiếm (Solid hoặc Stylized).',
      ],
    },
    {
      heading: 'Cài đặt bán sắc',
      paragraphs: ['Khi sử dụng chế độ hòa trộn Halftone:'],
      bullets: [
        'Kích thước ô: Mỗi mô-đun hoặc lưới N×N.',
        'Hình dạng chấm: Hình tròn, hình vuông hoặc đường thẳng.',
        'Đường cong độ sáng: Tuyến tính, Đường cong chữ S hoặc Gamma.',
      ],
    },
    {
      heading: 'Màu sắc hai tông',
      paragraphs: [
        'Khi sử dụng chế độ hòa trộn Duotone, hãy đặt Màu bóng (vùng tối) và Màu nổi bật (vùng sáng).',
      ],
    },
    {
      heading: 'Cài đặt ảnh động GIF',
      paragraphs: ['Khi sử dụng lớp phủ GIF động:'],
      bullets: [
        'Sử dụng Độ trễ khung: Tôn trọng thời gian GIF gốc.',
        'Max FPS: Giới hạn tốc độ khung hình (1-60 fps).',
        'Xử lý xử lý: Tôn trọng hoặc đơn giản hóa các phương pháp xử lý khung.',
      ],
    },
    {
      heading: 'Tùy chọn kết xuất nâng cao',
      paragraphs: ['Điều khiển hiển thị bổ sung:'],
      bullets: [
        'Chế độ khoảng trống: Kiểu dáng khoảng cách Không có, Inset, Stroke hoặc Không gian âm.',
        'Bán kính góc: Phần trăm góc được làm tròn cho các mô-đun.',
        'Độ dốc: Không có, độ dốc tuyến tính, xuyên tâm hoặc hình nón trên các mô-đun.',
        'Kiểu mắt bên ngoài/bên trong: Kiểu dáng độc lập cho các vòng mẫu tìm kiếm.',
        'Xoay điểm: Xoay mô-đun kim cương/chấm.',
        'Tỉ lệ mắt: Điều chỉnh kích thước cho các mẫu tìm kiếm.',
        'Kiểu khung: Thêm khung trang trí (Khung tròn, Nhãn dán, Thẻ).',
        'Khung văn bản: Thêm văn bản như "Quét tôi!" tới các khung hình.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Mã hóa QR nâng cao',
      paragraphs: ['Tinh chỉnh mã hóa QR:'],
      bullets: [
        'Chế độ mã hóa: Tự động, Số, Chữ và số, Byte/UTF-8 hoặc Kanji.',
        'Thực thi Vùng yên tĩnh tối thiểu: Đảm bảo có ít nhất 4 lề mô-đun.',
        'Mẫu mặt nạ: Tự động (tối ưu) hoặc chọn thủ công các mẫu 0-7 để điều khiển phân phối mô-đun. Các mẫu khác nhau tạo ra hình thức trực quan khác nhau trong khi mã hóa cùng một dữ liệu.',
        'Mã hóa ký tự: ISO-8859-1 (mặc định tiếng Latin-1), UTF-8 (Unicode đầy đủ bao gồm biểu tượng cảm xúc) hoặc Shift-JIS (tiếng Nhật). Chọn dựa trên yêu cầu về nhân vật trong nội dung của bạn.',
      ],
    },
    {
      heading: 'Tùy chọn đầu ra nâng cao',
      paragraphs: ['Cài đặt xuất bổ sung:'],
      bullets: [
        'Tên tệp: Tên tệp tùy chỉnh để tải xuống.',
        'Kích thước bảng màu GIF: 2-256 màu ở đầu ra GIF.',
        'Bộ định lượng GIF: Giảm màu Median Cut, NeuQuant hoặc Octree.',
        'Phối màu GIF: Tắt, Floyd-Steinberg hoặc Đã đặt hàng.',
        'Màu trong suốt GIF: Đặt màu thành trong suốt.',
        'SVG True Vector: Sử dụng đường dẫn thay vì raster nhúng.',
        'SVG Shape Precision: Hiển thị đường dẫn pixel hoặc chính xác.',
        'Lớp phủ raster nhúng SVG: Bao gồm lớp phủ dưới dạng hình ảnh được nhúng.',
        'Ghi đè nền: Buộc một màu nền cụ thể ở đầu ra.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tùy chọn xác thực',
      paragraphs: ['Cài đặt xử lý đầu vào:'],
      bullets: [
        'Xác thực đầu vào: Kiểm tra định dạng nội dung trước khi mã hóa.',
        'Cắt bớt khoảng trắng: Loại bỏ khoảng trắng ở đầu/cuối.',
        'Chuẩn hóa dòng mới: Chuyển đổi tất cả các kết thúc dòng thành LF.',
        'Bảo vệ độ dài tối đa: Cảnh báo nếu nội dung vượt quá dung lượng QR.',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Tính năng chuyên nghiệp',
      paragraphs: [
        'Cấp độ Chuyên nghiệp bổ sung hình mờ, siêu dữ liệu, tùy chọn chia sẻ, phân tích an toàn, mã QR thanh toán và các tính năng dành cho doanh nghiệp.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Hình mờ',
      paragraphs: ['Thêm hình mờ vào mã QR của bạn:'],
      bullets: [
        'Loại: Hình mờ văn bản, hình ảnh hoặc mẫu.',
        'Vị trí: Trung tâm, Góc, Cạnh, Phía sau hoặc Vùng yên tĩnh.',
        'Độ mờ: Độ trong suốt của hình mờ (0-100%).',
        'Chế độ hòa trộn: Hòa trộn Bình thường, Nhân, Màn hình hoặc Lớp phủ.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Siêu dữ liệu',
      paragraphs: ['Nhúng siêu dữ liệu vào tệp đã xuất:'],
      bullets: [
        'Các trường Tiêu đề, Tác giả, Bản quyền, Giấy phép, Mô tả.',
        'Thời gian tạo: Nhúng dấu thời gian tạo.',
        'Khóa-Giá trị tùy chỉnh: Thêm các cặp siêu dữ liệu tùy ý.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Chia sẻ',
      paragraphs: ['Chia sẻ cấu hình mã QR của bạn:'],
      bullets: [
        'Liên kết trực tiếp: Tạo URL có thể chia sẻ với cài đặt hiện tại của bạn.',
        'Nhúng HTML: Nhận mã nhúng cho trang web.',
        'Mã hóa tham số: Bao gồm tất cả cài đặt trong URL chia sẻ.',
        'Lưu ý: Không thể chia sẻ hình ảnh lớp phủ từ tệp cục bộ qua URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Phân tích an toàn',
      paragraphs: ['Đảm bảo mã QR vẫn có thể quét được:'],
      bullets: [
        'Chế độ an toàn: Yêu cầu quét Tắt, Cân bằng hoặc Nghiêm ngặt.',
        'Kích thước mô-đun tối thiểu: Kích thước pixel tối thiểu trên mỗi mô-đun.',
        'Vùng yên tĩnh tối thiểu: Các mô-đun ký quỹ tối thiểu.',
        'Khóa Finders/Thời gian/Căn chỉnh/Định dạng/Phiên bản: Bảo vệ các phần tử cụ thể.',
        'Cường độ lớp phủ tối đa theo ECC: Giới hạn cường độ tự động dựa trên mức sửa lỗi.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Các loại nội dung (Chuyên nghiệp)',
      paragraphs: [
        'Cấp độ chuyên nghiệp bổ sung thêm các loại nội dung thanh toán và doanh nghiệp:',
      ],
      bullets: [
        'EPC/SEPA (EU): Mã QR chuyển khoản ngân hàng Châu Âu có IBAN, BIC, số tiền, tham chiếu.',
        'UPI (Ấn Độ): Giao diện thanh toán hợp nhất với VPA, tên người nhận thanh toán, số tiền.',
        'PayNow ( Singapore): Thanh toán nhanh chóng tại Singapore bằng UEN hoặc số điện thoại di động.',
        'NhắcPay (Thái Lan): Hệ thống thanh toán quốc gia Thái Lan.',
        'PIX (Brazil): Thanh toán ngay lập tức ở Brazil bằng khóa PIX.',
        'Tiền điện tử: Địa chỉ thanh toán Bitcoin, Ethereum, Litecoin với số tiền tùy chọn.',
        'Liên kết chiến dịch tiếp thị: URL có theo dõi thông số UTM (Thẻ tiếp thị) đầy đủ.',
        'Liên kết ngắn: Để sử dụng với các công cụ rút ngắn URL cho mã QR động/có thể theo dõi.',
        'Liên kết kỹ thuật số GS1: Nhận dạng sản phẩm bằng GTIN, sê-ri, lô, hạn sử dụng.',
        'Liên kết sâu ứng dụng: Liên kết sâu ứng dụng iOS/Android với các lược đồ tùy chỉnh.',
        'Định dạng tùy chỉnh: Dữ liệu thô không có định dạng hoặc xác thực.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-2',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Thanh toán liên quan đến ngôn ngữ ở Chế độ nâng cao',
      paragraphs: [
        'Khi sử dụng chế độ Nâng cao, ANQR sẽ tự động hiển thị các phương thức thanh toán phù hợp với ngôn ngữ bạn đã chọn. Ví dụ: người dùng Việt Nam nhìn thấy VietQR, người dùng Thái Lan nhìn thấy NhắcPay và người dùng tiếng Ấn Độ nhìn thấy UPI và BharatQR. Các phương thức thanh toán toàn cầu (tiền điện tử, PayPal, Ứng dụng tiền mặt) có sẵn cho tất cả các ngôn ngữ. Chế độ chuyên nghiệp mở khóa tất cả các tiêu chuẩn thanh toán bất kể ngôn ngữ.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tiêu chuẩn thanh toán châu Âu',
      bullets: [
        'EPC/SEPA (EU): Mã QR chuyển khoản ngân hàng Châu Âu tuân theo Tiêu chuẩn mã QR EPC. Hỗ trợ IBAN, BIC (tùy chọn cho nội địa), số tiền bằng EUR và tham chiếu thanh toán có cấu trúc hoặc không cấu trúc. Được sử dụng trên toàn khu vực SEPA bao gồm các nước EU cùng với Thụy Sĩ, Na Uy, Iceland, Liechtenstein, Monaco và San Marino.',
        'Hóa đơn QR của Thụy Sĩ: Tiêu chuẩn thanh toán của Thụy Sĩ tuân theo SÁU Nguyên tắc triển khai. Hỗ trợ CHF và EUR, Tham chiếu QR (QRR), Tham chiếu bên được chi trả (ISO 11649), địa chỉ bên nợ/bên nợ có cấu trúc và thông tin hóa đơn. Bắt buộc đối với hóa đơn Thụy Sĩ kể từ năm 2022.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tiêu chuẩn thanh toán của Ấn Độ',
      bullets: [
        'UPI (Ấn Độ): Giao diện thanh toán hợp nhất tuân theo Thông số kỹ thuật liên kết sâu NPCI. Hỗ trợ VPA (Địa chỉ thanh toán ảo), tên người nhận thanh toán, số tiền tính bằng INR, ghi chú giao dịch, ID tham chiếu, mã danh mục người bán và chế độ giao dịch.',
        'BharatQR (Ấn Độ): Tiêu chuẩn QR thống nhất hỗ trợ cả thanh toán UPI và thẻ. Kết hợp UPI VPA với thẻ PAN để có khả năng tương thích tối đa. Bao gồm tên người bán, thành phố, MCC, chi tiết GST và số hóa đơn/tham chiếu.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tiêu chuẩn thanh toán Đông Nam Á',
      bullets: [
        'PayNow ( Singapore): Hệ thống thanh toán nhanh của Singapore sử dụng thông số EMVCo QR với hồ sơ SGQR. Hỗ trợ UEN (đăng ký kinh doanh), số điện thoại di động hoặc NRIC làm số nhận dạng proxy. Bao gồm cờ có thể chỉnh sửa số tiền và ngày hết hạn.',
        'NhắcPay (Thái Lan): Hệ thống thanh toán quốc gia Thái Lan theo hồ sơ EMV của Ngân hàng Thái Lan. Hỗ trợ số điện thoại di động, ID quốc gia, ID thuế, ID ví điện tử và thanh toán hóa đơn với nhiều trường tham chiếu.',
        'QRIS (Indonesia): Mã phản hồi nhanh tiêu chuẩn Indonesia. Tiêu chuẩn thanh toán quốc gia dựa trên EMV hỗ trợ ID người bán, NMID (ID người bán quốc gia), phân loại tiêu chí người bán và phí tiện lợi (cố định hoặc phần trăm).',
        'DuitNow (Malaysia): Hệ thống thanh toán tức thời của Malaysia. Hỗ trợ nhiều loại proxy bao gồm NRIC, điện thoại di động, hộ chiếu, ID quân đội và số đăng ký kinh doanh.',
        'VietQR (Việt Nam): Tiêu chuẩn chuyển khoản liên ngân hàng của Việt Nam. Yêu cầu BIN ngân hàng (nhận dạng NAPAS) và số tài khoản. Hỗ trợ nhiều mã dịch vụ cho các loại chuyển khác nhau (QRPUSH, QRIBFTTA, QRIBFTTC).',
        'QR Ph (Philippines): Tiêu chuẩn thanh toán QR của Philippine cho InstaPay và PESONet. Sử dụng số tài khoản có nhận dạng người bán cho các giao dịch P2M (người với người bán).',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tiêu chuẩn thanh toán Đông Á',
      bullets: [
        'TWQR (Đài Loan): Tiêu chuẩn thanh toán QR của Đài Loan. Hỗ trợ ID người bán, ID thuế và số tiền TWD.',
        'HKQR/FPS (Hồng Kông): Mã QR của Hệ thống thanh toán nhanh hơn Hồng Kông. Hỗ trợ ID FPS, số điện thoại di động hoặc email làm số nhận dạng thanh toán. Số tiền tính bằng HKD.',
        'JPQR (Nhật Bản): Tiêu chuẩn thanh toán mã QR thống nhất của Nhật Bản. Sử dụng ID cửa hàng để nhận dạng người bán với số tiền JPY.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Các tiêu chuẩn thanh toán khu vực khác',
      bullets: [
        'PIX (Brazil): Hệ thống thanh toán tức thời của Ngân hàng Trung ương Brazil tuân theo thông số kỹ thuật của Mã BR. Hỗ trợ khóa PIX (CPF, CNPJ, email, điện thoại hoặc khóa ngẫu nhiên), tên/thành phố người bán, ID giao dịch và số tiền BRL.',
        'AusPayNet/NPP PayID (Úc): Hệ thống PayID nền tảng thanh toán mới của Úc. Hỗ trợ các loại PayID (email, điện thoại di động, ABN, ID tổ chức) hoặc số tài khoản BSB + truyền thống. Tên người bán là tùy chọn vì người thanh toán sẽ thấy tên đã đăng ký từ tra cứu NPP.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Thanh toán bằng tiền điện tử',
      bullets: [
        'Bitcoin/Litecoin (BIP-21): URI thanh toán tiền điện tử tiêu chuẩn có địa chỉ ví, số tiền tùy chọn và nhãn. Tương thích với tất cả các ví Bitcoin và Litecoin chính.',
        'Lightning Network (BOLT11): Hóa đơn thanh toán của Lightning Network. Dán chuỗi hóa đơn được mã hóa BOLT11 để thanh toán Bitcoin ngay lập tức với mức phí tối thiểu.',
        'Ethereum (EIP-681): URI yêu cầu giao dịch Ethereum hỗ trợ chuyển ETH gốc và chuyển mã thông báo ERC-20. Bao gồm ID chuỗi để hỗ trợ nhiều mạng (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), thông số khí và lệnh gọi chức năng hợp đồng.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Dịch vụ liên kết thanh toán',
      bullets: [
        'PayPal.Me: Liên kết thanh toán PayPal với tên người dùng và số tiền điền sẵn tùy chọn. Người nhận có thể thanh toán qua số dư PayPal, thẻ hoặc tài khoản ngân hàng.',
        'Ứng dụng tiền mặt: Liên kết thanh toán Ứng dụng tiền mặt sử dụng $ cashtag với số tiền tùy chọn. Phổ biến ở Hoa Kỳ cho thanh toán ngang hàng.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR EMV chung',
      bullets: [
        'EMV Generic: Tạo mã QR Chế độ trình bày dành cho người bán EMV tùy chỉnh cho các chương trình thanh toán không được liệt kê cụ thể. Định cấu hình tên người bán, thành phố, mã quốc gia (ISO 3166-1), mã tiền tệ (số ISO 4217), MCC, tùy chọn tiền boa/phí tiện lợi và các trường dữ liệu bổ sung. Hữu ích cho việc thử nghiệm hoặc tích hợp tùy chỉnh.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Chế độ hòa trộn lớp phủ (Chuyên nghiệp)',
      paragraphs: ['Các chế độ hòa trộn bổ sung ở cấp độ Chuyên nghiệp:'],
      bullets: [
        'Pixelate: Hiệu ứng lớp phủ pixel.',
        'Phác thảo: Lớp phủ phát hiện cạnh chỉ hiển thị các đường viền.',
        'Sóng: Hiệu ứng biến dạng lượn sóng.',
        'Kích thước pixel phụ: Kích thước pixel phụ có thể thay đổi dựa trên hình ảnh.',
        'True Dither: Phối màu nâng cao với lựa chọn ma trận có thứ tự.',
        'Cực đoan: Khả năng hiển thị hình ảnh tối đa, có thể ảnh hưởng đến khả năng quét.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cài đặt bảo vệ',
      paragraphs: ['Kiểm soát chi tiết các phần tử QR nào được bảo vệ khỏi sửa đổi lớp phủ:'],
      bullets: [
        'Bảo toàn thời gian: Giữ nguyên các mẫu thời gian không bị sửa đổi.',
        'Bảo tồn căn chỉnh: Giữ nguyên các mẫu căn chỉnh không được sửa đổi.',
        'Bảo vệ thông tin định dạng: Mô-đun thông tin định dạng lá chắn.',
        'Bảo vệ thông tin phiên bản: Mô-đun thông tin phiên bản bảo vệ.',
      ],
    },
    {
      heading: 'Chế độ nhận biết ECC',
      paragraphs: [
        'Phân phối cường độ lớp phủ một cách thông minh dựa trên khả năng sửa lỗi. Hệ thống phân tích mô-đun nào có thể được sửa đổi trong khi vẫn duy trì khả năng quét được.',
      ],
      bullets: [
        'Ngân sách rủi ro: Tỷ lệ phần trăm khả năng sửa lỗi được sử dụng (0-100%).',
        'Ngân sách cao hơn = lớp phủ hiển thị nhiều hơn nhưng khả năng quét có rủi ro cao hơn.',
        'Ngân sách thấp hơn = quét an toàn hơn nhưng lớp phủ ít hiển thị hơn.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tùy chọn kết xuất chuyên nghiệp',
      paragraphs: ['Điều khiển hiển thị nâng cao:'],
      bullets: [
        'Các cạnh sắc nét: Sử dụng kết xuất hình ảnh pixel để có các cạnh mô-đun sắc nét.',
        'Pixel Snap: Căn chỉnh pixel sàn, tròn hoặc trần.',
        'Chế độ màu trên mỗi mô-đun: Đồng nhất, theo độ sáng, theo vị trí, theo lớp phủ, theo cụm.',
        'Bảng màu: Xác định bảng màu tùy chỉnh để tô màu cho mỗi mô-đun.',
        'Bảo vệ độ tương phản: Đảm bảo tỷ lệ tương phản tối thiểu giữa các màu.',
        'Tỷ lệ tương phản tối thiểu: Yêu cầu độ tương phản kiểu WCAG (1:1 đến 21:1).',
        'Mô-đun viền bổ sung: Đường viền bổ sung ngoài vùng yên tĩnh.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Tùy chọn đầu ra chuyên nghiệp',
      paragraphs: ['Cài đặt xuất doanh nghiệp:'],
      bullets: [
        'DPI: Cài đặt độ phân giải in (72-600DPI). Khuyến nghị 300DPI để in.',
        'Bao gồm Vùng yên tĩnh: Chuyển đổi vùng yên tĩnh trong kích thước đầu ra.',
        'Xuất dưới dạng bổ sung: Tạo PDF cùng với định dạng chính.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Cài đặt hoạt ảnh (Chuyên nghiệp)',
      paragraphs: ['Các tính năng hoạt hình chuyên nghiệp bổ sung:'],
      bullets: [
        'Hòa sắc tạm thời: Phối màu tắt, Nhiễu xanh hoặc An toàn nhấp nháy trên mỗi khung hình.',
        'Kiểu: Không có, Hiệu ứng xung, Sóng, Đường quét, Ánh sáng lung linh hoặc Trôi.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-4',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'Tham khảo API',
      paragraphs: [
        'ANQR cung cấp API phía máy chủ để tạo mã QR thông qua tham số URL. Điều này lý tưởng để nhúng mã QR vào trang web, email, tài liệu hoặc quy trình làm việc tự động mà không cần JavaScript phía máy khách.',
        'URL cơ sở: https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' }],
    },
    {
      heading: 'Thông số cơ bản',
      paragraphs: ['Các tham số bắt buộc và chung (tên tham số không được dịch):'],
      bullets: [
        'data (bắt buộc): Nội dung cần mã hóa trong mã QR. Các ký tự đặc biệt mã hóa URL.',
        'size: Kích thước hình ảnh tính bằng pixel (mặc định: 400, tối đa: 2000). Được sử dụng nếu không được chỉ định.',
        'w, h: Chiều rộng và chiều cao đầu ra tính bằng pixel. Ghi đè tham số kích thước.',
        'định dạng: Định dạng đầu ra - png, webp hoặc gif (mặc định: png).',
        'ec: Mức sửa lỗi - L, M, Q hoặc H (mặc định: H).',
        'fg: Màu nền trước ở dạng hex không có # (mặc định: 000000).',
        'bg: Màu nền ở dạng hex không có # (mặc định: ffffff).',
        'trong suốt: Đặt thành 1 cho nền trong suốt.',
        'lề: Vùng yên tĩnh trong mô-đun (mặc định: 4).',
      ],
    },
    {
      heading: 'Thông số kiểu dáng',
      paragraphs: ['Kiểu dáng mô-đun và mẫu:'],
      bullets: [
        'phong cách: Kiểu mô-đun - hình vuông, tròn, chấm, hình thoi, kết nối.',
        'công cụ tìm: Kiểu mẫu công cụ tìm - hình vuông, hình tròn, hình tròn.',
        'căn chỉnh: Kiểu mẫu căn chỉnh - match_finder, hình vuông, hình tròn, hình tròn.',
        'thời gian: Kiểu mẫu thời gian - match_module, liền nét, nét đứt.',
        'bán kính: Phần trăm bán kính góc 0-100.',
        'khoảng cách: Tỷ lệ phần trăm khoảng cách mô-đun 0-50.',
        'GapMode: Chế độ khoảng cách - không có, hình nhỏ, nét, âm_space.',
        'eyeOuter, eyeInner: Kiểu mắt - vuông, tròn, tròn.',
        'eyeScale: Phần trăm tỷ lệ mắt (mặc định: 100).',
        'grad: Loại gradient - không có, tuyến tính, xuyên tâm, hình nón.',
        'gradAngle: Góc chuyển màu cho độ dốc tuyến tính.',
        'gradStops: Chuyển màu dừng ở dạng color1,pos1,color2,pos2,... (ví dụ: ff0000,0,0000ff,1).',
      ],
    },
    {
      heading: 'Thông số lớp phủ',
      paragraphs: ['Tùy chọn lớp phủ hình ảnh (hình ảnh lớp phủ được tìm nạp phía máy chủ):'],
      bullets: [
        'img: URL tới hình ảnh lớp phủ (phải có thể truy cập công khai).',
        'chế độ: Chế độ lớp phủ - trung tâm, bán sắc, hòa trộn, độ sáng, khảm, hoà sắc, nhiễu xanh, pixel phụ.',
        'cường độ: Cường độ lớp phủ 0-100 (mặc định: 100).',
        'colorMode: Chế độ màu lớp phủ - màu, thang độ xám, bw.',
        'vừa vặn: Lớp phủ phù hợp như thế nào - che, chứa, kéo dài.',
        'rot: Xoay lớp phủ theo độ.',
        'flipX, flipY: Đặt thành 1 để lật lớp phủ.',
        'keepFinders: Giữ nguyên các mẫu tìm kiếm (mặc định: 1).',
        'keepTiming, keepAlign: Đặt thành 1 để duy trì các kiểu căn chỉnh/thời gian.',
      ],
    },
    {
      heading: 'Thông số tiền xử lý',
      paragraphs: ['Xử lý trước hình ảnh được áp dụng cho lớp phủ:'],
      bullets: [
        'độ sáng: Điều chỉnh -100 đến 100 (mặc định: 0).',
        'độ tương phản: Điều chỉnh -100 đến 100 (mặc định: 0).',
        'gamma: Giá trị 0,1 đến 3 (mặc định: 1).',
        'độ bão hòa: Điều chỉnh -100 đến 100 (mặc định: 0).',
        'Hue: Hue xoay theo độ.',
        'mờ: Làm mờ theo pixel.',
        'làm sắc nét: Số lượng sắc nét 0-100.',
        'posterize: Các cấp độ Posterize.',
        'ngưỡng: Ngưỡng nhị phân 0-255.',
        'cạnh: Phát hiện cạnh - tắt, sobel, canny.',
        'đảo ngược: Đặt thành 1 để đảo màu.',
      ],
    },
    {
      heading: 'Thông số hình mờ',
      paragraphs: ['Thêm hình mờ vào mã QR được tạo:'],
      bullets: [
        'wmEn: Đặt thành 1 để bật hình mờ.',
        'wmKind: Loại hình mờ - văn bản, hình ảnh, mẫu.',
        'wmText: Văn bản hình mờ (được mã hóa URL).',
        'wmImg: URL tới hình mờ.',
        'wmPos: Vị trí - giữa, góc, cạnh, phía sau, vùng yên tĩnh.',
        'wmOpacity: Độ mờ 0-100 (mặc định: 50).',
        'wmBlend: Chế độ hòa trộn - bình thường, nhân lên, sàng lọc, lớp phủ.',
      ],
    },
    {
      heading: 'Thông số hoạt ảnh',
      paragraphs: ['Đối với đầu ra GIF động (yêu cầu định dạng=gif):'],
      bullets: [
        'animPattern: Mẫu hoạt hình - không có, xung, sóng, đường quét, ánh sáng lung linh, trôi, color_cycle.',
        'animFrames: Số khung hình 1-60 (mặc định: 24).',
        'animSpeed: Độ trễ khung hình tính bằng mili giây 10-1000 (mặc định: 100).',
        'animSeed: Hạt giống ngẫu nhiên cho hoạt ảnh.',
        'easing: nới lỏng hoạt hình - tuyến tính, easy_in, easy_out, easy_in_out, thoát.',
      ],
    },
    {
      heading: 'Thông số đầu ra',
      paragraphs: ['Tùy chọn định dạng đầu ra:'],
      bullets: [
        'chất lượng: Chất lượng WebP 0-1 (mặc định: 0,9).',
        'webpQ: Chất lượng WebP 0-100 (mặc định: 90).',
        'gifColors: Kích thước bảng GIF 2-256 (mặc định: 256).',
        'dpi:DPI đầu ra cho PNG (mặc định: 72).',
        'metaTitle, metaAuthor, metaCopy, metaDesc: các trường siêu dữ liệu PNG.',
      ],
    },
    // Crop Parameters
    {
      heading: 'Cắt thông số',
      paragraphs: ['Tùy chọn cắt ảnh lớp phủ:'],
      bullets: [
        'cropEn: Bật cắt lớp phủ 0/1 (mặc định: 0).',
        'cropX: Cắt trung tâm X thành phân số 0-1 (mặc định: 0,5).',
        'cropY: Cắt trung tâm Y dưới dạng phân số 0-1 (mặc định: 0,5).',
        'cropSize: Cắt kích thước theo phân số của hình ảnh 0-1 (mặc định: 1).',
      ],
    },
    // Safety Lock Parameters
    {
      heading: 'Thông số khóa an toàn',
      paragraphs: ['Kiểm soát phần tử QR nào được bảo vệ khỏi sửa đổi lớp phủ:'],
      bullets: [
        'lockF: Mẫu tìm khóa 0/1 (mặc định: 1).',
        'lockT: Khóa mẫu thời gian 0/1 (mặc định: 1).',
        'lockA: Khóa mẫu căn chỉnh 0/1 (mặc định: 1).',
        'lockFmt: Khóa thông tin định dạng 0/1 (mặc định: 1).',
        'lockV: Khóa thông tin phiên bản 0/1 (mặc định: 1).',
        'safeMode: Chế độ an toàn - tắt, cân bằng, nghiêm ngặt (mặc định: tắt).',
        'safeMinPx: Kích thước mô-đun tối thiểu tính bằng pixel (mặc định: 2).',
        'safeMinQz: Các mô-đun vùng yên tĩnh tối thiểu (mặc định: 4).',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: 'Tự động điều chỉnh các thông số',
      paragraphs: ['Cài đặt tối ưu hóa tự động:'],
      bullets: [
        'autoVer: Tự động chọn phiên bản QR 0/1 (mặc định: 1).',
        'autoEcc: Tự động chọn mức ECC 0/1 (mặc định: 0) - chỉ gợi ý phía máy chủ.',
        'autoReduce: [CHỈ DÀNH CHO KHÁCH HÀNG] Tự động giảm cường độ cho đến khi có thể quét được - yêu cầu vòng xác thực quét.',
      ],
    },
    // Additional Animation Parameters
    {
      heading: 'Thông số hoạt ảnh bổ sung',
      paragraphs: ['Điều khiển hoạt ảnh mở rộng cho đầu ra GIF:'],
      bullets: [
        'vòng lặp: Hoạt ảnh lặp lại liên tục 0/1 (mặc định: 1).',
        'nảy: Hướng hoạt hình bóng bàn 0/1 (mặc định: 0).',
        'đảo ngược: Phát hoạt ảnh ngược 0/1 (mặc định: 0).',
        'colorCycle: Bật hiệu ứng chuyển màu 0/1 (mặc định: 0).',
        'interp: Nội suy khung - không có, crossfade, morph (mặc định: không có).',
        'tempDither: Phối màu theo thời gian - tắt, blue_noise, Flickr_safe (mặc định: tắt).',
        'startF: Khung bắt đầu hoạt ảnh (mặc định: 0).',
        'maxF: Số khung hình tối đa cần hiển thị (mặc định: 0 = tự động).',
        'stepF: Khoảng thời gian của khung hình (mặc định: 1).',
        'jitter: [CHỈ KHÁCH HÀNG] Độ giật mô-đun tính bằng pixel - yêu cầu tái tạo QR trên mỗi khung hình.',
      ],
    },
    // Dithering Parameters
    {
      heading: 'Thông số phối màu',
      paragraphs: ['Kiểm soát các thuật toán phối màu để xử lý lớp phủ:'],
      bullets: [
        'ditherKind: Thuật toán hòa sắc - error_diffusion, order_bayer, blue_noise, v.v. (mặc định: order_bayer).',
        'khuếch tánKernel: Lỗi khuếch tán hạt nhân - floyd_steinberg, jarvis_judice_ninke, Sticki, burkes, sierra, atkinson (mặc định: floyd_steinberg).',
        'Độ hoà sắc: Cường độ hoà sắc 0-100 (mặc định: 50).',
        'ngoằn ngoèo: Phối màu Serpentine 0/1 (mặc định: 0).',
        'ma trận: Ma trận hòa sắc có thứ tự - bayer2, bayer4, bayer8 (mặc định: bayer4).',
        'bnTile: Kích thước ô nhiễu xanh (mặc định: 64).',
        'bnSeed: Hạt giống ngẫu nhiên có tiếng ồn xanh (mặc định: 0).',
        'colorDither: Phối màu - không có, mỗi kênh, theo nhận thức (mặc định: không có).',
      ],
    },
    // Subpixel Parameters
    {
      heading: 'Thông số pixel phụ',
      paragraphs: ['Cài đặt cho chế độ hòa trộn pixel phụ:'],
      bullets: [
        'spGrid: Kích thước lưới Subpixel - 2x2, 3x3, 4x4 (mặc định: 3x3).',
        'spCenter: Quy tắc trung tâm - nghiêm ngặt, bán sắc_center (mặc định: nghiêm ngặt).',
        'spNeutral: Hệ lục phân màu trung tính không có # (mặc định: 808080).',
        'spFinder: Ghi đè Finder - liền khối, cách điệu (mặc định: rắn).',
      ],
    },
    // Halftone Parameters
    {
      heading: 'Thông số bán sắc',
      paragraphs: ['Cài đặt cho chế độ hòa trộn bán sắc:'],
      bullets: [
        'htCell: Kích thước ô Halftone - lưới per_module hoặc nxn (mặc định: per_module).',
        'htDot: Hình dạng chấm - hình tròn, hình vuông, đường thẳng (mặc định: hình tròn).',
        'htCurve: Đường cong độ sáng - tuyến tính, đường cong s, gamma (mặc định: tuyến tính).',
        'Duo1: Hệ lục phân màu bóng Duotone không có # (mặc định: 000000).',
        'Duo2: Hệ lục phân màu nổi bật Duotone không có # (mặc định: ffffff).',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Thông số chế độ nhận biết ECC',
      paragraphs: ['Phân phối lớp phủ thông minh dựa trên khả năng sửa lỗi:'],
      bullets: [
        'eccAware: Bật chế độ nhận biết ECC 0/1 (mặc định: 0).',
        'eccRisk: Tỷ lệ ngân sách rủi ro 0-100 (mặc định: 50).',
        'eccMap: Bản đồ trọng lượng - distance_to_finders, block_heatmap, theo kinh nghiệm_scan_heatmap (mặc định: distance_to_finders).',
      ],
    },
    // Frame Parameters
    {
      heading: 'Thông số khung',
      paragraphs: ['Cài đặt khung trang trí:'],
      bullets: [
        'khung: Kiểu khung - không có, round_frame, nhãn dán, thẻ (mặc định: không có).',
        'frameText: Văn bản hiển thị trong khung (được mã hóa URL).',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: 'Thông số màu trên mỗi mô-đun',
      paragraphs: ['Tùy chọn tô màu mô-đun riêng lẻ:'],
      bullets: [
        'modColor: Chế độ màu - rắn, by_brightness, by_position, by_overlay, by_cluster (mặc định: rắn).',
        'cGuard: Bảo vệ tương phản 0/1 (mặc định: 0).',
        'minContrast: Tỷ lệ tương phản tối thiểu 1-21 (mặc định: 4,5).',
        'bảng màu: Màu hex được phân tách bằng dấu phẩy cho chế độ bảng màu.',
        'bảng màuChế độ: Phân phối bảng màu - vị trí, độ sáng, đường chéo, hướng tâm, ngẫu nhiên, hàng, cột (mặc định: vị trí).',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'Thông số lớp phủ GIF',
      paragraphs: ['Cài đặt cho hình ảnh lớp phủ GIF động:'],
      bullets: [
        'ovType: Loại lớp phủ - tĩnh, gif, apng, webp_anim, video (mặc định: tĩnh).',
        'ovFramePick: Lựa chọn khung hình - tất cả, mọi_n, max_frames, thời lượng_limit (mặc định: tất cả).',
        'gifDelays: Sử dụng độ trễ khung GIF gốc 0/1 (mặc định: 1).',
        'gifDispH: Xử lý loại bỏ GIF - tôn trọng, đơn giản hóa (mặc định: tôn trọng).',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Giới hạn cường độ trên mỗi ECC',
      paragraphs: ['Cường độ lớp phủ tối đa trên mỗi mức sửa lỗi:'],
      bullets: [
        'maxIntL: Cường độ tối đa cho ECC L 0-100 (mặc định: 100).',
        'maxIntM: Cường độ tối đa cho ECC M 0-100 (mặc định: 100).',
        'maxIntQ: Cường độ tối đa cho ECC Q 0-100 (mặc định: 100).',
        'maxIntH: Cường độ tối đa cho ECC H 0-100 (mặc định: 100).',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Tham số mô phỏng QA (Chỉ dành cho khách hàng)',
      paragraphs: [
        'Các tham số này được phân tích cú pháp để tương thích với URL nhưng chỉ hoạt động trong trình duyệt:',
      ],
      bullets: [
        'qaContrast: Bật kiểm tra độ tương phản 0/1 - yêu cầu xác thực tương tác.',
        'qaBlur: Mô phỏng độ mờ bằng pixel - chỉ dành cho thử nghiệm tương tác.',
        'qaNoise: Mô phỏng mức độ tiếng ồn - chỉ dành cho thử nghiệm tương tác.',
        'qaHeatmap: Hiển thị bản đồ nhiệt khả năng đọc 0/1 - yêu cầu giao diện người dùng lớp phủ canvas.',
      ],
    },
    // Client-Only Parameters
    {
      heading: 'Thông số chỉ dành cho khách hàng',
      paragraphs: [
        'Hầu hết các tham số API đều được phía máy chủ hỗ trợ đầy đủ. Các tham số được đánh dấu [CHỈ KHÁCH HÀNG] được phân tích cú pháp để tương thích với URL nhưng yêu cầu các tính năng của trình duyệt:',
      ],
      bullets: [
        'jitter: jitter mô-đun yêu cầu tái tạo QR trên mỗi khung hình một cách ngẫu nhiên.',
        'autoReduce: Cường độ tự động giảm yêu cầu kiểm tra quét lặp đi lặp lại.',
        'qaContrast, qaBlur, qaNoise, qaHeatmap: Mô phỏng QA yêu cầu xác thực canvas tương tác.',
      ],
    },
    // Additional Output Parameters
    {
      heading: 'Thông số đầu ra bổ sung',
      paragraphs: ['Cài đặt đầu ra và xuất mở rộng:'],
      bullets: [
        'fname: Tên tệp tùy chỉnh để tải xuống (mặc định: anqr-qrcode).',
        'inclQz: Bao gồm vùng yên tĩnh trong kích thước đầu ra 0/1 (mặc định: 1).',
        'bgOver: Hex ghi đè màu nền không có # (ghi đè tham số bg).',
        'fmtExtra: Đầu ra định dạng bổ sung - không có, eps, hoạt hình_webp (mặc định: không có). Lưu ý: eps là [BẢNG].',
        'svgPrec: Độ chính xác của hình dạng SVG - pixel, chính xác (mặc định: pixel). [BẢNG] Phía máy chủ giới hạn đầu ra SVG.',
        'svgEmbed: Nhúng lớp phủ raster vào SVG 0/1 (mặc định: 1). [BẢNG] Phía máy chủ giới hạn đầu ra SVG.',
        'modulePx: Kích thước pixel mô-đun (mặc định: được tính toán tự động từ kích thước).',
        'đường viền: Các mô-đun viền bổ sung ngoài vùng yên tĩnh (mặc định: 0).',
        'sắc nét: Cho phép hiển thị hình ảnh sắc nét/pixel 0/1 (mặc định: 1).',
        'snap: Chế độ chụp pixel - sàn, tròn, trần (mặc định: sàn).',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Thông số bảo quản mẫu',
      paragraphs: ['Kiểm soát các thành phần cấu trúc nào được bảo vệ khỏi lớp phủ:'],
      bullets: [
        'keepFinders: Giữ nguyên các mẫu tìm kiếm 0/1 (mặc định: 1).',
        'keepTiming: Giữ nguyên các mẫu thời gian 0/1 (mặc định: 0).',
        'keepAlign: Giữ nguyên các mẫu căn chỉnh 0/1 (mặc định: 0).',
        'ProtectFmt: Bảo vệ mô-đun thông tin định dạng 0/1 (mặc định: 0).',
        'ProtectVer: Bảo vệ mô-đun thông tin phiên bản 0/1 (mặc định: 0).',
      ],
    },
    {
      heading: 'Cách sử dụng ví dụ',
      paragraphs: [
        'Mã QR cơ bản:',
        'https://anqr.link/api/qr?data=https://example.com',
        'Mã QR được tạo kiểu với màu sắc tùy chỉnh:',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        'Mã QR có hình ảnh lớp phủ:',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF hoạt hình:',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' }],
    },
    {
      heading: 'Nhúng mã QR',
      paragraphs: [
        'Ở chế độ Chuyên nghiệp, tính năng Chia sẻ tạo HTML và URL có thể nhúng. Đây là cách nhúng hoạt động:',
      ],
      bullets: [
        'Liên kết chia sẻ: Tạo URL tới ứng dụng ANQR với tất cả cài đặt của bạn được mã hóa dưới dạng tham số URL. Người nhận có thể xem và sửa đổi mã QR.',
        'Nhúng hình ảnh: Tạo thẻ <img> trỏ đến API máy chủ. Mã QR được hiển thị phía máy chủ và được dùng dưới dạng hình ảnh.',
        'Nhúng Markdown: Tạo cú pháp hình ảnh Markdown cho tài liệu và tệp README.',
        'URL API trực tiếp: URL API thô để sử dụng trong các ứng dụng, tập lệnh hoặc các phần tích hợp khác.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'Ví dụ về HTML',
      paragraphs: [
        'Để nhúng mã QR vào trang web của bạn:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="Mã QR" />',
        'Để định cỡ đáp ứng:',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="Mã QR" style="max-width: 100%; chiều cao: tự động;" />',
        'Máy chủ lưu các phản hồi có tiêu đề bộ nhớ đệm dài vào bộ nhớ đệm, do đó, các yêu cầu lặp lại cho cùng một URL sẽ diễn ra nhanh chóng.',
      ],
    },
    {
      heading: 'Chia sẻ định dạng URL',
      paragraphs: [
        'Khi bạn nhấp vào Chia sẻ ở chế độ Chuyên nghiệp, ANQR sẽ mã hóa cài đặt hiện tại của bạn thành tham số URL. Định dạng là:',
        'https://anqr.link/?data=...&ec=H&style=rounded&....',
        'Các tham số này phản ánh các tham số API, do đó bạn có thể chuyển đổi URL chia sẻ thành URL API bằng cách thay đổi đường dẫn cơ sở từ / thành /api/qr và điều chỉnh các tham số w/h nếu cần.',
        'Lưu ý: Không thể chia sẻ hình ảnh lớp phủ được tải lên từ tệp cục bộ qua URL - chỉ lớp phủ dựa trên URL (tham số img) mới hoạt động trong các liên kết được chia sẻ và lệnh gọi API.',
      ],
    },
    {
      heading: 'Giới hạn tỷ lệ và cách sử dụng',
      paragraphs: [
        'API được sử dụng miễn phí với số lượng hợp lý. Đối với việc sử dụng khối lượng lớn hoặc các ứng dụng thương mại yêu cầu thời gian hoạt động được đảm bảo, vui lòng liên hệ với chúng tôi.',
        'Phản hồi API bao gồm các tiêu đề bộ nhớ đệm linh hoạt. Để có hiệu suất tốt nhất, hãy lưu các phản hồi vào bộ nhớ đệm từ phía bạn hoặc sử dụng cùng một URL một cách nhất quán cho các mã QR giống nhau.',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Thực tiễn tốt nhất',
      paragraphs: ['Thực hiện theo các nguyên tắc sau để có mã QR đáng tin cậy:'],
      bullets: [
        'Luôn kiểm tra mã QR của bạn bằng nhiều ứng dụng máy quét trước khi in.',
        'Sử dụng Sửa lỗi H (Cao) khi thêm lớp phủ.',
        'Giữ ít nhất 4 mô-đun vùng yên tĩnh (lề).',
        'Đảm bảo độ tương phản cao giữa tiền cảnh và hậu cảnh.',
        'Để in, hãy sử dụng ít nhất 300 dpi và kiểm tra ở kích thước in thực tế.',
        'Bật Bảo tồn mẫu tìm kiếm khi sử dụng lớp phủ.',
        'Bắt đầu với cường độ lớp phủ thấp hơn và tăng dần.',
        'Để sử dụng ngoài trời, hãy xem xét kích thước mô-đun lớn hơn và khả năng sửa lỗi cao hơn.',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: 'Duyệt tìm hiểu bài viết', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' },
      ],
    },
    {
      heading: 'Khắc phục sự cố',
      paragraphs: ['Các vấn đề thường gặp và giải pháp:'],
      bullets: [
        'QR không quét: Giảm cường độ lớp phủ, tăng khả năng sửa lỗi, kiểm tra độ tương phản.',
        'Code quá lớn: Giảm độ dài nội dung, sử dụng trình rút gọn URL, phiên bản thấp hơn.',
        'Đầu ra mờ: Tăng kích thước mô-đun, sử dụng PNG thay vì định dạng nén.',
        'Màu sắc có vẻ sai: Kiểm tra độ tương phản màu, thử chế độ lớp phủ thang độ xám.',
        'GIF không hoạt hình: Đảm bảo sử dụng đầu ra định dạng GIF, kiểm tra số khung hình.',
        'Lớp phủ hình ảnh không tải: Kiểm tra quyền CORS trên hình ảnh từ xa.',
      ],
      links: [
        {
          href: '/learn?lang=${lang}#section-5',
          label: 'Xem hướng dẫn và ví dụ liên quan',
          type: 'learn',
        },
      ],
    },
    {
      heading: 'Phím tắt',
      paragraphs: [
        'ANQR hỗ trợ các phím tắt tiêu chuẩn. Sử dụng Ctrl/Cmd+S để kích hoạt xuất (khi tập trung vào bản xem trước).',
      ],
    },
    {
      heading: 'Chia sẻ & Nhúng',
      paragraphs: [
        'Ở chế độ Chuyên nghiệp, nhấp vào nút Chia sẻ để sao chép URL có cài đặt hiện tại của bạn. Người nhận có thể mở URL này để xem cấu hình chính xác của bạn. Lưu ý: Không thể chia sẻ hình ảnh lớp phủ từ tệp cục bộ qua URL.',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: 'Hãy thử cấu hình này trực tiếp trong trình tạo ANQR.',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Duyệt tìm hiểu bài viết', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Xem ví dụ về QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' },
  ],
};

export default guide;
