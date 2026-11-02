import { times } from 'lodash';
import { memo } from 'react';
import { View } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import Dot from './Dot';

const styles = StyleSheet.create((theme) => {
  return {
    root: {
      alignSelf: 'center',
      columnGap: theme.spacing.sm,
      flexDirection: 'row',
    },
  };
});

interface PagesControlProps {
  count: number;
  progress: SharedValue<number>;
  size?: number;
}

const PagesControl = memo(({ count, progress, size = 6 }: PagesControlProps) => (
  <View style={styles.root}>
    {times(count, (index) => {
      return <Dot key={index} count={count} index={index} progress={progress} size={size} />;
    })}
  </View>
));

PagesControl.displayName = 'PagesControl';

export default PagesControl;
