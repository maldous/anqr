import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Điều khoản dịch vụ',
  description: 'Bằng cách truy cập hoặc sử dụng trang web, bạn đồng ý bị ràng buộc bởi các điều khoản này.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Chính sách bảo mật', type: 'external' }],
  sections: [
    {
      heading: 'Chấp nhận các điều khoản',
      paragraphs: ['Bằng cách truy cập hoặc sử dụng ANQR (anqr.link), bạn đồng ý bị ràng buộc bởi các Điều khoản dịch vụ này và Chính sách quyền riêng tư của chúng tôi. Nếu bạn không đồng ý với các điều khoản này, không sử dụng trang web.', 'Thỉnh thoảng chúng tôi có thể cập nhật các Điều khoản này. Việc tiếp tục sử dụng trang web sau khi thay đổi đồng nghĩa với việc chấp nhận các điều khoản mới.'],
    },
    {
      heading: 'Đủ điều kiện',
      paragraphs: ['Bạn phải ít nhất 13 tuổi để sử dụng ANQR. Bằng cách sử dụng trang web, bạn tuyên bố rằng bạn đáp ứng yêu cầu về độ tuổi này. Nếu bạn dưới 18 tuổi, bạn tuyên bố rằng bạn có sự cho phép của cha mẹ hoặc người giám hộ để sử dụng trang web.'],
    },
    {
      heading: 'Được phép sử dụng',
      paragraphs: ['Bạn chỉ có thể sử dụng ANQR cho các mục đích hợp pháp. Bạn hoàn toàn chịu trách nhiệm về nội dung bạn mã hóa thành mã QR và cách bạn sử dụng bất kỳ mã QR nào bạn tạo.'],
    },
    {
      heading: 'Hành vi bị cấm',
      paragraphs: ['Bạn đồng ý không:'],
      bullets: ['Sử dụng ANQR để tạo mã QR hỗ trợ lừa đảo, phân phối phần mềm độc hại, lừa đảo, lừa đảo, quấy rối, phỉ báng hoặc bất kỳ hoạt động bất hợp pháp nào.', 'Mã hóa nội dung vi phạm quyền sở hữu trí tuệ, vi phạm quyền riêng tư hoặc chứa tài liệu bất hợp pháp.', 'Cố gắng làm gián đoạn, làm quá tải hoặc can thiệp vào hoạt động hoặc bảo mật của trang web.', 'Kỹ thuật đảo ngược, dịch ngược hoặc cố gắng trích xuất mã nguồn từ trang web.', 'Sử dụng các công cụ tự động (bot, máy quét) để truy cập trang web theo cách làm giảm hiệu suất của những người dùng khác.', 'Phá vỡ hoặc vô hiệu hóa bất kỳ tính năng bảo mật hoặc kiểm soát truy cập nào.', 'Mạo danh bất kỳ cá nhân hoặc tổ chức nào hoặc xuyên tạc mối liên kết của bạn.'],
    },
    {
      heading: 'Sở hữu trí tuệ',
      paragraphs: ['Bạn giữ quyền sở hữu nội dung bạn mã hóa thành mã QR. ANQR không yêu cầu quyền sở hữu dữ liệu của bạn.', 'Tên ANQR, logo, thiết kế giao diện và mã cơ bản được bảo vệ bởi bản quyền, nhãn hiệu và các luật sở hữu trí tuệ khác. Bạn không được sao chép, sửa đổi, phân phối hoặc tạo tác phẩm phái sinh mà không có sự cho phép của chúng tôi.', 'QR Code® là nhãn hiệu đã đăng ký của DENSO WAVE INCORPORATED. ANQR không liên kết với DENSO WAVE.'],
    },
    {
      heading: 'Giấy phép nội dung người dùng',
      paragraphs: ['Bằng cách sử dụng ANQR, bạn không cấp cho chúng tôi quyền đối với nội dung của bạn. Khi sử dụng tính năng tạo cục bộ (mặc định), tất cả việc tạo mã QR sẽ diễn ra trong trình duyệt của bạn và chúng tôi không truy cập, lưu trữ hoặc truyền dữ liệu được mã hóa của bạn.', 'Khi sử dụng API phía máy chủ, nội dung của bạn được xử lý để tạo hình ảnh QR nhưng không được lưu trữ, ghi lại hoặc sử dụng cho bất kỳ mục đích nào khác ngoài việc hiển thị hình ảnh được yêu cầu.'],
    },
    {
      heading: 'Dịch vụ và quảng cáo của bên thứ ba',
      paragraphs: ['Trang web hiển thị quảng cáo thông qua Google AdSense và có thể bao gồm các liên kết đến các trang web của bên thứ ba. Chúng tôi không chịu trách nhiệm về nội dung, dịch vụ hoặc biện pháp bảo mật của bên thứ ba.', 'Sự tương tác của bạn với nhà quảng cáo và bên thứ ba chỉ là giữa bạn và họ. Xem Chính sách quyền riêng tư của chúng tôi để biết thông tin về cách thực hành dữ liệu quảng cáo.'],
    },
    {
      heading: 'Từ chối trách nhiệm bảo đảm',
      paragraphs: ['ANQR ĐƯỢC CUNG CẤP TRÊN CƠ SỞ "NGUYÊN TRẠNG" VÀ "SẴN CÓ" MÀ KHÔNG CÓ BẤT CỨ HÌNH THỨC BẢO ĐẢM NÀO, RÕ RÀNG HAY NGỤ Ý, BAO GỒM NHƯNG KHÔNG GIỚI HẠN ĐẢM BẢO NGỤ Ý VỀ KHẢ NĂNG BÁN, SỰ PHÙ HỢP CHO MỘT MỤC ĐÍCH CỤ THỂ VÀ KHÔNG VI PHẠM.', 'Chúng tôi không đảm bảo rằng: (a) trang web sẽ không bị gián đoạn, an toàn hoặc không có lỗi; (b) Mã QR sẽ quét trong mọi môi trường, trên mọi thiết bị hoặc với mọi ứng dụng quét; (c) trang web sẽ đáp ứng yêu cầu của bạn.', 'Bạn phải luôn kiểm tra mã QR trong điều kiện chúng sẽ được sử dụng (kích thước in, ánh sáng, loại màn hình, khoảng cách, chất lượng camera).'],
    },
    {
      heading: 'Giới hạn trách nhiệm pháp lý',
      paragraphs: ['TRONG PHẠM VI TỐI ĐA ĐƯỢC LUẬT PHÁP CHO PHÉP, ANQR VÀ CÁC NHÀ ĐIỀU HÀNH, LIÊN KẾT VÀ CẤP PHÉP SẼ KHÔNG CHỊU TRÁCH NHIỆM ĐỐI VỚI BẤT KỲ THIỆT HẠI TRỰC TIẾP, GIÁN TIẾP, NGẪU NHIÊN, ĐẶC BIỆT, HẬU QUẢ, HÌNH PHẠT HOẶC THIỆT HẠI MẪU HÌNH, BAO GỒM NHƯNG KHÔNG GIỚI HẠN THIỆT HẠI VỀ MẤT LỢI NHUẬN, DOANH THU, DỮ LIỆU, TÍN DỤNG, SỬ DỤNG HOẶC CÁC MẤT MẤT VÔ HÌNH KHÁC PHÁT SINH TỪ HOẶC LIÊN QUAN ĐẾN VIỆC TRUY CẬP HOẶC SỬ DỤNG (HOẶC KHÔNG THỂ TRUY CẬP HOẶC SỬ DỤNG) DỊCH VỤ.', 'BẠN HIỂU RÕ RÀNG VÀ ĐỒNG Ý RẰNG BẠN RỦI RO KHI SỬ DỤNG DỊCH VỤ. DỊCH VỤ ĐƯỢC CUNG CẤP MIỄN PHÍ VÀ THEO ĐÓ, BẠN ĐỒNG Ý RẰNG ANQR VÀ NHÀ ĐIỀU HÀNH CỦA NÓ SẼ KHÔNG CHỊU TRÁCH NHIỆM ĐỐI VỚI BẠN VỀ BẤT KỲ THIỆT HẠI HOẶC MẤT MÁT NÀO. TRONG MỌI TRƯỜNG HỢP TỔNG TRÁCH NHIỆM PHÁP LÝ TỔNG HỢP CỦA CHÚNG TÔI SẼ VƯỢT QUÁ 0 ĐÔ LA ($0 AUD).', 'BẠN ĐỒNG Ý GIẢI QUYẾT, TỪ BỎ VÀ XÓA BẤT KỲ VÀ TẤT CẢ CÁC KHIẾU NẠI, YÊU CẦU VÀ NGUYÊN NHÂN CỦA HÀNH ĐỘNG CHỐNG LẠI ANQR VÀ CÁC NHÀ ĐIỀU HÀNH CỦA ANQR PHÁT SINH TỪ VIỆC BẠN SỬ DỤNG DỊCH VỤ.', 'MỘT SỐ QUYỀN QUYỀN KHÔNG CHO PHÉP LOẠI TRỪ MỘT SỐ BẢO ĐẢM HOẶC GIỚI HẠN TRÁCH NHIỆM PHÁP LÝ. TRONG CÁC KHU VỰC QUYỀN LỰC ĐÓ, TRÁCH NHIỆM PHÁP LÝ CỦA CHÚNG TÔI SẼ ĐƯỢC GIỚI HẠN TRONG PHẠM VI TỐI ĐA ĐƯỢC LUẬT HIỆN HÀNH CHO PHÉP.'],
    },
    {
      heading: 'Bồi thường',
      paragraphs: ['Bạn đồng ý bồi thường, bảo vệ và giữ ANQR, các nhà điều hành, chi nhánh và cán bộ, giám đốc, nhân viên và đại lý tương ứng của họ khỏi mọi khiếu nại, thiệt hại, tổn thất, trách nhiệm pháp lý, chi phí và phí tổn (bao gồm cả phí pháp lý) phát sinh từ: (a) việc bạn sử dụng trang web; (b) bạn vi phạm các Điều khoản này; (c) bạn vi phạm bất kỳ quyền nào của bên thứ ba; (d) bất kỳ nội dung nào bạn mã hóa thành mã QR.'],
    },
    {
      heading: 'Giải quyết tranh chấp',
      paragraphs: ['Mọi tranh chấp phát sinh từ các Điều khoản này hoặc việc bạn sử dụng ANQR trước tiên sẽ được cố gắng giải quyết thông qua thương lượng không chính thức bằng cách liên hệ với email@anqr.link.', 'Nếu giải pháp không chính thức không thành công, tranh chấp sẽ được giải quyết thông qua trọng tài có tính ràng buộc ở Victoria, Úc, ngoại trừ việc một trong hai bên có thể yêu cầu biện pháp khẩn cấp tại tòa án đối với các vi phạm sở hữu trí tuệ.'],
    },
    {
      heading: 'Miễn trừ hành động tập thể',
      paragraphs: ['TRONG PHẠM VI PHÁP LUẬT CHO PHÉP, BẠN ĐỒNG Ý RẰNG MỌI THỦ TỤC GIẢI QUYẾT TRANH CHẤP SẼ CHỈ ĐƯỢC TIẾN HÀNH TRÊN CƠ SỞ CÁ NHÂN VÀ KHÔNG PHẢI THEO CÁCH HÀNH ĐỘNG TẬP THỂ, HỢP NHẤT HOẶC ĐẠI DIỆN.'],
    },
    {
      heading: 'Luật điều chỉnh',
      paragraphs: ['Các Điều khoản này được điều chỉnh bởi luật pháp của Victoria, Úc, bất kể xung đột với các nguyên tắc luật pháp. Bạn đồng ý với quyền tài phán độc quyền của các tòa án ở Victoria, Úc.'],
    },
    {
      heading: 'Những thay đổi và tính khả dụng',
      paragraphs: ['Chúng tôi có thể sửa đổi, đình chỉ hoặc ngừng trang web (hoặc bất kỳ phần nào của trang web) bất cứ lúc nào mà không cần thông báo hoặc chịu trách nhiệm pháp lý.', 'Chúng tôi có thể cập nhật các Điều khoản này bất cứ lúc nào. Ngày "Cập nhật lần cuối" cho biết thời điểm chúng được sửa đổi gần đây nhất. Việc tiếp tục sử dụng sau khi thay đổi có nghĩa là chấp nhận.'],
    },
    {
      heading: 'Tính tách rời',
      paragraphs: ['Nếu bất kỳ điều khoản nào trong các Điều khoản này bị coi là không hợp lệ hoặc không thể thi hành thì điều khoản đó sẽ được thực thi ở mức tối đa cho phép và các điều khoản còn lại sẽ vẫn có đầy đủ hiệu lực.'],
    },
    {
      heading: 'Miễn trừ',
      paragraphs: ['Việc chúng tôi không thực thi bất kỳ quyền hoặc điều khoản nào trong các Điều khoản này sẽ không được coi là từ bỏ quyền hoặc điều khoản đó.'],
    },
    {
      heading: 'Toàn bộ thỏa thuận',
      paragraphs: ['Các Điều khoản này, cùng với Chính sách quyền riêng tư của chúng tôi, cấu thành toàn bộ thỏa thuận giữa bạn và ANQR về việc bạn sử dụng trang web và thay thế mọi thỏa thuận trước đó.'],
    },
    {
      heading: 'bất khả kháng',
      paragraphs: ['Chúng tôi sẽ không chịu trách nhiệm về bất kỳ sai sót hoặc chậm trễ trong hoạt động do các tình huống nằm ngoài tầm kiểm soát hợp lý của chúng tôi, bao gồm thiên tai, chiến tranh, khủng bố, bạo loạn, hành động của chính phủ hoặc lỗi Internet/cơ sở hạ tầng.'],
    },
    {
      heading: 'Liên hệ',
      paragraphs: ['Bạn có thể gửi câu hỏi về các Điều khoản này tới: email@anqr.link'],
    },
  ],
};

export default terms;
