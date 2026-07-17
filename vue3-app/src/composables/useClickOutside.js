import { onMounted, onUnmounted } from 'vue';

export function useClickOutside(target, onOutside) {
  function handleMousedown(event) {
    const el = target.value;
    if (el && !el.contains(event.target)) onOutside(event);
  }

  onMounted(() => document.addEventListener('mousedown', handleMousedown));
  onUnmounted(() => document.removeEventListener('mousedown', handleMousedown));
}
