export function validatePriority(priority) {
  const priorityNum = parseInt(priority, 10);
  if (isNaN(priorityNum) || priorityNum < 0 || priorityNum > 4) {
    throw new Error("Priority must be a number between 0 and 4");
  }
  return priorityNum;
}
