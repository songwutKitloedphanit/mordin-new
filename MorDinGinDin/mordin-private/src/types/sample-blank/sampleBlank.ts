import { CalendarInfoInterface } from '../ServiceCalendar';

import {
  sampleBlankResultInput,
  sampleBlankResultInfo,
} from './sampleBlankResult';

export interface SampleBlankInput {
  serviceCalendarId: number;
  name: string;
  repeatCount: number;
  type: SampleBlankType;
  sampleBlankResult: sampleBlankResultInput[];
}

export interface SampleBlankInfoInterface {
  sampleBlankId: number;
  serviceCalendarId: number;
  name: string;
  repeatCount: number;
  type: SampleBlankType;
  sampleBlankResult: sampleBlankResultInfo[];
  serviceCalendar: CalendarInfoInterface;
}

export enum SampleBlankType {
  SAMPLE = 'sample',
  BLANK = 'blank',
}
