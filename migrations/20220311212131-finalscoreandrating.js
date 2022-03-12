'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('characters', 'final', {type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0});
      await queryInterface.addColumn('characters', 'rank', {type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0});
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
