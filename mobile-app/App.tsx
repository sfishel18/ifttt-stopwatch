import React, { useState, useEffect } from 'react';
import { AsyncStorage } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StopWatchState } from './types';
import StopWatchWrapper from './components/StopWatchWrapper';
import IdPrompt from './components/IdPrompt';

export default () => {
  const [id, setId] = useState<String | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('@stopWatchId').then(storedId => {
      if (storedId !== null) {
        setId(storedId);
      }
    });
  }, []);

  const [stopWatchState, setStopWatchState] = useState<StopWatchState | null>(null);
  useEffect(() => {
    if (id === null) {
      return;
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    const fetchStopWatchState = () => {
      fetch(`https://us-central1-ifttt-stopwatch.cloudfunctions.net/get?id=${id}`)
        .then(response => response.json())
        .then(setStopWatchState);
    }
    fetchStopWatchState();
    const interval = setInterval(fetchStopWatchState, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (id === null) {
    return <IdPrompt onSubmit={setId} />
  }
  if (stopWatchState === null) {
    return null;
  }
  return <StopWatchWrapper {...stopWatchState} />;
}
