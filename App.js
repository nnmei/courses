import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css"
import Navigation from './navigation';
import { Provider } from 'react-redux';
import { store } from './store'
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './db/database';


export default function App() {
  return (
    <Provider store={store}>
      <SQLiteProvider
        databaseName="db.db" 
        onInit={initializeDatabase}
      >
        <Navigation />
      </SQLiteProvider>
    </Provider>

  );
}
