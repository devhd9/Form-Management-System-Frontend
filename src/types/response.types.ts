export interface UserFormResponseRequestPayload {
  assignmentId: string;
  //   For text, multiple_choice questions the answer will be string.
  //   For checkbox questions the answer will be string answers as CSV.
  answer: string;
}
