/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import Navigation from './src/utils/navigation';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <Navigation />
    </>
  );
}

export default App;
