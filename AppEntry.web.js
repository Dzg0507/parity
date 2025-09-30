// Web-specific entry point
import { registerRootComponent } from 'expo';
import App from './App';

// Web-specific setup
if (typeof window !== 'undefined') {
  // Ensure proper web environment setup
  window.addEventListener('DOMContentLoaded', () => {
    // Any web-specific initialization can go here
  });
}

registerRootComponent(App);