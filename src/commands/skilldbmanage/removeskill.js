const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skillremove')
        .setDescription('Removes a skill')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the skill.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has('908920221568483368')) return;
        await interaction.reply('Removing skill...');
        const skillName = interaction.options.getString('name');
        const rowCount = await database.SkillDesc.destroy({ where: { name: skillName } });
        if (!rowCount) {
            return await interaction.editReply('That skill did not exist.');
        }
        return await interaction.editReply('Skill deleted.');
    },
};