import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * 1. NotionOfficerDesk - Hero illustration of an officer working at a modern desk
 * with laptop, certificate document, coffee, and ambient plant.
 */
export const NotionOfficerDesk: React.FC<IllustrationProps> = ({ className = 'w-48 h-48', size }) => (
  <svg
    viewBox="0 0 240 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Ambient shadow */}
    <ellipse cx="120" cy="180" rx="90" ry="8" fill="#F1F5F9" />

    {/* Modern Desk */}
    <rect x="25" y="135" width="190" height="8" rx="4" fill="#0F172A" />
    <path d="M45 143V180" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    <path d="M195 143V180" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

    {/* Coffee Cup */}
    <rect x="42" y="122" width="12" height="13" rx="2" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2" />
    <path d="M54 126C57 126 58 129 57 131C56 133 54 133 54 133" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M45 116C46 114 47 115 48 113" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Laptop */}
    <path d="M75 118L95 118L100 135L70 135Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
    <rect x="75" y="100" width="28" height="20" rx="2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <circle cx="89" cy="110" r="3" fill="#F59E0B" />

    {/* Official Certificate on Stand */}
    <rect x="155" y="92" width="38" height="43" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <rect x="159" y="96" width="30" height="35" rx="1.5" stroke="#B8860B" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="163" y1="102" x2="185" y2="102" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="163" y1="107" x2="181" y2="107" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
    <line x1="163" y1="112" x2="175" y2="112" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
    {/* QR code spot */}
    <rect x="163" y="118" width="8" height="8" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
    {/* Gold Seal */}
    <circle cx="182" cy="122" r="4" fill="#F59E0B" stroke="#0F172A" strokeWidth="1" />
    {/* Stand */}
    <path d="M174 135L174 140" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

    {/* Notion Character (Officer) */}
    {/* Body */}
    <path d="M115 118C108 122 105 130 105 142H145C145 130 142 122 135 118" fill="#0F172A" />
    {/* Collar */}
    <path d="M121 118L125 125L129 118" fill="#FFFFFF" />
    {/* Arms */}
    <path d="M106 128L88 135" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    <path d="M144 128L158 135" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    {/* Head */}
    <circle cx="125" cy="98" r="14" fill="#FDE68A" stroke="#0F172A" strokeWidth="2" />
    {/* Hair */}
    <path d="M112 95C112 86 118 84 127 84C136 84 140 88 139 96C135 91 127 92 120 95C116 97 114 96 112 95Z" fill="#0F172A" />
    {/* Glasses */}
    <circle cx="121" cy="98" r="3.5" stroke="#0F172A" strokeWidth="1.5" fill="#FFFFFF" />
    <circle cx="129" cy="98" r="3.5" stroke="#0F172A" strokeWidth="1.5" fill="#FFFFFF" />
    <line x1="124.5" y1="98" x2="125.5" y2="98" stroke="#0F172A" strokeWidth="1.5" />
    {/* Smile */}
    <path d="M123 105C124.5 106.5 126.5 106.5 128 105" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />

    {/* Ambient plant on left */}
    <path d="M18 165C18 155 24 148 30 152C32 158 26 168 18 165Z" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
    <path d="M22 170C24 160 32 156 36 162C36 168 28 174 22 170Z" fill="#34D399" stroke="#0F172A" strokeWidth="1.5" />
    <rect x="22" y="165" width="10" height="15" rx="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
  </svg>
);

/**
 * 2. NotionBatchIntake - Step 1: Training Centre CSV Intake
 * Character filing candidate sheets into batch folder.
 */
export const NotionBatchIntake: React.FC<IllustrationProps> = ({ className = 'w-36 h-36', size }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    {/* Soft ground shadow */}
    <ellipse cx="80" cy="145" rx="55" ry="6" fill="#F1F5F9" />

    {/* Folder */}
    <path d="M35 70C35 66 38 63 42 63H62L70 71H120C124 71 127 74 127 78V125C127 129 124 132 120 132H42C38 132 35 129 35 125V70Z" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.5" />
    
    {/* CSV Candidate Spreadsheet Sheet */}
    <g transform="translate(50, 35)">
      <rect x="0" y="0" width="60" height="75" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
      <rect x="6" y="8" width="16" height="5" rx="1" fill="#10B981" />
      <line x1="26" y1="10" x2="52" y2="10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Table rows */}
      <line x1="6" y1="22" x2="54" y2="22" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="8" y="27" width="18" height="4" rx="1" fill="#0F172A" />
      <rect x="30" y="27" width="22" height="4" rx="1" fill="#E2E8F0" />

      <line x1="6" y1="36" x2="54" y2="36" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="8" y="41" width="14" height="4" rx="1" fill="#0F172A" />
      <rect x="26" y="41" width="26" height="4" rx="1" fill="#E2E8F0" />

      <line x1="6" y1="50" x2="54" y2="50" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="8" y="55" width="20" height="4" rx="1" fill="#0F172A" />
      <rect x="32" y="55" width="18" height="4" rx="1" fill="#E2E8F0" />
      
      {/* 100% Valid Badge */}
      <circle cx="52" cy="65" r="7" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
      <path d="M49 65L51 67L55 63" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Sparkles */}
    <path d="M25 45L27 49L31 51L27 53L25 57L23 53L19 51L23 49Z" fill="#F59E0B" />
  </svg>
);

