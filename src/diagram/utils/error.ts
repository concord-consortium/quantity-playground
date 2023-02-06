// Contains data about different types of known errors and messages to display when they are encountered

enum VariableErrors {
  incomplete = "incomplete",
  unknown = "unknown"
}

export interface IErrorMessage {
  errorMessage: string;
  variableName?: string;
}
export interface ErrorMessage {
  emoji?: string;
  short: (args: IErrorMessage) => string;
  expanded?: (args: IErrorMessage) => string;
}

export const errorMessages = {
  [VariableErrors.incomplete]: {
    emoji: ":face_with_diagonal_mouth:",
    short: (args: IErrorMessage) => "Um, still working?",
    expanded: (args: IErrorMessage) => "Check for anything missing or extra in the expression"
  },
  [VariableErrors.unknown]: {
    emoji: "",
    short: (args: IErrorMessage) => "Unknown error",
    expanded: (args: IErrorMessage) => args.errorMessage
  }
};

export function getErrorMessage(originalMessage: string) {
  if (originalMessage.startsWith("Unexpected end of expression")) {
    return errorMessages[VariableErrors.incomplete];
  } else if (originalMessage.startsWith("Function unaryPlus missing in provided namespace")) {
    return errorMessages[VariableErrors.incomplete];
  }
  return errorMessages[VariableErrors.unknown];
}

export function getCompactErrorMessage(originalMessage: string) {
  const error = getErrorMessage(originalMessage);
  return {error: `${error.emoji} ${error.short({ errorMessage: originalMessage })}`};
}
