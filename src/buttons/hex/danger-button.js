module.exports = {
    data: {
        name: `danger-button`
    },
    async execute (interaction, client) {
        await interaction.reply({ content: `Danger`});
    }
}