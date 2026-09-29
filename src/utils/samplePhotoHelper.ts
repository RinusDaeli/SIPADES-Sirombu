/**
 * Sample SVG Data URLs for realistic initial asset photos and BAST documents.
 */

export function createSampleAssetSvg(title: string, category: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)" />
    <rect x="20" y="20" width="560" height="360" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" />
    <g transform="translate(300, 160)" text-anchor="middle">
      <circle r="48" fill="#ffffff" fill-opacity="0.1" />
      <path d="M-24 -8 L0 -32 L24 -8 L16 -8 L16 24 L-16 24 L-16 -8 Z" fill="#ffffff" fill-opacity="0.8" />
    </g>
    <text x="300" y="245" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="1">
      ${category.toUpperCase()}
    </text>
    <text x="300" y="275" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${title}
    </text>
    <text x="300" y="305" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">
      Dokumentasi Fisik Barang Milik Desa • Kec. Sirombu
    </text>
  </svg>`;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

export function createSampleBastSvg(desaName: string, nomorBast: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#f8fafc" />
    <rect x="24" y="24" width="552" height="352" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
    <rect x="40" y="40" width="520" height="48" fill="#153422" rx="4" />
    <text x="300" y="68" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">
      BERITA ACARA SERAH TERIMA (BAST) ASET
    </text>
    <text x="300" y="115" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">
      PEMERINTAH ${desaName} - KECAMATAN SIROMBU
    </text>
    <text x="300" y="135" font-family="system-ui, sans-serif" font-size="11" fill="#475569" text-anchor="middle">
      Nomor: ${nomorBast}
    </text>
    <line x1="60" y1="150" x2="540" y2="150" stroke="#0f172a" stroke-width="1.5" />
    
    <text x="70" y="180" font-family="system-ui, sans-serif" font-size="11" fill="#334155">
      Pada hari ini telah diserahterimakan pengelolaan dan pemanfaatan aset desa kepada pengguna.
    </text>
    <text x="70" y="205" font-family="system-ui, sans-serif" font-size="11" fill="#334155">
      Status Barang : Kondisi Baik dan Lengkap dengan Berkas Pendukung.
    </text>
    
    <!-- Signatures placeholders -->
    <text x="140" y="260" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle">
      Yang Menyerahkan (Pihak I)
    </text>
    <text x="140" y="325" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle">
      Kepala Desa
    </text>
    
    <text x="460" y="260" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle">
      Yang Menerima (Pihak II)
    </text>
    <text x="460" y="325" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle">
      Penerima Manfaat / Pengguna
    </text>
  </svg>`;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}
