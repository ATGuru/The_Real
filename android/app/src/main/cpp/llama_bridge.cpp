#include <jni.h>
#include <string>

static bool g_loaded = false;
static std::string g_model_path;

extern "C" JNIEXPORT jboolean JNICALL
Java_com_omnix_llama_LlamaNative_loadModel(
    JNIEnv* env,
    jobject /*thiz*/,
    jstring path) {
  const char* cpath = env->GetStringUTFChars(path, nullptr);
  g_model_path = cpath ? cpath : "";
  env->ReleaseStringUTFChars(path, cpath);
  // TODO: integrate llama.cpp initialization here
  g_loaded = true;
  return g_loaded ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT void JNICALL
Java_com_omnix_llama_LlamaNative_unloadModel(
    JNIEnv* /*env*/, jobject /*thiz*/) {
  // TODO: free llama.cpp resources
  g_loaded = false;
  g_model_path.clear();
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_omnix_llama_LlamaNative_isReady(
    JNIEnv* /*env*/, jobject /*thiz*/) {
  return g_loaded ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_omnix_llama_LlamaNative_generate(
    JNIEnv* env,
    jobject /*thiz*/,
    jstring prompt,
    jstring systemPrompt,
    jint /*maxTokens*/,
    jfloat /*temperature*/) {
  const char* cp = env->GetStringUTFChars(prompt, nullptr);
  const char* cs = systemPrompt ? env->GetStringUTFChars(systemPrompt, nullptr) : nullptr;
  std::string sys = cs ? cs : "";
  std::string pr = cp ? cp : "";
  if (prompt) env->ReleaseStringUTFChars(prompt, cp);
  if (systemPrompt) env->ReleaseStringUTFChars(systemPrompt, cs);
  std::string out;
  if (g_loaded) {
    out = "Assistant:";
    if (!sys.empty()) {
      out += "\n" + sys + "\n";
    } else {
      out += " ";
    }
    out += pr;
  } else {
    out = std::string("Echo: ") + pr;
  }
  return env->NewStringUTF(out.c_str());
}

