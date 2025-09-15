// Lightweight Hugging Face API helpers (scaffold)
// NOTE: For large file downloads, prefer a native downloader or react-native-fs.

export type HFModelFile = {
  repoId: string; // e.g., TheBloke/TinyLLama-GGUF
  filename: string; // e.g., tinyllama-q4_k_m.gguf
  sizeBytes?: number;
};

export type HFListItem = {
  id: string;
  name: string;
  sizeGB: number;
  repoId: string;
  filename: string;
};

// Hardcoded examples to avoid network at build time; populate dynamically in-app later
export const CATALOG: HFListItem[] = [
  {
    id: 'tinyllama-q4km',
    name: 'TinyLLaMA 1.1B Q4_K_M',
    sizeGB: 0.6,
    repoId: 'TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF',
    filename: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
  },
  {
    id: 'phi3-mini-q4',
    name: 'Phi-3 Mini Q4',
    sizeGB: 2.0,
    repoId: 'microsoft/Phi-3-mini-4k-instruct-gguf',
    filename: 'phi-3-mini-4k-instruct-q4_0.gguf',
  },
];

export function modelDownloadUrl(m: HFListItem): string {
  // Public HTTPS URL structure
  return `https://huggingface.co/${m.repoId}/resolve/main/${m.filename}`;
}
