'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tạo bảng Users
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'publisher', 'admin'),
        defaultValue: 'user'
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      resetPasswordToken: Sequelize.STRING,
      resetPasswordExpire: Sequelize.DATE,
      verifyEmailToken: Sequelize.STRING,
      verifyEmailExpire: Sequelize.DATE,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tạo bảng Categories
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: Sequelize.TEXT,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tạo bảng Articles
    await queryInterface.createTable('Articles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      summary: Sequelize.TEXT,
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      image: Sequelize.STRING,
      status: {
        type: Sequelize.STRING,
        defaultValue: 'draft'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      publishedAt: Sequelize.DATE,
      source: Sequelize.STRING,
      sourceUrl: Sequelize.STRING,
      categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tạo bảng Tags
    await queryInterface.createTable('Tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tạo bảng ArticleTags
    await queryInterface.createTable('ArticleTags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      articleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tạo chỉ mục cho các trường thường được tìm kiếm
    await queryInterface.addIndex('Articles', ['title']);
    await queryInterface.addIndex('Articles', ['slug']);
    await queryInterface.addIndex('Articles', ['status']);
    await queryInterface.addIndex('Articles', ['categoryId']);
    await queryInterface.addIndex('Articles', ['userId']);
    await queryInterface.addIndex('Categories', ['slug']);
    await queryInterface.addIndex('Tags', ['slug']);
    await queryInterface.addIndex('ArticleTags', ['articleId']);
    await queryInterface.addIndex('ArticleTags', ['tagId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa các bảng theo thứ tự đảo ngược
    await queryInterface.dropTable('ArticleTags');
    await queryInterface.dropTable('Articles');
    await queryInterface.dropTable('Tags');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Users');
  }
};
