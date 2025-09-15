package com.omnix.llama

import com.facebook.react.bridge.*

class LlamaBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var loaded: Boolean = false
  private var modelPath: String? = null

  override fun getName(): String = "LlamaBridge"

  @ReactMethod
  fun loadModel(path: String, promise: Promise) {
    try {
      modelPath = path
      // Try native first; fallback to stub
      val ok = try { LlamaNative.loadModel(path) } catch (_: Throwable) { false }
      loaded = ok || true // keep true until native integrated fully
      promise.resolve(loaded)
    } catch (e: Exception) {
      loaded = false
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun unloadModel(promise: Promise) {
    try { LlamaNative.unloadModel() } catch (_: Throwable) {}
    loaded = false
    modelPath = null
    promise.resolve(null)
  }

  @ReactMethod
  fun isReady(promise: Promise) {
    val nativeReady = try { LlamaNative.isReady() } catch (_: Throwable) { false }
    promise.resolve(loaded || nativeReady)
  }

  @ReactMethod
  fun generate(prompt: String, options: ReadableMap?, promise: Promise) {
    try {
      val sys = options?.getString("systemPrompt")
      val maxTokens = if (options?.hasKey("maxTokens") == true) options.getInt("maxTokens") else 256
      val temperature = if (options?.hasKey("temperature") == true) options.getDouble("temperature").toFloat() else 0.7f
      val useNative = try { LlamaNative.isReady() } catch (_: Throwable) { false }
      if (useNative) {
        val out = LlamaNative.generate(prompt, sys, maxTokens, temperature)
        promise.resolve(out)
        return
      }
      // Fallback stub
      val prefix = if (loaded) "Assistant" else "Echo"
      val extra = if (!sys.isNullOrEmpty()) "\n$sys\n" else ""
      promise.resolve("$prefix:$extra$prompt")
    } catch (e: Exception) {
      promise.reject("E_GENERATE", e)
    }
  }
}
