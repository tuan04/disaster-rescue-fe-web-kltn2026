import { Card, Timeline } from 'antd';
import { HeartHandshake, Eye, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Giới thiệu Về Dự Án</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Sứ mệnh của chúng tôi là ứng dụng công nghệ hiện đại nhằm giảm thiểu tối đa rủi ro và thiệt hại do thiên tai mang lại.
        </p>
      </div>

      {/* Grid of Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 text-[var(--primary)] mb-3">
            <HeartHandshake className="h-6 w-6" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Giá trị cốt lõi</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hỗ trợ vô điều kiện, nhanh chóng, minh bạch và đặt tính mạng của con người lên hàng đầu.
          </p>
        </Card>

        <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 text-[var(--success)] mb-3">
            <Eye className="h-6 w-6" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Tầm nhìn</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trở thành nền tảng phản ứng nhanh trực tuyến đáng tin cậy hàng đầu Việt Nam cho các đợt lũ lụt và sạt lở miền Trung.
          </p>
        </Card>

        <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 text-[var(--warning)] mb-3">
            <Award className="h-6 w-6" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Độ chính xác</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ứng dụng công nghệ định vị GPS, bản đồ nhiệt, và các kênh thông tin thời gian thực để tối ưu lộ trình cứu hộ.
          </p>
        </Card>
      </div>

      {/* Project development timeline */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-8">Lộ trình Phát triển Hệ thống</h2>
        <Timeline
          items={[
            {
              color: 'green',
              children: 'Khảo sát thực trạng và yêu cầu cứu hộ thực tế tại các vùng thường xuyên chịu lũ lụt (Tháng 5/2026)',
            },
            {
              color: 'green',
              children: 'Thiết kế giao diện người dùng và cơ sở dữ liệu định vị thời gian thực (Tháng 6/2026)',
            },
            {
              color: 'orange',
              children: 'Hiện tại: Xây dựng và hoàn thiện phiên bản Web & App, kết nối API bản đồ (Tháng 7/2026)',
            },
            {
              color: 'gray',
              children: 'Thử nghiệm hệ thống tại địa phương và lấy ý kiến của lực lượng cứu hộ (Tháng 8/2026)',
            },
          ]}
        />
      </section>
    </div>
  );
}
