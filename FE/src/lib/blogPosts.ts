import { HERO_IMAGES } from "@/components/site/tokens";

export type Block = { type: "h2" | "p" | "quote"; text: string } | { type: "list"; items: string[] };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  /** Ngày đăng, yyyy-MM-dd. */
  date: string;
  image: string;
  blocks: Block[];
  /** Cuối bài hiện thêm các di sản thế giới lấy từ dữ liệu hệ thống. */
  showHeritage?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "mua-nao-di-dau",
    title: "Mùa nào đi đâu? Lịch du lịch Việt Nam quanh năm",
    excerpt: "Việt Nam trải dài trên nhiều vùng khí hậu, mỗi thời điểm trong năm đều có một nơi đẹp nhất để đến. Đây là gợi ý để bạn chọn đúng điểm đến, đúng mùa.",
    category: "Cẩm nang",
    readMinutes: 6,
    date: "2026-09-20",
    image: HERO_IMAGES.dalat,
    blocks: [
      { type: "p", text: "Một chuyến đi trọn vẹn bắt đầu từ việc chọn đúng thời điểm. Thời tiết ba miền khác nhau khá nhiều, nên cùng một tháng có nơi nắng đẹp, có nơi mưa dầm. Dưới đây là gợi ý chung để bạn tham khảo trước khi chọn tour." },
      { type: "h2", text: "Mùa xuân (tháng 1 - 3): lễ hội và hoa" },
      { type: "p", text: "Đây là mùa của các lễ hội đầu năm, hành hương và ngắm hoa. Miền Bắc se lạnh, thích hợp thăm chùa chiền, di tích. Đà Lạt và Tây Nguyên khô ráo, hoa nở rộ, rất hợp để chụp ảnh." },
      { type: "h2", text: "Mùa hè (tháng 4 - 8): biển và đảo" },
      { type: "p", text: "Biển miền Trung và các đảo phía Nam như Phú Quốc, Côn Đảo thường đẹp nhất vào khoảng tháng 4 đến tháng 8. Hãy nhớ chống nắng kỹ và đặt tour sớm vì đây là mùa cao điểm." },
      { type: "h2", text: "Mùa thu (tháng 9 - 11): vùng cao và di sản" },
      { type: "p", text: "Trời dịu, nắng nhẹ, ruộng bậc thang Tây Bắc vào mùa lúa chín vàng rực. Đây cũng là thời điểm đẹp để tham quan các di sản miền Trung trước khi mùa mưa bão đến." },
      { type: "h2", text: "Mùa đông (tháng 12 - 2): miền Nam và Tây Nguyên" },
      { type: "p", text: "Khi miền Bắc lạnh, miền Nam và Nam Trung Bộ lại dễ chịu, ít mưa. Đây là lúc lý tưởng cho Sài Gòn, miền Tây sông nước hay Nha Trang, Đà Lạt." },
      { type: "quote", text: "Không có thời điểm hoàn hảo cho mọi nơi, chỉ có nơi hoàn hảo cho từng thời điểm." },
      { type: "list", items: ["Kiểm tra dự báo thời tiết 3 - 5 ngày trước khi khởi hành.", "Mang theo áo mưa gọn nhẹ dù đi mùa khô.", "Chọn tour có lịch trình linh hoạt vào mùa mưa bão."] },
    ],
  },
  {
    slug: "di-san-the-gioi-viet-nam",
    title: "Di sản thế giới ở Việt Nam: những cái tên không thể bỏ lỡ",
    excerpt: "Từ vịnh Hạ Long đến phố cổ Hội An, những di sản được UNESCO ghi danh là lý do khiến hàng triệu du khách tìm đến Việt Nam mỗi năm.",
    category: "Di sản",
    readMinutes: 7,
    date: "2026-09-12",
    image: HERO_IMAGES.halong,
    showHeritage: true,
    blocks: [
      { type: "p", text: "Việt Nam sở hữu nhiều di sản được UNESCO công nhận, trải đều ba miền: có di sản thiên nhiên, di sản văn hóa và cả di sản hỗn hợp. Mỗi nơi kể một câu chuyện riêng về đất nước và con người." },
      { type: "h2", text: "Vịnh Hạ Long - kỳ quan của biển" },
      { type: "p", text: "Hàng nghìn đảo đá vôi nhô lên giữa làn nước xanh ngọc. Vịnh được UNESCO ghi danh lần đầu năm 1994 vì giá trị thẩm mỹ, và được công nhận lần nữa năm 2000 vì giá trị địa chất." },
      { type: "h2", text: "Cố đô Huế và Hoàng thành Thăng Long" },
      { type: "p", text: "Quần thể di tích Cố đô Huế (1993) lưu giữ dấu ấn của triều Nguyễn với cung điện, lăng tẩm và nhã nhạc cung đình. Khu trung tâm Hoàng thành Thăng Long (2010) nằm ngay giữa Hà Nội, hé lộ nhiều tầng lịch sử nối nhau suốt hơn một nghìn năm." },
      { type: "h2", text: "Phố cổ Hội An và Thánh địa Mỹ Sơn" },
      { type: "p", text: "Cả hai cùng được công nhận năm 1999. Hội An là thương cảng cổ với những ngôi nhà gỗ và đèn lồng rực rỡ về đêm. Mỹ Sơn là quần thể đền tháp Chăm Pa ẩn mình giữa thung lũng rừng." },
      { type: "h2", text: "Phong Nha - Kẻ Bàng và Tràng An" },
      { type: "p", text: "Phong Nha - Kẻ Bàng (2003) nổi tiếng với hệ thống hang động đồ sộ. Quần thể danh thắng Tràng An (2014) ở Ninh Bình kết hợp cảnh quan núi đá vôi với di tích cố đô Hoa Lư." },
      { type: "quote", text: "Đến một di sản là bước vào một trang sách còn nguyên vẹn của lịch sử." },
    ],
  },
  {
    slug: "kinh-nghiem-di-tour-lan-dau",
    title: "Kinh nghiệm đi tour lần đầu: chuẩn bị gì để chuyến đi trọn vẹn",
    excerpt: "Lần đầu đi tour trọn gói, bạn nên chuẩn bị những gì? Danh sách ngắn gọn giúp bạn yên tâm từ lúc đăng ký đến khi về nhà.",
    category: "Kinh nghiệm",
    readMinutes: 5,
    date: "2026-08-30",
    image: HERO_IMAGES.danang,
    blocks: [
      { type: "p", text: "Đi tour giúp bạn tiết kiệm thời gian lên kế hoạch và yên tâm về di chuyển, ăn ở. Chỉ cần chuẩn bị đúng, chuyến đi sẽ nhẹ nhàng hơn rất nhiều." },
      { type: "h2", text: "Trước khi đăng ký" },
      { type: "list", items: ["Đọc kỹ lịch trình và các điểm tham quan có trong tour.", "Kiểm tra ngày khởi hành, ngày kết thúc và số chỗ còn lại.", "Xem đánh giá của những khách đã đi để biết trải nghiệm thực tế."] },
      { type: "h2", text: "Thanh toán và hủy tour" },
      { type: "p", text: "Với VietJourney, bạn chỉ đăng ký giữ chỗ, không phải trả trước. Tiền tour được thanh toán bằng tiền mặt sau khi kết thúc hành trình. Nếu thay đổi kế hoạch, bạn có thể hủy đăng ký trước ngày khởi hành." },
      { type: "h2", text: "Hành lý nên mang" },
      { type: "list", items: ["Giấy tờ tùy thân và thông tin liên hệ khẩn cấp.", "Giày êm, quần áo phù hợp thời tiết và áo mưa nhẹ.", "Thuốc cá nhân, kem chống nắng, sạc dự phòng.", "Một ít tiền mặt cho các chi phí phát sinh nhỏ."] },
      { type: "quote", text: "Hãy để lại chỗ trống trong vali, vì bạn sẽ mang về rất nhiều kỷ niệm và quà." },
      { type: "h2", text: "Sau chuyến đi" },
      { type: "p", text: "Đừng quên để lại đánh giá để giúp những người đi sau. Bạn chỉ cần hoàn thành tour là có thể viết nhận xét ngay trên trang chi tiết tour." },
    ],
  },
  {
    slug: "am-thuc-ba-mien",
    title: "Ẩm thực dọc hành trình: ba miền, ba hương vị",
    excerpt: "Đi qua mỗi vùng đất là một lần làm quen với những món ăn mới. Gợi ý cách thưởng thức ẩm thực địa phương trong suốt chuyến đi.",
    category: "Ẩm thực",
    readMinutes: 5,
    date: "2026-08-18",
    image: HERO_IMAGES.phuquoc,
    blocks: [
      { type: "p", text: "Ẩm thực là một nửa của chuyến đi. Mỗi vùng có khẩu vị riêng, từ thanh đạm, tinh tế đến đậm đà, cay nồng, và thường gắn liền với nguyên liệu của địa phương." },
      { type: "h2", text: "Miền Bắc: thanh đạm và tinh tế" },
      { type: "p", text: "Phở, bún chả, chả cá hay các loại bánh truyền thống đều đề cao vị nguyên bản của nguyên liệu. Hãy thử vào buổi sáng sớm để cảm nhận nhịp sống phố phường." },
      { type: "h2", text: "Miền Trung: đậm đà và cay" },
      { type: "p", text: "Bún bò, mì Quảng, cao lầu, bánh bèo, bánh xèo mang hương vị đậm, cay đặc trưng. Đây cũng là vùng nổi tiếng với ẩm thực cung đình ở Huế." },
      { type: "h2", text: "Miền Nam: ngọt và phong phú" },
      { type: "p", text: "Hủ tiếu, cơm tấm, bánh xèo miền Tây và vô số loại trái cây nhiệt đới. Ở miền Tây, bữa ăn bên bờ sông là trải nghiệm không nên bỏ lỡ." },
      { type: "list", items: ["Ưu tiên quán đông khách địa phương.", "Hỏi hướng dẫn viên về món đặc sản theo mùa.", "Báo trước nếu bạn ăn chay hoặc có dị ứng thực phẩm."] },
    ],
  },
  {
    slug: "chup-anh-du-lich-bang-dien-thoai",
    title: "Chụp ảnh du lịch đẹp chỉ với chiếc điện thoại",
    excerpt: "Không cần máy ảnh đắt tiền, vài mẹo đơn giản về ánh sáng và bố cục sẽ giúp ảnh chuyến đi của bạn nổi bật hơn hẳn.",
    category: "Mẹo hay",
    readMinutes: 4,
    date: "2026-08-05",
    image: HERO_IMAGES.fansipan,
    blocks: [
      { type: "p", text: "Những bức ảnh đẹp thường đến từ việc chọn đúng thời điểm và góc nhìn, chứ không phải thiết bị. Chỉ cần nắm vài nguyên tắc cơ bản, điện thoại nào cũng có thể ghi lại khoảnh khắc đáng nhớ." },
      { type: "h2", text: "Tận dụng giờ vàng" },
      { type: "p", text: "Một giờ sau khi mặt trời mọc và một giờ trước khi mặt trời lặn là lúc ánh sáng mềm và ấm nhất. Cảnh biển, núi và di tích đều lên hình đẹp hơn rất nhiều." },
      { type: "h2", text: "Bố cục đơn giản" },
      { type: "list", items: ["Bật lưới 3x3 và đặt chủ thể lệch khỏi trung tâm.", "Tìm đường dẫn mắt như lối đi, hàng cây, bậc thang.", "Chụp thấp hoặc cao hơn tầm mắt để có góc lạ.", "Lau ống kính trước khi chụp."] },
      { type: "quote", text: "Hãy chụp ít hơn nhưng nhìn lâu hơn, vì phong cảnh đẹp xứng đáng được ngắm bằng mắt trước." },
    ],
  },
  {
    slug: "du-lich-co-trach-nhiem",
    title: "Du lịch có trách nhiệm: giữ gìn di tích và thiên nhiên",
    excerpt: "Những hành động nhỏ của mỗi du khách giúp di tích, danh thắng được bảo tồn cho nhiều thế hệ mai sau.",
    category: "Cộng đồng",
    readMinutes: 4,
    date: "2026-07-22",
    image: HERO_IMAGES.halong,
    blocks: [
      { type: "p", text: "Càng nhiều người đến, các điểm đến càng chịu áp lực. Du lịch có trách nhiệm là cách để cả du khách và cộng đồng địa phương cùng hưởng lợi lâu dài." },
      { type: "h2", text: "Những việc nên làm" },
      { type: "list", items: ["Không xả rác, mang rác trở về nơi quy định.", "Không chạm, khắc, viết lên di tích và hiện vật.", "Tôn trọng nghi lễ, trang phục khi vào nơi thờ tự.", "Hạn chế đồ nhựa dùng một lần, mang theo bình nước cá nhân.", "Mua đặc sản và quà lưu niệm của người dân địa phương."] },
      { type: "h2", text: "Vì sao điều đó quan trọng" },
      { type: "p", text: "Nhiều di tích đã tồn tại hàng trăm, hàng nghìn năm nhưng rất dễ hư hại bởi những tác động nhỏ. Mỗi hành động tử tế của bạn góp phần giữ lại vẻ đẹp ấy cho những người đến sau." },
      { type: "quote", text: "Hãy chỉ để lại dấu chân và chỉ mang đi những bức ảnh." },
    ],
  },
];

export const findPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
