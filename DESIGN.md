# Design System: Jaxtina Scholar (Digital Mentor)

## 1. Color Palette
| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| Background | `#f9f9f9` | `bg-background` | Base page background. |
| Surface | `#f9f9f1` | `bg-surface` | Primary surface for cards. |
| Primary | `#005cab` | `text-primary` / `bg-primary` | Main branding, primary actions. |
| Secondary | `#b7131d` | `text-secondary` / `bg-secondary` | Accent, critical actions. |
| Surface-Low | `#f3f3f3` | `bg-surface-container-low` | Background for nested containers (No-Line). |
| Surface-High | `#e8e8e8` | `bg-surface-container-high` | High-contrast surface elements. |

## 2. Typography
- **Headlines**: `Plus Jakarta Sans`
    - Scale: 5XL to 7XL for Hero, 2XL for Cards.
    - Weights: Black (`font-black`) or ExtraBold (`font-extrabold`).
- **Body**: `Inter`
    - Weights: Medium (`font-medium`) or Regular (`font-normal`).
- **Labels**: `Inter` (uppercase, tracked).

## 3. The Digital Mentor Rules
### The "No-Line" Rule
- **Standard**: Avoid `border` and `divide` utilities.
- **Implementation**: Define boundaries using background shifts (e.g., a `bg-surface-container-low` container on a `bg-surface` background).
- **Depth**: Use `shadow-stitched` (a custom soft, deep shadow) instead of borders for elevation.

### Tonal Layering
- **Layer 0**: `bg-surface` (Main canvas).
- **Layer 1**: `bg-white` or `bg-surface-container-low` (Primary content containers).
- **Layer 2**: `bg-surface-container-highest` (Secondary content, e.g., table headers).

### Roundness
- **Containers**: Heavy rounding, typically `rounded-[32px]` or `rounded-3xl`.
- **Buttons/Fields**: `rounded-2xl`.

### Premium Gradients
- `gradient-primary`: `from-primary to-primary-container`.
- `gradient-secondary`: `from-secondary to-secondary-container`.
