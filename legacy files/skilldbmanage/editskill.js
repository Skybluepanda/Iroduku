const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skilledit')
        .setDescription('Edits a skill')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your skill.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('max_level')
                .setDescription("Maximum level the skill has.")
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription("Description of your skill.")
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has('908920221568483368')) return;
        await interaction.reply('Editing skill...');
        const skillName = interaction.options.getString('name');
        const maxLevel = interaction.options.getInteger('max_level')
        const skillDescription = interaction.options.getString('description');

        const descUpdate = await database.SkillDesc.update({ description: skillDescription }, { where: { name: skillName } });
        const maxLevelUpdate = await database.SkillDesc.update({ maxLevel: maxLevel }, { where: { name: skillName } });
        

        if (descUpdate > 0) {
            if (maxLevelUpdate > 0) {
                return interaction.editReply(`Skill \`${skillName}\` was edited.`);
            }
        }
        return interaction.editReply(`Could not find a Skill with name \`${skillName}\`.`)
    },
};