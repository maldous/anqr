export function validatePriority(priority) {
  const priorityNum = Number.parseInt(priority, 10);
  if (Number.isNaN(priorityNum) || priorityNum < 0 || priorityNum > 4) {
    throw new Error("Priority must be a number between 0 and 4");
  }
  return priorityNum;
}
