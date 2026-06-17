require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("setup-whitelist")
    .setDescription("Setup Project X Verification Panel")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.APPLICATION_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

client.on(Events.InteractionCreate, async (interaction) => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "setup-whitelist") {

      const embed = new EmbedBuilder()
        .setColor("#ff7b00")
        .setTitle("🔥 PROJECT X WHITELIST")
        .setDescription(`
Welcome to **PROJECT X Roleplay**

Click the button below to verify and gain access to the city.

⚠️ **PLEASE READ THE RULES**

• Use your real RP Name
• Follow all server rules
• No Fail RP / Troll RP
• Respect all players and staff

✅ After verification:
• Your nickname will be updated
• Citizen role will be assigned automatically
`)
        .setThumbnail("https://cdn.discordapp.com/attachments/1437777270415691940/1516602460158955550/a2s2assss.png")
        .setImage("https://cdn.discordapp.com/attachments/1437777270415691940/1516686577202630826/ChatGPT_Image_Jun_17_2026_02_10_30_PM.png")
        .setFooter({
          text: "PROJECT X Roleplay • Verification System"
        });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_btn")
          .setLabel("✅ VERIFY NOW")
          .setStyle(ButtonStyle.Success)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId === "verify_btn") {

      const modal = new ModalBuilder()
        .setCustomId("verify_modal")
        .setTitle("PROJECT X VERIFY");

      const rpName = new TextInputBuilder()
        .setCustomId("rp_name")
        .setLabel("Enter your RP Name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(rpName);

      modal.addComponents(row);

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {

    if (interaction.customId === "verify_modal") {

      const rpName =
        interaction.fields.getTextInputValue("rp_name");

      try {

        const member =
          await interaction.guild.members.fetch(
            interaction.user.id
          );

        await member.setNickname(rpName);

        await member.roles.add(process.env.ROLE_ID);

        await interaction.reply({
          content:
            `✅ Verification Successful!\n\nRP Name: **${rpName}**\nCitizen role granted.`,
          ephemeral: true
        });

        const channel =
  await client.channels.fetch(
    process.env.CHANNEL_ID
  );

if (channel) {

  const logEmbed = new EmbedBuilder()
    .setColor("#00ff88")
    .setTitle("✅ New Verification")
    .addFields(
      {
        name: "User",
        value: `${interaction.user}`,
        inline: true
      },
      {
        name: "RP Name",
        value: rpName,
        inline: true
      }
    )
    .setTimestamp();

  await channel.send({
    embeds: [logEmbed]
  });
}

      } catch (err) {

        console.error(err);

        await interaction.reply({
          content:
            "❌ Unable to verify. Check bot role position and permissions.",
          ephemeral: true
        });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);