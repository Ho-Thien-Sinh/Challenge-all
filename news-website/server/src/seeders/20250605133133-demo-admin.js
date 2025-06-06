'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa dữ liệu cũ trước khi thêm mới (theo thứ tự đảo ngược khóa ngoại)
    await queryInterface.sequelize.query('TRUNCATE TABLE \"ArticleTags\" CASCADE');
    await queryInterface.sequelize.query('TRUNCATE TABLE \"Articles\" CASCADE');
    await queryInterface.sequelize.query('TRUNCATE TABLE \"Categories\" CASCADE');
    await queryInterface.sequelize.query('TRUNCATE TABLE \"Tags\" CASCADE');
    await queryInterface.sequelize.query('TRUNCATE TABLE \"Users\" CASCADE');
    
    // Reset sequence
    await queryInterface.sequelize.query('ALTER SEQUENCE \"Users_id_seq\" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE \"Categories_id_seq\" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE \"Articles_id_seq\" RESTART WITH 1');
    await queryInterface.sequelize.query('ALTER SEQUENCE \"Tags_id_seq\" RESTART WITH 1');

    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Thêm admin user
    await queryInterface.bulkInsert('Users', [{
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Thêm một số categories mẫu
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Thời sự',
        slug: 'thoi-su',
        description: 'Tin tức thời sự trong nước và quốc tế',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Thể thao',
        slug: 'the-thao',
        description: 'Tin tức thể thao trong nước và quốc tế',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Giải trí',
        slug: 'giai-tri',
        description: 'Tin tức giải trí, phim ảnh, âm nhạc',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Thêm một số tags mẫu
    await queryInterface.bulkInsert('Tags', [
      {
        name: 'Chính trị',
        slug: 'chinh-tri',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kinh tế',
        slug: 'kinh-te',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Xã hội',
        slug: 'xa-hoi',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Xóa dữ liệu mẫu khi rollback
    await queryInterface.bulkDelete('Users', { email: 'admin@example.com' }, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Tags', null, {});
  }
};
