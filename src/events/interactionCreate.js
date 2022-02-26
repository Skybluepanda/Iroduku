module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) return;
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			await console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction ${interaction.commandId} : ${interaction.commandName}.`);
			}
		//  else if (interaction.isButton()) {
		// 	const button = interaction.client.buttons.get(interaction.customId);
		// 	if (!button) return await interaction.reply({ content: `There was no button code found for this button.`});
		// 	try {
		// 		await button.execute(interaction);
		// 	} catch (error) {
		// 		console.error(error);
		// 		await interaction.reply({ content: 'There was an error while executing this Button!', ephemeral: true });
		// 	}
		// }

	},
};