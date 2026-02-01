import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Mengenai ANQR',
  description: 'ANQR ialah penjana kod QR percuma dengan pendekatan mengutamakan pelanggan - jana kod QR secara setempat atau gunakan API kami untuk membenamkan.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Buka penjana', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Semak imbas artikel Pelajari', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Dasar Privasi', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Syarat Perkhidmatan', type: 'external' },
  ],
  sections: [
    {
      heading: 'Apakah ANQR?',
      paragraphs: ['ANQR (sebutan "sauh") ialah penjana kod QR percuma yang mencipta kod boleh imbasan untuk URL, teks, bukti kelayakan Wi-Fi, kad kenalan, acara kalendar dan banyak lagi.', 'Ia dibina untuk individu, perniagaan kecil, pemasar dan pembangun yang mahukan alat QR yang berkuasa tanpa mendaftar. Reka bentuk mengutamakan pelanggan bermakna kod QR dijana secara setempat dalam penyemak imbas anda secara lalai, dengan API pelayan pilihan untuk pembenaman dan penyepaduan profesional.'],
    },
    {
      heading: 'Ciri-ciri utama',
      bullets: ['Jana kod QR serta-merta dalam penyemak imbas anda - tiada akaun diperlukan.', 'Sesuaikan warna, gaya modul, corak pencari dan tambah tindanan imej.', 'Eksport dalam pelbagai format: PNG, SVG, WebP dan GIF animasi.', 'Kawalan lanjutan untuk tahap pembetulan ralat, versi QR, mod pengekodan dan pemilihan topeng.', 'Panduan keselamatan imbasan dan pratonton langsung untuk membantu memastikan kod boleh dibaca dalam cetakan dan pada skrin.', 'API sisi pelayan untuk pembenaman profesional dengan sokongan parameter penuh.', 'Berfungsi di luar talian setelah dimuatkan - ia ialah apl web statik yang boleh anda jalankan di mana-mana sahaja.'],
    },
    {
      heading: 'Bagaimana ANQR berfungsi',
      paragraphs: ['ANQR berjalan dalam penyemak imbas anda dan mengekod input anda ke dalam matriks QR standard dengan pembetulan ralat Reed–Solomon, kemudian menjadikannya mengikut format yang anda pilih.', 'Secara lalai, penjanaan berlaku secara setempat dalam penyemak imbas anda. Untuk kegunaan profesional, anda juga boleh menggunakan API bahagian pelayan untuk menjana kod QR melalui parameter URL - sesuai untuk membenamkan dalam tapak web, e-mel atau aliran kerja automatik.', 'Apabila anda menambah tindanan atau animasi, ANQR mengimbangi penggayaan dengan kebolehpercayaan imbasan supaya hasilnya kekal boleh diimbas.', 'ANQR memfokuskan pada kod statik (data berada di dalam QR). Jika anda memerlukan kod dinamik (destinasi boleh diedit), anda boleh mengekod URL ubah hala atau pautan pendek anda sendiri.'],
    },
    {
      heading: 'Siapa yang mengendalikan ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Pengiklanan dan cara kami kekal bebas',
      paragraphs: ['ANQR adalah percuma untuk digunakan dan disokong oleh pengiklanan. Kami mungkin memaparkan iklan melalui Google AdSense dan/atau rakan kongsi pengiklanan lain.', 'Pembekal iklan boleh menggunakan kuki atau teknologi serupa untuk memperibadikan iklan berdasarkan minat dan aktiviti penyemakan imbas anda. Anda boleh mengurus pilihan iklan dalam tetapan peranti anda dan melalui tetapan iklan Google dan ketahui lebih lanjut dalam Dasar Privasi kami.', 'Kami tidak menjual kandungan yang anda kodkan ke dalam kod QR. Iklan membantu menampung kos menjalankan dan menambah baik projek.'],
    },
    {
      heading: 'Piawaian terbuka',
      paragraphs: ['ANQR menjana kod QR berdasarkan standard ISO/IEC 18004 dan menyasarkan keserasian luas merentas pengimbas, kamera dan aliran kerja cetakan.'],
    },
    {
      heading: 'Notis tanda dagangan',
      paragraphs: ['QR Code® ialah tanda dagangan berdaftar DENSO WAVE INCORPORATED. ANQR tidak bergabung dengan, disokong oleh, atau ditaja oleh DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Maklum balas dan sumbangan',
      paragraphs: ['Kami mengalu-alukan maklum balas, laporan pepijat dan cadangan ciri. Sila hubungi melalui e-mel atau halaman hubungan - kami membaca setiap mesej, walaupun masa respons mungkin berbeza-beza.'],
    },
  ],
};

export default about;
