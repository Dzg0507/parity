# 🎤 ElevenLabs TTS Setup Guide

## 🚀 **What I've Implemented**

I've created a complete ElevenLabs TTS integration for your Vibe avatar:

### **✅ New ElevenLabs TTS Service:**
- **High-quality AI voices** from ElevenLabs
- **Real-time speech generation** with your custom voice
- **Fallback to basic TTS** if API key is missing
- **Settings management** for rate and volume
- **Event callbacks** for speech start/end

### **✅ Updated Components:**
- **ReadyPlayerMeAvatar** - 3D avatar with ElevenLabs TTS
- **VibeAvatar** - Basic avatar with ElevenLabs TTS
- **TTSSettings** - Voice configuration panel

## 🔧 **Environment Setup**

### **1. Add to your `.env` file:**
```env
ELEVEN_LABS_API_KEY=your_api_key_here
VOICE_ID=your_voice_id_here
```

### **2. Get your ElevenLabs API Key:**
1. **Sign up** at [https://elevenlabs.io](https://elevenlabs.io)
2. **Go to Profile** → **API Keys**
3. **Copy your API key**

### **3. Get your Voice ID:**
1. **Go to Voice Library** in ElevenLabs
2. **Choose a voice** (or create a custom one)
3. **Copy the Voice ID** from the URL or voice settings

## 🎯 **How It Works**

### **Primary: ElevenLabs TTS**
- **High-quality AI voices** with natural speech
- **Real-time generation** from text
- **Custom voice** using your Voice ID
- **Professional audio quality**

### **Fallback: Basic TTS**
- **Web Speech API** for web
- **React Native TTS** for mobile
- **Automatic fallback** if ElevenLabs fails

## 🎨 **Features**

### **Voice Settings:**
- **Rate control** (0.1x - 2.0x speed)
- **Volume control** (0.0 - 1.0)
- **Enable/disable** TTS
- **Test voice** button

### **Integration:**
- **Works with 3D avatar** animations
- **Real-time lip-sync** during speech
- **Event callbacks** for UI updates
- **Error handling** and fallbacks

## 🚀 **Usage**

### **In your components:**
```jsx
import elevenLabsTtsService from '../../utils/elevenLabsTtsService';

// Initialize
await elevenLabsTtsService.initialize();

// Speak text
await elevenLabsTtsService.speak("Hello! I'm Vibe, your AI communication coach.");

// Set up event listeners
elevenLabsTtsService.setOnSpeechStart(() => {
  console.log('Started speaking');
});

elevenLabsTtsService.setOnSpeechEnd(() => {
  console.log('Finished speaking');
});
```

## 🔍 **Testing**

### **1. Test without API key:**
- Should fallback to basic TTS
- Check console for warnings

### **2. Test with API key:**
- Should use ElevenLabs voices
- Higher quality audio
- Natural speech patterns

### **3. Test voice settings:**
- Use the settings panel (⚙️ button)
- Adjust rate and volume
- Test voice button

## 💡 **Pro Tips**

- **Start with a free ElevenLabs account** (10,000 characters/month)
- **Choose a professional voice** that matches Vibe's personality
- **Test different voices** to find the perfect match
- **Monitor usage** to stay within limits

## 🎭 **Your Vibe Now Has:**

- ✅ **Professional AI voice** from ElevenLabs
- ✅ **3D avatar** with realistic animations
- ✅ **Real-time TTS** integration
- ✅ **Voice customization** options
- ✅ **Fallback TTS** for reliability

**Your Vibe now sounds as professional as it looks!** 🎤✨
