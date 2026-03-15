export function undefinedIfEqual<T>(value: T, defaultValue: T): T | undefined {
  return value === defaultValue ? undefined : value;
}

export function undefinedIfFalsy<T>(value: T): T | undefined {
  return value || undefined;
}

export function trueIfTrue(value: boolean): true | undefined {
  return value ? true : undefined;
}

export function falseIfFalse(value: boolean): false | undefined {
  return value === false ? false : undefined;
}

export function undefinedUnless<T>(condition: boolean, value: T): T | undefined {
  return condition ? value : undefined;
}
