const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fish')
		.setDescription('Try to catch fish!'),
	async execute(interaction) {
        await interaction.reply('catching...')

        if (Math.ceil(Math.random()*10)%2 == 0) {
            await interaction.editReply('Fish Caught!');
        } else {
            await interaction.editReply('No fish :(');
        }
	},
};
