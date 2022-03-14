'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('collects', 'lastclaim'); 
    await queryInterface.addColumn('collects', 'lastclaim', { 
      type: Sequelize.DATE,
      unique: false,
      defaultValue: 0,
  }); 
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
