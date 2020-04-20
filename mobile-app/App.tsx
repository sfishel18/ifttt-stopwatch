import React, { useState, useEffect, useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import StopWatch from './components/StopWatch';

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

type StopWatchDirection = 'asc' | 'desc';

const toggleDirection: (direction: StopWatchDirection) => StopWatchDirection = (direction) => direction === 'asc' ? 'desc' : 'asc';

export default () => {
  const [initialTime, setInitialTime] = useState(0);
  const [time, setTime] = useState(initialTime);
  const [direction, setDirection] = useState<StopWatchDirection>('asc');

  useEffect(() => {
    let previousTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now()
      const delta = now - previousTime;
      previousTime = now;
      setTime(t => direction === 'asc' ? t + delta : t - delta);
    }, 100);
    return () => clearInterval(interval)
  }, [direction]);

  const onPress = useCallback(
    () => setDirection(toggleDirection(direction)), 
    [setDirection, direction]
  );

  return <StopWatch time={time} onPress={onPress} />;
};
