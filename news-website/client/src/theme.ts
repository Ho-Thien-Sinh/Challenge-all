import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#B71C1C',
    colorLink: '#B71C1C',
    colorLinkHover: '#D32F2F',
    colorLinkActive: '#7F0000',
    colorText: '#333333',
    colorTextSecondary: '#666666',
    colorBorder: '#e0e0e0',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    borderRadius: 4,
  },
  components: {
    Button: {
      colorPrimary: '#B71C1C',
      colorPrimaryHover: '#D32F2F',
      colorPrimaryActive: '#7F0000',
    },
    Menu: {
      itemSelectedBg: 'rgba(183, 28, 28, 0.1)',
      itemSelectedColor: '#B71C1C',
      itemHoverColor: '#D32F2F',
      itemColor: 'rgba(0, 0, 0, 0.88)',
      horizontalItemHoverColor: '#D32F2F',
      horizontalItemSelectedColor: '#B71C1C',
      horizontalItemSelectedBg: 'rgba(183, 28, 28, 0.1)',
    },
    Card: {
      borderRadiusLG: 8,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  },
};

export default theme;
