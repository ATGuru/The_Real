import DeviceInfo from 'react-native-device-info';

export type DeviceProfile = {
  totalRamGB: number;
  freeStorageGB: number;
  supportedAbis: string[];
};

function toGB(bytes: number): number {
  const gb = bytes / 1024 ** 3;
  return Math.round(gb * 100) / 100; // 2 decimals
}

export async function getDeviceProfile(): Promise<DeviceProfile> {
  const [totalMemBytes, freeDiskBytes, abis] = await Promise.all([
    DeviceInfo.getTotalMemory(),
    DeviceInfo.getFreeDiskStorage(),
    DeviceInfo.getSupportedAbis(),
  ]);

  return {
    totalRamGB: toGB(totalMemBytes || 0),
    freeStorageGB: toGB(freeDiskBytes || 0),
    supportedAbis: abis || [],
  };
}
