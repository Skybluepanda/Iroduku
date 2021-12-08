const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skilllist')
        .setDescription('Shows all skills'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has('908920221568483368')) return;
        await interaction.reply('Showing all skills...');
        const skillList = await database.SkillDesc.findAll({ attributes: ['name'] });
        const skillString = skillList.map(s => s.name).join(', ') || 'No skills set.';

        return interaction.editReply(`List of skills: ${skillString}`);
    },
};