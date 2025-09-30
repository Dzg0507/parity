// ACCESSIBILITY SYSTEM
// This is going to make the app ACCESSIBLE TO EVERYONE! ♿

import { storage } from './storage';

// 1. ACCESSIBILITY MANAGER
export class AccessibilityManager {
  constructor() {
    this.settings = new Map();
    this.assistiveTechnologies = new Map();
    this.announcements = [];
  }

  // Initialize accessibility
  async initializeAccessibility() {
    const defaultSettings = {
      screenReader: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      voiceOver: false,
      talkBack: false,
      switchControl: false,
      voiceControl: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindSupport: false,
      dyslexiaSupport: false,
      fontSize: 'medium',
      contrastRatio: 'normal',
      animationSpeed: 'normal',
      soundEffects: true,
      hapticFeedback: true,
    };

    await this.setAccessibilitySettings(defaultSettings);
  }

  // Set accessibility settings
  async setAccessibilitySettings(settings) {
    this.settings = new Map(Object.entries(settings));
    await storage.setItem('accessibility_settings', JSON.stringify(settings));
  }

  // Get accessibility settings
  async getAccessibilitySettings() {
    const stored = await storage.getItem('accessibility_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      this.settings = new Map(Object.entries(settings));
      return settings;
    }
    return {};
  }

  // Update setting
  async updateSetting(key, value) {
    this.settings.set(key, value);
    const settings = Object.fromEntries(this.settings);
    await storage.setItem('accessibility_settings', JSON.stringify(settings));
  }

  // Get setting
  getSetting(key) {
    return this.settings.get(key);
  }

  // Check if setting is enabled
  isEnabled(key) {
    return this.settings.get(key) === true;
  }

  // Announce to screen reader
  announce(message, priority = 'polite') {
    const announcement = {
      id: this.generateAnnouncementId(),
      message,
      priority,
      timestamp: Date.now(),
    };

    this.announcements.push(announcement);
    
    // Keep only last 100 announcements
    if (this.announcements.length > 100) {
      this.announcements.splice(0, this.announcements.length - 100);
    }

    // In a real implementation, this would use the platform's screen reader API
    console.log(`Screen reader announcement (${priority}): ${message}`);
  }