/**
 * 3. NotionTwoOfficerConsensus - Step 2: District Consensus (2 Officers)
 * Two Notion officers holding hands or collaborating with dual checkmarks.
 */
export const NotionTwoOfficerConsensus: React.FC<IllustrationProps> = ({ className = 'w-36 h-36', size }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <ellipse cx="80" cy="142" rx="60" ry="6" fill="#F1F5F9" />

    {/* Officer 1 (Dev) */}
    <g transform="translate(25, 40)">
      <circle cx="30" cy="25" r="13" fill="#FDE68A" stroke="#0F172A" strokeWidth="2" />
      <path d="M19 22C19 14 24 12 32 12C39 12 43 15 42 22C38 18 32 19 26 22Z" fill="#0F172A" />
      <circle cx="26" cy="25" r="1.5" fill="#0F172A" />
      <circle cx="33" cy="25" r="1.5" fill="#0F172A" />
      <path d="M28 29C29.5 30 31 30 32 29" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20 45C14 49 12 58 12 70H48C48 58 46 49 40 45" fill="#0F172A" />
      <circle cx="30" cy="53" r="5" fill="#10B981" />
      <path d="M28 53L29.5 54.5L32 51.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Central Shield with '2/2' */}
    <g transform="translate(68, 65)">
      <path d="M12 2L22 6V16C22 22 17 28 12 31C7 28 2 22 2 16V6L12 2Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
      <path d="M7 15L10 18L17 11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Officer 2 (Meera) */}
    <g transform="translate(85, 40)">
      <circle cx="25" cy="25" r="13" fill="#FED7AA" stroke="#0F172A" strokeWidth="2" />
      <path d="M13 26C12 16 19 12 27 12C35 12 39 17 38 28C34 23 29 23 22 26Z" fill="#7C2D12" />
      <circle cx="21" cy="25" r="1.5" fill="#0F172A" />
      <circle cx="28" cy="25" r="1.5" fill="#0F172A" />
      <path d="M23 29C24.5 30 26 30 27 29" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 45C9 49 7 58 7 70H43C43 58 41 49 35 45" fill="#1E293B" />
      <circle cx="25" cy="53" r="5" fill="#10B981" />
      <path d="M23 53L24.5 54.5L27 51.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * 4. NotionQualityAudit - Step 3: Quality Scrutiny & State Authorization
 * Auditor with magnifying glass & sovereign gold seal.
 */
export const NotionQualityAudit: React.FC<IllustrationProps> = ({ className = 'w-36 h-36', size }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <ellipse cx="80" cy="142" rx="55" ry="6" fill="#F1F5F9" />

    {/* Document on desk */}
    <rect x="35" y="45" width="65" height="85" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
    <line x1="45" y1="60" x2="85" y2="60" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    <line x1="45" y1="70" x2="78" y2="70" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="45" y1="80" x2="82" y2="80" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="45" y1="90" x2="70" y2="90" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Big Gold Sovereign Stamp */}
    <circle cx="75" cy="108" r="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
    <circle cx="75" cy="108" r="10" fill="#F59E0B" />
    <path d="M72 108L74 110L78 106" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Magnifying Glass */}
    <g transform="translate(80, 50)">
      <circle cx="25" cy="25" r="18" fill="#E0F2FE" fillOpacity="0.8" stroke="#0F172A" strokeWidth="3" />
      <path d="M38 38L55 55" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="21" cy="21" r="3" fill="#FFFFFF" />
    </g>

    {/* Sparkles */}
    <path d="M22 65L24 69L28 71L24 73L22 77L20 73L16 71L20 69Z" fill="#F59E0B" />
  </svg>
);

