const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subping')
		.setDescription('Replies with Pong!')
		.addSubcommand(subcommand => 
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => 
					option
						.setName('target')
						.setDescription('The user')))

		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server'))
	}
