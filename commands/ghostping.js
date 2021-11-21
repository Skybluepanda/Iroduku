const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ghostping')
		.setDescription('Replies with Pong! then deletes the message.'),
	async execute(interaction) {
		await interaction.reply('Pong!');
        await interaction.deleteReply();
	},
};
