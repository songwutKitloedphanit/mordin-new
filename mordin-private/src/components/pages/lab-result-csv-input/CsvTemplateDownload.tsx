import React from 'react';

interface CsvTemplateDownloadProps {
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  className?: string;
  children?: React.ReactNode;
}

const CsvTemplateDownload: React.FC<CsvTemplateDownloadProps> = ({
  headers,
  rows,
  fileName,
  className = '',
  children = 'ดาวน์โหลด CSV Template',
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();

    // ฟังก์ชัน escape cell
    const escapeCell = (field: string | number) => {
      // ช่องว่าง ให้ return ว่างเปล่า (no quotes)
      if (field === '') return '';
      const str = String(field).replace(/"/g, '""');
      // ถ้ามี comma, newline หรือ quote ให้ห่อด้วย ""
      if (/[,"\r\n]/.test(str)) {
        return `"${str}"`;
      }
      // ถ้าเป็นตัวเลขหรือสตริงธรรมดา ให้ return ตรงๆ
      return str;
    };

    // สร้าง CSV
    const allRows = [headers, ...rows];
    const csvContent = allRows
      .map(row => row.map(escapeCell).join(','))
      .join('\r\n');

    // ดาวน์โหลด
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <a href="#" className={className} onClick={handleDownload}>
      {children}
    </a>
  );
};

export default CsvTemplateDownload;
