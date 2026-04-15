# Welcome to Chanhee Workspace! 🚀

This is a beautiful Soft Neumorphism markdown reader. It's built with HTML, CSS, and vanilla JS. No compiling needed!

## Features 🌟

- **Soft Neumorphism Design**: Gentle shadows for a tactile feel.
- **Dynamic TOC**: Table of contents auto-generates on the right sidebar.
- **Code Highlighting**: Looks gorgeous with `atom-one-light`.
- **Mermaid Support**: Native support for mermaid diagrams.

### Why Neumorphism?
It combines the clean, minimal aesthetic of flat design with the tactile feedback of skeuomorphism, leading to interfaces that feel real but look modern.

---

## Code Example

Here is some sample Python code to test out the syntax highlighter:

```python
def calculate_fibonacci(n):
    """Calculate the fibonacci sequence up to n."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
        
    return sequence

print(calculate_fibonacci(10))
```

And some Javascript:

```javascript
const colors = {
  primary: '#ff6b6b',
  secondary: '#4ecdc4',
  highlight: '#ffe66d'
};

const neumorphism = (bg = colors.primary) => {
  return `Looks awesome with ${bg}!`;
};

console.log(neumorphism());
```

> **Note**: Hover over code blocks to see the copy button!

## Tables

| Color Var | Hex | Usage |
|-----------|-----|-------|
| `--color-primary` | `#ff6b6b` | Headers, active states |
| `--color-secondary` | `#4ecdc4` | Links, TOC, secondary headers |
| `--color-highlight` | `#ffe66d` | Badges, warnings |

Enjoy your dynamic document reader!
