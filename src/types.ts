export interface Subject {
  name: string;
  total: number;
}

export interface SequenceMarks {
  [subject: string]: number | "";
}

export interface StudentMarks {
  firstSequence: SequenceMarks;
  secondSequence: SequenceMarks;
  thirdSequence: SequenceMarks;
  fourthSequence: SequenceMarks;
  fifthSequence: SequenceMarks;
  sixthSequence: SequenceMarks;
}

export interface SequenceResult {
  student: string;
  totalMarks: number;
  average: number;
  rank: number;
}

export interface TermResult {
  student: string;
  totalMarks: number;
  average: number;
  rank: number;
}

export interface AnnualResult {
  student: string;
  firstTermAverage: number;
  secondTermAverage: number;
  thirdTermAverage: number;
  finalAverage: number;
  rank: number;
}