// This direct import of mathjs is just for the types. All the actual code is imported
// by custom-math.js which reduces the amount of mathjs code that is imported. 
// Importing the types like this doesn't seem to increase the size of the bundle.
import { SymbolNode } from "mathjs";

import { processName } from "./validate";

export interface IMathLib {
  simplify: math.Simplify;
  unit: any;
  parse: math.ParseFunction;
  createUnit: (name: string, definition?: string | math.UnitDefinition | undefined, options?: math.CreateUnitOptions | undefined) => math.Unit;
  evaluate: (expr: math.MathExpression | math.MathExpression[], scope?: object | undefined) => any;
  number: (value?: string | number | boolean | math.MathArray | math.Matrix | math.Unit | math.BigNumber | math.Fraction | null | undefined) => number | math.MathArray | math.Matrix;
  isUnit: (x: unknown) => x is math.Unit;
  Unit: any;
}

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
