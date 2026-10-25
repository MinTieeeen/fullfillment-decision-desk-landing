// Business Activity Map and deep-dive analyses, adapted from docs/Business.md (assumed model).
type T = { en: string; vi: string };

export interface ActivityGroup {
  letter: string;
  name: T;
  items: { text: T; hit?: boolean }[];
}

const i = (en: string, vi: string, hit = false) => ({ text: { en, vi }, hit });

export const activityGroups: ActivityGroup[] = [
  {
    letter: 'A',
    name: { en: 'Commercial & Merchandising', vi: 'Thương mại & ngành hàng' },
    items: [
      i('Research market demand', 'Nghiên cứu nhu cầu thị trường'),
      i('Define B2B / B2C target segments', 'Xác định nhóm khách hàng mục tiêu B2B/B2C'),
      i('Select assortment and SKUs', 'Lựa chọn danh mục sản phẩm và SKU'),
      i('Set pricing, discounts and promotions', 'Xây dựng chiến lược giá, chiết khấu và khuyến mãi'),
      i('Manage suppliers and trade terms', 'Quản lý nhà cung cấp và điều kiện thương mại'),
      i('Manage assortment per market', 'Quản lý danh mục sản phẩm theo từng thị trường'),
      i('Forecast sales and plan', 'Dự báo doanh số và lập kế hoạch bán hàng'),
    ],
  },
  {
    letter: 'B',
    name: { en: 'Procurement & Inventory', vi: 'Mua hàng & tồn kho' },
    items: [
      i('Forecast material demand', 'Dự báo nhu cầu vật liệu'),
      i('Plan purchase orders', 'Lập kế hoạch đặt hàng'),
      i('Order and follow up suppliers', 'Đặt hàng và theo dõi nhà cung cấp'),
      i('Receive and inspect goods', 'Tiếp nhận và kiểm tra hàng nhập'),
      i('Manage stock quantity, location and status', 'Quản lý số lượng, vị trí và tình trạng tồn kho', true),
      i('Replenish stores from the central warehouse', 'Bổ sung hàng từ kho trung tâm đến cửa hàng'),
      i('Transfer stock between stores', 'Điều chuyển hàng giữa các cửa hàng'),
      i('Count stock and resolve discrepancies', 'Kiểm kê và xử lý chênh lệch tồn kho'),
      i('Handle damaged, lost and slow-moving goods', 'Quản lý hàng hư hỏng, thất thoát và chậm luân chuyển'),
    ],
  },
  {
    letter: 'C',
    name: { en: 'Store Operations', vi: 'Vận hành cửa hàng' },
    items: [
      i('Open and close the store', 'Mở và đóng cửa hàng'),
      i('Schedule and assign staff', 'Phân ca, phân công và điều phối nhân viên'),
      i('Arrange shelves and displays', 'Sắp xếp hàng hóa trên kệ và khu trưng bày'),
      i('Replenish shelves', 'Bổ sung hàng lên kệ'),
      i('Check prices and labels', 'Kiểm tra giá và nhãn sản phẩm'),
      i('Manage cleanliness, safety and facilities', 'Quản lý vệ sinh, an toàn và cơ sở vật chất'),
      i('Run checklists and store audits', 'Thực hiện checklist và kiểm toán cửa hàng'),
      i('Receive goods and manage storage areas', 'Tiếp nhận hàng nhập và quản lý khu lưu trữ'),
      i('Manage incidents and exceptions', 'Quản lý sự cố và các trường hợp ngoại lệ'),
      i('Report revenue, productivity and performance', 'Báo cáo doanh thu, năng suất và hiệu suất'),
    ],
  },
  {
    letter: 'D',
    name: { en: 'Sales & Customer Service', vi: 'Bán hàng & dịch vụ khách hàng' },
    items: [
      i('Receive customer requests', 'Tiếp nhận yêu cầu của khách hàng'),
      i('Advise on materials and products', 'Tư vấn lựa chọn vật liệu và sản phẩm'),
      i('Prepare B2B quotes', 'Lập báo giá cho khách hàng B2B'),
      i('Process orders in store and online', 'Xử lý đơn hàng tại cửa hàng và trực tuyến', true),
      i('Apply prices, promotions and discounts', 'Áp dụng giá, khuyến mãi và chiết khấu'),
      i('Process payment and invoices', 'Xử lý thanh toán và hóa đơn'),
      i('Manage business customer accounts', 'Quản lý tài khoản khách hàng doanh nghiệp'),
      i('Handle complaints and support', 'Tiếp nhận khiếu nại và yêu cầu hỗ trợ'),
      i('Process returns and refunds', 'Xử lý đổi trả và hoàn tiền'),
      i('Manage loyalty and relationships', 'Quản lý khách hàng thân thiết và quan hệ khách hàng'),
    ],
  },
  {
    letter: 'E',
    name: { en: 'Order Fulfilment & Logistics', vi: 'Hoàn tất đơn & logistics' },
    items: [
      i('Confirm order and goods status', 'Xác nhận đơn hàng và tình trạng hàng hóa', true),
      i('Choose the supplying warehouse or store', 'Chọn kho hoặc cửa hàng cung ứng', true),
      i('Pick, pack and stage', 'Lấy hàng, đóng gói và tập kết'),
      i('Check quantity, type and condition', 'Kiểm tra số lượng, chủng loại và tình trạng hàng'),
      i('Schedule delivery or store pickup', 'Lên lịch giao hàng hoặc nhận tại cửa hàng', true),
      i('Assign vehicle or carrier', 'Phân công phương tiện hoặc đơn vị vận chuyển', true),
      i('Track delivery progress', 'Theo dõi tiến độ giao hàng'),
      i('Handle short, late or wrong deliveries', 'Xử lý đơn thiếu, giao trễ hoặc giao sai', true),
      i('Confirm successful delivery', 'Xác nhận giao hàng thành công'),
      i('Handle returns and redelivery', 'Xử lý hàng trả lại và giao lại'),
    ],
  },
  {
    letter: 'F',
    name: { en: 'Digital Commerce & IT', vi: 'Kênh số & công nghệ' },
    items: [
      i('Manage website and sales apps', 'Quản lý website và ứng dụng bán hàng'),
      i('Sync catalogue, prices and stock across channels', 'Đồng bộ danh mục, giá và tồn kho giữa các kênh'),
      i('Manage omni-channel orders', 'Quản lý đơn hàng đa kênh'),
      i('Integrate POS, ERP, warehouse and transport', 'Tích hợp POS, ERP, kho và vận chuyển', true),
      i('Manage product and customer data', 'Quản lý dữ liệu sản phẩm và khách hàng'),
      i('Manage access and security', 'Quản lý quyền truy cập và bảo mật'),
      i('Support users and incidents', 'Hỗ trợ người dùng và xử lý sự cố hệ thống'),
      i('Manage reports and performance data', 'Quản lý báo cáo và dữ liệu hiệu suất'),
    ],
  },
  {
    letter: 'G',
    name: { en: 'People & Store Management', vi: 'Nhân sự & quản lý' },
    items: [
      i('Recruit and place staff', 'Tuyển dụng và bố trí nhân viên'),
      i('Train on processes and products', 'Đào tạo nghiệp vụ và sản phẩm'),
      i('Train on safety', 'Đào tạo an toàn lao động'),
      i('Evaluate competence and performance', 'Đánh giá năng lực và hiệu suất'),
      i('Manage schedules, leave and time', 'Quản lý lịch làm việc, nghỉ phép và chấm công'),
      i('Communicate policies internally', 'Truyền đạt chính sách và thông báo nội bộ'),
      i('Manage SOPs', 'Quản lý quy trình hướng dẫn công việc (SOP)'),
      i('Monitor compliance and fix deviations', 'Theo dõi tuân thủ và khắc phục sai lệch'),
    ],
  },
  {
    letter: 'H',
    name: { en: 'Finance, Risk & Governance', vi: 'Tài chính, rủi ro & kiểm soát' },
    items: [
      i('Reconcile revenue and payments', 'Đối soát doanh thu và thanh toán'),
      i('Manage store budgets and costs', 'Quản lý ngân sách và chi phí cửa hàng'),
      i('Control shrinkage and fraud', 'Kiểm soát thất thoát và gian lận'),
      i('Manage legal and local compliance', 'Quản lý tuân thủ pháp lý và quy định địa phương'),
      i('Track KPIs and management reporting', 'Theo dõi KPI và lập báo cáo quản trị'),
      i('Audit processes', 'Kiểm toán quy trình'),
      i('Manage complaints, incidents and operational risk', 'Quản lý khiếu nại, sự cố và rủi ro vận hành'),
      i('Analyse performance gaps between stores', 'Phân tích chênh lệch hiệu suất giữa các cửa hàng'),
    ],
  },
];

