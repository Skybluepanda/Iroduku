'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('characters', 'rank', { 
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3, });
      await queryInterface.removeColumn('characters', 'simps');
      await queryInterface.addColumn('series', 'alias', {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,
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
