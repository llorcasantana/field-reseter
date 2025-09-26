"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFieldsInPlace = resetFieldsInPlace;
function resetFieldsInPlace(obj, options = {}) {
    const { skip = [], rules = {} } = options;
    const isPlainObject = (x) => x !== null && typeof x === "object" && Object.getPrototypeOf(x) === Object.prototype;
    const getDefaultForPrimitive = (val, key) => {
        var _a, _b, _c, _d, _e;
        if (rules.byKey && Object.prototype.hasOwnProperty.call(rules.byKey, key)) {
            return rules.byKey[key];
        }
        if (val === null)
            return (_a = rules.null) !== null && _a !== void 0 ? _a : null;
        if (val === undefined)
            return (_b = rules.undefined) !== null && _b !== void 0 ? _b : null;
        switch (typeof val) {
            case "string": return (_c = rules.string) !== null && _c !== void 0 ? _c : "";
            case "number": return (_d = rules.number) !== null && _d !== void 0 ? _d : 0;
            case "boolean": return (_e = rules.boolean) !== null && _e !== void 0 ? _e : false;
            default: return null;
        }
    };
    const resetValue = (value, key) => {
        if (skip.includes(key))
            return value;
        if (Array.isArray(value)) {
            if ("array" in rules)
                return cloneIfNeeded(rules.array);
            return [];
        }
        if (isPlainObject(value)) {
            const target = value;
            if (rules.object && rules.object !== "recurse" && isPlainObject(rules.object)) {
                const template = rules.object;
                for (const k of Object.keys(target)) {
                    if (Object.prototype.hasOwnProperty.call(template, k)) {
                        target[k] = cloneIfNeeded(template[k]);
                    }
                    else {
                        target[k] = resetValue(target[k], k);
                    }
                }
                for (const k of Object.keys(template)) {
                    if (!(k in target)) {
                        target[k] = cloneIfNeeded(template[k]);
                    }
                }
                return target;
            }
            for (const k of Object.keys(target)) {
                target[k] = resetValue(target[k], k);
            }
            return target;
        }
        return getDefaultForPrimitive(value, key);
    };
    const cloneIfNeeded = (val) => {
        if (Array.isArray(val))
            return val.slice();
        if (isPlainObject(val))
            return Object.assign({}, val);
        return val;
    };
    if (obj && typeof obj === "object") {
        const target = obj;
        for (const key of Object.keys(target)) {
            target[key] = resetValue(target[key], String(key));
        }
    }
    return obj;
}
