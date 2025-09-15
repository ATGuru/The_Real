import { NativeModules } from 'react-native';

type QueryResult = {
  status?: number;
  title?: string | null;
  totalBytes?: number;
  downloadedBytes?: number;
  localUri?: string | null;
};

type HFDownloaderType = {
  enqueue: (url: string, filename: string) => Promise<number>;
  cancel: (id: number) => Promise<void>;
  query: (id: number) => Promise<QueryResult>;
};

const Missing: HFDownloaderType = {
  async enqueue(url, filename) {
    console.warn('[HFDownloader] Native module not linked.');
    return -1;
  },
  async cancel() {
    console.warn('[HFDownloader] Native module not linked.');
  },
  async query() {
    console.warn('[HFDownloader] Native module not linked.');
    return {};
  },
};

export const HFDownloader: HFDownloaderType = (NativeModules as any).HFDownloader || Missing;
