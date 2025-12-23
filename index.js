require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    EmbedBuilder,
    ChannelType,
    ButtonBuilder, // Tambahan baru
    ButtonStyle    // Tambahan baru
} = require('discord.js');

// --- KONFIGURASI ---
const TOKEN = process.env.DISCORD_TOKEN;
const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.on('ready', () => {
    console.log(`Bot sudah online sebagai ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    
    // ---------------------------------------------------------
    // 1. HANDLER COMMAND (/buat-announcement)
    // ---------------------------------------------------------
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'buat-announcement') {
            
            if (interaction.channelId !== ADMIN_CHANNEL_ID) {
                return interaction.reply({ 
                    content: `❌ Command ini hanya bisa digunakan di channel <#${ADMIN_CHANNEL_ID}>!`, 
                    ephemeral: true 
                });
            }

            // Fungsi untuk menampilkan Modal Kosong (Fungsi helper ada di bawah)
            await showAnnouncementModal(interaction);
        }
    }
if (interaction.commandName === 'setup-autorole') {
    const embed = new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('🌌 JOIN THE UNIVERSE! 🌌')
        .setDescription('Ambil role Universers untuk membuka akses ke event, update, dan diskusi seru di server ini...')
        .setAuthor({ name: 'Universers', iconURL: interaction.guild.iconURL() })
        .setImage('https://cdn.discordapp.com/attachments/1416162541578485811/1453033990473646251/Hitam_dan_Putih_Modern_Y2k_Streetwear_Tipografi_Logo_2.png...'); 

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_autorole')
        .setPlaceholder('Click menu ini untuk memilih roles!')
        .addOptions([
            {
                label: 'Universers',
                value: 'role_universers',
                description: 'Dapatkan akses ke event, update, dan diskusi seru di server ini',
                emoji: '✨'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // MENGIRIM PESAN SECARA MANDIRI KE CHANNEL (Tanpa jejak "used command")
    await interaction.channel.send({ embeds: [embed], components: [row] });

    // Memberikan respon tersembunyi agar command tidak dianggap gagal oleh Discord
    await interaction.reply({ content: '✅ Pesan Auto-Role telah dikirim secara bersih!', ephemeral: true });
}

    // --- HANDLER SELECT MENU ---
    if (interaction.isStringSelectMenu()) {
        // Handler target channel announcement yang sudah ada
        if (interaction.customId === 'select_channel_target') {
            // ... (kode lama Anda)
        }

        // TAMBAHKAN DI SINI: Handler Klik Role
        if (interaction.customId === 'select_autorole') {
            const ROLE_ID = process.env.ROLE_ID; // <--- MASUKKAN ID ROLE DI SINI
            const member = interaction.member;
            const role = interaction.guild.roles.cache.get(ROLE_ID);

            if (!role) return interaction.reply({ content: "Role tidak ditemukan!", ephemeral: true });

            try {
                if (member.roles.cache.has(ROLE_ID)) {
                    await member.roles.remove(role); // Klik lagi untuk hapus (toggle) atau biarkan saja
                    return interaction.reply({ content: `✅ Role **${role.name}** telah dihapus.`, ephemeral: true });
                } else {
                    await member.roles.add(role);
                    return interaction.reply({ content: `✅ Role **${role.name}** telah diberikan!`, ephemeral: true });
                }
            } catch (err) {
                return interaction.reply({ content: "Gagal memberikan role. Pastikan posisi Role Bot ada di atas role tersebut!", ephemeral: true });
            }
        }
    }

    // ---------------------------------------------------------
    // 2. HANDLER BUTTON EDIT
    // ---------------------------------------------------------
    if (interaction.isButton()) {
        if (interaction.customId === 'btn_edit_announcement') {
            // Ambil data dari embed yang sedang dilihat untuk dimasukkan kembali ke form
            const oldEmbed = interaction.message.embeds[0];
            const oldContent = interaction.message.content;

            // Ekstrak data Ping dari text content
            // Format: "**PREVIEW MODE**\nTarget Ping: @everyone..."
            let oldPing = "";
            if (oldContent.includes("Target Ping: ")) {
                const splitContent = oldContent.split("Target Ping: ")[1];
                oldPing = splitContent.split("\n")[0].trim();
                if (oldPing === 'Tidak ada') oldPing = "";
            }

            // Ekstrak data Gambar
            const oldImage = oldEmbed.image ? oldEmbed.image.url : "";

            // Tampilkan Modal tapi dengan value yang sudah diisi (Pre-filled)
            await showAnnouncementModal(
                interaction, 
                oldEmbed.title, 
                oldEmbed.description, 
                oldImage, 
                oldPing
            );
        }

        // Tombol Cancel (Opsional, untuk menghapus preview)
        if (interaction.customId === 'btn_cancel_announcement') {
            await interaction.update({ content: '❌ Pembuatan pengumuman dibatalkan.', embeds: [], components: [] });
        }
    }

    // ---------------------------------------------------------
    // 3. HANDLER MODAL SUBMIT (Preview Generator)
    // ---------------------------------------------------------
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_announcement') {
            const title = interaction.fields.getTextInputValue('input_title');
            const desc = interaction.fields.getTextInputValue('input_desc');
            const imageUrl = interaction.fields.getTextInputValue('input_image');
            const pingText = interaction.fields.getTextInputValue('input_ping');

            const embed = new EmbedBuilder()
                .setColor(0x2B2D31)
                .setTitle(title)
                .setDescription(desc);

            if (imageUrl && imageUrl.startsWith('http')) {
                embed.setImage(imageUrl);
            }
            
            // Mencari Channel Text
            const textChannels = interaction.guild.channels.cache
                .filter(c => c.type === ChannelType.GuildText) 
                .first(25); 

            if (!textChannels || textChannels.length === 0) {
                return interaction.reply({ content: "Tidak ada channel teks ditemukan.", ephemeral: true });
            }

            const channelOptions = textChannels.map(channel => ({
                label: channel.name,
                value: channel.id,
                description: `Kirim ke #${channel.name}`
            }));

            // Komponen 1: Dropdown Channel
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_channel_target')
                .setPlaceholder('Pilih channel tujuan untuk MENGIRIM...')
                .setMinValues(1)
                .setMaxValues(Math.min(channelOptions.length, 25))
                .addOptions(channelOptions);

            // Komponen 2: Tombol Edit & Batal
            const editBtn = new ButtonBuilder()
                .setCustomId('btn_edit_announcement')
                .setLabel('Edit Kembali')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏️');

            const cancelBtn = new ButtonBuilder()
                .setCustomId('btn_cancel_announcement')
                .setLabel('Batal')
                .setStyle(ButtonStyle.Danger);

            const rowDropdown = new ActionRowBuilder().addComponents(selectMenu);
            const rowButtons = new ActionRowBuilder().addComponents(editBtn, cancelBtn);

            let previewContent = `**PREVIEW MODE**\nTarget Ping: ${pingText || 'Tidak ada'}\n\n*Jika sudah benar, pilih channel di bawah untuk langsung mengirim.*\n*Jika salah, klik Edit.*`;

            // Kirim Preview (Jika ini hasil edit, kita update pesan sebelumnya, jika baru kita reply)
            // Agar aman dan mudah, kita selalu reply ephemeral baru saja.
            await interaction.reply({
                content: previewContent,
                embeds: [embed],
                components: [rowDropdown, rowButtons],
                ephemeral: true
            });
        }
    }

    // ---------------------------------------------------------
    // 4. HANDLER DROPDOWN MENU (Kirim Pesan Akhir)
    // ---------------------------------------------------------
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select_channel_target') {
            const embedToSend = EmbedBuilder.from(interaction.message.embeds[0]);
            const selectedChannelIds = interaction.values;
            
            const originalContent = interaction.message.content;
            let pingToSend = "";
            
            if (originalContent.includes("Target Ping: ")) {
                const splitContent = originalContent.split("Target Ping: ")[1];
                pingToSend = splitContent.split("\n")[0].trim();
                if (pingToSend === 'Tidak ada') pingToSend = "";
            }

            await interaction.deferUpdate();

            let successCount = 0;
            const failedChannels = [];

            for (const channelId of selectedChannelIds) {
                try {
                    const channel = interaction.guild.channels.cache.get(channelId);
                    if (channel) {
                        await channel.send({ 
                            content: pingToSend, 
                            embeds: [embedToSend] 
                        });
                        successCount++;
                    }
                } catch (err) {
                    failedChannels.push(channelId);
                }
            }

            let responseMsg = `✅ Sukses! Pengumuman dikirim ke **${successCount}** channel.`;
            if (failedChannels.length > 0) {
                responseMsg += `\n❌ Gagal di: ${failedChannels.map(id => `<#${id}>`).join(', ')}`;
            }

            await interaction.editReply({ 
                content: responseMsg, 
                embeds: [], 
                components: [] 
            });
        }
    }
});

