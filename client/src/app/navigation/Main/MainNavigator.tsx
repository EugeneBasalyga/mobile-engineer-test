import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { type MainStackParamList } from '@/app/models/navigation/main';
import { MAIN_ROUTE } from '@/app/routes/routes';
import { MainScreens } from '@/app/screens';

const MainStack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => (
  <MainStack.Navigator
    initialRouteName={MAIN_ROUTE.IMPORT}
    screenOptions={{
      headerShown: false,
    }}
  >
    <MainStack.Group>
      <MainStack.Screen component={MainScreens.ImportScreen} name={MAIN_ROUTE.IMPORT} />

      <MainStack.Screen component={MainScreens.ItemScreen} name={MAIN_ROUTE.ITEM} />

      <MainStack.Screen component={MainScreens.DiagnosticsScreen} name={MAIN_ROUTE.DIAGNOSTICS} />
    </MainStack.Group>
  </MainStack.Navigator>
);

export default MainNavigator;
