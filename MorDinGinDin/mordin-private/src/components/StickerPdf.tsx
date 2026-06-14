// components/StickerPdf.tsx
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import QRCode from 'qrcode';
import React from 'react';

const mm = (val: number) => val * 2.83465;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: mm(5),
  },
  sticker: {
    width: mm(105),
    height: mm(74.25),
    border: '1pt solid black',
    padding: mm(5),
    position: 'relative',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  qrCode: {
    position: 'absolute',
    top: mm(5),
    right: mm(5),
    width: mm(25),
    height: mm(25),
  },
  text: {
    marginBottom: mm(1),
    lineHeight: 1.4,
  },
});

const Sticker = ({ qrCodeValue }: { qrCodeValue: string }) => {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');

  React.useEffect(() => {
    QRCode.toDataURL(qrCodeValue, { margin: 1, width: 100 }).then(setQrDataUrl);
  }, [qrCodeValue]);

  if (!qrDataUrl) return null;

  return (
    <View style={styles.sticker}>
      {/* <Text style={styles.text}>ชื่อชาวไร่..............................................</Text> */}
      <Text style={styles.text}>
        Name..............................................
      </Text>
      <Text style={styles.text}>
        เบอร์ติดต่อ..............................................
      </Text>
      <Text style={styles.text}>
        หมายเลขแปลง...........................................
      </Text>
      <Text style={styles.text}>
        ชื่อตัวอย่าง...............................................
      </Text>
      <Text style={styles.text}>☐ อ้อยปลูก ☐ อ้อยตอ</Text>
      <Text style={styles.text}>
        เขต.......................... โรงงาน......................
      </Text>
      <Text style={styles.text}>
        วันที่เก็บ.................. อำเภอ......................
      </Text>

      {/* ใช้ Image ของ react-pdf */}
      <Image style={styles.qrCode} src={qrDataUrl} />
    </View>
  );
};

const StickerPdf = ({ qrList }: { qrList: string[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {qrList.map((qr, i) => (
        <Sticker key={i} qrCodeValue={qr} />
      ))}
    </Page>
  </Document>
);

export default StickerPdf;
