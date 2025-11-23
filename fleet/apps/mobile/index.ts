import { registerRootComponent } from 'expo';
import './global.css';
// Initialize warning suppressor first to suppress expected warnings
import './src/utils/warningSuppressor';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
