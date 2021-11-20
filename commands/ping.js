const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
<<<<<<< HEAD
		return interaction.reply('Pong!');
	},
};
=======
		await interaction.reply('Pong!');
	},
};
>>>>>>> 8c81f0afb6559830469cb8759624706bfaace840