/**
 * 5. NotionMobileDelivery - Step 4: WhatsApp Instant Delivery to Candidate
 * Smartphone with verified certificate alert and QR code.
 */
export const NotionMobileDelivery: React.FC<IllustrationProps> = ({ className = 'w-36 h-36', size }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <ellipse cx="80" cy="145" rx="50" ry="6" fill="#F1F5F9" />

    {/* Smartphone Frame */}
    <rect x="48" y="25" width="64" height="115" rx="14" fill="#0F172A" />
    <rect x="52" y="32" width="56" height="100" rx="10" fill="#F8FAFC" />

    {/* Camera Notch & Speaker */}
    <rect x="70" y="28" width="20" height="2.5" rx="1" fill="#334155" />

    {/* WhatsApp Chat Bubble */}
    <g transform="translate(56, 42)">
      <rect x="0" y="0" width="48" height="42" rx="6" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
      <rect x="4" y="6" width="30" height="4" rx="1" fill="#15803D" />
      <rect x="4" y="13" width="40" height="3" rx="1" fill="#4ADE80" />
      <rect x="4" y="18" width="35" height="3" rx="1" fill="#4ADE80" />
      {/* Verify Link Button */}
      <rect x="4" y="25" width="40" height="12" rx="3" fill="#0F172A" />
      <rect x="10" y="29" width="28" height="3" rx="1" fill="#FFFFFF" />
    </g>

    {/* Miniature Verified Certificate Floating */}
    <g transform="translate(62, 92)">
      <rect x="0" y="0" width="36" height="32" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
      {/* QR */}
      <rect x="4" y="4" width="10" height="10" fill="#0F172A" />
      <rect x="6" y="6" width="6" height="6" fill="#FFFFFF" />
      <rect x="7" y="7" width="4" height="4" fill="#0F172A" />
      {/* Verified seal */}
      <circle cx="26" cy="16" r="6" fill="#F59E0B" />
      <path d="M24 16L25.5 17.5L28 15" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* WhatsApp Icon Badge */}
    <circle cx="108" cy="40" r="11" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M104 42C104 38 107 36 110 36C112 36 114 38 114 40C114 43 111 44 110 44V45" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * 6. NotionEmptyState - Cozy character relaxing with coffee: "All Clear! No pending reviews."
 */
export const NotionEmptyState: React.FC<IllustrationProps> = ({ className = 'w-40 h-40', size }) => (
  <svg
    viewBox="0 0 180 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <ellipse cx="90" cy="142" rx="65" ry="6" fill="#F1F5F9" />

    {/* Desk */}
    <rect x="25" y="115" width="130" height="6" rx="3" fill="#0F172A" />
    <path d="M40 121V145" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M140 121V145" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

    {/* Empty Inbox Tray with Green Checkmark */}
    <path d="M45 95H75L80 105H100L105 95H135V115H45V95Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
    <circle cx="90" cy="85" r="14" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
    <path d="M85 85L88 88L95 81" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Coffee Mug steaming */}
    <rect x="125" y="100" width="12" height="15" rx="2" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2" />
    <path d="M137 104C140 104 141 107 140 109C139 111 137 111 137 111" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M129 94C130 92 131 93 132 91" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

    {/* "All Clear" banner */}
    <rect x="62" y="125" width="56" height="14" rx="7" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
    <circle cx="70" cy="132" r="3" fill="#10B981" />
    <line x1="77" y1="132" x2="108" y2="132" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * 7. NotionWelcomeCard - Warm Notion avatar badge for dashboard greeting
 */
export const NotionWelcomeOfficer: React.FC<IllustrationProps> = ({ className = 'w-24 h-24', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
    {/* Officer Head */}
    <circle cx="50" cy="42" r="18" fill="#FDE68A" stroke="#0F172A" strokeWidth="2.5" />
    {/* Hair */}
    <path d="M34 40C33 28 42 22 52 22C63 22 68 28 66 38C61 32 52 33 44 38C40 40 37 41 34 40Z" fill="#0F172A" />
    {/* Eyes & Smile */}
    <circle cx="45" cy="43" r="2" fill="#0F172A" />
    <circle cx="55" cy="43" r="2" fill="#0F172A" />
    <path d="M47 50C48.5 52 51.5 52 53 50" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    {/* Body */}
    <path d="M32 78C32 66 38 62 50 62C62 62 68 66 68 78" fill="#0F172A" />
    <path d="M46 62L50 69L54 62" fill="#FFFFFF" />
    <circle cx="50" cy="74" r="3" fill="#F59E0B" />
  </svg>
);
