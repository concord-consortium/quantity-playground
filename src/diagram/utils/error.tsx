// Contains data about different types of known errors and messages to display when they are encountered
import React from "react";

export interface IErrorMessage {
  errorMessage: string;
  variableName?: string;
}
export interface ErrorMessage {
  emoji?: string;
  short: string | JSX.Element;
  expanded?: string;
}

export const incompleteEmoji = "🫤";
export const incompleteShort = "Um, still working?";
export const incompleteExpanded = "Check for anything missing or extra in the expression.";
const getIncompleteErrorMessage = () => ({
  emoji: incompleteEmoji,
  short: incompleteShort,
  expanded: incompleteExpanded
});

const unknownSymbolMessageStart = "Undefined symbol ";
export const unknownSymbolEmoji = "🤔";
export const unknownSymbolShort = "Hmm, what is ";
export const unknownSymbolExpanded = "If it's a variable, create and link it to this card.";
const getUnknownSymbolErrorMessage = (symbol: string) => ({
  emoji: unknownSymbolEmoji,
  short: <span>{unknownSymbolShort}<strong>{symbol}</strong>?</span>,
  expanded: unknownSymbolExpanded
});

export const incompatibleUnitsEmoji = "😮";
export const incompatibleUnitsShort = "Oh, unit trouble?";
export const incompatibleUnitsExpanded = "Adjust the units and/or operations to make them compatible.";
const getIncompatibleUnitsErrorMessage = () => ({
  emoji: incompatibleUnitsEmoji,
  short: incompatibleUnitsShort,
  expanded: incompatibleUnitsExpanded
});

const getUnknownErrorMessage = (errorMessage: string) => ({
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
    return getIncompleteErrorMessage();
  } else if (args.errorMessage.startsWith("Function unaryPlus missing in provided namespace")) {
    return getIncompleteErrorMessage();
  } else if (args.errorMessage.startsWith(unknownSymbolMessageStart)) {
    const symbol = args.errorMessage.split(unknownSymbolMessageStart)[1];
    return getUnknownSymbolErrorMessage(symbol);
  } else if (args.errorMessage.startsWith("Units do not match")) {
    // Old comment from models/variable.ts
    // If we have to throw an exception we should update MathJS to provide
    // more information here. For other errors, MathJS provides a data
    // property on the error that includes the character location and more
    // info about the error.
    return getIncompatibleUnitsErrorMessage();
  } else if (args.errorMessage.startsWith("Unexpected type of argument")) {
    // Old comment from models/variable.ts
    // This can happen when a unit-less value is added or subtracted from a
    // value with a unit. We could provide more information about this if we
    // want to. When supporting generic expressions we probably will want to.
    return getIncompatibleUnitsErrorMessage();
  }
  return getUnknownErrorMessage(args.errorMessage);
}