export interface DeepDive {
  title: T;
  why: T;
  investigate: T[];
  chain: T[];
  kpi: T;
  note: T;
  link: T;
  focus?: boolean;
}

export const deepDives: DeepDive[] = [
  {
    title: { en: '① Receiving & Inventory Management', vi: '① Tiếp nhận hàng & quản lý tồn kho' },
    why: {
      en: 'Building materials vary in type, size, unit and storage. If stores receive goods, confirm quantities, update stock or handle damage differently, data quality and the ability to serve customers suffer.',
      vi: 'Vật liệu xây dựng có nhiều loại, kích thước, đơn vị và cách lưu trữ. Nếu các cửa hàng nhận hàng, xác nhận số lượng, cập nhật tồn hoặc xử lý hàng hỏng theo cách khác nhau, chất lượng dữ liệu và khả năng phục vụ khách bị ảnh hưởng.',
    },
    investigate: [
      { en: 'Is receiving consistent in steps and inspection criteria?', vi: 'Quy trình tiếp nhận có thống nhất về các bước và tiêu chí kiểm tra không?' },
      { en: 'Do staff confirm SKU, quantity, unit and condition correctly?', vi: 'Nhân viên có xác nhận đúng SKU, số lượng, đơn vị và tình trạng hàng không?' },
      { en: 'Is the system updated at the same moment everywhere?', vi: 'Thời điểm cập nhật hệ thống có giống nhau không?' },
      { en: 'Are counting and discrepancy handling clear?', vi: 'Quy trình kiểm kê và xử lý chênh lệch có rõ ràng không?' },
    ],
    chain: [
      { en: 'Stores receive goods differently', vi: 'Cửa hàng tiếp nhận hàng theo cách khác nhau' },
      { en: 'Stock data and inspection quality diverge', vi: 'Dữ liệu tồn và chất lượng kiểm tra không đồng nhất' },
      { en: 'Hard to confirm availability; extra checks and fixes', vi: 'Khó xác nhận hàng sẵn có, phát sinh kiểm tra và sửa lỗi' },
    ],
    kpi: {
      en: 'Inventory record accuracy · receiving discrepancy rate · receiving time · number of stock adjustments',
      vi: 'Độ chính xác bản ghi tồn kho · tỷ lệ sai lệch khi nhận · thời gian xử lý hàng nhập · số lần điều chỉnh tồn',
    },
    note: {
      en: 'If data is wrong because systems are not synchronised, the root cause may be Fragmented Systems, not only Store Operations.',
      vi: 'Nếu dữ liệu sai vì hệ thống không đồng bộ, nguyên nhân gốc có thể là Fragmented Systems, không chỉ là Store Operations.',
    },
    link: {
      en: 'This is why the prototype uses allocatable stock (physical − reserved − protected) and excludes stale data instead of trusting a single stock number.',
      vi: 'Đây là lý do prototype dùng tồn phân bổ được (thực tế − đã giữ − bảo vệ) và loại dữ liệu cũ thay vì tin một con số tồn duy nhất.',
    },
  },
  {
    title: { en: '② Customer Service & Sales Practices', vi: '② Tư vấn bán hàng & phục vụ khách hàng' },
    why: {
      en: 'Customers may need advice on specifications, quantities, compatibility and use. If quality depends heavily on each employee’s experience, the customer experience becomes uneven.',
      vi: 'Khách mua vật liệu xây dựng có thể cần tư vấn về thông số, số lượng, tính tương thích và cách dùng. Nếu chất lượng tư vấn phụ thuộc nhiều vào kinh nghiệm từng nhân viên, trải nghiệm khách không đồng đều.',
    },
    investigate: [
      { en: 'Do staff share one source of product information?', vi: 'Nhân viên có nguồn thông tin sản phẩm thống nhất không?' },
      { en: 'Are there minimum steps to confirm customer requirements?', vi: 'Quy trình tư vấn và xác nhận yêu cầu khách có các bước tối thiểu rõ ràng không?' },
      { en: 'Are B2B quotes based on approved pricing and discounts?', vi: 'Báo giá B2B có theo chính sách giá và chiết khấu đã duyệt không?' },
      { en: 'Do staff know when to escalate to an expert or manager?', vi: 'Nhân viên có biết khi nào phải chuyển cho chuyên gia hoặc quản lý không?' },
    ],
    chain: [
      { en: 'Advice and promises depend on the individual', vi: 'Tư vấn và lời hứa phụ thuộc từng người' },
      { en: 'Quotes and delivery promises vary', vi: 'Báo giá và lời hứa giao hàng không đồng nhất' },
      { en: 'Complaints, corrections and lost trust', vi: 'Khiếu nại, sửa báo giá và mất niềm tin' },
    ],
    kpi: {
      en: 'Complaint rate · share of quotes revised · policy misapplication rate · customer satisfaction',
      vi: 'Tỷ lệ khiếu nại · tỷ lệ báo giá phải sửa · tỷ lệ áp dụng sai chính sách · mức hài lòng khách',
    },
    note: {
      en: 'Identical advice from every employee is not the goal: technical products still need flexibility for each customer.',
      vi: 'Không coi việc mọi nhân viên tư vấn giống hệt nhau là mục tiêu tuyệt đối: sản phẩm kỹ thuật vẫn cần linh hoạt theo nhu cầu khách.',
    },
    link: {
      en: 'This is why the primary user is the sales employee at the counter, with a separate, simple screen the customer chooses from.',
      vi: 'Đây là lý do người dùng chính là nhân viên bán hàng tại quầy, kèm một màn hình riêng, đơn giản để khách tự chọn.',
    },
  },
  {
    title: { en: '③ Order Fulfilment & Source Selection', vi: '③ Hoàn tất đơn & chọn nguồn hàng' },
    focus: true,
    why: {
      en: 'When stock is spread across stores and warehouses, the choice of sources and services sets the delivery cost and whether the promise to the customer can be kept.',
      vi: 'Khi hàng phân tán ở nhiều cửa hàng và kho, việc chọn nguồn và dịch vụ quyết định chi phí giao và việc có giữ được lời hứa với khách hay không.',
    },
    investigate: [
      { en: 'How often does one source not cover a large order?', vi: 'Bao nhiêu đơn lớn không được một nguồn đáp ứng đủ?' },
      { en: 'How are sources and services chosen today, and by whom?', vi: 'Hiện ai chọn nguồn và dịch vụ, chọn theo cách nào?' },
      { en: 'How many promises change after confirmation, and why?', vi: 'Bao nhiêu lời hứa bị thay đổi sau xác nhận, vì sao?' },
      { en: 'Is allocatable stock and carrier capacity visible at decision time?', vi: 'Tồn phân bổ được và năng lực xe có hiển thị lúc ra quyết định không?' },
    ],
    chain: [
      { en: 'Sources chosen by habit, nearest first', vi: 'Chọn nguồn theo thói quen, gần nhất trước' },
      { en: 'Extra sources and deliveries, transport not secured', vi: 'Thêm nguồn, thêm chuyến, xe chưa được giữ' },
      { en: 'Higher cost per order and revised promises', vi: 'Chi phí mỗi đơn cao hơn và phải sửa lời hứa' },
    ],
    kpi: {
      en: 'Fulfilment cost per order · complete & on-time rate · deliveries per order · revisions after confirmation',
      vi: 'Chi phí fulfilment mỗi đơn · tỷ lệ giao đủ & đúng hẹn · số chuyến mỗi đơn · số lần sửa sau xác nhận',
    },
    note: {
      en: 'If inaccurate stock or structural capacity shortage dominates, the first investment may need to change: the tool does not create stock or vehicles.',
      vi: 'Nếu tồn sai hoặc thiếu năng lực vận chuyển là nguyên nhân chính, ưu tiên đầu tư có thể phải đổi: công cụ không tạo thêm hàng hay xe.',
    },
    link: {
      en: 'This is the core problem the prototype solves: compute feasible plans, let the customer choose, confirm before promising.',
      vi: 'Đây là bài toán chính prototype giải quyết: tính phương án khả thi, để khách chọn, xác nhận rồi mới hứa.',
    },
  },
];
