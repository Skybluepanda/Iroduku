'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('wishlists', 'created_at');
    await queryInterface.removeColumn('wishlists', 'updated_at');
    /**
     * Add altering commands here.
     *
     * Example:
     * 
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
