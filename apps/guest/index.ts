import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from './App';

function Root() {
  return React.createElement(SafeAreaProvider, null, React.createElement(App));
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
