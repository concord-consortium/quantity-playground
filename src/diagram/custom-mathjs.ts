// Note: we can't use mathjs/number due to https://github.com/josdejong/mathjs/issues/2284
import { create, simplifyDependencies, unitDependencies,
  parseDependencies, evaluateDependencies, toDependencies,
  createUnitDependencies } from "mathjs";

import { UnitsManager } from "./units-manager";
import { IMathLib } from "./utils/mathjs-utils";

export function createMath(unitsManager: UnitsManager): IMathLib {
  // This reduces the size of the bundle, see:
  // https://mathjs.org/docs/custom_bundling.html
  const m = create({ simplifyDependencies, unitDependencies, parseDependencies,
    evaluateDependencies, toDependencies, createUnitDependencies });

  // When adding new features you might want to comment out the statements above and
  // uncomment these 2 lines below. This way all of mathjs is available. After the
  // code is working you can go back and figure out what specific dependencies are
  // needed.
  // import { create , all } from "mathjs";
  // const m = create({ all });

  const mathUnit = unitsManager.initializeMath(m);

  return {
    simplify: m.simplify,
    unit: m.unit,
    parse: m.parse,
    createUnit: m.createUnit,
    evaluate: m.evaluate,
    number: m.number,
    isUnit: m.isUnit,
    Unit: mathUnit
  };
}
