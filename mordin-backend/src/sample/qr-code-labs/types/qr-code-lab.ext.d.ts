import { QrCodeLab } from "../entities/qr-code-lab.entity";

declare module "../entities/qr-code-lab.entity.ts" {
    interface QrCodeLab {
        removedBy?: number;
    }
}