import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Ví dụ về ANQR',
  description: 'Năm ví dụ về phong cách sản xuất, trong thế giới thực cho thấy nơi mã QR tạo ra giá trị có thể đo lường được: nâng cao mã quầy bán lẻ truyền thống, thanh toán bán lẻ có thương hiệu và hành động "quét đến", in tỷ lệ từ tờ rơi đến bảng quảng cáo, QR hoạt hình cho bảng hiệu kỹ thuật số và cộng tác đa ngôn ngữ bằng cách sử dụng các liên kết Anchor có thể chia sẻ. Mỗi ví dụ bao gồm hình ảnh, các ràng buộc thực tế và liên kết phối lại trở lại trình tạo.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Duyệt tìm hiểu bài viết', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Mở Hướng dẫn sử dụng đầy đủ', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Nghiên cứu điển hình: Nâng cao QR của quầy bán lẻ',
      paragraphs: ['Ví dụ thực tế này theo sau một quán cà phê nhỏ đã sử dụng cùng một mã QR trên quầy của họ trong ba năm. Mã ban đầu được tạo ra nhanh chóng trong thời kỳ đại dịch cao điểm, được in trên giấy tiêu chuẩn và được đặt trên một giá đỡ bằng nhựa. Nó vẫn hoạt động - về mặt kỹ thuật - nhưng khách hàng thường phải thử quét nó nhiều lần và nó không thể củng cố nhận diện thương hiệu được xây dựng cẩn thận của quán cà phê.', 'Quá trình chuyển đổi bắt đầu bằng một cuộc kiểm tra đơn giản: mã hiện có đã mã hóa URL menu trực tuyến của quán cà phê mà họ muốn giữ lại. Thử thách là làm cho QR giống như một phần của trải nghiệm ở quán cà phê hơn là một tiện ích được cân nhắc kỹ lưỡng từ năm 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Mã QR bị phong hóa trên giá nhựa hiển thị vết mòn, dấu vân tay và bản in bị mờ',
          caption: 'Điểm khởi đầu: ba năm phục vụ tại quầy đã khiến QR ban đầu hầu như không hoạt động',
        },
      ],
    },
    {
      heading: 'Chẩn đoán sự cố của mã gốc',
      paragraphs: ['Thử nghiệm cho thấy nhiều vấn đề: mã ban đầu sử dụng Error Correction L (dự phòng tối thiểu), có vùng yên tĩnh chỉ có 2 mô-đun và được in ở độ phân giải thấp. Dưới ánh đèn vonfram ấm áp của quán cà phê, những mô-đun màu đen vốn đã mờ nhạt hầu như không tương phản với tờ giấy ố vàng. Điện thoại cũ gặp khó khăn; điện thoại mới hơn đã thành công nhưng có độ trễ đáng chú ý.', 'Ngoài các vấn đề kỹ thuật, hình vuông đen trắng chung chung không truyền đạt gì về thương hiệu. Khách hàng do dự trước khi quét - một rào cản tin cậy tinh vi làm giảm mức độ tương tác với menu kỹ thuật số được thiết kế cẩn thận của quán cà phê.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Lớp phủ chẩn đoán hiển thị các thiếu sót kỹ thuật của QR ban đầu: ECC thấp, vùng yên tĩnh tối thiểu, độ tương phản kém',
          caption: 'Phân tích kỹ thuật tiết lộ lý do tại sao mã kế thừa hoạt động kém trong điều kiện thực tế',
        },
      ],
    },
    {
      heading: 'Quá trình nâng cao',
      paragraphs: ['Bằng cách sử dụng ANQR, chủ quán cà phê đã tạo lại mã với URL menu giống hệt nhưng cài đặt được cải thiện đáng kể: Sửa lỗi H để có khả năng phục hồi tối đa, vùng yên tĩnh gồm 6 mô-đun để phát hiện ranh giới đáng tin cậy và màu sắc thương hiệu (mô-đun màu đỏ tía đậm trên nền kem) phù hợp với bảng màu nội thất của quán cà phê.', 'Một lớp phủ nhỏ ở giữa có logo của quán cà phê đã được thêm vào - được cố tình tinh tế để duy trì khả năng có thể quét được đồng thời mang lại khả năng nhận diện thương hiệu ngay lập tức. Chế độ An toàn đã xác nhận thiết kế mới được quét một cách đáng tin cậy trên các thiết bị thử nghiệm trước khi in.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'Giao diện ANQR hiển thị cấu hình: màu sắc thương hiệu, ECC phù hợp, vùng yên tĩnh rộng rãi, lớp phủ logo tinh tế',
          caption: 'Xây dựng cấu hình nâng cấp: mọi cài đặt được chọn để cân bằng biểu hiện thương hiệu với độ tin cậy quét',
        },
      ],
    },
    {
      heading: 'Kết quả có thể đo lường được',
      paragraphs: ['Sau khi triển khai mã QR mới trên giấy in thẻ cán mờ chuyên nghiệp, quán cà phê đã theo dõi kết quả trong vòng bốn tuần. Tỷ lệ quét thành công được cải thiện từ ước tính 70% lên gần 100%. Thời gian quét trung bình giảm từ 3-4 giây xuống dưới 1 giây. Đáng kể nhất, mức độ tương tác với menu đã tăng 40% - những khách hàng trước đây đã nhìn vào QR và bỏ cuộc giờ đây đang quét một cách tự tin.', 'Nhân viên báo cáo rằng khách hàng có ít câu hỏi hơn về \'cách sử dụng QR\' và không có thêm trường hợp nhập URL thủ công nào khiến khách hàng thất vọng. Vẻ ngoài mang thương hiệu cũng làm dấy lên những cuộc trò chuyện, trong đó khách hàng nhận xét tích cực về thiết kế gắn kết.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'So sánh trước/sau với các số liệu: tỷ lệ quét thành công, thời gian quét trung bình và cải thiện số lần quét hàng tuần',
          caption: 'Bốn tuần dữ liệu cho thấy tác động có thể đo lường được của việc nâng cao QR một cách chu đáo',
        },
      ],
    },
    {
      heading: 'Tạo lại cấu hình này',
      paragraphs: ['Cấu hình của quán cà phê thể hiện thương hiệu thận trọng nhưng hiệu quả: Sửa lỗi H, vùng yên tĩnh 6 mô-đun, màu sắc thương hiệu có độ tương phản cao và lớp phủ trung tâm tối thiểu. Cân này hoạt động với hầu hết các ứng dụng tại quầy bán lẻ trong đó độ tin cậy phải được đặt lên hàng đầu nhưng sự hiện diện của thương hiệu vẫn là vấn đề quan trọng.', 'Mở trình tạo có cài đặt sẵn các cài đặt này và điều chỉnh màu sắc cũng như lớp phủ cho phù hợp với thương hiệu của riêng bạn. The key insight: reliability improvements alone can dramatically increase engagement, even before adding any visual styling.', 'Xem hướng dẫn Tìm hiểu có liên quan về cách cải thiện các chiến dịch QR hiện có để biết phương pháp đầy đủ đằng sau phương pháp này.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Liên kết với trình tạo được cấu hình sẵn với cài đặt của quán cà phê để tùy chỉnh ngay lập tức',
          caption: 'Bắt đầu với cấu hình đã được chứng minh và tùy chỉnh cho thương hiệu của bạn',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Duyệt tìm hiểu bài viết',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Nghiên cứu điển hình: Hiển thị quầy thanh toán nhiều lần',
      paragraphs: ['Ví dụ này theo sau một cửa hàng quần áo boutique đã tích lũy năm mã QR khác nhau trong sổ đăng ký của họ: thanh toán ngân hàng, mẹo, Instagram, bài đánh giá trên Google và liên kết tuyển dụng. Mỗi bản được tạo từ một nguồn khác nhau, được in vào các thời điểm khác nhau và được hiển thị trên các giá đỡ không khớp. Sự hỗn loạn về mặt thị giác đã làm suy yếu tính thẩm mỹ được quản lý cẩn thận của cửa hàng và nhân viên thường xuyên xử lý trường hợp khách hàng quét sai mã.', 'Giải pháp yêu cầu tách biệt các mối quan tâm: mã thanh toán cần độ tin cậy tối đa với kiểu dáng thận trọng, trong khi mã tiếp thị có thể mang tính biểu cảm hơn. Hệ thống hiển thị thống nhất xuất hiện thể hiện cách cân bằng sự hiện diện của thương hiệu với nhu cầu chức năng của các trường hợp sử dụng QR khác nhau.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Khu vực đăng ký lộn xộn hiển thị năm mã QR không khớp trên nhiều giá đỡ và tài liệu in khác nhau',
          caption: 'Điểm khởi đầu hỗn loạn: 5 mã QR rời rạc tranh giành sự chú ý, khiến khách hàng bối rối',
        },
      ],
    },
    {
      heading: 'Ưu tiên trải nghiệm thanh toán',
      paragraphs: ['Phương thức thanh toán chính của cửa hàng sử dụng tiêu chuẩn khu vực yêu cầu tuân thủ nghiêm ngặt về tải trọng. Thử nghiệm cho thấy rằng ngay cả kiểu dáng nhỏ cũng ảnh hưởng đến tốc độ quét với một số ứng dụng ngân hàng nhất định. Quyết định: giữ nguyên hoàn toàn mã QR thanh toán ngoại trừ việc tối ưu hóa kích thước và in chuyên nghiệp trên giấy mờ.', 'Cách tiếp cận thận trọng này có nghĩa là mã thanh toán trông ít \'có thương hiệu\' hơn mức lý tưởng, nhưng tỷ lệ hoàn thành giao dịch được cải thiện đáng kể. Thông tin chi tiết: khoảnh khắc thanh toán không phải là cơ hội xây dựng thương hiệu - mà là khoảnh khắc đáng tin cậy. Khách hàng đánh giá cao tốc độ và sự chắc chắn về tính thẩm mỹ khi liên quan đến tiền bạc.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Mã QR thanh toán lớn, rõ ràng trên kho thẻ mờ chuyên nghiệp, được đặt nổi bật tại quầy đăng ký',
          caption: 'QR thanh toán: có kích thước rộng rãi, được in chuyên nghiệp, được tạo kiểu cẩn thận để các ứng dụng ngân hàng nhận dạng ngay lập tức',
        },
      ],
    },
    {
      heading: 'Tạo màn hình hành động phụ',
      paragraphs: ['Đối với các mẹo, bài đánh giá, mạng xã hội và tuyển dụng, cửa hàng có thể mang tính biểu cảm hơn. Các mã này đã được tái tạo trong ANQR với kiểu dáng thương hiệu nhất quán: màu xanh ô liu đặc trưng của cửa hàng trên nền kem, kiểu mô-đun tròn và lớp phủ trung tâm tinh tế với biểu tượng của cửa hàng. Sửa lỗi H đảm bảo độ tin cậy ngay cả với kiểu dáng.', 'Bốn mã này được sắp xếp trong một bảng có thương hiệu được đặt bên cạnh (không cạnh tranh với) mã thanh toán. Nhãn rõ ràng trong kiểu chữ của cửa hàng giải thích mục đích của từng mã. Hệ thống phân cấp trực quan có chủ đích: thanh toán đứng riêng biệt và nổi bật; các hành động phụ được nhóm lại với nhau dưới dạng tùy chọn.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Bảng điều khiển có thương hiệu hiển thị bốn mã QR theo kiểu dành cho mẹo, bài đánh giá, mạng xã hội và tuyển dụng với nhãn rõ ràng',
          caption: 'Bảng hành động phụ: xây dựng thương hiệu nhất quán, ghi nhãn rõ ràng, được định vị dưới dạng tùy chọn thay vì gây phiền nhiễu',
        },
      ],
    },
    {
      heading: 'Thiết kế hệ thống hiển thị',
      paragraphs: ['Màn hình vật lý đã giải quyết được một số vấn đề cùng một lúc. Cả quầy thanh toán và bảng điều khiển phụ đều sử dụng vật liệu mờ để loại bỏ ánh sáng chói từ ánh sáng trên cao. Chiều cao được tối ưu hóa cho khách hàng có tầm vóc khác nhau. Góc hướng về phía khách hàng xếp hàng chứ không nằm phẳng trên quầy.', 'Điều quan trọng là cửa hàng đã tạo các bản in dự phòng từ các liên kết cấu hình ANQR bị khóa. Khi mã mẹo cuối cùng bị văng cà phê, nhân viên đã thay thế nó trong vòng vài phút bằng cách sử dụng cấu hình được lưu trữ - không ảnh chụp màn hình, không đoán cài đặt, không suy giảm chất lượng.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Sơ đồ hiển thị bố cục màn hình vật lý: chiều cao, góc, chất liệu và mối quan hệ giữa thanh toán và màn hình phụ',
          caption: 'Sơ đồ hệ thống hiển thị: công thái học vật lý được tối ưu hóa để quét đáng tin cậy theo độ cao và điều kiện ánh sáng của khách hàng',
        },
      ],
    },
    {
      heading: 'Cải tiến hoạt động',
      paragraphs: ['Sáu tuần sau khi triển khai, cửa hàng đã ghi nhận những cải tiến đáng kể: không có khiếu nại nào của khách hàng về nhầm lẫn \'mã sai\', thời gian giao dịch nhanh hơn và số lần gửi tiền boa tăng gấp 3 lần (giờ đây khách hàng có thể tìm và quét mã tiền boa mà không cần phải hỏi nhân viên một cách lúng túng). Các đánh giá trên Google cũng tăng lên khi QR chuyên dụng, được gắn nhãn rõ ràng đã loại bỏ được xung đột.', 'Việc đào tạo nhân viên trở nên đơn giản hơn: \'mã thanh toán là vấn đề lớn, mọi thứ khác đều có trong bảng điều khiển.\' Khi các ứng dụng thanh toán được cập nhật và một ứng dụng hiển thị tốc độ quét chậm hơn trong thời gian ngắn, thiết kế mã thanh toán thận trọng có nghĩa là nó vẫn hoạt động - chỉ chậm hơn một chút thay vì thất bại hoàn toàn.', 'Xem hướng dẫn Tìm hiểu về mã QR để thanh toán bán lẻ để biết các nguyên tắc đằng sau thiết kế hệ thống hiển thị này.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Bảng điều khiển số liệu hiển thị các so sánh trước/sau: sự cố nhầm lẫn, thời gian giao dịch, tần suất tiền boa, gửi đánh giá',
          caption: 'Sáu tuần dữ liệu vận hành chứng minh tác động kinh doanh của hệ thống hiển thị đa QR chu đáo',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Duyệt tìm hiểu bài viết',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Nghiên cứu điển hình: Từ danh thiếp đến bảng quảng cáo',
      paragraphs: ['Ví dụ này theo sau một công ty sản xuất sự kiện đang chuẩn bị cho một hội nghị lớn. Họ cần cùng một mã QR - liên kết với ứng dụng sự kiện - được triển khai trên các định dạng hoàn toàn khác nhau: thẻ gắn huy hiệu người tham dự (3cm), thẻ lều trên bàn (8cm), biển báo trên bàn đăng ký (30cm), áp phích chỉ đường (60cm) và biểu ngữ phông nền sân khấu lớn (4 mét). Mỗi định dạng có khoảng cách xem, điều kiện ánh sáng và quy trình sản xuất khác nhau.', 'Thử thách không chỉ là kỹ thuật - mà còn là hoạt động. Nhiều nhà cung cấp xử lý các công việc in khác nhau và công ty cần đảm bảo kết quả nhất quán, có thể quét được bất kể ai sản xuất cái gì. Giải pháp của họ tập trung vào việc xuất SVG và tài liệu chuyển giao nghiêm ngặt.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Ảnh ghép hiển thị cùng một mã QR được triển khai trên năm kích thước khác nhau, từ huy hiệu đến biểu ngữ',
          caption: 'Một mã QR, năm quy mô triển khai: thách thức duy trì khả năng quét từ cm đến mét',
        },
      ],
    },
    {
      heading: 'Tại sao các sự kiện trước đó lại có vấn đề',
      paragraphs: ['Tại hội nghị gần đây nhất, công ty đã trải qua những thất bại đáng xấu hổ. QR biểu ngữ sân khấu được tạo dưới dạng PNG nhỏ và được phóng to trong phần mềm thiết kế - kết quả trông có vẻ chấp nhận được khi nhìn từ xa nhưng không thể quét được từ khán giả một cách đáng tin cậy. QR huy hiệu được tạo kiểu quá mức và quá nhỏ, khiến những người tham dự cố gắng thêm địa chỉ liên hệ cảm thấy khó chịu. Cài đặt không nhất quán giữa các định dạng có nghĩa là mã QR \'giống nhau\' thực sự trông khác nhau trên mỗi phần.', 'Phân tích sau sự kiện đã tiết lộ nguyên nhân sâu xa: không có nguồn sự thật duy nhất nào. Mỗi nhà thiết kế đã tạo lại QR với các cài đặt hơi khác nhau và mỗi nhà cung cấp dịch vụ in đều xử lý các tệp khác nhau. Chất lượng bị suy giảm thông qua trò chơi chuyển giao tập tin trên điện thoại.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Ảnh cận cảnh cho thấy lỗi quét: mô-đun biểu ngữ có pixel, mã huy hiệu có kích thước nhỏ, kiểu dáng không nhất quán giữa các định dạng',
          caption: 'Phân tích pháp lý về các lỗi sự kiện trước đó: mỗi định dạng đã đưa ra các vấn đề về chất lượng khác nhau',
        },
      ],
    },
    {
      heading: 'Quy trình làm việc đầu tiên của SVG',
      paragraphs: ['Đối với sự kiện này, công ty đã thiết lập một giao thức nghiêm ngặt: một QR chính được tạo trong ANQR với cài đặt tối ưu (Sửa lỗi H, vùng yên tĩnh rộng rãi, kiểu dáng gọn gàng), xuất dưới dạng SVG và được lưu trữ dưới dạng nguồn có thẩm quyền duy nhất. Liên kết cấu hình ANQR đã được ghi lại cùng với tệp SVG để mã có thể được tạo lại nếu cần.', 'Mọi nhà thiết kế và nhà cung cấp đều nhận được cùng một bản gốc SVG với hướng dẫn rõ ràng: đặt ở kích thước yêu cầu, không sửa đổi, duy trì khoảng trống vùng yên tĩnh. Đối với các nhà cung cấp yêu cầu định dạng raster, công ty đã cung cấp các PNG kết xuất trước ở các kích thước cụ thể với quy ước đặt tên rõ ràng cho biết mục đích sử dụng.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Gói tệp hiển thị bản gốc SVG, PNG có kích thước cụ thể, tài liệu đặc tả và liên kết cấu hình',
          caption: 'Gói bàn giao: mọi thứ mà nhà cung cấp cần để tạo ra kết quả nhất quán mà không cần đoán trước',
        },
      ],
    },
    {
      heading: 'Cân nhắc cụ thể về kích thước',
      paragraphs: ['Mỗi định dạng yêu cầu sự chú ý cụ thể. Các tấm huy hiệu có kích thước 3cm cần có QR để chiếm không gian tối đa có sẵn - khoảng cách quét sẽ bằng chiều dài cánh tay. Lều để bàn có kích thước 8 cm có thể bao gồm khung trang trí bên ngoài khu vực yên tĩnh. Tính toán yêu cầu biểu ngữ dài 4 mét: từ khoảng cách khán giả thông thường (15-20 mét), các mô-đun cần phải được phân biệt rõ ràng bằng camera điện thoại, nghĩa là QR cần phải cách ít nhất 80cm trong thiết kế biểu ngữ.', 'Công ty đã tạo hướng dẫn định cỡ ghi lại các kích thước QR tối thiểu cho từng khoảng cách quét dự kiến. Điều này đã trở thành tài sản có thể tái sử dụng cho các sự kiện trong tương lai, loại bỏ phỏng đoán khỏi quá trình thiết kế.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Biểu đồ hiển thị mối quan hệ giữa khoảng cách quét, kích thước QR tối thiểu và kích thước mô-đun cho từng định dạng sự kiện',
          caption: 'Ma trận định cỡ: kích thước được tính toán đảm bảo khả năng quét đáng tin cậy ở khoảng cách xem dự kiến của mỗi định dạng',
        },
      ],
    },
    {
      heading: 'Kết quả sản xuất',
      paragraphs: ['Việc xác thực ngày hội nghị có tính hệ thống: nhân viên đã kiểm tra mọi mã QR được triển khai trước khi cửa mở. Các phần chèn huy hiệu được quét ngay lập tức trong tầm tay. Lều để bàn hoạt động ổn định trong điều kiện ánh sáng thay đổi của phòng họp nhóm. Banner sân khấu - nỗi bối rối của sự kiện trước đó - được quét thành công từ giữa khu vực khán giả.', 'Không có khiếu nại về quét nào được ghi lại trên hơn 2.000 người tham dự. Chiến thắng trong hoạt động cũng có ý nghĩa không kém: khi việc bổ sung nhà tài trợ vào phút cuối yêu cầu bảng hiệu mới, nhóm sản xuất đã tạo ra nó từ SVG chính trong vài phút, tự tin rằng nó sẽ phù hợp với mọi thứ khác.', 'Xem hướng dẫn Tìm hiểu về mã QR sẵn sàng in cho khung quyết định SVG và PNG và các phương pháp hay nhất về chuyển giao.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'Chụp ảnh sự kiện cho thấy người tham dự quét thành công mã QR ở nhiều kích cỡ và khoảng cách khác nhau trên khắp địa điểm',
          caption: 'Thành công của ngày hội nghị: quét đáng tin cậy trên mọi định dạng, từ ảnh cận cảnh huy hiệu đến ảnh chụp khoảng cách biểu ngữ sân khấu',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Duyệt tìm hiểu bài viết',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Nghiên cứu điển hình: Màn hình kỹ thuật số phòng chờ sân bay',
      paragraphs: ['Ví dụ này theo sau một phòng chờ của hãng hàng không đã sử dụng mã QR tĩnh trên màn hình chào mừng kỹ thuật số của họ. Các màn hình hiển thị nội dung quảng cáo xoay vòng, nhưng mã QR để đăng ký phòng chờ nằm ​​ở một góc, tĩnh và dễ bị bỏ qua. Phân tích chỉ cho thấy 15% khách đủ điều kiện đã sử dụng tính năng đăng ký QR mặc dù nó nhanh hơn xếp hàng tại bàn. Hầu hết khách chỉ đơn giản là không nhận thấy nó.', 'Giả thuyết rất đơn giản: trong một môi trường trực quan bận rộn với nội dung chuyển động, QR tĩnh sẽ trở nên vô hình. Giải pháp cần thiết để làm cho QR trở nên dễ nhận thấy mà không ảnh hưởng đến độ tin cậy cần thiết cho quy trình đăng ký khi thất bại sẽ khiến khách du lịch thất vọng và hàng đợi bàn dài hơn.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Màn hình kỹ thuật số trong phòng chờ sân bay hiển thị nội dung quảng cáo với mã QR tĩnh nhỏ ở góc',
          caption: 'Thiết lập ban đầu: QR tĩnh bị mất trong biển nội dung quảng cáo động, chỉ đạt được tỷ lệ chấp nhận 15%',
        },
      ],
    },
    {
      heading: 'Thiết kế hoạt hình an toàn',
      paragraphs: ['Biển hiệu kỹ thuật số của phòng chờ sử dụng bảng đèn LED lớn - một môi trường đầy thách thức, nơi hoạt ảnh mạnh mẽ có thể tạo ra vấn đề khi quét. Nhóm thiết kế đã bắt đầu một cách thận trọng: hiệu ứng xung nhẹ nhàng mở rộng và thu nhỏ sự hiện diện trực quan của QR một cách tinh tế mà không sửa đổi cấu trúc mã thực tế. Thời gian kết xuất khung hình được đặt chậm (250 mili giây) để tránh mọi sự cố nhấp nháy với tốc độ làm mới đèn LED.', 'Xác thực Chế độ an toàn đã xác nhận mọi khung hình vẫn có thể quét được. Thử nghiệm bổ sung trên bảng đèn LED thực tế cho thấy rằng xung cần phải tinh tế hơn so với đề xuất xem trước trên máy tính để bàn - Độ sáng và góc nhìn của đèn LED ảnh hưởng đến độ tương phản cảm nhận nhiều hơn mong đợi.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'Bảng cài đặt hoạt ảnh ANQR hiển thị cấu hình xung: thời gian chậm, cường độ tinh tế, đã bật Chế độ an toàn',
          caption: 'Cấu hình hoạt ảnh: các tham số được điều chỉnh để hiển thị bảng LED trong khi vẫn duy trì độ tin cậy quét trong mọi khung hình',
        },
      ],
    },
    {
      heading: 'Tích hợp với nội dung bảng hiệu',
      paragraphs: ['QR hoạt hình được đặt trong một \'vùng ổn định\' chuyên dụng của bố cục màn hình - một khu vực không đổi trong khi nội dung quảng cáo được luân chuyển trong khu vực hiển thị chính. Sự tách biệt này rất quan trọng: QR cần sự ổn định về mặt hình ảnh để quét ngay cả khi thu hút sự chú ý thông qua hoạt ảnh tinh tế của nó.', 'Lời kêu gọi hành động rõ ràng đã được thêm bên cạnh QR: \'Bỏ qua hàng đợi - quét để đăng ký.\' Văn bản vẫn tĩnh trong khi QR chuyển động, tạo ra một hệ thống phân cấp trực quan thu hút sự chú ý đến cơ hội quét mà không lấn át nội dung quảng cáo.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Sơ đồ bố cục màn hình hiển thị QR động ở vùng ổn định trong khi nội dung quảng cáo xoay vòng trong khu vực chính',
          caption: 'Phân bổ bất động sản trên màn hình: QR hoạt hình chiếm một vùng ổn định tách biệt với nội dung quảng cáo luân phiên',
        },
      ],
    },
    {
      heading: 'Triển khai kỹ thuật',
      paragraphs: ['QR hoạt hình đã được xuất dưới dạng GIF với cài đặt được tối ưu hóa cho CMS bảng hiệu. Việc cân nhắc kích thước tệp rất quan trọng - hệ thống quản lý nội dung của phòng chờ có giới hạn tải lên và các tệp quá lớn gây ra hiện tượng giật hình khi phát lại. Chất lượng hình ảnh xuất cuối cùng được cân bằng với kích thước tệp bằng cách giới hạn bảng màu và tối ưu hóa số lượng khung hình.', 'Việc triển khai bao gồm một dự phòng: nếu GIF không phát được vì bất kỳ lý do gì, hệ thống biển báo sẽ hiển thị bản sao lưu PNG tĩnh. Sự dư thừa này đảm bảo khả năng đăng ký không bao giờ bị mất do sự cố kỹ thuật với hoạt ảnh.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Giao diện CMS hiển thị tải lên QR động với hình ảnh tĩnh dự phòng được định cấu hình',
          caption: 'Cấu hình Signage CMS: hoạt hình chính với dự phòng tĩnh đảm bảo khả năng đăng ký không bao giờ bị gián đoạn',
        },
      ],
    },
    {
      heading: 'Tác động được đo',
      paragraphs: ['Sau một tháng hoạt động, tỷ lệ chấp nhận đăng ký QR đã tăng từ 15% lên 24% - mức cải thiện tương đối là 60%. Khảo sát phản hồi của khách cho thấy QR động "dễ nhận thấy hơn" và "có cảm giác hiện đại hơn". Thời gian xếp hàng tại bàn giảm đáng kể trong thời gian cao điểm do có nhiều khách tự phục vụ qua QR hơn.', 'Điều quan trọng là không có lỗi quét nào được báo cáo mặc dù có hàng nghìn lượt quét hàng ngày. Cách tiếp cận hoạt hình thận trọng đã đạt được mục tiêu gây chú ý mà không làm mất đi độ tin cậy mà quy trình đăng ký yêu cầu. Phòng chờ sau đó đã triển khai các mã QR hoạt hình tương tự cho các địa điểm khác của họ.', 'Xem hướng dẫn Tìm hiểu về mã QR động cho bảng hiệu kỹ thuật số để biết các nguyên tắc kỹ thuật đằng sau thiết kế hoạt ảnh an toàn.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Một bảng thông tin hiển thị mức tăng tỷ lệ tiếp nhận, giảm thời gian xếp hàng và độ tin cậy quét không xảy ra lỗi trong giai đoạn triển khai',
          caption: 'Một tháng dữ liệu: tăng tỷ lệ sử dụng 60%, giảm thời gian xếp hàng và duy trì độ tin cậy quét hoàn hảo',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Duyệt tìm hiểu bài viết',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Nghiên cứu điển hình: Chiến dịch QR ra mắt sản phẩm toàn cầu',
      paragraphs: ['Ví dụ này theo sau một công ty điện tử tiêu dùng tung ra đồng thời một sản phẩm mới tại 12 thị trường với 8 ngôn ngữ. Mỗi nhóm tiếp thị khu vực cần sản xuất bao bì, màn hình bán lẻ và tài liệu quảng cáo có mã QR liên kết đến các trang sản phẩm được bản địa hóa. Các lần ra mắt trước đó đã dẫn đến kiểu dáng QR không nhất quán, thỉnh thoảng xảy ra lỗi quét và \'trò chơi điện thoại\' lệch cấu hình khi mỗi nhóm tạo lại mã từ ảnh chụp màn hình.', 'Giải pháp tận dụng các liên kết cấu hình có thể chia sẻ của ANQR để thiết lập một nguồn thông tin chính xác duy nhất mà mọi nhóm trong khu vực đều có thể truy cập, bất kể ngôn ngữ giao diện của họ. Tải trọng QR sử dụng chuyển hướng thông minh để phát hiện ngôn ngữ người dùng, do đó, một mã có thể hoạt động trên toàn cầu đồng thời mang lại trải nghiệm bản địa hóa.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Bản đồ thế giới hiển thị 12 vị trí thị trường có mã QR, một số vị trí không giống nhau về mặt hình ảnh',
          caption: 'Thách thức: 12 thị trường, 8 ngôn ngữ và lịch sử triển khai QR không nhất quán giữa các khu vực',
        },
      ],
    },
    {
      heading: 'Thiết lập cấu hình chính',
      paragraphs: ['Nhóm thương hiệu toàn cầu đã tạo cấu hình QR có thẩm quyền trong ANQR: màu sắc thương hiệu phù hợp với nhận dạng hình ảnh của dòng sản phẩm, Sửa lỗi H để đảm bảo độ tin cậy trên tất cả các ứng dụng in và kỹ thuật số cũng như kiểu dáng có thể tái tạo nhất quán bất kể phương pháp sản xuất địa phương. Cấu hình đã bị khóa và liên kết chia sẻ được ghi lại trong bản tóm tắt chiến dịch toàn cầu.', 'Điều quan trọng là URL được mã hóa đã sử dụng dịch vụ chuyển hướng phát hiện ngôn ngữ. Khi được quét, người dùng sẽ tự động được chuyển đến trang sản phẩm bằng ngôn ngữ địa phương của họ. Điều này có nghĩa là tất cả 12 thị trường đều có thể sử dụng mã QR giống hệt nhau - không có biến thể tải trọng nào trên mỗi thị trường có thể gây ra lỗi.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'Giao diện ANQR hiển thị cấu hình chính với màu sắc thương hiệu, ECC H và URL chuyển hướng thông minh',
          caption: 'Cấu hình chính: các tiêu chuẩn thương hiệu toàn cầu được mã hóa thành một nguồn thông tin duy nhất có thể chia sẻ được',
        },
      ],
    },
    {
      heading: 'Quy trình làm việc của nhóm khu vực',
      paragraphs: ['Mỗi nhóm tiếp thị khu vực đều nhận được liên kết cấu hình kèm theo hướng dẫn đơn giản: mở liên kết, xác minh bản xem trước phù hợp với nguyên tắc thương hiệu, xuất ở định dạng bắt buộc cho ứng dụng của bạn. Giao diện ANQR được hiển thị bằng ngôn ngữ ưa thích của mỗi nhóm, nhưng cài đặt QR cơ bản vẫn giống nhau bất kể ngôn ngữ giao diện.', 'Khi đội Nhật Bản cần SVG cho màn hình bán lẻ cao cấp và đội Brazil cần PNG cho mạng xã hội, cả hai đều được xuất từ cùng một cấu hình. Khi nhà cung cấp dịch vụ in của đội Đức yêu cầu các giá trị màu cụ thể, họ có thể tham khảo cấu hình trực tiếp thay vì đoán từ ảnh chụp màn hình.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Ảnh chụp màn hình hiển thị cùng một liên kết cấu hình được mở bằng giao diện tiếng Nhật, tiếng Bồ Đào Nha và tiếng Đức',
          caption: 'Cấu hình giống nhau, giao diện khác nhau: các nhóm khu vực làm việc bằng ngôn ngữ ưa thích của họ trong khi vẫn duy trì tính nhất quán toàn cầu',
        },
      ],
    },
    {
      heading: 'Xử lý các biến thể khu vực',
      paragraphs: ['Một số thị trường yêu cầu những điều chỉnh nhỏ. Nhóm Trung Quốc cần một phiên bản có khung được tối ưu hóa cho WeChat để chia sẻ trên mạng xã hội. Thay vì sửa đổi bản gốc, họ đã tạo một biến thể được ghi lại bằng liên kết cấu hình riêng, được gắn nhãn rõ ràng là \'biến thể CN-WeChat\' trong thư viện nội dung chiến dịch. Điều này duy trì khả năng truy xuất nguồn gốc trong khi cho phép nội địa hóa cần thiết.', 'Nhóm thương hiệu đã thiết lập một quy tắc đơn giản: bất kỳ biến thể nào từ bản chính đều yêu cầu liên kết cấu hình mới, được ghi lại. Không sửa đổi các tệp đã xuất, không \'sửa nhanh\' trong phần mềm thiết kế. Điều này đã ngăn cản sự lệch cấu hình đã gây khó khăn cho các lần ra mắt trước đó.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Giao diện thư viện nội dung hiển thị cấu hình chính và các biến thể khu vực được phê duyệt, mỗi biến thể có liên kết riêng',
          caption: 'Quản trị tài sản chiến dịch: cấu hình chính cộng với các biến thể được ghi lại, tất cả đều có thể theo dõi được thông qua liên kết cấu hình',
        },
      ],
    },
    {
      heading: 'Kết quả khởi động',
      paragraphs: ['Ngày ra mắt sản phẩm chứng kiến mã QR được triển khai đồng thời trên bao bì, màn hình bán lẻ, tài liệu sự kiện và chiến dịch kỹ thuật số ở tất cả 12 thị trường. Kiểm tra chất lượng đã xác nhận tính nhất quán trực quan giữa các khu vực - QR trên màn hình bán lẻ ở Tokyo khớp với QR trên bao bì São Paulo khớp với QR trên biểu ngữ sự kiện ở Berlin.', 'Không có lỗi quét nào được báo cáo trên khắp các thị trường. Khi cần thay đổi URL của trang sản phẩm sau khi ra mắt, dịch vụ chuyển hướng sẽ xử lý nó một cách ẩn - không cần in lại. Nhóm toàn cầu ước tính phương pháp liên kết cấu hình đã tiết kiệm được hơn 40 giờ thời gian phối hợp so với phương pháp ra mắt trước đó của họ.', 'Xem hướng dẫn Tìm hiểu về cộng tác QR đa ngôn ngữ để biết các nguyên tắc quy trình làm việc đằng sau tính nhất quán của chiến dịch toàn cầu.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Một mạng lưới các bức ảnh thể hiện việc triển khai QR nhất quán trên các thị trường khác nhau: bán lẻ ở Tokyo, bao bì São Paulo, sự kiện ở Berlin',
          caption: 'Đạt được sự nhất quán toàn cầu: trình bày QR giống hệt nhau trên 12 thị trường mặc dù có ngôn ngữ, nhà cung cấp và định dạng khác nhau',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Duyệt tìm hiểu bài viết',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Duyệt tìm hiểu bài viết', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Mở Hướng dẫn sử dụng đầy đủ', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Mở thư viện', type: 'gallery' },
  ],
};
