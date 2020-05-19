import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const POSITIVE_BG_COLOR = 'green';
const NEGATIVE_BG_COLOR = 'red';

const zeroPad = (num: number) => num < 10 ? `0${String(num)}` : String(num)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    fontSize: 120,
    color: 'white',
  },
});

interface StopWatchProps {
  time: number,
};

export default ({ time }: StopWatchProps) => {
  const isNegative = time < 0;
  const absTime = Math.abs(time);
  const hours = Math.floor(absTime / (60 * 60 * 1000));
  const minutes = Math.floor((absTime % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((absTime % (60 * 1000)) / 1000);
  return (
    <View style={[styles.container, { backgroundColor: isNegative ? NEGATIVE_BG_COLOR : POSITIVE_BG_COLOR}]}>
      <Text style={styles.counter}>
        {isNegative ? '-' : ''}{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
      </Text>
    </View>
  )
}
