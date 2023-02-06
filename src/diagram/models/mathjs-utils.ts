// This direct import of mathjs is just for the types. All the actual code is imported
// by custom-math.js which reduces the amount of mathjs code that is imported. 
// Importing the types like this doesn't seem to increase the size of the bundle.
import math, { SymbolNode } from "mathjs";
import { unit, parse, createUnit, Unit } from "../custom-mathjs";
import * as pluralize from "pluralize";

export const getMathUnit = (value: number, unitString: string): math.Unit | undefined => {
  try {
    // Look for unknown units in the unit string
    const unitNode = parse(unitString);
    const symbols = unitNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
    for(const symbol of symbols) {
      // if the symbol isn't already a unit, make a unit for it
      if (!Unit.isValuelessUnit(symbol.name)) {
        if (/^[a-zA-Z]\w*$/.test(symbol.name)) {
          const singular = pluralize.singular(symbol.name);
          const plural = pluralize.plural(symbol.name);
          createUnit(singular, {aliases: [plural]});
        } else {
          createUnit(symbol.name);
        }
        // console.log(`Created unit: ${singular}(${plural})`);
      }
    }
    return unit(value, unitString);
  } catch (e: any) {
    // Do nothing just return undefined
  }
};

export const parseExpression = (expression: string, inputNames: (string | undefined)[]) => {
  const localExpression = expression;
  const inputsInExpression: string[] = [];

  try {
    const expressionNode = parse(localExpression);
    const symbols = expressionNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
    for(const symbol of symbols) {
      inputNames.forEach((name, index) => {
        if (symbol.name === name) {
          symbol.name = `input_${index}`;
          inputsInExpression.push(name);
        }
      });
    }
    return { expression: expressionNode.toString(), inputsInExpression };
  } catch (e) {
    // If there is parse error, return the original expression for now
    // and use a regex to find the input names in the expression.
    inputNames.forEach((name) => {
      const variableRegex = new RegExp(`(^|[÷,×,+,-,-,/,*])${name}[÷,×,+,-,-,/,*]`);
      if (name && variableRegex.test(localExpression)) {
        inputsInExpression.push(name);
      }
    });
    return { expression: localExpression, inputsInExpression };
  }
};

export const replaceInputNames = (expression: string, inputNames: (string | undefined)[]) => {
  return parseExpression(expression, inputNames).expression;
};

export const getUsedInputs = (expression: string, inputNames: (string | undefined)[]) => {
  return parseExpression(expression, inputNames).inputsInExpression;
};
