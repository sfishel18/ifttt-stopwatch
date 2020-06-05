import React, { useState, useEffect } from 'react';
import { AsyncStorage, Alert, Text } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StopWatchState } from './types';
import StopWatchWrapper from './components/StopWatchWrapper';

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

export default () => {
  const [id, setId] = useState<String | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('@stopWatchId').then(storedId => {
      if (storedId === null) {
        Alert.prompt('Enter a stopwatch ID', undefined, newId => {
          setId(id);
          AsyncStorage.setItem('@stopWatchId', newId);
        });
      } else {
        setId(storedId);
      }
    });
  }, []);

  const [stopWatchState, setStopWatchState] = useState<StopWatchState | null>(null);
  useEffect(() => {
    if (id === null) {
      return;
    }
    const interval = setInterval(() => {
      fetch(`https://us-central1-ifttt-stopwatch.cloudfunctions.net/get?id=${id}`)
        .then(response => response.json())
        .then(setStopWatchState);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [id]);

  if (stopWatchState === null) {
    return null;
  }
  return <StopWatchWrapper {...stopWatchState} />;
}
