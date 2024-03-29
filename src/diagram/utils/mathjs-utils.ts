// This direct import of mathjs is just for the types. All the actual code is imported
// by custom-math.js which reduces the amount of mathjs code that is imported. 
// Importing the types like this doesn't seem to increase the size of the bundle.
import math, { SymbolNode } from "mathjs";
import * as pluralize from "pluralize";

import { processName } from "./validate";
import { addCustomUnit } from "../custom-mathjs-units";
import { IMathLib } from "../custom-mathjs";

export const getMathUnit = (value: number, unitString: string, mathLib: IMathLib): math.Unit | undefined => {
  try {
    // Look for unknown units in the unit string
    const unitNode = mathLib.parse(unitString);
    const symbols = unitNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
    for(const symbol of symbols) {
      // if the symbol isn't already a unit, make a unit for it
      if (!mathLib.Unit.isValuelessUnit(symbol.name)) {
        try {
          if (/^[a-zA-Z]\w*$/.test(symbol.name)) {
            const singular = pluralize.singular(symbol.name);
            const plural = pluralize.plural(symbol.name);
            if (mathLib.Unit.isValuelessUnit(singular) || mathLib.Unit.isValuelessUnit(plural)) {
              // If the singular or plural is already a unit, just add the base
              addCustomUnit(symbol.name);
              mathLib.createUnit(symbol.name);
            } else {
              // Otherwise, add them both as synonyms
              const options = { aliases: [plural] };
              addCustomUnit(singular, options);
              mathLib.createUnit(singular, options);
            }
          } else {
            addCustomUnit(symbol.name);
            mathLib.createUnit(symbol.name);
          }
        } catch (e: any) {
          console.log(`Error creating unit`, e);
        }
      }
    }
    return mathLib.unit(value, unitString);
  } catch (e: any) {
    // Do nothing just return undefined
  }
};

export const parseExpression = (expression: string, inputNames: (string | undefined)[], mathLib: IMathLib) => {
  const localExpression = expression;
  const inputsInExpression: string[] = [];

  try {
    const expressionNode = mathLib.parse(localExpression);
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
    // If there is parse error, return the original expression for now and
    // use a regex to find the input names in the expression.
    // Note there are slightly different subtract signs we need to handle.
    inputNames.forEach((name) => {
      if (name) {
        const variableRegex = new RegExp(`(^|[÷,×,+,-,-,/,*,),(,^])${processName(name)}([÷,×,+,-,-,/,*,(,),^]|$)`);
        if (name && variableRegex.test(localExpression)) {
          inputsInExpression.push(name);
        }
      }
    });
    return { expression: localExpression, inputsInExpression };
  }
};

export const replaceInputNames = (expression: string, inputNames: (string | undefined)[], mathLib: IMathLib) => {
  return parseExpression(expression, inputNames, mathLib).expression;
};

export const getUsedInputs = (expression: string, inputNames: (string | undefined)[], mathLib: IMathLib) => {
  return parseExpression(expression, inputNames, mathLib).inputsInExpression;
};
