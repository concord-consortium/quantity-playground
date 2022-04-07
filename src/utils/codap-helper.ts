/**
 * Functions that support integration with CODAP
 */
import codapInterface from "../lib/CodapInterface";

type CodapRequest = {
    action: "get"|"create"|"update"|"delete",
    resource: string,
    values?: any
}
type CodapReply = {
    success: boolean,
    values: any
};
type QPVariable = {
    id: string,
    name?: string,
    unit?: string,
    inputA?: string,
    inputB?: string,
    operation?: "+"|"-"|"×"|"÷"
};
type CodapAttribute = {
    name: string,
    cid?: string,
    id?: number,
    unit?: string,
    type?: string,
    description?: string
}
type CodapDataset = {
    name: string,
    description?: string,
    collections: [{
        name: string,
        attrs: CodapAttribute[]
    }]
}

function qpToCodapOpMap(qpOperation:string) {
    return (qpOperation === "÷")?"/":
        (qpOperation === "×")?"*":qpOperation;
}

let generatedNameCount = 0;
function generateName():string {
    generatedNameCount++;
    return "name_" + generatedNameCount;
}

function sendRequest(request:CodapRequest|CodapRequest[]):Promise<CodapReply> {
    return codapInterface.sendRequest(request) as Promise<CodapReply>;
}

function getReplyValues(reply:CodapReply):Promise<any> {
    if (reply.success) {return Promise.resolve(reply.values);}
    else {return Promise.reject(reply.values.msg);}
}

function createDataset(name:string, description:string, attributeDefList:[QPVariable])
        :Promise<CodapReply> {
    const dataset: CodapDataset = {
        name,
        collections: [{
            name: "cases",
            attrs: []
        }]
    };
    return sendRequest({
            action: "create",
            resource: "dataContext",
            values: dataset
        })
        .then(getReplyValues)
        .then(() => guaranteeAttributes(dataset, attributeDefList));
}

function fetchDataset(name:string) {
    return sendRequest({action: "get", resource: `dataContext[${name}]`});
}

/**
 * Create or update a CODAP dataset to match the given characteristics.
 */
function guaranteeDataSet(name:string, description:string, attributeDefList: [QPVariable])
        : Promise<any> {
    return fetchDataset(name)
        .then(getReplyValues)
        .then(
            (dataset) => {
                return guaranteeAttributes(dataset, attributeDefList);
            },
            (/*msg*/) => {
                return createDataset(name, description, attributeDefList);
            }
        );
}

function guaranteeAttributes (dataset: any, qpVariableList:QPVariable[]) {
    const dsName = dataset.name;
    const attrMap:{[index: string]:any} = {};
    let lastCollectionName = "";

    // assemble map of existing attributes, keyed by cid.
    dataset.collections.forEach((col:any) => {
        const collectionName = col.name;
        lastCollectionName = collectionName;
        col.attrs.forEach((attr:any) => {
            if (attr.cid) {
                attrMap[String(attr.cid)] = {
                    resourceID: `dataContext[${dsName}].collection[${collectionName}].attribute[${attr.id}]`,
                    collection: col,
                    state: "old",
                    existingAttr: attr,
                    name: attr.name
                };
            }
        });
    });

    const defaultResourceID = `dataContext[${dsName}].collection[${lastCollectionName}].attribute`;
    // correlate qpVariables
    qpVariableList.forEach((qpVar) => {
        const existing = attrMap[qpVar.id];
        if (existing) {
            existing.state = "mod";
            existing.qpVar = qpVar;
            existing.name = qpVar.name || existing.name;
        }
        else {
            attrMap[qpVar.id] = {
                resourceID: defaultResourceID,
                collection: lastCollectionName,
                state: "new",
                qpVar,
                name: qpVar.name || generateName()
            };
        }
    });
    const requestList: CodapRequest[] = [];
    Object.values(attrMap).forEach(attrDef => {
        let request: CodapRequest | null = null;
        if (attrDef.state === "mod") {
            request = makeAttributeUpdate(attrDef, attrMap);
        } else if (attrDef.state === "new") {
            request = makeAttributeCreate(attrDef, attrMap);
        }
        if (request) {
            requestList.push(request);
        }
    });
    return sendRequest(requestList);
}

