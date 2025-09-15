package com.omnix.llama

object LlamaNative {
  init {
    try {
      System.loadLibrary("llama_bridge")
    } catch (e: UnsatisfiedLinkError) {
      // Library not present; calls will no-op
    }
  }

  external fun loadModel(path: String): Boolean
  external fun unloadModel()
  external fun isReady(): Boolean
  external fun generate(prompt: String, systemPrompt: String?, maxTokens: Int, temperature: Float): String
}

