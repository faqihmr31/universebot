// Jalankan ini satu kali untuk menghapus perintah GLOBAL
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