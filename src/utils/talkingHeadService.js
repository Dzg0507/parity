import { Platform } from 'react-native';

class TalkingHeadService {
  constructor() {
    this.isInitialized = false;
    this.avatar = null;
    this.isSpeaking = false;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
  }

  async initialize() {
    if (this.isInitialized || Platform.OS !== 'web') return;

    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.isInitialized = true;
      console.log('TalkingHead Service initialized');
    } catch (error) {
      console.error('Failed to initialize TalkingHead Service:', error);
    }
  }

  // Create a simple lip-sync animation based on audio frequency
  startLipSync(audioElement) {
    if (!this.isInitialized || Platform.OS !== 'web') return;

    try {
      // Connect audio to analyser
      const source = this.audioContext.createMediaElementSource(audioElement);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Start lip-sync animation
      this.animateLipSync();
    } catch (error) {
      console.error('Failed to start lip-sync:', error);
    }
  }

  animateLipSync() {
    if (!this.isInitialized) return;

    const animate = () => {
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Calculate average frequency
      const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
      
      // Convert to mouth opening (0-1)
      const mouthOpening = Math.min(average / 128, 1);
      
      // Dispatch custom event for avatar to listen to
      const event = new CustomEvent('lipSyncUpdate', { 
        detail: { mouthOpening, isSpeaking: average > 10 } 
      });
      window.dispatchEvent(event);

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  stopLipSync() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Dispatch stop event
    const event = new CustomEvent('lipSyncUpdate', { 
      detail: { mouthOpening: 0, isSpeaking: false } 
    });
    window.dispatchEvent(event);
  }

  // Create a simple 3D avatar using CSS transforms
  createSimpleAvatar(containerId) {
    if (Platform.OS !== 'web') return null;

    const container = document.getElementById(containerId);
    if (!container) return null;

    // Create avatar HTML structure
    const avatarHTML = `
      <div class="talking-head-avatar">
        <div class="avatar-face">
          <div class="avatar-eyes">
            <div class="eye left-eye">
              <div class="pupil"></div>
            </div>
            <div class="eye right-eye">
              <div class="pupil"></div>
            </div>
          </div>
          <div class="avatar-mouth">
            <div class="mouth-inner"></div>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const styles = `
      <style>
        .talking-head-avatar {
          width: 120px;
          height: 120px;
          position: relative;
          perspective: 1000px;
        }
        
        .avatar-face {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        
        .avatar-eyes {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
        }
        
        .eye {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          position: relative;
          transition: transform 0.1s ease;
        }
        
        .pupil {
          width: 8px;
          height: 8px;
          background: #333;
          border-radius: 50%;
          position: absolute;
          top: 4px;
          left: 4px;
          transition: transform 0.1s ease;
        }
        
        .avatar-mouth {
          position: absolute;
          bottom: 25%;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 15px;
          background: white;
          border-radius: 15px 15px 0 0;
          overflow: hidden;
          transition: all 0.1s ease;
        }
        
        .mouth-inner {
          width: 100%;
          height: 100%;
          background: #ff6b6b;
          border-radius: 15px 15px 0 0;
          transform-origin: bottom;
          transition: transform 0.1s ease;
        }
        
        .talking-head-avatar.speaking .avatar-face {
          transform: scale(1.05);
        }
        
        .talking-head-avatar.speaking .eye {
          transform: scaleY(0.8);
        }
      </style>
    `;

    // Add styles to head if not already added
    if (!document.getElementById('talking-head-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'talking-head-styles';
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }

    container.innerHTML = avatarHTML;
    const avatar = container.querySelector('.talking-head-avatar');

    // Listen for lip-sync events
    window.addEventListener('lipSyncUpdate', (event) => {
      const { mouthOpening, isSpeaking } = event.detail;
      
      if (isSpeaking) {
        avatar.classList.add('speaking');
      } else {
        avatar.classList.remove('speaking');
      }

      // Update mouth opening
      const mouthInner = avatar.querySelector('.mouth-inner');
      if (mouthInner) {
        const scale = 0.3 + (mouthOpening * 0.7); // Scale from 0.3 to 1.0
        mouthInner.style.transform = `scaleY(${scale})`;
      }
    });

    return avatar;
  }

  // Cleanup
  destroy() {
    this.stopLipSync();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
const talkingHeadService = new TalkingHeadService();

export default talkingHeadService;
