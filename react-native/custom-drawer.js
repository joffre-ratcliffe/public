import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = 250;

const CustomDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize the drawer off-screen to the left
  const slideAnimation = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const toggleDrawer = () => {
    // If it's open, slide it back out of view (-250). If closed, slide it in (0).
    const toValue = isOpen ? -DRAWER_WIDTH : 0;
    
    Animated.timing(slideAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true, // Crucial for smooth, 60fps animations
    }).start();
    
    setIsOpen(!isOpen);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Main Background Content */}
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.placeholder} /> {/* To center the title */}
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>Your main app content goes here.</Text>
        </View>
      </View>

      {/* 2. Dimmed Overlay (Tapping this closes the drawer) */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        />
      )}

      {/* 3. The Animated Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnimation }],
          },
        ]}
      >
        <SafeAreaView>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerHeaderText}>Navigation</Text>
          </View>
          
          <TouchableOpacity style={styles.drawerItem}>
            <Text style={styles.drawerItemText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.drawerItem}>
            <Text style={styles.drawerItemText}>Settings</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuButton: {
    padding: 5,
  },
  hamburgerIcon: {
    fontSize: 28,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 30, // Matches hamburger icon width roughly to balance flex-between
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#666',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 15,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomDrawer;
