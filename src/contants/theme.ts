// Định nghĩa hệ màu cứu trợ y hệt bên Mobile của ông
const customColors = {
    danger: '#D9383A',   // Cảnh báo nguy hiểm, sạt lở
    success: '#2E7D32',  // Ca cứu trợ hoàn thành, vùng an toàn
    warning: '#F59E0B',  // Đang xử lý, vùng có nguy cơ ngập
};

export const LightTheme = {
    colors: {
        primary: '#FF6B00',       // Cam cứu hộ (Màu chủ đạo)
        secondary: '#1A365D',     // Xanh Navy (Màu phụ)
        background: '#F9FAFB',    // Nền sáng
        surface: '#FFFFFF',       // Nền của Card/Component
        text: '#11181C',
        ...customColors,
    },
};

export const DarkTheme = {
    colors: {
        primary: '#FF7A1A',       // Cam sáng hơn trên nền tối
        secondary: '#2A4365',     // Xanh Navy tối
        background: '#121212',    // Đen ròng
        surface: '#1E1E1E',       // Nền Card tối
        text: '#ECEDEE',
        ...customColors,
    },
};

export const Fonts = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const Typography = {
    sizes: {
        xs: '12px',       // Caption, thời gian gửi, text cực nhỏ
        sm: '14px',       // Body phụ, nhãn phụ dưới icon, mô tả ngắn
        md: '16px',       // Chữ body mặc định
        lg: '18px',       // Tiêu đề nhỏ, tiêu đề các thẻ Card
        xl: '22px',       // Tiêu đề màn hình chính (Header Title)
        xxl: '32px',      // Số liệu lớn, hoặc chữ khẩn cấp tầm trung
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

export const Spacing = {
    screenHorizontal: '24px',
    screenVertical: '20px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
};