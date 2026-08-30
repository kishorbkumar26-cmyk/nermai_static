import { useState, useCallback } from 'react';

export function useMagnetic(strength = 0.5) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e, ref) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  }, [strength]);

  const reset = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return { position, handleMouse, reset };
}
