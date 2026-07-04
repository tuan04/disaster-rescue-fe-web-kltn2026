import { Link } from 'react-router-dom';
import { Card, Col, Row, Statistic } from 'antd';
import { AlertTriangle, ShieldCheck, Users, HelpCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="text-center py-16 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:text-orange-400">
            Hệ thống Khẩn Cấp Thiên Tai
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            CỨU HỘ KỊP THỜI - KẾT NỐI SỰ SỐNG
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Giải pháp hỗ trợ và kết nối khẩn cấp giữa người gặp nạn do thiên tai và lực lượng ứng cứu chuyên nghiệp thời gian thực.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/map"
              className="px-6 py-3 text-base font-semibold text-white bg-[var(--primary)] hover:bg-orange-600 dark:hover:bg-orange-500 rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-105"
            >
              Vào Bản đồ Cứu hộ
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-all"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Thống kê hoạt động cứu nạn</h2>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={8} className="text-center">
            <Card bordered={false} className="bg-white dark:bg-slate-800 shadow-sm">
              <Statistic
                title="Yêu cầu cứu trợ đã tiếp nhận"
                value={1240}
                valueStyle={{ color: '#FF6B00', fontWeight: 'bold' }}
                prefix={<AlertTriangle className="inline mr-2 h-5 w-5" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} className="text-center">
            <Card bordered={false} className="bg-white dark:bg-slate-800 shadow-sm">
              <Statistic
                title="Đã giải cứu thành công"
                value={1195}
                valueStyle={{ color: '#2E7D32', fontWeight: 'bold' }}
                prefix={<ShieldCheck className="inline mr-2 h-5 w-5" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} className="text-center">
            <Card bordered={false} className="bg-white dark:bg-slate-800 shadow-sm">
              <Statistic
                title="Tình nguyện viên hoạt động"
                value={534}
                valueStyle={{ color: '#1A365D', fontWeight: 'bold' }}
                prefix={<Users className="inline mr-2 h-5 w-5" />}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* Guide details */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="text-[var(--primary)]" /> Hướng dẫn Gửi Yêu cầu khẩn cấp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 border border-gray-100 dark:border-slate-700 rounded-2xl">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950 text-[var(--primary)] font-bold text-lg mb-4">1</div>
            <h3 className="font-semibold text-lg mb-2">Định vị vị trí của bạn</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cho phép trình duyệt truy cập vị trí GPS của bạn trên màn hình bản đồ để định vị chính xác.</p>
          </div>
          <div className="p-5 border border-gray-100 dark:border-slate-700 rounded-2xl">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950 text-[var(--primary)] font-bold text-lg mb-4">2</div>
            <h3 className="font-semibold text-lg mb-2">Điền thông tin sự cố</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chọn loại sự cố (ngập lụt, sạt lở, y tế khẩn cấp), số người gặp nạn, và ghi chú tình huống hiện tại.</p>
          </div>
          <div className="p-5 border border-gray-100 dark:border-slate-700 rounded-2xl">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950 text-[var(--primary)] font-bold text-lg mb-4">3</div>
            <h3 className="font-semibold text-lg mb-2">Gửi & Theo dõi trạng thái</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nhấn nút gửi khẩn cấp. Lực lượng cứu hộ gần nhất sẽ tiếp nhận và hiển thị đường đi trên bản đồ của bạn.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
