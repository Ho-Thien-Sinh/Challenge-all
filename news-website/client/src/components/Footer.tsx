import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'VỀ TUỔI TRẺ ONLINE',
      links: [
        { title: 'Giới thiệu', url: '/about' },
        { title: 'Liên hệ', url: '/contact' },
        { title: 'Tuyển dụng', url: '/careers' },
        { title: 'Quảng cáo', url: '/advertise' },
      ],
    },
    {
      title: 'QUY ĐỊNH',
      links: [
        { title: 'Điều khoản sử dụng', url: '/terms' },
        { title: 'Chính sách bảo mật', url: '/privacy' },
        { title: 'Khiếu nại bản quyền', url: '/copyright' },
      ],
    },
    {
      title: 'THEO DÕI CHÚNG TÔI',
      links: [
        { title: 'Facebook', url: 'https://facebook.com/tuoitre' },
        { title: 'Youtube', url: 'https://youtube.com/tuoitre' },
        { title: 'Zalo', url: 'https://zalo.me/tuoitre' },
      ],
    },
    {
      title: 'TẢI ỨNG DỤNG',
      links: [
        { title: 'App Store', url: 'https://apps.apple.com/vn/app/tuoi-tre-online/id481017006' },
        { title: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.vn.tuoitre' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {footerLinks.map((section, index) => (
            <div key={index} className="footer-column">
              <h3>{section.title}</h3>
              <ul className="footer-links">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.url}>{link.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="copyright">
          <p>© {currentYear} Báo Tuổi Trẻ. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