function makeAttributeUpdate(attrDef:any, attrMap:any) {
    const qpVar = attrDef.qpVar;
    if (qpVar.inputA || qpVar.inputB) {
        return makeFormulaAttributeUpdate(attrDef, attrMap);
    } else {
        return makeValueAttributeUpdate(attrDef);
    }
}

function makeAttributeCreate(attrDef:any, attrMap: any) {
    const qpVar = attrDef.qpVar;
    if (qpVar.inputA || qpVar.inputB) {
        return makeFormulaAttributeCreate(attrDef, attrMap);
    } else {
        return makeValueAttributeCreate(attrDef);
    }
}
function makeValueAttributeCreate(attrDef:any): CodapRequest {
    const qpVar = attrDef.qpVar;
    return {
        action: "create",
        resource: attrDef.resourceID,
        values: {
            name: attrDef.name,
            unit: qpVar.unit,
            cid: qpVar.id
        }
    };
}

function same(a:any,b:any):boolean {
    return (a == null && b == null) || (a === b);
}

function makeValueAttributeUpdate(attrDef:any): CodapRequest|null{
    const qpVar = attrDef.qpVar;
    if (same(attrDef.existingAttr.name, qpVar.name) && same(attrDef.existingAttr.unit, qpVar.unit)) {
        return null;
    } else {
        return {
            action: "update",
            resource: attrDef.resourceID,
            values: {
                name: qpVar.name || attrDef.name,
                unit: qpVar.unit
            }
        };
    }
}
function makeFormula(inputA:string, inputB:string, qpOp:string):string {
    const codapOp = qpToCodapOpMap(qpOp);
    if (inputA && inputB && codapOp) {
        return `${inputA} ${codapOp} ${inputB}`;
    }
    else if (inputA) {
        return inputA;
    }
    else if (inputB) {
        return inputB;
    }
    else {
        return "";
    }
}
function makeFormulaAttributeCreate(attrDef:any, attrMap:any): CodapRequest {
    const qpVar = attrDef.qpVar;
    const inputA = attrMap[qpVar.inputA]?.name;
    const inputB = attrMap[qpVar.inputB]?.name;
    const formula = makeFormula(inputA, inputB, qpVar.operation);
        return {
            action: "create",
            resource: attrDef.resourceID,
            values: {
                name: attrDef.name,
                cid: qpVar.id,
                formula: formula?formula:null,
                unit: qpVar.unit
            }
        };
}
function makeFormulaAttributeUpdate(attrDef:any, attrMap:any): CodapRequest|null {
    const qpVar = attrDef.qpVar;
    const existingAttr = attrDef.existingAttr;
    const inputA = attrMap[qpVar.inputA]?.name;
    const inputB = attrMap[qpVar.inputB]?.name;
    const formula = makeFormula(inputA, inputB, qpVar.operation);
    if (same(existingAttr.formula,formula)
        && same(existingAttr.unit, qpVar.unit)
        && same(existingAttr.name, attrDef.name)) {
        return null;
    } else {
        return {
            action: "update",
            resource: attrDef.resourceID,
            values: {
                name: attrDef.name,
                formula,
                unit: qpVar.unit
            }
        };
    }
}

function createItem(dataSetName: string, values: [{id:string,value?:number}])
        :Promise<CodapReply> {
    return fetchDataset(dataSetName)
        .then(getReplyValues)
        .then((dataset: CodapDataset) => {
            let attrs: CodapAttribute[] = [];
            dataset.collections.forEach((col) => {
                attrs = attrs.concat(col.attrs);
            });
            const item:{[key:string]: any} = {};
            values.forEach((v) => {
                const myAttr = attrs.find(attr => attr.cid === v.id);
                if (myAttr) {
                    item[myAttr.name] = v.value;
                }
            });
            return sendRequest({
                action: "create",
                resource: `dataContext[${dataSetName}].item`,
                values: item
            });
        });

}

function createCaseTable(datasetName: string):Promise<CodapReply> {
    return sendRequest({
        action: "create",
        resource: `component`,
        values: {
            type: "caseTable",
            dataContext: datasetName
        }
    });
}
export {guaranteeDataSet, createItem, createCaseTable};
