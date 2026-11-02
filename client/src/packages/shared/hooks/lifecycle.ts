import { useEffect, useLayoutEffect, useRef, type EffectCallback } from 'react';

export const useMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};

export const useLayoutMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(effect, []);
};

export const useUnmount = (effect: () => void) => {
  const effectRef = useRef(effect);

  // eslint-disable-next-line react-compiler/react-compiler, react-hooks/refs
  effectRef.current = effect;

  useMount(() => {
    return () => {
      effectRef.current();
    };
  });
};

export const useIsMountedRef = () => {
  const isMountedRef = useRef(false);

  useMount(() => {
    isMountedRef.current = true;
  });

  return isMountedRef;
};
