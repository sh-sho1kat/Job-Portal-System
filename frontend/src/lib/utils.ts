import { twMerge, type ClassNameValue } from "tailwind-merge";

export type ClassValue = ClassNameValue;

export function cn(...inputs: ClassValue[]) {
  return twMerge(...inputs);
}

export function mergeClassName<State>(
  baseClassName: string,
  className: string | ((state: State) => string | undefined) | undefined,
) {
  return typeof className === "function"
    ? (state: State) => cn(baseClassName, className(state))
    : cn(baseClassName, className);
}
