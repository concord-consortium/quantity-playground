// Contains data about different types of known errors and messages to display when they are encountered

export interface IErrorMessage {
  errorMessage: string;
  variableName?: string;
}
export interface ErrorMessage {
  emoji?: string;
  short: string;
  expanded?: string;
}

// 🤔😮
export const incompleteEmoji = "🫤";
export const incompleteShort = "Um, still working?";
export const incompleteExpanded = "Check for anything missing or extra in the expression";
const getIncompleteErrorMessage = (args: IErrorMessage) => ({
  emoji: incompleteEmoji,
  short: incompleteShort,
  expanded: incompleteExpanded
});
const getUnknownErrorMessage = ({ errorMessage }: IErrorMessage) => ({
  emoji: "",
  short: `Unknown error`,
  expanded: errorMessage
});

export function basicErrorMessage(originalMessage: string) {
  return {
    short: `Warning: ${originalMessage}`
  };
}

export function getErrorMessage(args: IErrorMessage) {
  if (args.errorMessage.startsWith("Unexpected end of expression")) {
    return getIncompleteErrorMessage(args);
  } else if (args.errorMessage.startsWith("Function unaryPlus missing in provided namespace")) {
    return getIncompleteErrorMessage(args);
  }
  return getUnknownErrorMessage(args);
}
