// Note: we can't use mathjs/number due to https://github.com/josdejong/mathjs/issues/2284
import { create, simplifyDependencies } from "mathjs";

// https://mathjs.org/docs/custom_bundling.html
const { simplify } = create({ simplifyDependencies });
export { simplify };
