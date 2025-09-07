// fieldReseter.safe.ts
export type ResetRules = {
    string?: any;     // por ejemplo: '' o 'draft'
    number?: any;     // por ejemplo: 0
    boolean?: any;    // por ejemplo: false
    array?: any;      // por ejemplo: [] (vacía)
    object?: "recurse" | Record<string, any>; // "recurse" = mantener forma y resetear dentro
    null?: any;       // por ejemplo: null
    undefined?: any;  // ¡OJO! Mejor usa null para evitar que 'desaparezcan' en JSON
    byKey?: Record<string, any>; // valores por clave exacta
};

export interface ResetOptions {
    skip?: string[];        // claves a no tocar
    rules?: ResetRules;
}

/**
 * Resetea IN-PLACE sin borrar claves.
 * - Nunca asigna undefined a menos que tú fuerces rules.undefined.
 * - Para objetos: si rules.object === "recurse", mantiene el shape y resetea dentro.
 *   Si rules.object es un objeto "plantilla", hace merge por clave (no desaparecen claves extra).
 */
export function resetFieldsInPlace<T extends Record<string, any>>(obj: T, options: ResetOptions = {}): T {
    const { skip = [], rules = {} } = options;

    type Mutable<V> = {
        -readonly [K in keyof V]: V[K];
    };

    const isPlainObject = (x: unknown): x is Record<string, any> =>
        x !== null && typeof x === "object" && Object.getPrototypeOf(x) === Object.prototype;

    const getDefaultForPrimitive = (val: unknown, key: string): any => {
        // Por prioridad: byKey > tipo específico > fallback seguro
        if (rules.byKey && Object.prototype.hasOwnProperty.call(rules.byKey, key)) {
            return rules.byKey[key];
        }
        if (val === null) return rules.null ?? null;
        if (val === undefined) return rules.undefined ?? null; // evita 'undefined' para que no se “pierda” en JSON
        switch (typeof val) {
            case "string": return rules.string ?? "";
            case "number": return rules.number ?? 0;
            case "boolean": return rules.boolean ?? false;
            default: return null;
        }
    };

    const resetValue = (value: any, key: string): any => {
        // Respeta skip
        if (skip.includes(key)) return value;

        // Arrays
        if (Array.isArray(value)) {
            // Si definiste un valor para array, lo usamos (por lo general [])
            if ("array" in rules) return cloneIfNeeded(rules.array);
            // Si no, por defecto vaciamos el array (sin borrar la propiedad)
            return [];
        }

        // Objetos "plain"
        if (isPlainObject(value)) {
            const target = value as Record<string, any>;

            if (rules.object && rules.object !== "recurse" && isPlainObject(rules.object)) {
                // Modo "plantilla": aplica plantilla sin perder claves existentes
                const template = rules.object as Record<string, any>;
                for (const k of Object.keys(target)) {
                    if (Object.prototype.hasOwnProperty.call(template, k)) {
                        // Si la plantilla tiene ese k, úsalo (clonando si es objeto/array)
                        target[k] = cloneIfNeeded(template[k]);
                    } else {
                        // Si no, resetea recursivamente el valor existente para mantener la forma
                        target[k] = resetValue(target[k], k);
                    }
                }
                // Si quieres además agregar claves que existan en la plantilla y no en el objeto:
                for (const k of Object.keys(template)) {
                    if (!(k in target)) {
                        target[k] = cloneIfNeeded(template[k]);
                    }
                }
                return target;
            }

            // Modo "recurse" (o sin regla object): resetea adentro, no reemplaza el objeto
            for (const k of Object.keys(target)) {
                target[k] = resetValue(target[k], k);
            }
            return target;
        }

        // Primitivos / null / undefined
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
            // ¡Clave se mantiene! Solo reasignamos su valor
            target[key] = resetValue(target[key], String(key));
        }
    }

    return obj;
}
