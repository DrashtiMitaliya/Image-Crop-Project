import {useEffect} from 'react'

const useDebounceEffect = (fn, waitTime, deps) => {
    useEffect(() => {
        const timeout = setTimeout(() => {
          fn();
        }, waitTime);
    
        return () => {
          clearTimeout(timeout);
        };
      }, deps);
}

export default useDebounceEffect
