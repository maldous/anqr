/** Determine whether a conditional check applies to this record. */
export function shouldApplyConditional(record, condition) {
  switch (condition) {
    case "execution_success_with_push":
      return record.execution?.success === true && record.push != null;
    case "validation_ran":
      return record.validation != null;
    default:
      return false;
  }
}
