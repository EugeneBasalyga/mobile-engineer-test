import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';

import MainNavigator from '@/app/navigation/Main';

// TODO: Add types

const RootStack = createStackNavigator();

const RootNavigator = () => {
  const isMainLoading = false;

  useEffect(() => {
    const init = async () => {
      if (!isMainLoading) {
        await BootSplash.hide({ fade: true });
      }
    };

    init();
  }, [isMainLoading]);

  const getNavigator = () => {
    // here can be some checks for roles in order to return correct navigator

    return {
      component: MainNavigator,
      name: 'main',
    };
  };

  const currentNavigator = getNavigator();

  return (
    <RootStack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid,
        headerShown: false,
      }}
    >
      <RootStack.Screen component={currentNavigator.component} name={currentNavigator.name} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
