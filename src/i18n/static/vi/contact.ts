import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Liên hệ với chúng tôi',
  description: 'Chúng tôi hoan nghênh phản hồi, báo cáo lỗi, yêu cầu tính năng và các câu hỏi chung.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Làm thế nào để liên hệ với chúng tôi',
      paragraphs: ['Chúng tôi cung cấp một số cách để liên hệ với chúng tôi tùy thuộc vào nhu cầu của bạn. Chúng tôi đọc mọi tin nhắn, mặc dù thời gian phản hồi có thể khác nhau tùy theo khối lượng và loại yêu cầu.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Đối với tất cả các yêu cầu: email@anqr.link', 'Đây là cách đáng tin cậy nhất để liên hệ với chúng tôi và được khuyên dùng cho các câu hỏi chi tiết, thắc mắc về kinh doanh hoặc bất kỳ thắc mắc nào khác.'],
    },
    {
      heading: 'Các loại truy vấn',
      bullets: ['Câu hỏi chung: Câu hỏi về cách sử dụng ANQR, giải thích tính năng hoặc phản hồi chung.', 'Báo cáo lỗi: Vui lòng bao gồm trình duyệt, hệ điều hành, các bước tái tạo và bất kỳ thông báo lỗi nào bạn thấy.', 'Yêu cầu tính năng: Đề xuất về các tính năng hoặc cải tiến mới. Chúng tôi xem xét tất cả các yêu cầu mặc dù chúng tôi không thể hứa thực hiện.', 'Thắc mắc về kinh doanh: Cơ hội hợp tác, câu hỏi cấp phép hoặc thắc mắc về sử dụng thương mại.', 'Yêu cầu quyền riêng tư: Yêu cầu thực hiện quyền riêng tư của bạn theo GDPR, CCPA hoặc các luật về quyền riêng tư khác (xem Chính sách quyền riêng tư).', 'DMCA/Bản quyền: Xem phần DMCA bên dưới để biết các yêu cầu về thông báo gỡ xuống.'],
    },
    {
      heading: 'Thời gian phản hồi',
      paragraphs: ['Chúng tôi mong muốn trả lời các câu hỏi trong vòng 5-7 ngày làm việc. Các yêu cầu liên quan đến quyền riêng tư sẽ được giải quyết trong vòng 30 ngày theo yêu cầu của pháp luật.', 'Trong thời gian bận rộn, thời gian phản hồi có thể lâu hơn. Đối với các vấn đề khẩn cấp, vui lòng ghi rõ " KHẨN CẤP" trong dòng chủ đề của bạn.'],
    },
    {
      heading: 'Trước khi liên hệ với chúng tôi',
      paragraphs: ['Vui lòng kiểm tra trang Tài liệu của chúng tôi để biết câu trả lời cho các câu hỏi phổ biến về cách sử dụng các tính năng ANQR. Nhiều câu hỏi về các tùy chọn tạo, tạo kiểu và xuất mã QR được đề cập ở đó.'],
    },
    {
      heading: 'Thông báo bản quyền DMCA',
      paragraphs: ['Nếu bạn cho rằng nội dung có sẵn trên ANQR vi phạm bản quyền của bạn, bạn có thể gửi thông báo gỡ xuống theo Đạo luật bản quyền thiên niên kỷ kỹ thuật số (DMCA). Để có hiệu lực, thông báo của bạn phải bao gồm:'],
      bullets: ['Chữ ký vật lý hoặc điện tử của chủ sở hữu bản quyền hoặc đại lý được ủy quyền.', 'Nhận dạng tác phẩm có bản quyền được cho là đã bị vi phạm.', 'Nhận dạng tài liệu được cho là vi phạm, với thông tin đầy đủ để xác định vị trí của tài liệu đó.', 'Thông tin liên lạc của bạn (địa chỉ, số điện thoại và địa chỉ email).', 'Tuyên bố rằng bạn thực sự tin rằng việc sử dụng tài liệu này không được chủ sở hữu bản quyền cho phép.', 'Tuyên bố, theo hình phạt khai man, rằng thông tin trong thông báo của bạn là chính xác và bạn là chủ sở hữu bản quyền hoặc được ủy quyền hành động thay mặt họ.'],
    },
    {
      heading: 'Liên hệ DMCA',
      paragraphs: ['Gửi thông báo DMCA tới: email@anqr.link', 'Vui lòng bao gồm "Thông báo DMCA" trong dòng chủ đề. Chúng tôi sẽ phản hồi các thông báo hợp lệ theo luật hiện hành. Lưu ý rằng ANQR tạo mã QR cục bộ trên thiết bị của người dùng và không lưu trữ nội dung do người dùng tạo.'],
    },
    {
      heading: 'Cộng đồng Reddit',
      paragraphs: ['Tham gia cộng đồng Reddit của chúng tôi tại r/ANQR để chia sẻ các sáng tạo QR của bạn, đặt câu hỏi, nhận trợ giúp và kết nối với những người dùng ANQR khác.'],
    },
  ],
};

export default contact;
