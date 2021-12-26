'use strict';
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Stores', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    homepage: {
      type: Sequelize.STRING
    },
    cashbackEnabled: {
      type: Sequelize.BOOLEAN
    },
    cashbackPercent: {
      type: Sequelize.DECIMAL
    },
    cashbackType: {
      type: Sequelize.STRING
    },
    network: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Stores');
}