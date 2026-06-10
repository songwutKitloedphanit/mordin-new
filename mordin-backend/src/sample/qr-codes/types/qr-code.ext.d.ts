import { QrCode } from "../entities/qr-code.entity";

declare module "../entities/qr-code.entity" {
  interface QrCode {
    removedBy?: number;
  }
}
