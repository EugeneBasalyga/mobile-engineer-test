import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { type FC } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Toast } from '@/packages/shared/components';
import ApplicationContextProvider from '@/packages/shared/contexts/ApplicationContext';
import { createQueryClient } from '@/packages/shared/utils/queryClient';

import { initApplicationContext } from '@/app/config/init';
import { initI18n } from '@/app/i18n/i18n';
import RootNavigator from '@/app/navigation/RootNavigator';

/**
 * Warning from @react-navigation library, will be fixed in future releases.
 * https://github.com/react-navigation/react-navigation/issues/12785
 */
LogBox.ignoreLogs([
  "InteractionManager has been deprecated and will be removed in a future release. Please refactor long tasks into smaller ones, and  use 'requestIdleCallback' instead.",
]);

const { repositories, services } = initApplicationContext();

initI18n();

const queryClient = createQueryClient(repositories.storage);

const App: FC = () => (
  <GestureHandlerRootView>
    <KeyboardProvider>
      <StatusBar animated translucent backgroundColor="transparent" barStyle="dark-content" />

      <NavigationContainer>
        <QueryClientProvider client={queryClient}>
          <ApplicationContextProvider repositories={repositories} services={services}>
            <BottomSheetModalProvider>
              <RootNavigator />
            </BottomSheetModalProvider>

            <Toast />
          </ApplicationContextProvider>
        </QueryClientProvider>
      </NavigationContainer>
    </KeyboardProvider>
  </GestureHandlerRootView>
);

export default App;
