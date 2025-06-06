/**
 * Định dạng ngày tháng
 * @param dateString Chuỗi ngày tháng hoặc đối tượng Date
 * @returns Chuỗi ngày tháng đã định dạng (VD: "Thứ Hai, 01/01/2023, 10:00")
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(date.getTime())) return '';
  
  // Định dạng ngày tháng
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  // Chuyển đổi sang định dạng tiếng Việt
  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

/**
 * Định dạng ngày tháng ngắn gọn (chỉ hiển thị ngày/tháng/năm)
 * @param dateString Chuỗi ngày tháng hoặc đối tượng Date
 * @returns Chuỗi ngày tháng đã định dạng (VD: "01/01/2023")
 */
export const formatShortDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(date.getTime())) return '';
  
  // Định dạng ngày tháng
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Tính thời gian đã trôi qua so với hiện tại (ví dụ: "2 giờ trước", "3 ngày trước")
 * @param dateString Chuỗi ngày tháng hoặc đối tượng Date
 * @returns Chuỗi mô tả thời gian đã trôi qua
 */
export const timeAgo = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Tính toán các khoảng thời gian
  const intervals = {
    năm: 31536000,
    tháng: 2592000,
    tuần: 604800,
    ngày: 86400,
    giờ: 3600,
    phút: 60,
    giây: 1
  };
  
  // Tìm khoảng thời gian phù hợp
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? '' : ''} trước`;
    }
  }
  
  return 'Vừa xong';
};
