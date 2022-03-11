import { create, simplifyDependencies } from "mathjs";

// https://mathjs.org/docs/custom_bundling.html
const { simplify } = create({ simplifyDependencies });
export { simplify };