// --- FUNGSI HELPER: MEMBUAT MODAL ---
// Fungsi ini dipisah agar bisa dipanggil saat Command BARU atau saat tombol EDIT
async function showAnnouncementModal(interaction, titleVal = "", descVal = "", imageVal = "", pingVal = "") {
    const modal = new ModalBuilder()
        .setCustomId('modal_announcement')
        .setTitle('Form Pengumuman');

    const titleInput = new TextInputBuilder()
        .setCustomId('input_title')
        .setLabel("Judul (Header)")
        .setPlaceholder("Cth: SEPTEM BER-AKSI!!")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(titleVal); // Isi otomatis jika edit

    const descInput = new TextInputBuilder()
        .setCustomId('input_desc')
        .setLabel("Isi Pengumuman")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setValue(descVal); // Isi otomatis jika edit

    const imageInput = new TextInputBuilder()
        .setCustomId('input_image')
        .setLabel("Link Gambar (URL)")
        .setPlaceholder("Wajib link address dari discord !")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(imageVal); // Isi otomatis jika edit

    const pingInput = new TextInputBuilder()
        .setCustomId('input_ping')
        .setLabel("Ping / Mention")
        .setPlaceholder("@everyone, @here, atau kosongkan")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(pingVal); // Isi otomatis jika edit

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(descInput),
        new ActionRowBuilder().addComponents(imageInput),
        new ActionRowBuilder().addComponents(pingInput)
    );

    await interaction.showModal(modal);
}

client.login(TOKEN);