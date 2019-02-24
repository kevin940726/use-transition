# use-transition

use transition hook for React

A tiny [react custom hook](https://reactjs.org/docs/hooks-intro.html) for controlling transition state like [react-transition-group](https://github.com/reactjs/react-transition-group).

## Installation

```sh
yarn add use-transition
```

## Basic Example

```jsx
import useTransition from 'use-transition';

function App() {
  const [isActive, setIsActive] = React.useState(false);
  const state = useTransition(isActive, 1000);

  return (
    <>
      <button onClick={() => setIsActive(active => !active)}>
        toggle: {String(isActive)}
      </button>
      <h1>{state}</h1>
    </>
  );
}
```

[![Edit use-transition basic example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/jv46lkwzm3?fontsize=14&hidenavigation=1)

## API

### `useTransition(isActive: boolean, timeout: number, options?: Options): States`

The main hook to return the current state of the transition. Takes an `isActive` indicating the transition state and `timeout` being the delay in ms. The return value is of type `States`, which is an enum similar to `react-transition-group`:

```ts
enum States {
  unmounted = 'unmounted',
  entering = 'entering',
  entered = 'entered',
  exiting = 'exiting',
  exited = 'exited',
}
```

The `options` takes an object, and has type `Options`:

```ts
type Options = {
  unmountOnExited?: boolean;
};
```

#### `unmountOnExited: boolean`

Whether or not to transition to `unmounted` immediately after `exited`. Useful for controlling element which is only appearing when is active. When used together with `useTriggerReflow`, it can easily apply transition effect to elements appearing only when they were active, more on that later.

### `STATES: States`

The object form of the enum `States`. Useful for conditionally trigger different transition effect in a more reliable way.

```js
import { STATES } from 'use-transition';

{
  transition: 'opacity 1s ease-out',
  opacity: Number(state === STATES.entering || state === STATES.entered),
}
```

### `useTriggerReflow(isActive: boolean, state: STATES, targetRef: RefObject<HTMLElement>)`

An useful hook to automatically trigger reflow on `targetRef.current` when the `state` is `STATES.exited` and `isActive` being `false`. When you are only mounting the component when it is active, it is a useful hook combined with `useTransition` to force browser to paint the intermediate style when still in `exited` state. A common example would be to mount and fade in a component on active.

```jsx
import useTransition, { STATES, useTriggerReflow } from 'use-transition';

const [isActive, setIsActive] = React.useState(false);
const targetRef = React.useRef();

const state = useTransition(isActive, 1000, { unmountOnExited: true });

useTriggerReflow(isActive, state, targetRef);

return (
  <>
    <button onClick={() => setIsActive(prev => !prev)}>Toggle</button>

    {state !== STATES.unmounted && (
      <div
        ref={targetRef}
        style={{
          transition: 'opacity 1s ease-in-out',
          opacity: Number(
            state === STATES.entering || state === STATES.entered
          ),
        }}
      />
    )}
  </>
);
```

## Author, License

Kai Hao,
MIT
