export interface ResultInput {
  resultId: number | null;
  preValue: number | null;
}

export interface LabResult {
  id: string;
  examId: string;
  results: {
    shortNameBefore: string;
    resultId: number | null;
    preValue: string;
  }[];
}
