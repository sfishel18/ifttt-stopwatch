export interface StopWatchState {
  direction: 'up' | 'down' | 'pause',
  previousValue: number,
  lastUpdatedTime?: number,
}
