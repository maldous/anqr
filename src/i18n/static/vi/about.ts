import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Giới thiệu về ANQR',
  description: 'ANQR là trình tạo mã QR miễn phí với cách tiếp cận ưu tiên khách hàng - tạo mã QR cục bộ hoặc sử dụng API của chúng tôi để nhúng.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Duyệt tìm hiểu bài viết', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Chính sách bảo mật', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Điều khoản dịch vụ', type: 'external' },
  ],
  sections: [
    {
      heading: 'ANQR là gì?',
      paragraphs: ['ANQR (phát âm là "anchor") là trình tạo mã QR miễn phí giúp tạo mã có thể quét được cho URL, văn bản, thông tin xác thực Wi-Fi, thẻ liên hệ, sự kiện lịch, v.v.', 'Nó được xây dựng cho các cá nhân, doanh nghiệp nhỏ, nhà tiếp thị và nhà phát triển muốn có các công cụ QR mạnh mẽ mà không cần đăng ký. Thiết kế ưu tiên khách hàng nghĩa là mã QR được tạo cục bộ trong trình duyệt của bạn theo mặc định, với API máy chủ tùy chọn để nhúng và tích hợp chuyên nghiệp.'],
    },
    {
      heading: 'Các tính năng chính',
      bullets: ['Tạo mã QR ngay lập tức trong trình duyệt của bạn - không cần tài khoản.', 'Tùy chỉnh màu sắc, kiểu mô-đun, mẫu công cụ tìm và thêm lớp phủ hình ảnh.', 'Xuất ở nhiều định dạng: PNG, SVG, WebP và GIF động.', 'Kiểm soát nâng cao về mức sửa lỗi, phiên bản QR, chế độ mã hóa và lựa chọn mặt nạ.', 'Hướng dẫn an toàn khi quét và xem trước trực tiếp để giúp mã có thể đọc được khi in và trên màn hình.', 'API phía máy chủ để nhúng chuyên nghiệp với hỗ trợ đầy đủ thông số.', 'Hoạt động ngoại tuyến sau khi tải - đây là một ứng dụng web tĩnh mà bạn có thể chạy ở mọi nơi.'],
    },
    {
      heading: 'ANQR hoạt động như thế nào',
      paragraphs: ['ANQR chạy trong trình duyệt của bạn và mã hóa dữ liệu đầu vào của bạn thành ma trận QR tiêu chuẩn với tính năng sửa lỗi Reed–Solomon, sau đó hiển thị dữ liệu đó theo định dạng bạn chọn.', 'Theo mặc định, việc tạo diễn ra cục bộ trong trình duyệt của bạn. Để sử dụng chuyên nghiệp, bạn cũng có thể sử dụng API phía máy chủ để tạo mã QR thông qua tham số URL - hoàn hảo để nhúng vào trang web, email hoặc quy trình làm việc tự động.', 'Khi bạn thêm lớp phủ hoặc hoạt ảnh, ANQR sẽ cân bằng kiểu dáng với độ tin cậy quét để kết quả vẫn có thể quét được.', 'ANQR tập trung vào mã tĩnh (dữ liệu nằm trong QR). Nếu bạn cần mã động (đích có thể chỉnh sửa), bạn có thể mã hóa URL chuyển hướng hoặc liên kết ngắn của riêng mình.'],
    },
    {
      heading: 'Ai vận hành ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Quảng cáo và cách chúng ta được tự do',
      paragraphs: ['ANQR được sử dụng miễn phí và được hỗ trợ bởi quảng cáo. Chúng tôi có thể hiển thị quảng cáo qua Google AdSense và/hoặc các đối tác quảng cáo khác.', 'Nhà cung cấp quảng cáo có thể sử dụng cookie hoặc công nghệ tương tự để cá nhân hóa quảng cáo dựa trên sở thích và hoạt động duyệt web của bạn. Bạn có thể quản lý tùy chọn quảng cáo trong cài đặt thiết bị của mình và thông qua cài đặt quảng cáo của Google, đồng thời tìm hiểu thêm trong Chính sách bảo mật của chúng tôi.', 'Chúng tôi không bán nội dung bạn mã hóa thành mã QR. Quảng cáo giúp trang trải chi phí vận hành và cải thiện dự án.'],
    },
    {
      heading: 'Tiêu chuẩn mở',
      paragraphs: ['ANQR tạo mã QR dựa trên tiêu chuẩn ISO/IEC 18004 và nhằm mục đích tương thích rộng rãi giữa các máy quét, máy ảnh và quy trình in.'],
    },
    {
      heading: 'Thông báo nhãn hiệu',
      paragraphs: ['QR Code® là nhãn hiệu đã đăng ký của DENSO WAVE INCORPORATED. ANQR không được liên kết, xác nhận hoặc tài trợ bởi DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Phản hồi và đóng góp',
      paragraphs: ['Chúng tôi hoan nghênh phản hồi, báo cáo lỗi và đề xuất tính năng. Vui lòng liên hệ qua email hoặc trang liên hệ - chúng tôi đọc mọi tin nhắn, mặc dù thời gian phản hồi có thể thay đổi.'],
    },
  ],
};

export default about;
