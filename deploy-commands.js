require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
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
        console.log('Menghapus semua global commands...');
        
        // Mengirim body kosong ke Routes.applicationCommands akan menghapus semua command global
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: [] },
        );

        console.log('Sukses menghapus global commands.');
    } catch (error) {
        console.error(error);
    }
})();