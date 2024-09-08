import { useRef, useEffect, useState } from "react";

export default function usePollingEffect(
  asyncCallback: () => any,
  dependencies: any[],
  {
    interval = 10_000, // 10 seconds
    onCleanUp = () => {},
  } = {}
) {
  const [dead, kill] = useState(false);
  const timeoutIdRef = useRef<any>(null);
  useEffect(() => {
    if (dead) {
      return;
    }

    let _stopped = false;

    (async function pollingCallback() {
      try {
        await asyncCallback();
      } finally {
        // Set timeout after it finished, unless stopped
        timeoutIdRef.current =
          !_stopped && setTimeout(pollingCallback, interval);
      }
    })();

    // Clean up if dependencies change
    return () => {
      _stopped = true; // prevent racing conditions
      clearTimeout(timeoutIdRef.current);
      onCleanUp();
    };
  }, [...dependencies, interval, dead]);

  return [() => kill(true), () => kill(false)];
}
