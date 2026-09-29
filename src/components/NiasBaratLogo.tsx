import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const NiasBaratLogo: React.FC<LogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
        style={{ width: `${size}px`, height: `${size}px` }}
        role="img"
        aria-label="Lambang Resmi Kabupaten Nias Barat"
      >
        {/* Perisai Segilima Merah (Red Pentagon Shield with Bold Black Outline) */}
        <polygon
          points="500,10 995,385 790,990 210,990 5,385"
          fill="#ED1C24"
          stroke="#000000"
          strokeWidth="16"
          strokeLinejoin="round"
        />

        {/* Bintang Bersudut Lima Kuning Emas (Top Golden Star) */}
        <polygon
          points="500,125 516,166 560,166 525,192 538,234 500,208 462,234 475,192 440,166 484,166"
          fill="#FFE600"
          stroke="#000000"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Pucuk Tombak Emas & Batang Pohon Belang Hitam-Kuning (Spear Tip & Striped Pole) */}
        <polygon
          points="500,222 510,248 490,248"
          fill="#FFE600"
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <rect x="492" y="248" width="16" height="264" fill="#000000" />
        <rect x="492" y="258" width="16" height="20" fill="#FFE600" />
        <rect x="492" y="298" width="16" height="20" fill="#FFE600" />
        <rect x="492" y="340" width="16" height="20" fill="#FFE600" />
        <rect x="492" y="382" width="16" height="20" fill="#FFE600" />
        <rect x="492" y="424" width="16" height="20" fill="#FFE600" />
        <rect x="492" y="466" width="16" height="20" fill="#FFE600" />
        <rect x="492" y="248" width="16" height="264" fill="none" stroke="#000000" strokeWidth="5" />

        {/* Ornamen Cabang Spiral Ganda (4 Tingkat Ni'obakha / Ni'otowo) */}
        {/* Tingkat 1 (Atas) */}
        <path
          d="M 492 278 C 450 250 380 250 370 280 C 360 305 395 320 415 305 C 428 295 420 275 405 280"
          fill="none"
          stroke="#FFE600"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 492 278 C 450 250 380 250 370 280 C 360 305 395 320 415 305 C 428 295 420 275 405 280"
          fill="none"
          stroke="#000000"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 508 278 C 550 250 620 250 630 280 C 640 305 605 320 585 305 C 572 295 580 275 595 280"
          fill="none"
          stroke="#FFE600"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 508 278 C 550 250 620 250 630 280 C 640 305 605 320 585 305 C 572 295 580 275 595 280"
          fill="none"
          stroke="#000000"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Tingkat 2 */}
        <path
          d="M 492 335 C 420 300 355 310 340 345 C 325 380 375 400 405 375 C 425 358 410 328 385 336"
          fill="none"
          stroke="#FFE600"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 492 335 C 420 300 355 310 340 345 C 325 380 375 400 405 375 C 425 358 410 328 385 336"
          fill="none"
          stroke="#000000"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 508 335 C 580 300 645 310 660 345 C 675 380 625 400 595 375 C 575 358 590 328 615 336"
          fill="none"
          stroke="#FFE600"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 508 335 C 580 300 645 310 660 345 C 675 380 625 400 595 375 C 575 358 590 328 615 336"
          fill="none"
          stroke="#000000"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Tingkat 3 */}
        <path
          d="M 492 395 C 400 355 320 370 305 410 C 290 450 350 475 385 445 C 408 425 390 390 360 400"
          fill="none"
          stroke="#FFE600"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 492 395 C 400 355 320 370 305 410 C 290 450 350 475 385 445 C 408 425 390 390 360 400"
          fill="none"
          stroke="#000000"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 508 395 C 600 355 680 370 695 410 C 710 450 650 475 615 445 C 592 425 610 390 640 400"
          fill="none"
          stroke="#FFE600"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 508 395 C 600 355 680 370 695 410 C 710 450 650 475 615 445 C 592 425 610 390 640 400"
          fill="none"
          stroke="#000000"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Tingkat 4 (Bawah Luas Melengkung di Atas Rumah Adat) */}
        <path
          d="M 492 470 C 370 415 280 440 265 500 C 250 550 325 580 370 540 C 400 515 375 470 335 480"
          fill="none"
          stroke="#FFE600"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 492 470 C 370 415 280 440 265 500 C 250 550 325 580 370 540 C 400 515 375 470 335 480"
          fill="none"
          stroke="#000000"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 508 470 C 630 415 720 440 735 500 C 750 550 675 580 630 540 C 600 515 625 470 665 480"
          fill="none"
          stroke="#FFE600"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 508 470 C 630 415 720 440 735 500 C 750 550 675 580 630 540 C 600 515 625 470 665 480"
          fill="none"
          stroke="#000000"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Untaian Kapas Kiri (17 Butir Kapas Kuning) */}
        <g fill="#FFE600" stroke="#000000" strokeWidth="4">
          <path d="M 345 220 C 370 195 385 220 370 240 C 350 255 330 235 345 220 Z" />
          <path d="M 310 265 C 335 240 350 265 335 285 C 315 300 295 280 310 265 Z" />
          <path d="M 280 315 C 305 290 320 315 305 335 C 285 350 265 330 280 315 Z" />
          <path d="M 252 370 C 277 345 292 370 277 390 C 257 405 237 385 252 370 Z" />
          <path d="M 228 430 C 253 405 268 430 253 450 C 233 465 213 445 228 430 Z" />
          <path d="M 205 495 C 230 470 245 495 230 515 C 210 530 190 510 205 495 Z" />
          <path d="M 188 565 C 213 540 228 565 213 585 C 193 600 173 580 188 565 Z" />
          <path d="M 178 640 C 203 615 218 640 203 660 C 183 675 163 655 178 640 Z" />
          <path d="M 175 715 C 200 690 215 715 200 735 C 180 750 160 730 175 715 Z" />
          <path d="M 180 785 C 205 760 220 785 205 805 C 185 820 165 800 180 785 Z" />
          <path d="M 195 850 C 220 825 235 850 220 870 C 200 885 180 865 195 850 Z" />
          <path d="M 225 905 C 250 880 265 905 250 925 C 230 940 210 920 225 905 Z" />
        </g>

        {/* Untaian Padi Kanan (Padi Kuning Berbutir Emas) */}
        <g fill="#FFE600" stroke="#000000" strokeWidth="4">
          <path d="M 655 220 C 675 200 705 215 690 240 C 675 260 640 240 655 220 Z" />
          <path d="M 690 265 C 715 245 740 260 725 285 C 705 305 675 285 690 265 Z" />
          <path d="M 720 315 C 745 295 770 310 755 335 C 735 355 705 335 720 315 Z" />
          <path d="M 748 370 C 775 350 800 365 785 390 C 765 410 735 390 748 370 Z" />
          <path d="M 772 430 C 800 410 825 425 810 450 C 790 470 760 450 772 430 Z" />
          <path d="M 795 495 C 825 475 850 490 835 515 C 815 535 780 515 795 495 Z" />
          <path d="M 812 565 C 840 545 865 560 850 585 C 830 605 795 585 812 565 Z" />
          <path d="M 822 640 C 850 620 875 635 860 660 C 840 680 805 660 822 640 Z" />
          <path d="M 825 715 C 850 695 875 710 860 735 C 840 755 805 735 825 715 Z" />
          <path d="M 820 785 C 845 765 870 780 855 805 C 835 825 800 805 820 785 Z" />
          <path d="M 805 850 C 830 830 855 845 840 870 C 820 890 785 870 805 850 Z" />
          <path d="M 775 905 C 800 885 825 900 810 925 C 790 945 755 925 775 905 Z" />
        </g>

        {/* Rumah Adat Tradisional Nias (Omo Hada / Omo Sebua) */}
        {/* Atap Rumbia Lengkung Coklat Tua */}
        <path
          d="M 440 512 C 430 570 375 625 350 662 L 650 662 C 625 625 570 570 560 512 Z"
          fill="#362216"
          stroke="#000000"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {/* Jendela Atap Kanan (Töla Gara) Putih Garis Hitam */}
        <polygon
          points="535,625 580,655 570,664 526,634"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Dinding Kayu Bundar Putih-Coklat dengan Bilah Kayu Vertikal */}
        <path
          d="M 380 662 L 388 722 L 612 722 L 620 662 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="6"
        />
        <line x1="432" y1="662" x2="435" y2="722" stroke="#5B3A29" strokeWidth="6" />
        <line x1="495" y1="662" x2="495" y2="722" stroke="#5B3A29" strokeWidth="6" />
        <line x1="560" y1="662" x2="558" y2="722" stroke="#5B3A29" strokeWidth="6" />
        <path
          d="M 388 722 L 398 738 L 602 738 L 612 722 Z"
          fill="#936037"
          stroke="#000000"
          strokeWidth="6"
        />

        {/* Tiang-tiang Penyangga Kayu (Tiang Ehomo) */}
        <g stroke="#000000" strokeWidth="7" fill="#362216">
          <rect x="403" y="738" width="12" height="36" />
          <rect x="438" y="738" width="12" height="36" />
          <rect x="466" y="738" width="12" height="36" />
          <rect x="502" y="738" width="12" height="36" />
          <rect x="530" y="738" width="12" height="36" />
          <rect x="565" y="738" width="12" height="36" />
          <line x1="412" y1="774" x2="445" y2="738" stroke="#362216" strokeWidth="5" />
          <line x1="548" y1="738" x2="573" y2="774" stroke="#362216" strokeWidth="5" />
        </g>

        {/* Pelataran Batu Putih (Batu Megalit / Chert Doli-doli Bertitik) */}
        <ellipse cx="500" cy="772" rx="160" ry="24" fill="#FFFFFF" stroke="#000000" strokeWidth="6" />
        <ellipse
          cx="500"
          cy="772"
          rx="145"
          ry="18"
          fill="none"
          stroke="#000000"
          strokeWidth="4"
          strokeDasharray="6 6"
        />
        <path
          d="M 340 772 C 340 790 400 802 500 802 C 600 802 660 790 660 772"
          fill="none"
          stroke="#000000"
          strokeWidth="6"
        />

        {/* Plakat Lengkung Berisi Semboyan HASAMBUA */}
        <path
          d="M 335 780 C 335 780 400 828 500 828 C 600 828 665 780 665 780 L 660 812 C 660 812 595 848 500 848 C 405 848 340 812 340 812 Z"
          fill="#351408"
          stroke="#FFE600"
          strokeWidth="5"
        />
        <text
          x="500"
          y="828"
          textAnchor="middle"
          fill="#FFE600"
          fontSize="36"
          fontWeight="900"
          fontFamily="serif"
          letterSpacing="8"
        >
          HASAMBUA
        </text>

        {/* Pita Hitam Bagian Bawah Bertuliskan NIAS BARAT */}
        {/* Gulungan Lipatan Pita Kiri & Kanan */}
        <path d="M 245 882 C 220 895 210 930 235 945 C 255 955 275 945 265 940 Z" fill="#9CA3AF" stroke="#000000" strokeWidth="5" />
        <path d="M 755 882 C 780 895 790 930 765 945 C 745 955 725 945 735 940 Z" fill="#9CA3AF" stroke="#000000" strokeWidth="5" />
        <path d="M 245 882 L 265 940 L 290 882 Z" fill="#6B7280" stroke="#000000" strokeWidth="4" />
        <path d="M 755 882 L 735 940 L 710 882 Z" fill="#6B7280" stroke="#000000" strokeWidth="4" />

        {/* Badan Pita Lengkung Hitam Bergaris Emas */}
        <path
          d="M 245 882 C 340 862 660 862 755 882 L 735 940 C 640 922 360 922 265 940 Z"
          fill="#000000"
          stroke="#FFE600"
          strokeWidth="5"
        />

        {/* Tulisan NIAS BARAT Huruf Kapital Putih Tebal */}
        <text
          x="500"
          y="922"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="48"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="6"
        >
          NIAS BARAT
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              SIPAD • Permendagri 20/2018
            </span>
          </div>
          <span className="text-base font-extrabold tracking-tight text-white leading-tight">
            Kecamatan Sirombu
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Kabupaten Nias Barat
          </span>
        </div>
      )}
    </div>
  );
};
