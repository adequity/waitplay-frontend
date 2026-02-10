# AI Skill: Component Scaffolding

Copy and paste this prompt to Claude to generate a new Vue component following project standards.

## Prompt Template

```markdown
Create a new Vue 3 component named `[ComponentName]`.
Path: `src/components/[ComponentName].vue`

**Requirements:**

1.  **Script**: Use `<script setup lang="ts">`.
2.  **Props**: Define a TypeScript interface `[ComponentName]Props` for props. Do not use `any`.
3.  **Emits**: Define emits using `defineEmits` with explicit types if possible.
4.  **Style**: Use `<style scoped>`.
    - Use CSS variables from `src/style.css` (e.g., `var(--primary)`, `var(--bg-secondary)`).
    - Do NOT use Tailwind utility classes.
5.  **Template**:
    - Use semantic HTML.
    - Ensure accessibility (aria-labels where needed).

**Example Output Structure:**

<script setup lang="ts">
interface [ComponentName]Props {
  title: string;
  isActive?: boolean;
}

const props = withDefaults(defineProps<[ComponentName]Props>(), {
  isActive: false,
});

const emit = defineEmits<{
  (e: 'click', id: string): void;
}>();
</script>

<template>
  <div class="component-container" :class="{ active: isActive }">
    <!-- content -->
  </div>
</template>

<style scoped>
.component-container {
  background: var(--bg-primary);
  border: 1px solid var(--bg-elevated);
}
</style>
```
