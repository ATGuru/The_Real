import { NativeModules, Platform } from 'react-native';

type LlamaBridgeType = {
  // Initialize with a model file path (e.g., file:///storage/emulated/0/Download/model.gguf)
  loadModel: (path: string) => Promise<boolean>;
  unloadModel: () => Promise<void>;
  // Generate tokens; emits partial tokens over a bridge event. For now we expose a simple call.
  generate: (
    prompt: string,
    options?: { maxTokens?: number; temperature?: number },
  ) => Promise<string>;
  isReady: () => Promise<boolean>;
};

const Missing: LlamaBridgeType = {
  async loadModel() {
    console.warn('[LlamaBridge] Native module not linked. Skipping loadModel.');
    return false;
  },
  async unloadModel() {
    console.warn('[LlamaBridge] Native module not linked. Skipping unloadModel.');
  },
  async generate(prompt: string) {
    console.warn('[LlamaBridge] Native module not linked. Echoing prompt.');
    return `Echo: ${prompt}`;
  },
  async isReady() {
    return false;
  },
};

// Attempt to resolve native module
const Native: LlamaBridgeType = (NativeModules as any).LlamaBridge || Missing;

export const LlamaBridge = Native;
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
