import { useState, useEffect, RefObject } from "react";
import invariant from "tiny-invariant";

export enum STATES {
  unmounted = "unmounted",
  entering = "entering",
  entered = "entered",
  exiting = "exiting",
  exited = "exited"
}

type Options =
  | number
  | {
      timeout?: number;
      unmountOnExited?: boolean;
      triggerReflowOnMount?: boolean;
    };

function useTransition(isOpen: boolean, options: Options = {}) {
  const timeout = typeof options === "number" ? options : options.timeout;
  const unmountOnExited =
    typeof options !== "number" && !!options.unmountOnExited;

  invariant(
    typeof timeout === "number" && timeout >= 0,
    "`timeout` should be a number greater or equal to 0."
  );

  const [state, setState] = useState(() => {
    if (isOpen) {
      return STATES.entered;
    }

    return unmountOnExited ? STATES.unmounted : STATES.exited;
  });

  useEffect(() => {
    if (isOpen) {
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
          }, timeout || 0);

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
          }, timeout || 0);

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
  }, [isOpen, state, timeout, unmountOnExited]);

  return state;
}

export function useTriggerReflow(
  isOpen: boolean,
  state: STATES,
  targetRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (isOpen && state === STATES.exited) {
      // @ts-ignore
      targetRef.current && targetRef.current.offsetWidth;
    }
  }, [isOpen, state, targetRef]);
}

export default useTransition;
