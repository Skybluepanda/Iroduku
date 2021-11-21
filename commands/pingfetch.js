const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingfetch')
		.setDescription('Replies with Pong! Then stores pong in console log.'),
	async execute(interaction) {
		await interaction.reply('Pong!');
        const message = await interaction.fetchReply();
        console.log(message);
	},
};
