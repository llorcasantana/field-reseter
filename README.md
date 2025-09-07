# Field Reseter

A small TypeScript utility to **reset object fields to default values** depending on their type (string, number, boolean, array, object, etc.).  
It works **in-place** (mutates the object) which makes it ideal for use with reactive stores (e.g., Vue’s `reactive` or `ref`).  

---

## ✨ Features
- Reset all object fields in-place based on type:
  - `string → ''`
  - `number → 0`
  - `boolean → false`
  - `array → []`
  - `object → recurse` (default)
- Works recursively for nested objects.
- Allows **custom default values by type**.
- Allows **custom default values by key**.
- Supports skipping keys you don’t want to reset.

---

## 📦 Installation

Just copy `src/index.ts` into your project:

```
src/utils/resetFieldsInPlace.ts
```

---

## 🚀 Usage

### Basic Example

```ts
import { resetFieldsInPlace } from "./resetFieldsInPlace";

const product = {
  title: "T-Shirt",
  price: 25,
  active: true,
  tags: ["new", "discount"],
  meta: {
    created_at: "2025-09-07",
    stock: 15,
  },
};

// Reset all fields in-place
resetFieldsInPlace(product);

console.log(product);
/*
{
  title: '',
  price: 0,
  active: false,
  tags: [],
  meta: {
    created_at: '',
    stock: 0
  }
}
*/
```

---

### With Custom Rules

You can override the default reset values:

```ts
resetFieldsInPlace(product, {
  rules: {
    string: "",        // default for strings
    number: 0,         // default for numbers
    boolean: false,    // default for booleans
    byKey: {
      price: 1,        // 👈 force "price" to reset to 1
      status: "draft", // 👈 force "status" to reset to 'draft'
    },
  },
});
```

---

### Skipping Keys

Skip specific keys from being reset:

```ts
resetFieldsInPlace(product, {
  skip: ["status", "meta"],
});
```

---

## ⚙️ Options

| Option      | Type                        | Default   | Description                                                                 |
|-------------|-----------------------------|-----------|-----------------------------------------------------------------------------|
| `skip`      | `string[]`                 | `[]`      | Array of keys to leave unchanged.                                           |
| `rules`     | `ResetRules`               | see below | Object defining reset values by type or by key.                             |

### `ResetRules`

```ts
{
  string?: any;       // default: ''
  number?: any;       // default: 0
  boolean?: any;      // default: false
  array?: any;        // default: []
  object?: "recurse" | object; // default: "recurse"
  null?: any;         // default: null
  undefined?: any;    // default: null
  byKey?: Record<string, any>; // overrides by specific key
}
```

---

## 🛠️ Notes

- **In-place mutation**: the object reference remains the same → works perfectly with Vue’s reactivity system.
- If you prefer a **cloning (immutable)** version, you can easily adapt it by using `Object.fromEntries` instead of mutating.

---

## 📜 License

MIT
