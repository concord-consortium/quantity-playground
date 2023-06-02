import { VariableType } from "../models/variable";

function validInputs(variable: VariableType) {
  return variable.inputs.filter(input => !!input) as VariableType[];
}

// Returns true if possibleDescendent is dependent on possibleAncestor
function isAncestor(possibleAncestor: VariableType, possibleDescendant: VariableType) {
  console.log(`--- checking ancestry between ${possibleAncestor.id} and ${possibleDescendant.id}`);
  const ancestors = validInputs(possibleDescendant);
  const seenVariableIds: string[] = [];

  for (let i = 0; i < ancestors.length; i++) {
    const input = ancestors[i];
    if (!seenVariableIds.includes(input.id)) {
      seenVariableIds.push(input.id);

      if (input.id === possibleAncestor.id) {
        console.log(`${possibleAncestor.id} ancestor ${possibleDescendant.id}`, possibleAncestor, possibleDescendant);
        return true;
      } else {
        const ancestorInputs = validInputs(input);
        for (let j = 0; j < ancestorInputs.length; j++) {
          const ancestorInput = ancestorInputs[j];
          if (!seenVariableIds.includes(ancestorInput.id)) {
            ancestors.push(ancestorInput);
          }
        }
      }
    }
  }

  return false;
}

export function canAddInput(source: VariableType, target: VariableType) {
  console.log(`+++ canAddInput ${source.id} ${target.id}`);
  // Cannot connect to oneself
  if (target.id === source.id) return false;

  // Cannot add a connection if one already exists
  const inputVariableIds = (validInputs(target)).map(inputVariable => inputVariable.id);
  if (inputVariableIds.includes(source.id)) {
    console.log(` ++ ${source.id} among ${inputVariableIds}`);
    return false;
  }

  // Cannot add a connection if target is an ancestor of source.
  return !isAncestor(target, source);
}