  // Generate announcement ID
  generateAnnouncementId() {
    return `announcement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get accessibility level
  getAccessibilityLevel() {
    const enabledSettings = Array.from(this.settings.entries())
      .filter(([key, value]) => value === true).length;
    
    if (enabledSettings >= 8) return 'high';
    if (enabledSettings >= 4) return 'medium';
    return 'low';
  }

  // Get accessibility recommendations
  getAccessibilityRecommendations() {
    const recommendations = [];
    const settings = Object.fromEntries(this.settings);
    
    if (!settings.screenReader && !settings.voiceOver && !settings.talkBack) {
      recommendations.push({
        type: 'screen_reader',
        title: 'Enable Screen Reader Support',
        description: 'Enable screen reader support for better accessibility',
        priority: 'high',
      });
    }
    
    if (!settings.highContrast) {
      recommendations.push({
        type: 'high_contrast',
        title: 'Enable High Contrast',
        description: 'Enable high contrast mode for better visibility',
        priority: 'medium',
      });
    }
    
    if (!settings.largeText) {
      recommendations.push({
        type: 'large_text',
        title: 'Enable Large Text',
        description: 'Enable large text for better readability',
        priority: 'medium',
      });
    }
    
    if (!settings.reducedMotion) {
      recommendations.push({
        type: 'reduced_motion',
        title: 'Enable Reduced Motion',
        description: 'Enable reduced motion for users with vestibular disorders',
        priority: 'low',
      });
    }
    
    return recommendations;
  }
}

export const accessibilityManager = new AccessibilityManager();

// 2. SCREEN READER SUPPORT
export class ScreenReaderSupport {
  constructor() {
    this.accessibilityManager = accessibilityManager;
  }

  // Set accessible label
  setAccessibleLabel(element, label) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('aria-label', label);
    }
  }

  // Set accessible description
  setAccessibleDescription(element, description) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('aria-describedby', description);
    }
  }

  // Set accessible role
  setAccessibleRole(element, role) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', role);
    }
  }

  // Set accessible state
  setAccessibleState(element, state, value) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute(`aria-${state}`, value);
    }
  }

  // Set accessible heading level
  setAccessibleHeading(element, level) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', 'heading');
      element.setAttribute('aria-level', level);
    }
  }

  // Set accessible button
  setAccessibleButton(element, label, pressed = false) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', label);
      if (pressed !== false) {
        element.setAttribute('aria-pressed', pressed);
      }
    }
  }

  // Set accessible link
  setAccessibleLink(element, label, href) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', 'link');
      element.setAttribute('aria-label', label);
      if (href) {
        element.setAttribute('href', href);
      }
    }
  }

  // Set accessible image
  setAccessibleImage(element, alt, decorative = false) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      if (decorative) {
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('alt', '');
      } else {
        element.setAttribute('alt', alt);
      }
    }
  }

  // Set accessible form field
  setAccessibleFormField(element, label, required = false, invalid = false) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('aria-label', label);
      if (required) {
        element.setAttribute('aria-required', 'true');
      }
      if (invalid) {
        element.setAttribute('aria-invalid', 'true');
      }
    }
  }

  // Set accessible table
  setAccessibleTable(element, caption, headers) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', 'table');
      if (caption) {
        element.setAttribute('aria-label', caption);
      }
      if (headers) {
        element.setAttribute('aria-labelledby', headers);
      }
    }
  }

  // Set accessible list
  setAccessibleList(element, label) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', 'list');
      if (label) {
        element.setAttribute('aria-label', label);
      }
    }
  }

  // Set accessible list item
  setAccessibleListItem(element, label) {
    if (this.accessibilityManager.isEnabled('screenReader')) {
      element.setAttribute('role', 'listitem');
      if (label) {
        element.setAttribute('aria-label', label);
      }
    }
  }
}

export const screenReaderSupport = new ScreenReaderSupport();

// 3. KEYBOARD NAVIGATION
export class KeyboardNavigation {
  constructor() {
    this.accessibilityManager = accessibilityManager;
    this.focusableElements = [];
    this.currentFocusIndex = 0;
  }

  // Initialize keyboard navigation
  initializeKeyboardNavigation() {
    if (!this.accessibilityManager.isEnabled('keyboardNavigation')) return;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.updateFocusableElements();
  }

  // Handle key down events
  handleKeyDown(event) {
    if (!this.accessibilityManager.isEnabled('keyboardNavigation')) return;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        this.handleTab(event.shiftKey);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'Escape':
        this.handleEscape(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowKeys(event);
        break;
    }
  }

  // Handle tab navigation
  handleTab(shiftKey) {
    if (shiftKey) {
      this.previousFocus();
    } else {
      this.nextFocus();
    }
  }

  // Handle activation
  handleActivation(event) {
    const focusedElement = document.activeElement;
    if (focusedElement) {
      focusedElement.click();
    }
  }

  // Handle escape
  handleEscape(event) {
    // Close modals, menus, etc.
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      if (modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    });
  }

  // Handle arrow keys
  handleArrowKeys(event) {
    const focusedElement = document.activeElement;
    if (!focusedElement) return;

    const role = focusedElement.getAttribute('role');
    if (role === 'menuitem' || role === 'tab') {
      event.preventDefault();
      this.navigateInGroup(focusedElement, event.key);
    }
  }

  // Navigate in group
  navigateInGroup(element, direction) {
    const group = element.closest('[role="menu"], [role="tablist"]');
    if (!group) return;

    const items = Array.from(group.querySelectorAll('[role="menuitem"], [role="tab"]'));
    const currentIndex = items.indexOf(element);
    
    let nextIndex;
    switch (direction) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    if (nextIndex !== undefined) {
      items[nextIndex].focus();
    }
  }

  // Next focus
  nextFocus() {
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  // Previous focus
  previousFocus() {
    this.currentFocusIndex = this.currentFocusIndex > 0 ? 
      this.currentFocusIndex - 1 : 
      this.focusableElements.length - 1;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  // Update focusable elements
  updateFocusableElements() {
    this.focusableElements = Array.from(document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
  }

  // Set focus order
  setFocusOrder(elements) {
    elements.forEach((element, index) => {
      element.setAttribute('tabindex', index + 1);
    });
  }

  // Trap focus
  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }
}

export const keyboardNavigation = new KeyboardNavigation();

// 4. COLOR AND CONTRAST
export class ColorAndContrast {
  constructor() {
    this.accessibilityManager = accessibilityManager;
    this.colorBlindTypes = ['protanopia', 'deuteranopia', 'tritanopia', 'monochromacy'];
  }

  // Check contrast ratio
  checkContrastRatio(foreground, background) {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Get luminance
  getLuminance(color) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Check if contrast meets WCAG standards
  meetsWCAGStandards(foreground, background, level = 'AA') {
    const ratio = this.checkContrastRatio(foreground, background);
    
    if (level === 'AA') {
      return ratio >= 4.5;
    } else if (level === 'AAA') {
      return ratio >= 7;
    }
    
    return false;
  }

  // Apply high contrast mode
  applyHighContrastMode() {
    if (!this.accessibilityManager.isEnabled('highContrast')) return;

    const style = document.createElement('style');
    style.id = 'high-contrast-mode';
    style.textContent = `
      * {
        background-color: #000000 !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
      }
      
      a {
        color: #ffff00 !important;
      }
      
      button {
        background-color: #ffffff !important;
        color: #000000 !important;
        border: 2px solid #ffffff !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Remove high contrast mode
  removeHighContrastMode() {
    const style = document.getElementById('high-contrast-mode');
    if (style) {
      style.remove();
    }
  }

  // Apply color blind support
  applyColorBlindSupport(type) {
    if (!this.accessibilityManager.isEnabled('colorBlindSupport')) return;

    const style = document.createElement('style');
    style.id = 'color-blind-support';
    
    let filter = '';
    switch (type) {
      case 'protanopia':
        filter = 'sepia(1) saturate(2) hue-rotate(90deg)';
        break;
      case 'deuteranopia':
        filter = 'sepia(1) saturate(2) hue-rotate(180deg)';
        break;
      case 'tritanopia':
        filter = 'sepia(1) saturate(2) hue-rotate(270deg)';
        break;
      case 'monochromacy':
        filter = 'grayscale(1)';
        break;
    }
    
    style.textContent = `
      * {
        filter: ${filter} !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Remove color blind support
  removeColorBlindSupport() {
    const style = document.getElementById('color-blind-support');
    if (style) {
      style.remove();
    }
  }

  // Get accessible colors
  getAccessibleColors(baseColor) {
    const colors = [];
    const baseRgb = this.hexToRgb(baseColor);
    if (!baseRgb) return colors;
    
    // Generate variations with different contrast ratios
    for (let i = 0; i < 10; i++) {
      const factor = i / 10;
      const color = {
        r: Math.round(baseRgb.r * factor),
        g: Math.round(baseRgb.g * factor),
        b: Math.round(baseRgb.b * factor),
      };
      
      const hex = this.rgbToHex(color.r, color.g, color.b);
      const contrast = this.checkContrastRatio(hex, '#ffffff');
      
      colors.push({
        hex,
        contrast,
        accessible: contrast >= 4.5,
      });
    }
    
    return colors;
  }

  // Convert RGB to hex
  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

export const colorAndContrast = new ColorAndContrast();

// 5. MOTION AND ANIMATION
export class MotionAndAnimation {
  constructor() {
    this.accessibilityManager = accessibilityManager;
  }

  // Apply reduced motion
  applyReducedMotion() {
    if (!this.accessibilityManager.isEnabled('reducedMotion')) return;

    const style = document.createElement('style');
    style.id = 'reduced-motion';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Remove reduced motion
  removeReducedMotion() {
    const style = document.getElementById('reduced-motion');
    if (style) {
      style.remove();
    }
  }

  // Check if motion should be reduced
  shouldReduceMotion() {
    return this.accessibilityManager.isEnabled('reducedMotion');
  }

  // Create accessible animation
  createAccessibleAnimation(element, animation, duration = 300) {
    if (this.shouldReduceMotion()) {
      // Apply instant transition for reduced motion
      element.style.transition = 'none';
      element.style.transform = animation.to;
      return;
    }
    
    // Apply normal animation
    element.style.transition = `all ${duration}ms ease-in-out`;
    element.style.transform = animation.to;
  }
}

export const motionAndAnimation = new MotionAndAnimation();

// 6. ACCESSIBILITY TESTING
export class AccessibilityTesting {
  constructor() {
    this.accessibilityManager = accessibilityManager;
  }

  // Run accessibility audit
  async runAccessibilityAudit() {
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push({
          type: 'missing_alt_text',
          element: img,
          severity: 'high',
          message: 'Image missing alt text',
        });
      }
    });
    
    // Check for missing labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.id;
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledby) {
        issues.push({
          type: 'missing_label',
          element: input,
          severity: 'high',
          message: 'Form field missing label',
        });
      }
    });
    
    // Check for missing headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    if (headings.length === 0) {
      issues.push({
        type: 'missing_headings',
        element: document.body,
        severity: 'medium',
        message: 'Page missing headings',
      });
    }
    
    // Check for missing landmarks
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
    if (landmarks.length === 0) {
      issues.push({
        type: 'missing_landmarks',
        element: document.body,
        severity: 'medium',
        message: 'Page missing landmark roles',
      });
    }
    
    // Check for color contrast
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = colorAndContrast.checkContrastRatio(color, backgroundColor);
        if (contrast < 4.5) {
          issues.push({
            type: 'low_contrast',
            element,
            severity: 'high',
            message: `Low contrast ratio: ${contrast.toFixed(2)}`,
          });
        }
      }
    });
    
    return issues;
  }

  // Get accessibility score
  async getAccessibilityScore() {
    const issues = await this.runAccessibilityAudit();
    const totalIssues = issues.length;
    const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
    const mediumSeverityIssues = issues.filter(i => i.severity === 'medium').length;
    const lowSeverityIssues = issues.filter(i => i.severity === 'low').length;
    
    // Calculate score (100 - weighted issues)
    const score = Math.max(0, 100 - (highSeverityIssues * 10) - (mediumSeverityIssues * 5) - (lowSeverityIssues * 1));
    
    return {
      score,
      totalIssues,
      highSeverityIssues,
      mediumSeverityIssues,
      lowSeverityIssues,
      issues,
    };
  }
}

export const accessibilityTesting = new AccessibilityTesting();

export default {
  accessibilityManager,
  screenReaderSupport,
  keyboardNavigation,
  colorAndContrast,
  motionAndAnimation,
  accessibilityTesting,
};
