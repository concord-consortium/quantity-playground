type ConversionFunction = (input: number) => number;

export const getUnitConversion = (inputUnit:string, outputUnit:string): ConversionFunction | null => {
  
  if (inputUnit === outputUnit) {
      return value => value;
  }

  const combined = `${inputUnit}-${outputUnit}`;
  switch (combined) {
      case "m-cm":
          return value => value * 100;
          break;
      case "minutes-seconds":
          return value => value * 60;

      default:
          break;
  }

  // if no conversion is found return null
  return null;
};
