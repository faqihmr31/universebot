require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
// TAMBAHKAN ID SERVER ANDA DI SINI (Dapatkan dengan klik kanan server -> Copy Server ID)
const GUILD_ID = process.env.GUILD_ID;

const commands = [
    new SlashCommandBuilder()
        .setName('buat-announcement')
        .setDescription('Membuka form untuk membuat pengumuman'),
    new SlashCommandBuilder()
        .setName('setup-autorole')
        .setDescription('Mengirim pesan pilihan role permanen')
]
.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`Sedang mendaftarkan ${commands.length} application (/) commands ke GUILD...`);

        // PERUBAHAN DI SINI: Menggunakan applicationGuildCommands agar instan
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Sukses mendaftarkan ${data.length} application (/) commands secara instan.`);
    } catch (error) {
        console.error(error);
    }
})();