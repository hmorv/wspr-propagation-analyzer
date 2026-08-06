export interface ParseIssue {
  lineNumber: number;
  line: string;
  reason: string;
}

export interface ParseResult<T> {
  records: T[];
  issues: ParseIssue[];
  blankLines: number;
  ignoredRecords: number;
  totalLines: number;
}