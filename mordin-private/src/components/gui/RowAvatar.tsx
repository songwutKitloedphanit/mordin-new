import React from 'react';

// สีวงกลม avatar — โทนเดียวกับ palette ของระบบ (mockup .row-avatar)
const AVATAR_COLORS = [
  '#005092',
  '#18a05c',
  '#d98f0c',
  '#0aa2c0',
  '#7a5af5',
  '#d9483b',
  '#3b9bd9',
  '#2fb380',
];

const colorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface RowAvatarProps {
  name: string;
  sub?: React.ReactNode;
  hideAvatar?: boolean;
}

/**
 * เซลล์ชื่อในตาราง: วงกลม avatar สีจากชื่อ + ชื่อตัวหนา + บรรทัดรองสีเทา
 * ใช้ในตารางรายชื่อ (ชาวไร่ / ผู้ใช้งาน) ตามดีไซน์ mockup
 */
const RowAvatar: React.FC<RowAvatarProps> = ({ name, sub, hideAvatar }) => {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="d-flex align-items-center gap-2">
      {!hideAvatar && (
        <span
          className="private-row-avatar"
          style={{ backgroundColor: colorFromName(name) }}
          aria-hidden
        >
          {initial}
        </span>
      )}
      <span className="min-w-0">
        <span className="private-row-main d-block text-truncate">{name}</span>
        {sub != null && sub !== '' && (
          <span className="private-row-sub d-block text-truncate">{sub}</span>
        )}
      </span>
    </div>
  );
};

export default RowAvatar;
