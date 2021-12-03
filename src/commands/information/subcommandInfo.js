const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Replies with Pong!')
        .setDefaultPermission(false)
        .addSubcommand(subcommand => 
            subcommand
                .setName("user")
                .setDescription("Gets information of the user mentioned.")
                .addUserOption(option => 
                    option
                        .setName("target")
                        .setDescription("The user mentioned")
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("server")
                .setDescription("Gets information of the server")),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === "user") {
            const user = interaction.options.getUser("target");
            if (user) {
                await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
            } else {
                await interaction.reply(`Username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
            }
        } else if (interaction.options.getSubcommand() === "server") {
            await interaction.reply(`Server Name: ${interaction.guild.name}\nTotal Members: ${interaction.guild.memberCount}`);
        }
	},
};
