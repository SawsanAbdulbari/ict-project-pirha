// This file contains a custom hook for detecting mobile screen sizes.
import * as React from "react"
// This constant defines the width (in pixels) below which the screen is considered "mobile".
const MOBILE_BREAKPOINT = 768
// This hook returns `true` if the window width is less than the mobile breakpoint, and `false` otherwise.
export function useIsMobile() {
  // This state variable starts as `undefined` to handle server-side rendering or the initial paint before the effect runs.
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    // It sets up a `matchMedia` query to watch for changes in screen size relative to the breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    // It defines an `onChange` handler to update the `isMobile` state.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // It adds an event listener to call the handler when the screen size crosses the breakpoint.
    mql.addEventListener("change", onChange)
    // It performs an initial check to set the state correctly on component mount.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    // It returns a cleanup function to remove the event listener when the component unmounts, preventing memory leaks.
    return () => mql.removeEventListener("change", onChange);
  }, [])
  // It is used to cast the `undefined` initial state to `false`, ensuring the hook always returns a boolean.
  return !!isMobile
}
