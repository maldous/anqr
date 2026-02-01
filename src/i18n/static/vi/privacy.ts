import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Chính sách bảo mật',
  description:
    'Thông tin ANQR thu thập, cách sử dụng thông tin đó và các quyền của bạn theo luật bảo mật hiện hành.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Điều khoản dịch vụ', type: 'external' }],
  sections: [
    {
      heading: 'Tóm tắt',
      paragraphs: [
        'ANQR là một trình tạo mã QR với cách tiếp cận ưu tiên khách hàng. Chúng tôi không yêu cầu bạn tạo tài khoản. Theo mặc định, mã QR được tạo cục bộ trong trình duyệt của bạn - chúng tôi không có quyền truy cập vào nội dung bạn mã hóa.',
        'Để sử dụng chuyên nghiệp, ANQR cung cấp API phía máy chủ tạo mã QR từ các tham số URL. Khi sử dụng API, nội dung QR của bạn được xử lý trên máy chủ của chúng tôi để hiển thị hình ảnh nhưng không được lưu trữ hoặc ghi lại.',
        'Chúng tôi sử dụng Google AdSense để quảng cáo và có thể sử dụng các dịch vụ phân tích. Các dịch vụ này thu thập thông tin thông qua cookie và các công nghệ tương tự. Chính sách này giải thích dữ liệu nào được thu thập, cách sử dụng và quyền của bạn.',
      ],
    },
    {
      heading: 'Thông tin chúng tôi thu thập',
      bullets: [
        'Thông tin bạn cung cấp: Nếu bạn liên hệ với chúng tôi qua email hoặc biểu mẫu liên hệ của chúng tôi, chúng tôi sẽ thu thập tên, địa chỉ email và nội dung tin nhắn của bạn.',
        'Thông tin được thu thập tự động: Nhà cung cấp dịch vụ lưu trữ của chúng tôi (Netlify), đối tác quảng cáo và dịch vụ phân tích có thể thu thập: địa chỉ IP, loại và phiên bản trình duyệt, hệ điều hành, loại thiết bị, URL giới thiệu, các trang đã truy cập, thời gian trên trang web và vị trí địa lý gần đúng.',
        'Cookie của bên thứ ba: Các đối tác quảng cáo của chúng tôi (Google AdSense) sử dụng cookie và các công nghệ tương tự để phân phát và đo lường quảng cáo. Bản thân ANQR không đặt bất kỳ cookie nào của bên thứ nhất.',
      ],
    },
    {
      heading: 'Cookie và công nghệ của bên thứ ba',
      paragraphs: [
        'ANQR không đặt bất kỳ cookie nào của bên thứ nhất. Tùy chọn của bạn (chẳng hạn như chế độ tối) được lưu trữ cục bộ trên thiết bị của bạn và không được truyền đến bất kỳ máy chủ nào.',
        'Tuy nhiên, các đối tác quảng cáo của chúng tôi (Google AdSense) và nhà cung cấp dịch vụ lưu trữ có thể sử dụng cookie và các công nghệ theo dõi tương tự:',
      ],
      bullets: [
        'Cookie quảng cáo (bên thứ ba): Được Google AdSense và các đối tác quảng cáo đặt để phân phát quảng cáo có liên quan, đo lường hiệu suất quảng cáo và hiểu sở thích của người dùng. Những cookie này có thể theo dõi hoạt động của bạn trên các trang web khác nhau.',
        'Cookie phân tích (bên thứ ba): Có thể được nhà cung cấp dịch vụ lưu trữ hoặc dịch vụ phân tích của chúng tôi sử dụng để thu thập dữ liệu sử dụng ẩn danh.',
      ],
    },
    {
      heading: 'Google AdSense và quảng cáo',
      paragraphs: [
        'Chúng tôi hiển thị quảng cáo thông qua Google AdSense. Google và các đối tác của Google sử dụng cookie để phân phát quảng cáo dựa trên lịch sử duyệt web của bạn trên trang web này và các trang web khác (quảng cáo dựa trên sở thích).',
        'Tìm hiểu cách Google sử dụng thông tin của bạn: https://policies.google.com/technologists/partner-sites',
        'Quản lý cá nhân hóa quảng cáo: https://adssettings.google.com',
        'Chọn không tham gia thông qua Sáng kiến Quảng cáo Mạng: https://optout.networkadvertising.org',
        'Chọn không tham gia thông qua Liên minh quảng cáo kỹ thuật số: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Cách chúng tôi sử dụng thông tin',
      bullets: [
        'Để trả lời các câu hỏi của bạn và cung cấp hỗ trợ.',
        'Để hiển thị các quảng cáo có liên quan thông qua các đối tác quảng cáo của chúng tôi.',
        'Để phân tích việc sử dụng trang web và cải thiện dịch vụ của chúng tôi.',
        'Để phát hiện, ngăn chặn và giải quyết các vấn đề gian lận, lạm dụng và bảo mật.',
        'Để tuân thủ các nghĩa vụ pháp lý.',
      ],
    },
    {
      heading: 'Dịch vụ của bên thứ ba',
      bullets: [
        'Google AdSense: Nhận dữ liệu để phục vụ và đo lường quảng cáo.',
        'Nhà cung cấp phân tích: Nhận dữ liệu sử dụng ẩn danh.',
        'Netlify (lưu trữ): Xử lý các yêu cầu và có thể ghi lại địa chỉ IP.',
        'Chúng tôi không bán thông tin cá nhân của bạn. Tuy nhiên, việc chia sẻ dữ liệu với các đối tác quảng cáo có thể được coi là "bán hàng" theo CCPA (xem bên dưới).',
      ],
    },
    {
      heading: 'Lưu giữ dữ liệu',
      bullets: [
        'Liên hệ nộp hồ sơ: Tối đa 2 năm.',
        'Nhật ký máy chủ: Tối đa 30 ngày (nhà cung cấp dịch vụ lưu trữ).',
        'Dữ liệu phân tích: Tối đa 26 tháng (ẩn danh).',
        'Cookie quảng cáo: Thông thường là 13 tháng (thay đổi tùy theo đối tác).',
      ],
    },
    {
      heading: 'Quyền của bạn theo GDPR (người dùng EEA)',
      paragraphs: [
        'Nếu bạn ở Khu vực Kinh tế Châu Âu, bạn có các quyền sau theo Quy định chung về bảo vệ dữ liệu:',
      ],
      bullets: [
        'Quyền truy cập: Yêu cầu bản sao dữ liệu cá nhân mà chúng tôi lưu giữ về bạn.',
        'Quyền cải chính: Yêu cầu chỉnh sửa dữ liệu không chính xác.',
        'Quyền xóa: Yêu cầu xóa dữ liệu của bạn ("quyền được lãng quên").',
        'Quyền hạn chế xử lý: Yêu cầu giới hạn về cách chúng tôi sử dụng dữ liệu của bạn.',
        'Quyền di chuyển dữ liệu: Yêu cầu dữ liệu của bạn ở định dạng di động.',
        'Quyền phản đối: Phản đối việc xử lý, bao gồm cả việc tiếp thị trực tiếp.',
        'Quyền rút lại sự đồng ý: Rút lại sự đồng ý bất cứ lúc nào khi quá trình xử lý dựa trên sự đồng ý.',
        'Quyền khiếu nại: Gửi khiếu nại đến cơ quan bảo vệ dữ liệu của bạn.',
      ],
    },
    {
      heading: 'Cơ sở pháp lý GDPR',
      paragraphs: [
        'Chúng tôi xử lý dữ liệu dựa trên những cơ sở sau: (a) Sự đồng ý - đối với quảng cáo được cá nhân hóa (do đối tác quảng cáo của chúng tôi quản lý); (b) Lợi ích chính đáng - về phân tích, bảo mật và cải tiến; (c) Hợp đồng - để trả lời các yêu cầu.',
        'Để thực hiện các quyền của bạn, hãy liên hệ với email@anqr.link. Chúng tôi trả lời trong vòng 30 ngày.',
      ],
    },
    {
      heading: 'Quyền của bạn theo CCPA (người dùng California)',
      bullets: [
        'Quyền được biết: Yêu cầu thông tin về dữ liệu được thu thập, nguồn, mục đích và bên thứ ba.',
        'Quyền xóa: Yêu cầu xóa thông tin cá nhân của bạn.',
        'Quyền từ chối: Từ chối "bán" thông tin cá nhân (chia sẻ với các đối tác quảng cáo có thể đủ điều kiện).',
        'Quyền không phân biệt đối xử: Chúng tôi sẽ không phân biệt đối xử khi thực hiện các quyền của bạn.',
      ],
    },
    {
      heading: 'Các danh mục CCPA được thu thập',
      paragraphs: [
        'Danh mục: Giá trị nhận dạng (địa chỉ IP, ID thiết bị), Hoạt động Internet (duyệt web, tương tác quảng cáo), Định vị địa lý (gần đúng), Suy luận (sở thích từ việc duyệt web).',
        'Để thực hiện các quyền hoặc chọn không tham gia: email@anqr.link hoặc điều chỉnh cài đặt cookie.',
      ],
    },
    {
      heading: 'Chuyển khoản quốc tế',
      paragraphs: [
        'Thông tin của bạn có thể được chuyển đến các quốc gia có luật bảo vệ dữ liệu khác nhau, bao gồm cả Hoa Kỳ. Chúng tôi sử dụng các biện pháp bảo vệ thích hợp như Điều khoản hợp đồng tiêu chuẩn.',
      ],
    },
    {
      heading: 'Quyền riêng tư của trẻ em',
      paragraphs: [
        'ANQR không hướng tới trẻ em dưới 13 tuổi (hoặc 16 tuổi ở EEA). Chúng tôi không cố ý thu thập dữ liệu từ trẻ em. Hãy liên hệ với email@anqr.link nếu bạn cho rằng một đứa trẻ đã cung cấp thông tin.',
      ],
    },
    {
      heading: 'Bảo mật',
      paragraphs: [
        'Chúng tôi sử dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu, bao gồm cả mã hóa HTTPS. Tuy nhiên, không có đường truyền internet nào an toàn 100%.',
      ],
    },
    {
      heading: 'Không theo dõi',
      paragraphs: [
        'Chúng tôi tôn trọng các tín hiệu Không theo dõi của trình duyệt khi khả thi, mặc dù các đối tác quảng cáo có thể không phản hồi DNT.',
      ],
    },
    {
      heading: 'Những thay đổi đối với chính sách này',
      paragraphs: [
        'Chúng tôi có thể cập nhật chính sách này định kỳ. Ngày "Cập nhật lần cuối" cho biết bản sửa đổi gần đây nhất. Những thay đổi quan trọng có thể được truyền đạt thông qua biểu ngữ trang web.',
      ],
    },
    {
      heading: 'Liên hệ với chúng tôi',
      paragraphs: [
        'Đối với các câu hỏi về quyền riêng tư hoặc để thực hiện các quyền của bạn: email@anqr.link hoặc sử dụng trang Liên hệ của chúng tôi. Chúng tôi đáp ứng các yêu cầu về quyền riêng tư trong vòng 30 ngày.',
      ],
    },
    {
      heading: 'Chính sách bảo mật đầy đủ',
      paragraphs: [
        'Trang này cung cấp bản tóm tắt các biện pháp bảo mật của chúng tôi. Để biết chính sách quyền riêng tư đầy đủ, ràng buộc về mặt pháp lý với đầy đủ chi tiết về xử lý dữ liệu, quyền của bạn và nghĩa vụ của chúng tôi theo GDPR, CCPA và các luật về quyền riêng tư khác, vui lòng xem chính sách đầy đủ của chúng tôi do iubenda lưu trữ.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Xem toàn bộ Chính sách quyền riêng tư trên iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
