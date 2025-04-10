## Overview

The `Markup` class provides a simple and flexible way to generate Markdown-formatted text. It allows users to apply formatting such as headers, bold, italics, strike, links, and more through both static methods and instance methods for chaining.

---

## Features

-   **Static Methods** for formatting individual text elements.
-   **Instance Methods** for chaining multiple formatting options.
-   **Supports Markdown Formatting** including headers, bold, italics, underlines, links, and inline code.
-   **Optional Prefix and Postfix Arguments** to customize the formatting output.

---

## Class Definition

```typescript
export class Markup {
    private value: string;

    constructor(value: string = "") {
        this.value = value;
    }
```

The constructor initializes the class with an optional string value.

---

## Static Methods

Static methods allow direct formatting of a single string without creating an instance. Each method has optional prefix and postfix arguments, which can be used to add extra content before or after the formatted text.

### `header(text: string | number | Markup, prefix = "", postfix = "")`

Formats text as a level-3 header.

```typescript
Markup.header("Title");
// Output: "###Title"
```

### `subheader(text: string | number | Markup, prefix = "", postfix = "")`

Formats text as a level-2 header.

```typescript
Markup.subheader("Subtitle");
// Output: "##Subtitle"
```

### `bold(text: string | number | Markup, prefix = "", postfix = "")`

Formats text in bold.

```typescript
Markup.bold("Bold Text");
// Output: "**Bold Text**"
```

### `underline(text: string | number | Markup, prefix = "", postfix = "")`

Formats text with an underline.

```typescript
Markup.underline("Underlined Text");
// Output: "__Underlined Text__"
```

### `italic(text: string | number | Markup, prefix = "", postfix = "")`

Formats text in italics.

```typescript
Markup.italic("Italic Text");
// Output: "*Italic Text*"
```

### `strike(text: string | number | Markup, prefix = "", postfix = "")`

Formats text with a strike.

```typescript
Markup.strike("Strike");
// Output: "~~Strike~~"
```

### `copyable(text: string | number | Markup, prefix = "", postfix = "")`

Formats text as inline code.

```typescript
Markup.copyable("Code Snippet");
// Output: "`Code Snippet`"
```

### `link(text: string | number | Markup, link: string, prefix = "", postfix = "")`

Creates a Markdown link.

```typescript
Markup.link("Google", "https://www.google.com");
// Output: "[Google](https://www.google.com)"
```

---

## Instance Methods

Instance methods allow chaining of multiple formatting options. Similar to static methods, they also support optional prefix and postfix arguments for customization.

### `clear()`

Clears the stored value.

```typescript
const markup = new Markup("Initial");
markup.clear();
console.log(markup.toString()); // Output: ""
```

### `newLine(count: number = 1)`

Adds a new line (`\n`).

```typescript
markup.newLine();
// Output: "\n"
```

### `text(text: string | number, prefix = "", postfix = "")`

Appends text to the instance.

```typescript
markup.text("Hello").text("World");
// Output: "HelloWorld"
```

### `header(text: string, prefix = "", postfix = "")`

Appends a level-3 header.

```typescript
markup.header("My Title");
// Output: "###My Title"
```

### `subheader(text: string, prefix = "", postfix = "")`

Appends a level-2 header.

```typescript
markup.subheader("My Subtitle");
// Output: "##My Subtitle"
```

### `underline(text: string | number | Markup, prefix = "", postfix = "")`

Adds underlined text.

```typescript
markup.underline("My Underline");
// Output: "__My Underline__"
```

### `bold(text: string | number | Markup, prefix = "", postfix = "")`

Adds bold text.

```typescript
markup.bold("Bold");
// Output: "**Bold**"
```

### `italic(text: string | number | Markup, prefix = "", postfix = "")`

Adds italic text.

```typescript
markup.italic("Italic");
// Output: "*Italic*"
```

### `strike(text: string | number | Markup, prefix = "", postfix = "")`

Adds strike text.

```typescript
markup.strike("Strike");
// Output: "~~Strike~~"
```

### `copyable(text: string | number | Markup, prefix = "", postfix = "")`

Adds inline code.

```typescript
markup.copyable("Code");
// Output: "`Code`"
```

### `link(text: string | number, link: string, prefix = "", postfix = "")`

Adds a link.

```typescript
markup.link("GitHub", "https://github.com");
// Output: "[GitHub](https://github.com)"
```

### `toString()`

Returns the formatted value as a string.

```typescript
console.log(markup.toString());
```

---

## Usage Example

```typescript
const markup = new Markup()
    .header("My Title")
    .newLine()
    .text("This is an ")
    .bold("important")
    .text(" message.")
    .newLine(2)
    .link("Click here", "https://example.com");

console.log(markup.toString());
```

### Output

```
###My Title

This is an **important** message.


[Click here](https://example.com)
```

---

## Conclusion

The `Markup` class simplifies Markdown text generation with both static and instance methods, making it easy to compose structured Markdown documents dynamically.
