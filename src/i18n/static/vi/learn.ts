import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Tìm hiểu với ANQR',
  description: 'Hướng dẫn thực tế, dành cho doanh nghiệp để biến mã QR thành tài sản tiếp thị thực sự - không chỉ là các ô vuông chức năng. Tìm hiểu cách nâng cấp mã điểm bán hàng cũ, tạo bảng hiệu QR thanh toán tuân thủ, chuẩn bị xuất sẵn để in, sử dụng hoạt ảnh một cách an toàn trên màn hình kỹ thuật số và chia sẻ cấu hình khóa giữa các nhóm đa ngôn ngữ bằng cách sử dụng liên kết ANQR ("neo").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Mở máy phát điện', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Mở Hướng dẫn sử dụng đầy đủ', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Cải thiện các chiến dịch QR hiện có',
      paragraphs: ['Hầu hết các doanh nghiệp đều có mã QR nằm rải rác trong các hoạt động của họ - trên thực đơn, quầy tính tiền, bao bì và tài liệu quảng cáo. Nhiều mã trong số này đã được tạo từ nhiều năm trước bằng các trình tạo cơ bản, dẫn đến các ô vuông đen trắng chung chung không tạo được sự tự tin hoặc không phù hợp với bản sắc thương hiệu của bạn. Hướng dẫn toàn diện này hướng dẫn bạn cách tiếp cận có hệ thống để kiểm tra, nâng cấp và tối ưu hóa cơ sở hạ tầng QR hiện tại của bạn mà không làm gián đoạn hành trình của khách hàng mà bạn đã thiết lập.', 'Lợi thế chiến lược của việc nâng cấp thay vì thay thế mã QR của bạn nằm ở việc duy trì tính liên tục. Khách hàng của bạn đã biết cách mong đợi một số điểm đến nhất định khi họ quét mã của bạn. Bằng cách giữ các URL được mã hóa giống hệt nhau đồng thời cải thiện đáng kể cách trình bày trực quan, độ tin cậy khi quét và sự liên kết thương hiệu, bạn tạo ra một quá trình chuyển đổi liền mạch nhằm nâng cao độ tin cậy mà không yêu cầu bất kỳ thay đổi nào đối với cơ sở hạ tầng kỹ thuật số hoặc theo dõi phân tích của bạn.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Hình ảnh so sánh song song hiển thị mã QR chung, mờ bên cạnh phiên bản được gắn thương hiệu hiện đại mã hóa cùng một URL',
          caption: 'Trước và sau: URL đích giống nhau được chuyển đổi từ mã chung cũ kỹ thành nội dung có thương hiệu chuyên nghiệp',
        },
      ],
    },
    {
      heading: 'Tại sao mã QR cũ hoạt động kém',
      paragraphs: ['Mã QR được tạo trong giai đoạn đầu áp dụng - đặc biệt là trong giai đoạn 2020-2021 khi các doanh nghiệp gấp rút triển khai các giải pháp không tiếp xúc - thường gặp phải một số vấn đề nghiêm trọng. Cài đặt sửa lỗi thấp khiến chúng dễ vỡ khi được in trên các bề mặt có họa tiết hoặc được xem dưới ánh sáng khó khăn. Vùng yên tĩnh không đủ gây ra lỗi quét khi mã được đặt gần các thành phần hình ảnh khác. Kiểu dáng chung chung không truyền tải được tính hợp pháp của thương hiệu, dẫn đến sự do dự và giảm tỷ lệ quét.', 'Ngoài những hạn chế về mặt kỹ thuật, các mã kế thừa thường thể hiện những cơ hội xây dựng thương hiệu bị bỏ lỡ. Mỗi mã QR là một điểm tiếp xúc với khách hàng của bạn - khoảnh khắc mà họ tích cực tương tác và sẵn sàng hành động. Mã có kiểu dáng chuyên nghiệp phù hợp với màu sắc thương hiệu của bạn, bao gồm các giới hạn an toàn thích hợp và có các thành phần thương hiệu tùy chọn sẽ biến tiện ích này thành tài sản tiếp thị giúp củng cố danh tính của bạn trong mọi tương tác.'],
    },
    {
      heading: 'Tiến hành kiểm tra mã QR',
      paragraphs: ['Bắt đầu dự án nâng cấp của bạn bằng cách tạo bản kiểm kê toàn diện về mọi mã QR hiện được triển khai trên toàn doanh nghiệp của bạn. Ghi lại vị trí thực tế, đích được mã hóa, tình trạng hiện tại của tài liệu in và môi trường quét điển hình bao gồm điều kiện ánh sáng và góc nhìn. Kiểm tra từng mã với nhiều thiết bị - điện thoại thông minh cũ và thiết bị giá rẻ thường bộc lộ các vấn đề về độ tin cậy mà điện thoại cao cấp che giấu.', 'Đặc biệt chú ý đến mã ở những vị trí có mức độ rủi ro cao: điểm thanh toán, khu vực đăng ký và nơi trưng bày quảng cáo nơi lỗi quét ảnh hưởng trực tiếp đến doanh thu hoặc trải nghiệm của khách hàng. Những thứ này nên được ưu tiên nâng cấp ngay lập tức. Ngoài ra, hãy lưu ý các mã xuất hiện trong nội dung ảnh hoặc video vì những mã này sẽ yêu cầu phối hợp với nhóm tiếp thị của bạn để cập nhật nội dung hình ảnh.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Giao diện danh sách kiểm tra hiển thị các danh mục kiểm tra QR: vị trí, tình trạng, độ tin cậy quét và xếp hạng ưu tiên',
          caption: 'Mẫu kiểm tra QR có hệ thống để ghi lại và ưu tiên các ứng cử viên nâng cấp của bạn',
        },
      ],
    },
    {
      heading: 'Chiến lược nâng cấp an toàn',
      paragraphs: ['Nguyên tắc cơ bản của việc nâng cấp QR là bảo toàn điểm đến. Trích xuất URL chính xác từ mỗi mã hiện có và mã hóa nó giống hệt trong phiên bản mới của bạn. Điều này đảm bảo tất cả các phân tích hiện có, logic chuyển hướng và kỳ vọng của khách hàng vẫn được giữ nguyên. Nếu bạn cần tính linh hoạt của đích đến cho các bản cập nhật trong tương lai, đây là thời điểm lý tưởng để giới thiệu URL ngắn có thương hiệu hoặc dịch vụ chuyển hướng - nhưng hãy triển khai dự án này như một dự án riêng biệt để tránh những thay đổi gộp.', 'Để nâng cấp hình ảnh, hãy áp dụng các cải tiến theo lớp: trước tiên hãy đảm bảo độ tin cậy kỹ thuật (sửa lỗi phù hợp và vùng yên tĩnh), sau đó thêm kiểu dáng thương hiệu (màu sắc, hình dạng mô-đun) và cuối cùng xem xét các cải tiến tùy chọn (lớp phủ trung tâm, khung). Mỗi lớp phải được xác nhận thông qua thử nghiệm trước khi tiếp tục. Chế độ an toàn của ANQR giúp thực thi các ưu tiên này bằng cách cảnh báo khi các lựa chọn kiểu dáng có thể ảnh hưởng đến khả năng quét.'],
    },
    {
      heading: 'Thêm bản sắc thương hiệu mà không ảnh hưởng đến độ tin cậy',
      paragraphs: ['Nhãn hiệu QR hiệu quả sẽ cân bằng tác động trực quan với độ tin cậy của quá trình quét. Bắt đầu bằng màu sắc: thay thế nền trước màu đen mặc định bằng màu thương hiệu chính của bạn, đảm bảo có đủ độ tương phản với nền của bạn. Đối với hầu hết các thương hiệu, màu tối trên nền sáng sẽ mang lại hiệu quả tốt nhất. Tránh kết hợp độ tương phản thấp, độ chuyển màu làm giảm độ rõ nét của cạnh hoặc màu sắc xuất hiện tương tự trong điều kiện ánh sáng thông thường.', 'Tùy chỉnh hình dạng mô-đun mang lại cơ hội xây dựng thương hiệu khác với tác động về độ tin cậy tối thiểu. Các mô-đun được làm tròn tạo ra vẻ ngoài nhẹ nhàng hơn, dễ tiếp cận hơn trong khi vẫn duy trì khả năng quét tuyệt vời. Các mô-đun kiểu chấm hoạt động tốt cho các thương hiệu hiện đại, tiên tiến về công nghệ. Các mô-đun được kết nối phù hợp với bản sắc công nghiệp hoặc doanh nghiệp. Dù bạn chọn phong cách nào, hãy duy trì tính nhất quán trong tất cả các hoạt động triển khai QR của bạn để nhận diện thương hiệu ngay lập tức.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Biểu đồ bánh xe màu hiển thị các kết hợp màu QR tối ưu với các chỉ báo tỷ lệ tương phản',
          caption: 'Hướng dẫn chọn màu thương hiệu hiển thị các kết hợp có độ tương phản cao giúp duy trì độ tin cậy khi quét',
        },
      ],
    },
    {
      heading: 'Giao thức kiểm tra và xác nhận',
      paragraphs: ['Never deploy upgraded QR codes without rigorous testing. In bản thử nghiệm vật lý ở kích thước chính xác và trên cùng chất liệu với lần triển khai cuối cùng của bạn. Kiểm tra tại vị trí thực tế nơi mã sẽ tồn tại, vào các thời điểm khác nhau trong ngày để tính đến các biến thể về ánh sáng. Sử dụng ít nhất ba thiết bị khác nhau: điện thoại hàng đầu hiện tại, thiết bị tầm trung và điện thoại thông minh cũ hơn hoặc bình dân.', 'Ghi lại thời gian quét và tỷ lệ thành công cho mỗi lần kiểm tra. Mã được tối ưu hóa tốt sẽ quét trong vòng 1-2 giây trên bất kỳ thiết bị hiện đại nào. Nếu bạn thấy độ trễ hoặc lỗi liên tục, hãy giảm cường độ tạo kiểu - xóa hoặc thu nhỏ lớp phủ, tăng kích thước vùng yên tĩnh hoặc chuyển sang mức sửa lỗi cao hơn. Độ tin cậy luôn được ưu tiên hơn độ tinh tế về mặt thị giác.'],
    },
    {
      heading: 'Khóa cấu hình của bạn để đảm bảo tính nhất quán',
      paragraphs: ['Khi bạn đã xác thực cấu hình tối ưu, hãy duy trì cấu hình đó bằng các liên kết có thể chia sẻ của ANQR. Điều này tạo ra một bản ghi vĩnh viễn về mọi cài đặt được sử dụng để tạo mã được phê duyệt của bạn - màu sắc, kiểu mô-đun, sửa lỗi, định cỡ và bất kỳ lớp phủ nào. Chia sẻ liên kết này với nhóm thiết kế, nhà cung cấp dịch vụ in ấn của bạn và bất kỳ ai có thể cần sao chép mã trong tương lai.', 'Khóa cấu hình này ngăn chặn sự xuống cấp dần dần gây khó khăn cho nhiều hoạt động triển khai QR. Nếu không có nó, nhân viên sẽ tạo lại mã từ ảnh chụp màn hình, nhà thiết kế xây dựng lại cài đặt từ bộ nhớ và nhà cung cấp máy in sẽ thực hiện các điều chỉnh \'hữu ích\'. Mỗi biến thể giới thiệu các vấn đề tiềm ẩn. Với liên kết cấu hình bị khóa, mọi bản sao đều giống hệt với bản gốc đã được kiểm tra và phê duyệt của bạn.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Sơ đồ hiển thị sự thay đổi cấu hình: ảnh chụp màn hình dẫn đến nội dung tái tạo dẫn đến biến thể, so với một liên kết nguồn sự thật duy nhất',
          caption: 'Ngăn chặn sự thay đổi cấu hình bằng cách thiết lập một nguồn có thẩm quyền duy nhất cho tất cả các bản sao QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Xem ví dụ về QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Mã QR cho thanh toán bán lẻ',
      paragraphs: ['Mã QR thanh toán hoạt động trong môi trường đòi hỏi khắt khe nhất trong lĩnh vực bán lẻ: thời điểm giao dịch. Khách hàng sẵn sàng thanh toán, thường có một hàng dài phía sau họ và mỗi giây chậm trễ đều tạo ra xích mích. Tuy nhiên, thời điểm áp lực cao này cũng là thời điểm quan trọng để củng cố thương hiệu. Hướng dẫn này giải thích cách tạo mã QR thanh toán quét ngay lập tức trên các ứng dụng ngân hàng trong khi vẫn thể hiện vẻ chuyên nghiệp, có thương hiệu để tạo dựng lòng tin của khách hàng.', 'Nguyên tắc cơ bản cho mã QR thanh toán là độ tin cậy hơn là tính thẩm mỹ. Một mã được thiết kế đẹp mắt nhưng không thể quét được trên ứng dụng ngân hàng của một khách hàng sẽ khiến bạn tốn nhiều tiền hơn trong các giao dịch bị bỏ lỡ và làm khách hàng thất vọng so với một thiết kế thận trọng từng có thể. Bắt đầu bằng việc tuân thủ, tăng cường độ tin cậy, sau đó cẩn thận chỉ xếp lớp thương hiệu ở những nơi nó không ảnh hưởng đến chức năng chính.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Màn hình quầy bán lẻ hiển thị mã QR thanh toán đang được quét bằng điện thoại thông minh có ứng dụng ngân hàng',
          caption: 'Mã QR thanh toán phải hoạt động ngay lập tức với các ứng dụng ngân hàng và ví trong điều kiện truy cập thực tế',
        },
      ],
    },
    {
      heading: 'Hiểu các tiêu chuẩn QR thanh toán',
      paragraphs: ['Mã QR thanh toán thường tuân theo các tiêu chuẩn khu vực quy định định dạng tải trọng. Tại Singapore, PayNow QR sử dụng định dạng cụ thể. Ở Ấn Độ, mã UPI tuân theo tiêu chuẩn liên kết sâu BharatQR hoặc UPI. Thanh toán SEPA Châu Âu sử dụng mã QR EPC. Mỗi tiêu chuẩn tồn tại để đảm bảo các ứng dụng ngân hàng có thể nhận dạng và xử lý thông tin thanh toán ngay lập tức. Việc sai lệch so với các tiêu chuẩn này - dù chỉ một chút - có thể khiến các ứng dụng thanh toán từ chối các mã mà máy quét camera thông thường đọc được mà không gặp vấn đề gì.', 'ANQR bao gồm các mẫu dành cho các tiêu chuẩn thanh toán chính tự động định dạng thông tin chi tiết về người bán của bạn thành các tải trọng tuân thủ. Always use these templates rather than manually constructing payment strings, as even minor formatting errors can cause transaction failures. Nếu tiêu chuẩn thanh toán tại khu vực của bạn không có sẵn dưới dạng mẫu, hãy tham khảo tài liệu kỹ thuật của nhà cung cấp dịch vụ thanh toán của bạn để biết các yêu cầu định dạng chính xác.'],
    },
    {
      heading: 'Kích thước và vị trí cho màn hình quầy',
      paragraphs: ['Mã QR phản diện phải đối mặt với những thách thức vật lý độc đáo. Khách hàng có thể quét trong khoảng cách sải tay, thường ở một góc, đôi khi qua tấm chắn hắt hơi hoặc hộp trưng bày. Ánh sáng trên cao tạo ra các điểm chói. Mã cạnh tranh với các quầy khác để thu hút sự chú ý và tầm nhìn rõ ràng. Kích thước QR thanh toán của bạn một cách rộng rãi - khuyến nghị tối thiểu 4-5 cm cho hầu hết các ứng dụng tại quầy, tăng tỷ lệ nếu mã nằm sau kính hoặc trong khu vực thiếu sáng.', 'Vị trí quan trọng như kích thước. Đặt mã ở nơi khách hàng có thể thoải mái cầm điện thoại mà không phải xếp hàng hay lúng túng khi tiếp cận. Hướng màn hình về phía khách hàng thay vì đặt phẳng. Nếu có thể, hãy sử dụng vật liệu hiển thị cán mờ hoặc không phản chiếu để giảm thiểu độ chói từ ánh sáng trên cao. Kiểm tra vị trí cuối cùng vào các thời điểm khác nhau trong ngày để phát hiện các vấn đề về ánh sáng.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Sơ đồ hiển thị chiều cao và góc vị trí QR tối ưu cho các cấu hình bộ đếm khác nhau',
          caption: 'Hướng dẫn đặt quầy: chiều cao, góc và khoảng cách tối ưu để quét thanh toán đáng tin cậy',
        },
      ],
    },
    {
      heading: 'Xây dựng thương hiệu bảo thủ cho mã thanh toán',
      paragraphs: ['Các ứng dụng thanh toán ít dễ tha thứ hơn so với các máy quét camera thông thường. Nhiều ứng dụng ngân hàng sử dụng thuật toán đọc QR cũ hơn, đơn giản hơn được tối ưu hóa cho tốc độ thay vì tính linh hoạt. Điều này có nghĩa là kiểu dáng hoạt động hoàn hảo với camera điện thoại có thể không thành công với các ứng dụng thanh toán cụ thể. Giữ thương hiệu thận trọng: sử dụng màu thương hiệu của bạn làm nền trước nếu nó duy trì độ tương phản mạnh, nhưng tránh chuyển màu, lớp phủ nặng hoặc các yếu tố trang trí có thể cản trở khả năng nhận dạng.', 'Nếu bạn muốn có biểu tượng hoặc lớp phủ ở giữa, hãy giữ kích thước cực nhỏ - không quá 10-15% diện tích QR - và thử nghiệm rộng rãi với mọi ứng dụng thanh toán mà khách hàng của bạn có thể sử dụng. Nhiều doanh nghiệp chọn không có lớp phủ cụ thể trên mã thanh toán, dành kiểu dáng đó cho mã QR tiếp thị nơi các yêu cầu về độ tin cậy ít nghiêm ngặt hơn. Nhiệm vụ của mã thanh toán là xử lý giao dịch chứ không phải để gây ấn tượng trực quan.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'So sánh cho thấy mức độ thương hiệu có thể chấp nhận được và rủi ro đối với mã QR thanh toán',
          caption: 'Phổ thương hiệu QR thanh toán: từ phong cách bảo thủ an toàn đến các phương pháp trang trí đầy rủi ro',
        },
      ],
    },
    {
      heading: 'Cân nhắc về chất liệu và in ấn',
      paragraphs: ['Vật liệu hiển thị vật lý tác động đáng kể đến độ tin cậy của quá trình quét. Cán màng bóng phản chiếu ánh sáng trên cao trực tiếp vào camera của khách hàng. Vật liệu có kết cấu có thể làm biến dạng các cạnh của mô-đun. In ấn giá rẻ có thể làm mờ các chi tiết đẹp. Đối với mã QR thanh toán, hãy đầu tư vào chất lượng: sử dụng cán mờ hoặc satin, đảm bảo in có độ phân giải cao và thay thế màn hình trước khi chúng bị mòn. Mã thanh toán bị trầy xước hoặc bị mờ sẽ khiến bạn mất phí giao dịch.', 'Hãy xem xét độ bền và khả năng thay thế của màn hình. Màn hình quầy bị chạm, di chuyển, văng tung tóe và đôi khi bị đổ. Thiết kế hệ thống hiển thị của bạn sao cho có thể dễ dàng thay thế phần chèn QR mà không cần thay thế toàn bộ chân đế. Luôn sẵn sàng các bản in dự phòng, được tạo từ liên kết cấu hình bị khóa của bạn để các mã bị mòn có thể được hoán đổi ngay lập tức.'],
    },
    {
      heading: 'Thử nghiệm với các ứng dụng thanh toán thực',
      paragraphs: ['Máy quét camera thông thường sẽ giải mã hầu hết mọi mã QR được định dạng hợp lý. Ứng dụng thanh toán kén chọn hơn. Trước khi triển khai bất kỳ mã QR thanh toán nào, hãy thử nghiệm mã đó với mọi ứng dụng thanh toán mà khách hàng của bạn có thể sử dụng. Trong môi trường đa thanh toán, điều này có thể có nghĩa là thử nghiệm với nhiều ứng dụng ngân hàng, ví kỹ thuật số và nền tảng thanh toán. Ghi lại những ứng dụng bạn đã thử nghiệm và phiên bản của chúng - ứng dụng thanh toán cập nhật thường xuyên và bản cập nhật có thể thay đổi hành vi quét.', 'Kiểm tra trong điều kiện thực tế: màn hình thực tế, ánh sáng thực tế, khoảng cách quét thực tế. Một mã quét ngay lập tức trên bàn của bạn có thể gặp khó khăn trên quầy vào lúc 5 giờ chiều khi mặt trời buổi chiều tạo ra ánh sáng chói. Thử nghiệm với điện thoại thông minh cũ nhất, rẻ nhất mà bạn có thể tìm thấy - nếu nó hoạt động đáng tin cậy trên thiết bị giá rẻ thì nó sẽ hoạt động trên mọi thứ. Gắn cờ bất kỳ thời gian quét nào trên 2 giây để điều tra và thiết kế lại tiềm năng.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Danh sách kiểm tra thử nghiệm hiển thị các ứng dụng thanh toán, loại thiết bị và điều kiện môi trường khác nhau để xác minh',
          caption: 'Ma trận thử nghiệm QR thanh toán toàn diện bao gồm các ứng dụng, thiết bị và các yếu tố môi trường',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Xem ví dụ về QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Mã QR sẵn sàng in: SVG so với PNG',
      paragraphs: ['Sự khác biệt giữa mã QR quét hoàn hảo và mã quét không thành công thường nằm ở cách xuất và xử lý mã đó trong quy trình in. Hướng dẫn này giải thích những điểm khác biệt quan trọng giữa định dạng vectơ (SVG) và raster (PNG), thời điểm sử dụng từng định dạng cũng như cách chuyển giao tác phẩm nghệ thuật QR cho nhà thiết kế và nhà cung cấp dịch vụ in ấn theo cách duy trì độ tin cậy khi quét từ danh thiếp đến biển hiệu cỡ bảng quảng cáo.', 'Quá trình sản xuất bản in đưa ra các biến không tồn tại trên màn hình: độ lan mực, kết cấu nền, quy trình hoàn thiện và hiệu ứng tích lũy của nhiều lần chuyển đổi tệp. Mã QR trông hoàn hảo trong phần mềm thiết kế của bạn có thể xuất hiện từ máy in với các cạnh được làm mềm, độ tương phản giảm hoặc các mô-đun bị biến dạng một cách tinh vi. Việc hiểu rõ các phương pháp hay nhất về lựa chọn định dạng và quy trình làm việc sẽ ngăn chặn những lỗi thầm lặng này.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Chế độ xem phóng to so sánh các mô-đun QR vector với các cạnh sắc nét so với các mô-đun raster hiển thị các tạo phẩm pixel',
          caption: 'Vector so với raster ở quy mô in: sự khác biệt về độ chính xác quyết định độ tin cậy của quá trình quét',
        },
      ],
    },
    {
      heading: 'Tại sao Vector (SVG) được ưa thích để in',
      paragraphs: ['Tệp SVG mô tả mã QR dưới dạng hình dạng toán học thay vì lưới pixel. Điều này có nghĩa là mã có thể được điều chỉnh theo bất kỳ kích thước nào - từ nhãn 1 cm đến biểu ngữ dài 10 mét - mà không làm giảm độ sắc nét của cạnh. RIP (Bộ xử lý hình ảnh raster) của máy in hiển thị các vectơ ở độ phân giải gốc của thiết bị đầu ra, đảm bảo từng cạnh mô-đun sắc nét như phần cứng cho phép. Không có nội suy, không có tạo tác khử răng cưa, không có hiện tượng mờ tích lũy từ nhiều thao tác thay đổi kích thước.', 'Ngoài khả năng mở rộng, các tệp SVG còn mạnh mẽ hơn trong quy trình làm việc chuyên nghiệp. Chúng tồn tại qua các chuyến đi khứ hồi thông qua phần mềm thiết kế mà không bị xuống cấp. Chúng có thể được sửa màu mà không cần lấy mẫu lại. Chúng nhúng rõ ràng vào các tệp PDF để có đầu ra sẵn sàng cho báo chí. Đối với bất kỳ ứng dụng in nào có vấn đề về chất lượng, SVG phải là định dạng xuất mặc định của bạn.'],
    },
    {
      heading: 'Khi PNG được chấp nhận',
      paragraphs: ['PNG trở nên cần thiết khi quy trình làm việc hoặc nền tảng đích của bạn không hỗ trợ các định dạng vector. Một số nền tảng web, hệ thống CMS bảng hiệu và quy trình in cũ yêu cầu hình ảnh raster. Trong những trường hợp này, PNG có thể hoạt động tốt - nhưng chỉ khi bạn tuân theo các quy tắc nghiêm ngặt: xuất ở kích thước và độ phân giải vật lý cuối cùng, không bao giờ mở rộng quy mô sau khi xuất và tránh mọi hoạt động nén hoặc chuyển đổi định dạng bị mất dữ liệu.', 'Quy tắc quan trọng đối với PNG là tính toán kích thước pixel yêu cầu của bạn trước khi xuất. Nếu QR của bạn sẽ in ở kích thước 5cm và máy in của bạn hoạt động ở 300 dpi, bạn cần khoảng 590 pixel. Xuất ở kích thước này hoặc lớn hơn, sau đó giảm quy mô nếu cần - không bao giờ tăng. Hãy đưa thông tin này vào tên tệp hoặc siêu dữ liệu của bạn để người dùng trong tương lai không vô tình sử dụng sai mục đích xuất theo kích thước cụ thể.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Giao diện máy tính hiển thị mối quan hệ giữa kích thước vật lý, dpi và kích thước pixel bắt buộc',
          caption: 'Máy tính độ phân giải in: xác định kích thước pixel tối thiểu cho kích thước đầu ra mục tiêu của bạn',
        },
      ],
    },
    {
      heading: 'Giải thích về tùy chọn xuất ANQR',
      paragraphs: ['ANQR cung cấp một số chế độ xuất SVG để phù hợp với các quy trình công việc khác nhau. Chế độ True Vector tạo ra đầu ra dựa trên đường dẫn thuần túy lý tưởng cho các công cụ in ấn và thiết kế chuyên nghiệp. Khi bạn đã thêm lớp phủ raster hoặc một số hiệu ứng nhất định, ANQR có thể nhúng những lớp phủ này trong khi duy trì các mô-đun vectơ hoặc bạn có thể xuất phiên bản rastered đầy đủ ở độ phân giải đã chỉ định của mình. Việc hiểu các tùy chọn này sẽ giúp bạn chọn cách xuất phù hợp cho từng trường hợp sử dụng.', 'Để xuất PNG, ANQR cho phép bạn chỉ định kích thước chính xác và bao gồm các tùy chọn cho nền trong suốt. Cài đặt DPI giúp bạn tính toán kích thước thích hợp để in, tuy nhiên hãy nhớ rằng PPI là siêu dữ liệu - điều quan trọng đối với bản in là có đủ pixel cho kích thước vật lý của bạn. Khi nghi ngờ, hãy xuất lớn hơn mức bạn nghĩ mình cần; giảm quy mô sẽ duy trì chất lượng trong khi tăng quy mô sẽ phá hủy nó.'],
    },
    {
      heading: 'Chuẩn bị tập tin cho Handoff',
      paragraphs: ['Khi chuyển tác phẩm nghệ thuật QR cho nhà thiết kế hoặc nhà cung cấp dịch vụ in ấn, hãy bao gồm các thông số kỹ thuật rõ ràng: kích thước vật lý dự định, yêu cầu về vùng yên tĩnh tối thiểu và mọi cân nhắc về không gian màu. Đối với các ứng dụng quan trọng, hãy cung cấp cả bản sao SVG chính và bản sao lưu PNG có độ phân giải cao, được gắn nhãn rõ ràng với mục đích sử dụng. Bao gồm liên kết cấu hình ANQR của bạn để mã có thể được tạo lại nếu cần.', 'Dự đoán những lỗi thường gặp trong quá trình bàn giao. Nêu rõ rằng QR không được thu nhỏ, xoay, lệch hoặc áp dụng các hiệu ứng. Chỉ định rằng vùng yên tĩnh phải rõ ràng - không có dấu cắt, dấu đăng ký hoặc các yếu tố thiết kế xâm nhập. Nếu QR sẽ được đặt trên nền màu hoặc nền ảnh, hãy cung cấp phiên bản có hình nền mờ đục để đảm bảo độ tương phản đầy đủ.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Sơ đồ gói tệp hiển thị bản gốc SVG, bản sao lưu PNG, tài liệu thông số kỹ thuật và liên kết cấu hình',
          caption: 'Gói chuyển giao QR chuyên nghiệp: mọi thứ mà một nhà thiết kế hoặc nhà cung cấp dịch vụ in ấn cần để tái tạo chính xác',
        },
      ],
    },
    {
      heading: 'Xác minh bản in thử',
      paragraphs: ['Không bao giờ phê duyệt một lần in mà không quét bản in thử. Yêu cầu bản in thử trên bề mặt thực tế với lớp hoàn thiện thực tế sẽ được sử dụng trong sản xuất. Quét bản in thử trong điều kiện ánh sáng tương tự như nơi sản phẩm cuối cùng sẽ được hiển thị. Thử nghiệm với nhiều thiết bị, bao gồm cả điện thoại thông minh cũ có thể gặp khó khăn với chất lượng cận biên.', 'Nếu bằng chứng quét chậm hoặc không nhất quán, hãy điều tra trước khi phê duyệt. Các vấn đề thường gặp bao gồm độ tương phản không đủ trên nền màu, vi phạm vùng yên tĩnh do cắt xén, làm mềm các cạnh mô-đun lan truyền mực hoặc cán màng tạo ra ánh sáng chói. Bất kỳ vấn đề nào trong số này đều có thể được giải quyết trước khi bắt đầu in toàn bộ - nhưng chỉ khi bạn nắm bắt được chúng ở giai đoạn kiểm chứng.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Danh sách kiểm tra đánh giá bằng chứng có kết quả kiểm tra quét, đo độ tương phản và chữ ký phê duyệt',
          caption: 'Quy trình xác minh bằng chứng in: kiểm tra có hệ thống trước khi cam kết số lượng sản xuất',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Xem ví dụ về QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Tạo mã QR động',
      paragraphs: ['Mã QR hoạt hình kết hợp chức năng của mã QR tiêu chuẩn với chuyển động bắt mắt giúp tăng đáng kể tỷ lệ tương tác. Trong bảng hiệu kỹ thuật số, phương tiện truyền thông xã hội và màn hình tương tác, hoạt ảnh biến tiện ích tĩnh thành yếu tố hình ảnh hấp dẫn thu hút sự chú ý và mời gọi tương tác. Hướng dẫn này bao gồm các nguyên tắc, kỹ thuật và các ràng buộc thực tế trong việc tạo mã QR động để quét một cách đáng tin cậy đồng thời mang lại tác động trực quan.', 'Thách thức cơ bản của mã QR động là cân bằng giữa lợi ích trực quan và độ tin cậy của quá trình quét. Mỗi khung hình phải có thể quét được riêng lẻ - máy quét có thể chụp mã tại bất kỳ điểm nào trong chu kỳ hoạt ảnh. Ràng buộc này định hình mọi quyết định thiết kế: thành phần nào có thể di chuyển, mức độ chúng có thể thay đổi và thành phần nào phải duy trì ổn định trong suốt hoạt ảnh.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Màn hình bảng hiệu kỹ thuật số hiển thị mã QR động thu hút sự chú ý của người xem trong không gian công cộng',
          caption: 'Mã QR hoạt hình trong bảng hiệu kỹ thuật số: chuyển động thu hút sự chú ý và khuyến khích quét',
        },
      ],
    },
    {
      heading: 'Hoạt ảnh ảnh hưởng đến khả năng quét như thế nào',
      paragraphs: ['Máy quét QR hoạt động bằng cách chụp một khung hình duy nhất và phân tích mô hình của các mô-đun sáng và tối. Để mã động hoạt động, mọi khung hình phải chứa mẫu QR hoàn chỉnh, hợp lệ. Điều này loại trừ các hoạt ảnh làm thay đổi cấu trúc mã, hòa tan các mô-đun hoặc thay đổi đáng kể mẫu tương phản. Các mô-đun mang dữ liệu - mẫu dường như ngẫu nhiên ở trung tâm - phải luôn ổn định về mặt trực quan xuyên suốt.', 'Các phương pháp hoạt ảnh an toàn sửa đổi các phần tử không mang dữ liệu: nền, màu sắc, khung trang trí và các phần tử lớp phủ. Các thành phần cấu trúc - các mẫu tìm kiếm (các ô vuông góc lớn), các mẫu thời gian (các đường xen kẽ) và các mẫu căn chỉnh (các ô vuông nhỏ hơn trong các mã lớn hơn) - phải duy trì vị trí và tỷ lệ của chúng. Làm việc trong những hạn chế này vẫn cho phép tạo ra các hoạt ảnh động và hấp dẫn một cách đáng ngạc nhiên.'],
    },
    {
      heading: 'Kỹ thuật hoạt hình có tác dụng',
      paragraphs: ['Chu trình màu sẽ tạo hoạt ảnh cho màu nền trước và màu nền thông qua bảng màu trong khi vẫn duy trì đủ độ tương phản ở mỗi bước. Điều này tạo ra hiệu ứng sống động, thu hút sự chú ý với rủi ro quét tối thiểu - miễn là độ tương phản không bao giờ giảm xuống dưới mức có thể đọc được. Các cài đặt trước chu kỳ màu của ANQR được thiết kế để duy trì khả năng quét trong suốt chu kỳ.', 'Lớp phủ hoạt hình đặt hình ảnh chuyển động phía sau mẫu QR bán trong suốt. Mã vẫn ổn định trong khi nền hoạt hình - có thể là video lặp lại, các thành phần thương hiệu hoạt hình hoặc đồ họa chuyển động trừu tượng. Kỹ thuật này yêu cầu quản lý cường độ cẩn thận để ngăn nền lấn át mẫu QR nhưng tạo ra kết quả ấn tượng nhất về mặt thị giác.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Sơ đồ hiển thị cấu trúc phân lớp của QR động: lớp mã ổn định trên lớp nền động',
          caption: 'Nguyên tắc phân lớp hoạt ảnh: mẫu QR không đổi trong khi các phần tử nền hoạt hình bên dưới',
        },
      ],
    },
    {
      heading: 'Định cấu hình tham số hoạt ảnh',
      paragraphs: ['Tốc độ khung hình ảnh hưởng đến cả độ mượt của hình ảnh và kích thước tệp. Đối với hầu hết các ứng dụng, 10-15 khung hình mỗi giây mang lại chuyển động mượt mà mà không có kích thước tệp quá lớn. Tốc độ khung hình cao hơn mang lại hiệu quả hình ảnh giảm dần trong khi kích thước tệp tăng đáng kể. Hãy xem xét bối cảnh phân phối của bạn - bảng hiệu kỹ thuật số lớn có thể xử lý các tệp lớn hơn vị trí đặt quảng cáo trên thiết bị di động.', 'Hành vi vòng lặp xác định cách hoạt ảnh quay vòng. Các vòng lặp liền mạch tạo ra chuyển động liên tục lý tưởng cho biển báo và màn hình xung quanh. Vòng lặp bóng bàn (tiến rồi lùi) hoạt động tốt cho các hoạt ảnh đơn giản. Để có nhịp điệu thu hút sự chú ý, hãy xem xét các hoạt ảnh có chế độ giữ - các khoảng thời gian tĩnh được ngắt quãng bằng chuyển động thu hút mắt mà không gây mỏi mắt khi chuyển động liên tục.'],
    },
    {
      heading: 'Tạo lớp phủ hoạt hình',
      paragraphs: ['Khi sử dụng hình ảnh động (GIF, WebP động hoặc video) làm lớp phủ, ANQR sẽ trích xuất các khung và kết hợp chúng bằng mã QR của bạn. Cài đặt cường độ lớp phủ kiểm soát lượng hoạt ảnh hiển thị - giá trị thấp hơn ưu tiên khả năng quét trong khi giá trị cao hơn ưu tiên tác động trực quan. Kiểm tra cường độ bạn đã chọn trên nhiều khung hình để đảm bảo khả năng quét nhất quán.', 'Chất lượng nguyên liệu nguồn tác động đáng kể đến kết quả. Sử dụng lớp phủ có chủ thể rõ ràng và độ tương phản tốt. Tránh các hoạt ảnh nguồn có nhấp nháy nhanh hoặc thay đổi độ sáng quá mức có thể thỉnh thoảng tạo ra các khung hình có độ tương phản thấp. Xem trước toàn bộ chu trình hoạt ảnh trước khi xuất để nắm bắt mọi khung hình có vấn đề có thể không quét được.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Chế độ xem từng khung hình của lớp phủ hoạt hình hiển thị mức độ tương phản được duy trì trong toàn bộ chuỗi',
          caption: 'Phân tích khung hình: xác minh khả năng quét nhất quán trong toàn bộ chu trình hoạt ảnh',
        },
      ],
    },
    {
      heading: 'Những cân nhắc về xuất khẩu và giao hàng',
      paragraphs: ['GIF vẫn là định dạng hoạt hình được hỗ trợ rộng rãi nhất, tự động phát trong hầu hết các ngữ cảnh mà không cần hỗ trợ trình phát video. Tuy nhiên, bảng màu 256 màu của GIF hạn chế độ trung thực của màu sắc. Đối với các hoạt ảnh quan trọng về màu sắc, hãy xem xét WebP hoạt hình nếu được hỗ trợ hoặc quay lại các định dạng video để có chất lượng cao nhất. Tính năng xuất GIF của ANQR bao gồm các tùy chọn phối màu để tối đa hóa chất lượng trong giới hạn bảng màu.', 'Kích thước tập tin quan trọng đối với việc phân phối. Hệ thống bảng hiệu kỹ thuật số, ứng dụng email và nền tảng xã hội thường áp đặt giới hạn kích thước. Nếu hoạt ảnh của bạn vượt quá các giới hạn này, hãy giảm số lượng khung hình, kích thước hoặc độ sâu màu. Đôi khi việc chia một hoạt ảnh phức tạp thành một vòng lặp ngắn hơn sẽ đạt được kết quả tốt hơn so với việc nén mạnh làm giảm chất lượng mọi khung hình.'],
    },
    {
      heading: 'Kiểm tra mã QR hoạt hình',
      paragraphs: ['Kiểm tra mã hoạt ảnh yêu cầu quét tại nhiều điểm trong chu kỳ hoạt ảnh. Đừng chỉ quét một lần và coi như thành công - hãy quét nhiều lần, vào các thời điểm khác nhau, để xác minh rằng mọi khung hình đều có thể đọc được. Đặc biệt chú ý đến các khung hình ở mức cực đại của chu kỳ màu hoặc cường độ lớp phủ đạt đỉnh nơi độ tương phản có thể thấp nhất.', 'Kiểm tra phần cứng màn hình thực tế nếu có thể. Hiệu chỉnh màu sắc màn hình, góc nhìn và ánh sáng xung quanh đều ảnh hưởng đến cách hoạt ảnh xuất hiện và quét. Hình ảnh động sáng quét hoàn hảo trên màn hình của bạn có thể bị mờ trên màn hình ngoài trời hoặc không thể đọc được ở các góc nhìn xiên.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Ma trận thử nghiệm hiển thị tỷ lệ quét thành công trên các khung, thiết bị và điều kiện hiển thị khác nhau',
          caption: 'Giao thức kiểm tra QR hoạt hình: xác minh có hệ thống trên các khung, thiết bị và điều kiện xem',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Xem ví dụ về QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Các phương pháp hay nhất về an toàn và tuân thủ QR',
      paragraphs: ['Một mã QR được thiết kế đẹp mắt mà không quét được còn tệ hơn là vô dụng - nó làm khách hàng thất vọng, gây tổn hại đến nhận thức về thương hiệu và lãng phí mọi nguồn lực đầu tư vào việc tạo và phân phối. Hướng dẫn này bao gồm các yếu tố kỹ thuật và thực tế nhằm xác định xem mã QR có quét đáng tin cậy hay không cũng như cách sử dụng các tính năng an toàn của ANQR để phát hiện các sự cố tiềm ẩn trước khi chúng được đưa vào sản xuất.', 'QR code reliability isn\'t binary. A code might scan perfectly on flagship phones but fail on budget devices. Nó có thể hoạt động trong điều kiện ánh sáng lý tưởng nhưng lại gặp khó khăn trong những nhà hàng thiếu ánh sáng hoặc ánh nắng chói chang. Hiểu được các yếu tố ảnh hưởng đến khả năng quét giúp bạn thực hiện sự cân bằng sáng suốt giữa kiểu dáng trực quan và độ tin cậy trong thế giới thực.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Phổ độ tin cậy hiển thị các mã QR từ có thể quét được nhiều đến có thể đọc được một chút',
          caption: 'Phổ khả năng quét: từ mã chống đạn đến kiểu dáng đẩy giới hạn độ tin cậy',
        },
      ],
    },
    {
      heading: 'Hiểu mức độ sửa lỗi',
      paragraphs: ['Mã QR bao gồm tính năng dự phòng tích hợp cho phép đọc chúng ngay cả khi bị hỏng hoặc bị che khuất một phần. Mức sửa lỗi - L (7%), M (15%), Q (25%) hoặc H (30%) - xác định số lượng mã có thể bị thiếu trong khi vẫn giải mã chính xác. Khả năng sửa lỗi cao hơn sẽ tạo ra mã lớn hơn nhưng mang lại giới hạn an toàn cho lớp phủ, lỗi in và thiệt hại về môi trường.', 'Đối với các mã có lớp phủ hình ảnh, mức sửa lỗi H là cần thiết - lớp phủ che khuất một phần mã và bạn cần mức dự phòng 30% đó để duy trì độ tin cậy. Đối với mã sạch, không bị định kiểu trong môi trường được kiểm soát, mức M thường là đủ. Cấp L nên được dành riêng cho các tình huống trong đó kích thước mã bị hạn chế nghiêm trọng và bạn có thể đảm bảo các điều kiện nguyên sơ.'],
    },
    {
      heading: 'Khu vực yên tĩnh quan trọng',
      paragraphs: ['Vùng yên tĩnh là khoảng trống bao quanh mỗi mã QR. Máy quét sử dụng ranh giới này để xác định nơi mã bắt đầu và kết thúc. Tiêu chuẩn ISO chỉ định vùng yên tĩnh tối thiểu gồm bốn mô-đun (gấp bốn lần chiều rộng của hình vuông nhỏ nhất trong mã). Vi phạm không gian này - với các thành phần thiết kế, viền cắt hoặc nội dung liền kề - là một trong những nguyên nhân phổ biến nhất gây ra lỗi quét.', 'Việc thực thi vùng yên tĩnh của ANQR giúp duy trì khoảng cách quan trọng này, nhưng bạn cũng phải đảm bảo nó được duy trì trong thiết kế cuối cùng của mình. Khi bàn giao tác phẩm nghệ thuật QR, hãy chỉ định rõ ràng các yêu cầu về vùng yên tĩnh. Khi đặt mã vào bố cục, hãy xác minh rằng không có phần tử nào xâm nhập vào không gian này. Một vài mm không gian trống có thể tạo ra sự khác biệt giữa khả năng quét đáng tin cậy và sự thất vọng của khách hàng.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Sơ đồ hiển thị khoảng cách vùng yên tĩnh chính xác so với các vi phạm phổ biến gây ra lỗi quét',
          caption: 'Yêu cầu về vùng yên tĩnh: ranh giới vô hình quyết định thành công của quá trình quét',
        },
      ],
    },
    {
      heading: 'Độ tương phản và an toàn màu sắc',
      paragraphs: ['Máy quét QR phát hiện mô hình của các mô-đun sáng và tối. Bất kỳ kiểu dáng nào làm giảm độ tương phản này - nền trước sáng, nền tối, hiệu ứng chuyển màu hoặc lớp phủ có độ mờ thấp - đều làm cho mã khó đọc hơn. ANQR tính toán tỷ lệ tương phản và cảnh báo khi lựa chọn màu sắc của bạn đạt đến mức nguy hiểm, nhưng trọng tài cuối cùng luôn là thử nghiệm trong thế giới thực.', 'Nhận thức màu sắc thay đổi theo điều kiện ánh sáng. Sự kết hợp màu sắc có độ tương phản cao trên màn hình của bạn có thể trở nên khó phân biệt dưới ánh sáng sợi đốt ấm áp hoặc đèn huỳnh quang mát mẻ. Nếu mã của bạn sẽ được triển khai trong các điều kiện ánh sáng khác nhau, hãy kiểm tra dưới nhiều nguồn sáng và xem xét tỷ lệ tương phản thận trọng hơn làm giới hạn an toàn.'],
    },
    {
      heading: 'Kích thước mô-đun và khoảng cách xem',
      paragraphs: ['Kích thước vật lý của từng mô-đun riêng lẻ xác định khoảng cách tối đa mà mã có thể được quét. Các mô-đun nhỏ hơn có nghĩa là mã nhỏ hơn nhưng yêu cầu khoảng cách quét gần hơn. Nguyên tắc chung là mỗi mô-đun phải có khoảng cách quét ít nhất là 0,5mm ở khoảng cách quét dự định, tăng tỷ lệ tương ứng cho khoảng cách lớn hơn. Mã trên bảng quảng cáo cần mô-đun lớn hơn nhiều so với mã trên danh thiếp.', 'Khi tính toán kích thước mô-đun, hãy xem xét trường hợp xấu nhất: khách hàng sử dụng điện thoại cũ, trong điều kiện ánh sáng không hoàn hảo, quét ở khoảng cách tối đa có thể xảy ra. Thiết kế cho người dùng này và những người khác sẽ có trải nghiệm tốt hơn nữa. Các đề xuất về kích thước của ANQR tính đến các biến số trong thế giới thực này để đề xuất các kích thước phù hợp cho mục đích sử dụng của bạn.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Biểu đồ liên quan đến kích thước mô-đun, kích thước in và khoảng cách quét hiệu quả tối đa',
          caption: 'Hướng dẫn khoảng cách quét: kích thước mô-đun phù hợp với yêu cầu triển khai của bạn',
        },
      ],
    },
    {
      heading: 'Sử dụng Chế độ An toàn ANQR',
      paragraphs: ['Chế độ an toàn của ANQR cung cấp phản hồi theo thời gian thực về độ tin cậy của quá trình quét. Nó giám sát tỷ lệ tương phản, tuân thủ vùng yên tĩnh, cường độ lớp phủ và các yếu tố khác ảnh hưởng đến khả năng quét. Khi bất kỳ thông số nào đạt đến mức rủi ro, bạn sẽ thấy cảnh báo kèm theo hướng dẫn cụ thể về cách cải thiện độ tin cậy. Đối với các hoạt động triển khai chuyên nghiệp mà thất bại gây tốn kém, hãy duy trì Chế độ an toàn ở trạng thái hoạt động trong suốt quá trình thiết kế.', 'Chế độ an toàn cũng bao gồm tính năng xác minh quét nhằm cố gắng giải mã mã được tạo của bạn và báo cáo thành công hay thất bại. Mặc dù việc xác minh trong ứng dụng này không thể sao chép mọi điều kiện thực tế nhưng nó phát hiện được nhiều vấn đề thường gặp trước khi bạn đầu tư vào in ấn hoặc phân phối. Hãy coi việc xác minh thành công là điều kiện tối thiểu chứ không phải là sự đảm bảo - thử nghiệm trong thế giới thực vẫn là điều cần thiết.'],
    },
    {
      heading: 'Giao thức thử nghiệm trong thế giới thực',
      paragraphs: ['Không có mức độ xác minh phần mềm nào có thể thay thế được thử nghiệm vật lý. In mã của bạn ở kích thước mong muốn trên tài liệu đại diện. Kiểm tra nó trong môi trường triển khai thực tế với điều kiện ánh sáng phù hợp với mục đích sử dụng thực tế. Quét bằng nhiều thiết bị - không chỉ điện thoại hàng đầu của bạn mà cả các thiết bị Android giá rẻ, iPhone cũ hơn và bất kỳ thiết bị cụ thể nào mà đối tượng của bạn thường sử dụng.', 'Ghi lại thử nghiệm của bạn một cách có hệ thống. Ghi lại thiết bị nào đã được thử nghiệm, trong điều kiện nào, cho kết quả như thế nào. Nếu bạn đang triển khai mã trên quy mô lớn, hãy thiết lập tiêu chí chấp nhận: tỷ lệ thành công có thể là 95% trên nhóm thử nghiệm thiết bị của bạn hoặc quét thành công trong vòng 2 giây trên tất cả các thiết bị được thử nghiệm. Những tiêu chuẩn này giúp đưa ra quyết định đi/không đi một cách khách quan hơn là hy vọng điều tốt nhất.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Danh sách kiểm tra thử nghiệm toàn diện bao gồm các thiết bị, điều kiện và tiêu chí chấp nhận',
          caption: 'Giao thức thử nghiệm triển khai QR: xác minh có hệ thống trước khi cam kết sản xuất',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Mở máy phát điện',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Xem ví dụ về QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Xem ví dụ về QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Mở Hướng dẫn sử dụng đầy đủ', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Mở thư viện', type: 'gallery' },
  ],
};
