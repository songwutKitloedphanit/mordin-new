import { User } from '../User';

import { StandardType } from './AnalysisStandards';
import {
  StandardCertificate,
  StandardCertificateInput,
  StandardCertificateUpdateInput,
} from './standardCertificate';
export interface Standard {
  standardId: number;
  standardName: string;
  updatedUid: number;
  updatedAt: number;
  updatedUser?: User;
  standardCertificates?: StandardCertificate[];
}
export interface StandardInput {
  standardName: string;
  standardCertificates: StandardCertificateInput[];
}
export interface StandardUpdateInput {
  standardName: string;
  standardCertificates: StandardCertificateUpdateInput[];
}
export interface StandardInfo {
  standardId: number;
  type: StandardType;
  standardName: string;
  updateUid: number;
  updatedAt: number;
  standardCertificates: StandardCertificate[];
}
