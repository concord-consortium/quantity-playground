import { CreateUnitOptions, SymbolNode } from "mathjs";
import { action, makeObservable, observable } from "mobx";
import * as pluralize from "pluralize";
import { IMathLib } from "./utils/mathjs-utils";

export interface IUnit {
  unit: string;
  options?: CreateUnitOptions;
}

export class UnitsManager {
  // A list of custom units added to mathjs. This list will grow as a user adds custom units.
  // Built-in custom units can also be added here. They should look like:
  // { unit: "cat", options: { aliases: ["cats"] } }
  units: IUnit[] = observable.array<IUnit>();

  constructor() {
    makeObservable(this);
  }

  @action
  addUnit(unit: string, options?: CreateUnitOptions) {
    if (this.units.find((iunit: IUnit) => iunit.unit === unit)) return;
    this.units.push({ unit, options });   
  }

  // This is not an action because we want changes in the units to be observed
  // and trigger initializeMath to be run again
  initializeMath(m: math.MathJsStatic) {
    // The types don't give access to the Unit class object, but it is there.
    const mathUnit = (m as any).Unit;

    const isAlphaOriginal = mathUnit.isValidAlpha;
    mathUnit.isValidAlpha = function (c: string): boolean {
      return isAlphaOriginal(c) || c === "$";
    };
  
    deleteUnits.forEach((u: string) => mathUnit.deleteUnit(u));
    this.units.forEach((u: IUnit) => {
      // createUnit has two versions:
      //   createUnit(name: string, definition?: string | UnitDefinition, options?: CreateUnitOptions): Unit;
      //   createUnit(units: Record<string, string | UnitDefinition>, options?: CreateUnitOptions): Unit;
      // If u.options is undefined and we call `m.createUnit(u.unit, u.options);` Typescript's overloading
      // support fails for some reason. So this is split out to 2 function calls.
      if (u.options) {
        m.createUnit(u.unit, u.options);
      } else {
        m.createUnit(u.unit);
      }
    });

    return mathUnit;
  }

  // NOTE: this is both an action and a view. It is called by MST views to get the math.Unit
  // object. At the same time is possibly adding units to the units array of `this`. The addition
  // of these new units triggers updates in other views that are observing the units via the 
  // initializeMath method above.
  // The `getMathUnit` function does not actually "read" any observable state. So it is OK that it is treated
  // as an action by MobX.
  //
  // The interaction of this within the full system is complex. Below is a list of what happens current.
  // However if the code is changed slightly, this might be out of date. When a equation is entered that uses
  // an input variable that has units:
  // - `computedValueIncludingMessageAndError` called on equation variable 
  // - this calls `mathValue` on the input variable
  // - `mathValue` calls `self.math` which causes `unitsManager.initializeMath` to be called on the 
  //   mathLib of the input variable.
  // - then `unitsManager.getMathUnit` is called with this mathLib from the input variable
  // - this adds the units of the input variable to the unitsManager.units array.
  // - a temporary `mathValue` is returned for the input variable
  // - `computedValueIncludingMessageAndError` returns a value for the equation variable.
  // - because the units array was updated, and `self.math` is used by `mathValue`, both this triggers
  //   any observers of the mathValue to be recomputed.
  // - this includes the `computedValueIncludingMessageAndError` on the equation variable.
  // - because of this, `unitsManager.getMathUnit` is called again, but this time the units exist
  //   so an endless loop does not happen.
  // 
  // TODO: Find a way to separate the action and view so the complex interaction above is simplified.
  // With the current setup I think the only way to do that is to add the units to the UnitsManager
  // as they are defined in the variables. And if we do that we probably should also clean up units
  // that are no longer used by variables. With that change, this `getMathUnit` could just be a 
  // "view".
  @action
  getMathUnit(value: number, unitString: string, mathLib: IMathLib): math.Unit | undefined {
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
                this.addUnit(symbol.name);
                // NOTE: this `createUnit` call and the 2 other below are only adding the unit to the passed 
                // in mathLib. Each variable has its own mathLib, so the other variable's mathLibs are not be
                // updated here.
                // The system relies on MobX observing for those other variables to update their mathLibs
                // when a new unit is added by the `this.addUnit` above.
                mathLib.createUnit(symbol.name);
              } else {
                // Otherwise, add them both as synonyms
                const options = { aliases: [plural] };
                this.addUnit(singular, options);
                mathLib.createUnit(singular, options);
              }
            } else {
              this.addUnit(symbol.name);
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
  }  
}


// A list of built-in units to delete.
export const deleteUnits = [
  // Length
  "link", "links", "li", "rod", "rods", "rd", "chain", "chains", "ch",
  "angstrom", "angstroms", "mil",

  // Surface area
  "sqch", "sqmil",

  // Volume
  "l", "lt",

  // Liquid volume
  "minim", "minims", "fluiddram", "fluiddrams", "fldr", "gill", "gills", "gi", "cp", "beerbarrel",
  "beerbarrels", "bbl", "oilbarrel", "oilbarrels", "obl", "hogshead", "hogsheads", "drop", "gtt",

  // Angles
  "grad", "gradian", "gradians", "cycle", "cycles", "arcsec", "arcsecond", "arcseconds",
  "arcmin", "arcminute", "arcminutes",

  // Frequency
  "Hertz", "Hz", "hertz",

  // Mass
  "grain", "grains", "gr", "dram", "drams", "dr", "lbm", "hundredweight", "hundredweights", "cwt",
  "stick", "sticks", "stone",

  // Electric current
  "A", "ampere", "amperes",

  // Temperature
  "rankine", "degR",

  // Amount of substance
  "mol", "mole", "moles",

  // Luminous intensity
  "cd", "candela",

  // Force
  "N", "newton", "dyn", "dyne", "lbf", "poundforce", "kip", "kips", "kilogramforce", "kgf",

  // Energy
  "J", "joule", "joules", "erg", "Wh", "BTU", "BTUs", "eV", "electronvolt", "electronvolts",

  // Power
  "W", "watt", "watts", "hp",

  // Electrical power units
  "VAR", "VA",

  // Pressure
  "PA", "psi", "atm", "bar", "torr", "mmHg", "mmhg", "mmH2O", "mmh2o", "cmH2O", "cmh2o",

  // Electricity and magnetism
  "coulomb", "coulombs", "C", "farad", "farads", "F", "volt", "volts", "V", "ohm", "ohms",
  "henry", "H", "siemens", "S", "weber", "webers", "Wb", "tesla", "teslas", "T",

  // Binary
  "b", "bit", "bits", "B", "byte", "bytes",
];
