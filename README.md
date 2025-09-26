# NOTE
This project is archived and no longer maintained. Use the follow repo for updated utilities:
[llorcadev-utils](https://github.com/llorcasantana/llorcadev-utils).
# llorcadev-utils

[![npm version](https://badge.fury.io/js/llorcadev-utils.svg)](https://badge.fury.io/js/llorcadev-utils) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)


---

# Field Reseter

A small TypeScript utility to **reset object fields to default values** depending on their type (string, number, boolean, array, object, etc.).  
It works **in-place** (mutates the object) which makes it ideal for use with reactive stores (e.g., Vue’s `reactive` or `ref`).  

---
# Acknowledgments
If you like the repo, please share it with your dev friends and give it a star. It makes me grow and inspires me to keep creating new things. Thanks.

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

Just copy install:

```bash
yarn add llorcadev-utils
```

---

## 🚀 Usage

### Basic Example

```ts
import { useFieldReseter } from "llorcadev-utils";

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
useFieldReseter(product);

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
useFieldReseter(product, {
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
useFieldReseter(product, {
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
