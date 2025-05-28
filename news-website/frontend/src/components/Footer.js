import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="tuoitre-footer mt-auto">
      <Container>
        <Row>
          <Col lg={3} md={6} className="mb-4">
            <div className="mb-3">
              <img
                src={process.env.PUBLIC_URL + '/tuoitre-logo.svg'}
                height="40"
                className="d-inline-block mb-3"
                alt="Tuổi Trẻ Logo"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className="small">Cơ quan chủ quản: Báo Tuổi Trẻ</p>
            <p className="small">© 2025 Bản quyền thuộc về Báo Tuổi Trẻ</p>
          </Col>
          <Col lg={3} md={6} className="mb-4">
            <h5>DANH MỤC</h5>
            <Row>
              <Col xs={6}>
                <ul className="list-unstyled">
                  <li><Link to="/category/thoi-su">Thời sự</Link></li>
                  <li><Link to="/category/the-gioi">Thế giới</Link></li>
                  <li><Link to="/category/phap-luat">Pháp luật</Link></li>
                  <li><Link to="/category/kinh-doanh">Kinh doanh</Link></li>
                  <li><Link to="/category/cong-nghe">Công nghệ</Link></li>
                  <li><Link to="/category/xe">Xe</Link></li>
                </ul>
              </Col>
              <Col xs={6}>
                <ul className="list-unstyled">
                  <li><Link to="/category/du-lich">Du lịch</Link></li>
                  <li><Link to="/category/van-hoa">Văn hóa</Link></li>
                  <li><Link to="/category/giai-tri">Giải trí</Link></li>
                  <li><Link to="/category/the-thao">Thể thao</Link></li>
                  <li><Link to="/category/giao-duc">Giáo dục</Link></li>
                  <li><Link to="/category/suc-khoe">Sức khỏe</Link></li>
                </ul>
              </Col>
            </Row>
          </Col>
          <Col lg={3} md={6} className="mb-4">
            <h5>LIÊN HỆ</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                Địa chỉ: 60A Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                Điện thoại: (028) 3997 3838
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                Email: tto@tuoitre.com.vn
              </li>
            </ul>
          </Col>
          <Col lg={3} md={6} className="mb-4">
            <h5>KẾT NỐI VỚI CHÚNG TÔI</h5>
            <div className="d-flex mb-3">
              <a href="#" className="me-3 text-dark">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="#" className="me-3 text-dark">
                <i className="bi bi-youtube fs-4"></i>
              </a>
              <a href="#" className="me-3 text-dark">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="#" className="text-dark">
                <i className="bi bi-instagram fs-4"></i>
              </a>
            </div>
            <h5 className="mt-4">TẢI ỨNG DỤNG</h5>
            <div className="d-flex">
              <a href="#" className="me-2">
                <img src="https://static-tuoitre.tuoitre.vn/tuoitre/web_images/app-store.svg" alt="App Store" height="40" />
              </a>
              <a href="#">
                <img src="https://static-tuoitre.tuoitre.vn/tuoitre/web_images/google-play.svg" alt="Google Play" height="40" />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
      <div className="tuoitre-copyright">
        <Container>
          <p className="mb-0">© {new Date().getFullYear()} Báo Tuổi Trẻ. Tất cả các quyền được bảo lưu.</p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;