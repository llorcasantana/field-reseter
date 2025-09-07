export type ResetRules = {
    string?: any;
    number?: any;
    boolean?: any;
    array?: any;
    object?: "recurse" | object;
    null?: any;
    undefined?: any;
    byKey?: Record<string, any>;
};

export interface ResetOptions {
    skip?: string[];
    rules?: ResetRules;
}

type Mutable<T> = {
    -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K];
};

export function resetFieldsInPlace<T extends Record<string, any>>(
    obj: T,
    options: ResetOptions = {}
): T {
    const {
        skip = [],
        rules = {
            string: "",
            number: 0,
            boolean: false,
            array: [],
            object: "recurse",
            null: null,
            undefined: null,
            byKey: {},
        },
    } = options;

    const skipSet = new Set(skip);

    const resetValue = (value: any, key: string): any => {
        if (skipSet.has(key)) return value;

        if (rules.byKey && key in rules.byKey) {
            return rules.byKey[key];
        }

        if (Array.isArray(value)) {
            if (Array.isArray(rules.array)) {
                return [...rules.array];
            }
            value.length = 0;
            return value;
        }

        const t = value === null ? "null" : typeof value;

        if (t === "object") {
            if (rules.object === "recurse") {
                for (const k of Object.keys(value)) {
                    (value as any)[k] = resetValue((value as any)[k], k);
                }
                return value;
            } else if (typeof rules.object === "object") {
                return { ...rules.object };
            } else {
                return rules.object;
            }
        }

        if (t === "string") return rules.string;
        if (t === "number") return rules.number;
        if (t === "boolean") return rules.boolean;
        if (t === "undefined") return rules.undefined;
        if (t === "null") return rules.null;

        return null;
    };

    if (obj && typeof obj === "object") {
        const target = obj as Mutable<T>;

        for (const key of Object.keys(target) as Array<keyof T>) {
            target[key] = resetValue(target[key], String(key));
        }
    }

    return obj;
}
