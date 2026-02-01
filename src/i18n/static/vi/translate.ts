import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Trợ giúp Dịch ANQR',
  description: 'Tham gia cộng đồng dịch giả của chúng tôi để giúp ANQR có thể truy cập được cho người dùng trên toàn thế giới. Không cần kinh nghiệm viết mã - đóng góp trực tiếp từ trình duyệt của bạn.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Mở kho dịch', type: 'external' },
    { href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Giới thiệu về ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Liên hệ với chúng tôi', type: 'external' },
  ],
  sections: [
    {
      heading: 'Tại sao đóng góp?',
      paragraphs: ['ANQR được mọi người trên khắp thế giới sử dụng để tạo mã QR cho doanh nghiệp, sự kiện, thanh toán và dự án cá nhân. Bằng cách đóng góp bản dịch, bạn giúp làm cho công cụ mạnh mẽ này có thể truy cập được đối với những người dùng thích ngôn ngữ mẹ đẻ của họ.', 'Mỗi đóng góp dịch thuật - cho dù sửa lỗi đánh máy hay dịch toàn bộ ngôn ngữ - đều tạo ra sự khác biệt thực sự cho người dùng trong cộng đồng của bạn.'],
    },
    {
      heading: 'Bạn có thể dịch gì?',
      paragraphs: ['ANQR có hai loại nội dung có thể dịch được:'],
      bullets: ['Chuỗi giao diện người dùng: Nhãn nút, mục menu, chú giải công cụ và văn bản giao diện xuất hiện trong toàn bộ ứng dụng.', 'Nội dung tĩnh: Các trang tài liệu bao gồm hướng dẫn, ví dụ, chính sách bảo mật và bài viết trợ giúp.', 'Cả hai loại đều được lưu trữ dưới dạng tệp văn bản đơn giản mà bạn có thể chỉnh sửa trực tiếp trong trình duyệt của mình - không cần phần mềm đặc biệt.', 'Các bản dịch được xem xét trước khi hợp nhất để đảm bảo chất lượng và tính nhất quán.'],
    },
    {
      heading: 'Cách đóng góp',
      paragraphs: ['Đóng góp rất dễ dàng và không yêu cầu kiến thức về Git:'],
      bullets: ['Truy cập kho lưu trữ bản dịch công khai của chúng tôi trên GitHub.', 'Tìm tệp ngôn ngữ của bạn (hoặc tạo một tệp mới nếu ngôn ngữ của bạn chưa được hỗ trợ).', 'Nhấp vào biểu tượng bút chì để chỉnh sửa trực tiếp trong trình duyệt của bạn.', 'Thực hiện các thay đổi của bạn và nhấp vào "Đề xuất thay đổi" - GitHub sẽ tự động tạo yêu cầu kéo.', 'Đóng góp của bạn sẽ được xem xét và hợp nhất, thường trong vòng vài ngày.'],
    },
    {
      heading: 'Nguyên tắc dịch thuật',
      paragraphs: ['Khi dịch, vui lòng giữ nguyên các phần giữ chỗ như {name}, {count} và {{variable}} - những phần giữ chỗ này được thay thế bằng các giá trị động khi chạy. Đồng thời giữ nguyên mọi cú pháp giống HTML, chẳng hạn như các liên kết ở định dạng [[/path|Label]].', 'Nếu bạn không chắc chắn về bản dịch, tốt hơn là để nó bằng tiếng Anh hơn là cung cấp bản dịch sai. Bạn cũng có thể mở một vấn đề trên GitHub để yêu cầu làm rõ.'],
    },
    {
      heading: 'Ngôn ngữ hiện được hỗ trợ',
      paragraphs: ['ANQR hiện hỗ trợ hơn 40 ngôn ngữ, bao gồm:'],
      bullets: ['Các ngôn ngữ chính trên thế giới: tiếng Anh, tiếng Trung, tiếng Tây Ban Nha, tiếng Ả Rập, tiếng Hindi, tiếng Bồ Đào Nha, tiếng Nhật, tiếng Hàn, tiếng Pháp, tiếng Đức, tiếng Nga, v.v.', 'Ngôn ngữ Đông Nam Á: tiếng Thái, tiếng Việt, tiếng Indonesia, tiếng Philippin, tiếng Mã Lai, tiếng Khmer, tiếng Lào, tiếng Miến Điện.', 'Các ngôn ngữ Nam Á: Tiếng Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Nepali.'],
    },
    {
      heading: 'Sự công nhận',
      paragraphs: ['Tất cả những người đóng góp đều được ghi có vào kho lưu trữ của chúng tôi. Công việc của bạn giúp hàng nghìn người dùng truy cập ANQR bằng ngôn ngữ ưa thích của họ.', 'Cảm ơn tất cả những người đóng góp dịch thuật của chúng tôi đã giúp ANQR có thể truy cập được trên toàn thế giới!'],
    },
    {
      heading: 'Câu hỏi?',
      paragraphs: ['Nếu bạn có thắc mắc về việc đóng góp bản dịch, vui lòng mở một vấn đề trên kho GitHub của chúng tôi hoặc liên hệ với chúng tôi qua email. Chúng tôi rất vui được giúp bạn bắt đầu.'],
    },
  ],
};

export default translate;
