import { simplify } from "../custom-mathjs";


export function tryToSimplify(operation: "÷" | "×", inputAUnit?: string, inputBUnit?: string) {
    if (!inputAUnit && !inputBUnit) {
        // If there is no unit on both inputs then return no unit
        // and don't show the "units cancel" message
        return {};
    }

    const aUnit = inputAUnit || "1";
    const bUnit = inputBUnit || "1";

    let newUnit = "";
    switch (operation) {
        case "÷":
            newUnit = `(${aUnit})/(${bUnit})`;
            break;
        case "×":
            newUnit = `(${aUnit})*(${bUnit})`;
            break;
        default:
            break;
    }

    try {
        const result = simplify(newUnit).toString();
        if (result === "1") {
            return { message: "units cancel" };
        }
        return { unit: result };
    } catch (error) {
        return { error: "cannot simplify combined unit" };
    }
}
