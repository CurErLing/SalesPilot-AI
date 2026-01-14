import { useCallback, useEffect, useState, useRef } from 'react';
import { bluetoothService } from '../services/BluetoothService';

export interface HardwareFile {
  id: string;
  name: string;
  rawName: Uint8Array;
  size: string;
  rawSize: number;
  duration: string; 
  date: string;
  selected: boolean;
}

export const useHardwareSync = (
  onCreateMeeting: (file: File, context: { isBatch: boolean }) => void,
  onSyncComplete: () => void
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'searching' | 'connected' | 'syncing' | 'disconnected'>('idle');
  const [deviceFiles, setDeviceFiles] = useState<HardwareFile[]>([]);
  
  const [deviceStatus, setDeviceStatus] = useState<{
    battery: number;
    version: string;
    capacity: { used: number; total: number } | null;
  }>({ battery: 0, version: '', capacity: null });
  
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferTime, setTransferTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    return bluetoothService.subscribeToState((state) => {
      setConnectionState(state);
      if (state === 'disconnected' && isModalOpen) {
        setIsModalOpen(false);
        stopTimer();
      }
    });
  }, [isModalOpen]);

  const startTimer = () => {
    setTransferTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTransferTime(t => t + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const openSyncModal = useCallback(async () => {
    setIsModalOpen(true);
    setTransferTime(0);
    try {
        await bluetoothService.connect();
    } catch (e: any) {
        setIsModalOpen(false);
        return;
    }
    
    if (bluetoothService.isConnected) {
        bluetoothService.setStatusCallback((status) => {
            setDeviceStatus(prev => ({ ...prev, ...status }));
        });

        await bluetoothService.getDeviceInfo();

        bluetoothService.fetchFileList((files) => {
            const mappedFiles = files.map((f, idx) => ({
                id: `hw_${idx}`,
                name: f.name,
                rawName: f.rawName,
                rawSize: f.size,
                size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
                duration: '--:--', 
                date: new Date(f.time * 1000).toLocaleDateString(),
                selected: false
            }));
            setDeviceFiles(mappedFiles);
        });
    }
  }, []);

  const closeSyncModal = useCallback(() => {
    stopTimer();
    bluetoothService.disconnect();
    setIsModalOpen(false);
    setConnectionState('idle');
    setDeviceFiles([]);
    setTransferTime(0);
  }, []);

  const toggleFileSelection = useCallback((id: string) => {
    setDeviceFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  }, []);

  const handleSync = useCallback(async () => {
    const filesToSync = deviceFiles.filter(f => f.selected);
    if (filesToSync.length === 0) return;

    const isBatch = filesToSync.length > 1;
    startTimer();

    for (const fileData of filesToSync) {
      setTransferProgress(0);
      try {
        await new Promise<void>((resolve) => {
            bluetoothService.downloadFile(
                fileData.name,
                fileData.rawName,
                fileData.rawSize,
                (pct) => setTransferProgress(pct),
                (file) => {
                    onCreateMeeting(file, { isBatch });
                    resolve();
                },
                (errStr) => {
                    resolve(); 
                }
            );
        });
      } catch (e) {
        console.error("Sync loop error", e);
      }
    }

    stopTimer();
    setTransferProgress(100);
    setTimeout(() => {
      onSyncComplete();
      closeSyncModal();
    }, 500);
  }, [deviceFiles, onCreateMeeting, onSyncComplete, closeSyncModal]);

  return {
    isModalOpen,
    connectionState,
    deviceFiles,
    deviceStatus,
    transferProgress,
    transferTime,
    openSyncModal,
    closeSyncModal,
    toggleFileSelection,
    handleSync
  };
};
