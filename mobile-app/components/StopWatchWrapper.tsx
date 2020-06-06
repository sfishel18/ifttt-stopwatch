import React, { useState, useEffect, useCallback } from 'react';
import StopWatch from './StopWatch';
import { StopWatchState } from '../types';

const StopWatchWrapper: React.FC<StopWatchState> = ({ direction, lastUpdatedTime, previousValue }) => {

  const computeCurrentTime = () => {
    if (lastUpdatedTime == null || direction === 'pause') {
      return previousValue;
    }
    const timeSinceUpdate = Date.now() - lastUpdatedTime;
    if (direction === 'up') {
      return previousValue + timeSinceUpdate;
    }
    return previousValue - timeSinceUpdate;
  }

  const [time, setTime] = useState(computeCurrentTime());

  useEffect(() => {
    let interval: number;
    if (direction !== 'pause') {
      interval = setInterval(() => {
        setTime(computeCurrentTime());
      }, 100);
    }
    return () => clearInterval(interval)
  }, [direction]);

  return <StopWatch time={time} />;
}

export default StopWatchWrapper;
