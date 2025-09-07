export type ResetRules = {
    string?: any;
    number?: any;
    boolean?: any;
    array?: any;
    object?: "recurse" | Record<string, any>;
    null?: any;
    undefined?: any;
    byKey?: Record<string, any>;
};

export interface ResetOptions {
    skip?: string[];
    rules?: ResetRules;
}

export function resetFieldsInPlace<T extends Record<string, any>>(obj: T, options: ResetOptions = {}): T {
    const { skip = [], rules = {} } = options;

    type Mutable<V> = {
        -readonly [K in keyof V]: V[K];
    };

    const isPlainObject = (x: unknown): x is Record<string, any> =>
        x !== null && typeof x === "object" && Object.getPrototypeOf(x) === Object.prototype;

    const getDefaultForPrimitive = (val: unknown, key: string): any => {
        if (rules.byKey && Object.prototype.hasOwnProperty.call(rules.byKey, key)) {
            return rules.byKey[key];
        }
        if (val === null) return rules.null ?? null;
        if (val === undefined) return rules.undefined ?? null;
        switch (typeof val) {
            case "string": return rules.string ?? "";
            case "number": return rules.number ?? 0;
            case "boolean": return rules.boolean ?? false;
            default: return null;
        }
    };

    const resetValue = (value: any, key: string): any => {
        if (skip.includes(key)) return value;

        if (Array.isArray(value)) {
            if ("array" in rules) return cloneIfNeeded(rules.array);
            return [];
        }

        if (isPlainObject(value)) {
            const target = value as Record<string, any>;

            if (rules.object && rules.object !== "recurse" && isPlainObject(rules.object)) {
                const template = rules.object as Record<string, any>;
                for (const k of Object.keys(target)) {
                    if (Object.prototype.hasOwnProperty.call(template, k)) {
                        target[k] = cloneIfNeeded(template[k]);
                    } else {
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

    const cloneIfNeeded = (val: any): any => {
        if (Array.isArray(val)) return val.slice();
        if (isPlainObject(val)) return { ...val };
        return val;
    };

    if (obj && typeof obj === "object") {
        const target = obj as Mutable<T>;
        for (const key of Object.keys(target) as Array<keyof T>) {
            target[key] = resetValue(target[key], String(key));
        }
    }

    return obj;
}
