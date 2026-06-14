import { BaseSearchAndPaginationParams } from './common/BaseSearch';
import { Laboratory } from './Laboratory';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface standardSearch extends BaseSearchAndPaginationParams {}

export interface StandardCertificate {
  standardId: number;
  laboratoryId: number;
  certificateValue: number;
  laboratory: Laboratory;
}

export interface StandardInfo {
  standardId: number;
  standardName: string;
  updateUid: number;
  updatedAt: number;
  standardCertificates: StandardCertificate[];
}
