export function falseIfFalse(value: boolean): false | undefined {
  return value === false ? false : undefined;
}
