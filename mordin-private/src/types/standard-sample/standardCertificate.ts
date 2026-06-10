import { Laboratory } from '../Laboratory';
export interface StandardCertificate {
  standardId: number;
  laboratoryId: number;
  certificateValue: number;
  laboratory?: Laboratory;
}
export interface StandardCertificateInput {
  laboratoryId: number;
  certificateValue: number;
}

export interface StandardCertificateUpdateInput
  extends StandardCertificateInput {
  standardCertificateId: number;
}
