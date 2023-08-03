const { Collection } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      const { cooldowns } = interaction.client;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const defaultCooldownDuration = 3;
      const cooldownAmount =
        (command.cooldown ?? defaultCooldownDuration) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return interaction.reply({
            content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true,
          });
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `There was an error while executing this command! ${error}`,
          ephemeral: true,
        });
      }
      console.log(
        `${interaction.user.tag} in #${interaction.channel.name} triggered an interaction ${interaction.commandId} : ${interaction.commandName}.`
      );
    }
  },
};

// module.exports = {
// 	name: 'interactionCreate',
// 	async execute(interaction) {
// 		if (interaction.isCommand()) {
// 			const command = interaction.client.commands.get(interaction.commandName);
// 			if (!command) return;
// 			try {
// 				await command.execute(interaction);
// 			} catch (error) {
// 				console.error(error);
// 				await interaction.reply({ content: `There was an error while executing this command! ${error}`, ephemeral: true });
// 			}
// 			console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction ${interaction.commandId} : ${interaction.commandName}.`);
// 			}
// 		//  else if (interaction.isButton()) {
// 		// 	const button = interaction.client.buttons.get(interaction.customId);
// 		// 	if (!button) return await interaction.reply({ content: `There was no button code found for this button.`});
// 		// 	try {
// 		// 		await button.execute(interaction);
// 		// 	} catch (error) {
// 		// 		console.error(error);
// 		// 		await interaction.reply({ content: 'There was an error while executing this Button!', ephemeral: true });
// 		// 	}
// 		// }

// 	},
// };
