'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Characters', 'updatedAt');
    await queryInterface.removeColumn('gifs', 'updatedAt');
    await queryInterface.removeColumn('gifs', 'createdAt');
    await queryInterface.removeColumn('players', 'updatedAt');
    await queryInterface.removeColumn('players', 'createdAt');
    await queryInterface.removeColumn('wishlists', 'updatedAt');
    await queryInterface.removeColumn('wishlists', 'createdAt');
    await queryInterface.removeColumn('dailies', 'updatedAt');
    await queryInterface.removeColumn('dailies', 'createdAt');
    await queryInterface.removeColumn('series', 'updatedAt');
    await queryInterface.removeColumn('series', 'createdAt');
    await queryInterface.removeColumn('images', 'updatedAt');
    await queryInterface.removeColumn('images', 'createdAt');
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
