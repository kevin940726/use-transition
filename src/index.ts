import { useState, useEffect, RefObject } from 'react';

export enum STATES {
  unmounted = 'unmounted',
  entering = 'entering',
  entered = 'entered',
  exiting = 'exiting',
  exited = 'exited',
}

type Options = {
  unmountOnExited?: boolean;
};

function useTransition(
  isActive: boolean,
  timeout: number,
  options: Options = {}
) {
  const unmountOnExited = !!options.unmountOnExited;

  const [state, setState] = useState(() => {
    if (isActive) {
      return STATES.entered;
    }

    return unmountOnExited ? STATES.unmounted : STATES.exited;
  });

  useEffect(() => {
    if (isActive) {
      switch (state) {
        case STATES.unmounted:
          setState(STATES.exited);
          break;
        case STATES.exited:
        case STATES.exiting:
          setState(STATES.entering);
          break;
        case STATES.entering: {
          const timer = setTimeout(() => {
            setState(STATES.entered);
          }, timeout);

          return () => clearTimeout(timer);
        }
        default:
          break;
      }
    } else {
      switch (state) {
        case STATES.entered:
        case STATES.entering:
          setState(STATES.exiting);
          break;
        case STATES.exiting: {
          const timer = setTimeout(() => {
            setState(STATES.exited);
          }, timeout);

          return () => clearTimeout(timer);
        }
        case STATES.exited: {
          if (unmountOnExited) {
            setState(STATES.unmounted);
          }
          break;
        }
        default:
          break;
      }
    }

    return;
  }, [isActive, state, timeout, unmountOnExited]);

  return state;
}

export function useTriggerReflow(
  isActive: boolean,
  state: STATES,
  targetRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (isActive && state === STATES.exited) {
      // @ts-ignore
      targetRef.current && targetRef.current.offsetWidth;
    }
  }, [isActive, state, targetRef]);
}

export default useTransition;
