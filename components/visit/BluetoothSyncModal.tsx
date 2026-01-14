import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Smartphone, Bluetooth, X, ChevronRight, FileAudio, Clock, Download, Loader2, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { bluetoothService, DeviceFileInfo, DeviceStatus } from '../../services/BluetoothService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onFileComplete: (file: File) => void;
}

type SyncStep = 'idle' | 'searching' | 'listing' | 'syncing' | 'complete';

export const BluetoothSyncModal: React.FC<Props> = ({ isOpen, onClose, onFileComplete }) => {
    const [step, setStep] = useState<SyncStep>('idle');
    const [files, setFiles] = useState<DeviceFileInfo[]>([]);
    const [status, setStatus] = useState<Partial<DeviceStatus>>({});
    const [syncProgress, setSyncProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        
        const unsubscribe = bluetoothService.subscribeToState((state) => {
            if (state === 'searching') setStep('searching');
            else if (state === 'connected') setStep('listing');
            else if (state === 'syncing') setStep('syncing');
            else if (state === 'disconnected') {
                if (step !== 'idle' && step !== 'complete') {
                    setError("设备已断开连接");
                    setStep('idle');
                }
            }
        });

        bluetoothService.setStatusCallback((s) => setStatus(prev => ({ ...prev, ...s })));

        return () => unsubscribe();
    }, [isOpen, step]);

    const handleConnect = async () => {
        setError(null);
        try {
            await bluetoothService.connect();
            if (bluetoothService.isConnected) {
                setStep('listing');
                await bluetoothService.getDeviceInfo();
                bluetoothService.fetchFileList((fileList) => {
                    setFiles(fileList.sort((a, b) => b.time - a.time));
                });
            }
        } catch (e: any) {
            setError(e.message || "连接失败");
            setStep('idle');
        }
    };

    const handleDownload = async (fileInfo: DeviceFileInfo) => {
        setError(null);
        setSyncProgress(0);
        setStep('syncing');
        
        try {
            await bluetoothService.downloadFile(
                fileInfo.name,
                fileInfo.rawName,
                fileInfo.size,
                (pct) => setSyncProgress(pct),
                (file) => {
                    setStep('complete');
                    setTimeout(() => onFileComplete(file), 1000);
                },
                (err) => {
                    setError(err);
                    setStep('listing');
                }
            );
        } catch (e: any) {
            setError(e.message);
            setStep('listing');
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (ts: number) => {
        return new Date(ts * 1000).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-xl"
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black text-slate-800">硬件设备同步</span>
                </div>
            }
            footer={
                step === 'listing' ? (
                    <div className="flex justify-between items-center w-full px-2">
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Bluetooth className="w-3.5 h-3.5 text-indigo-500" /> 已连接
                            </div>
                            {status.battery !== undefined && (
                                <span>电量: {status.battery}%</span>
                            )}
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => bluetoothService.disconnect()}>断开并退出</Button>
                    </div>
                ) : null
            }
        >
            <div className="min-h-[400px] flex flex-col">
                {(step === 'idle' || step === 'searching') && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-full animate-pulse scale-150"></div>
                            <div className="relative w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                <Bluetooth className={`w-16 h-16 text-indigo-600 ${step === 'searching' ? 'animate-pulse' : ''}`} />
                                {step === 'searching' && (
                                    <div className="absolute top-2 right-4 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-slate-800">
                                {step === 'searching' ? '正在搜索设备...' : '准备同步录音笔'}
                            </h3>
                            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                                请确保录音笔已开机，并且蓝牙已开启。在浏览器弹出的窗口中选择您的设备。
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full border border-red-100">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button 
                            onClick={handleConnect} 
                            size="lg" 
                            isLoading={step === 'searching'}
                            className="w-full max-w-xs shadow-xl shadow-indigo-200"
                        >
                            {step === 'searching' ? '等待连接...' : '开始连接设备'}
                        </Button>
                    </div>
                )}

                {step === 'listing' && (
                    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <HardDrive className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">存储空间</div>
                                    <div className="text-xs font-bold text-slate-700">
                                        {status.capacity ? `已用 ${formatSize(status.capacity.used)} / 总计 ${formatSize(status.capacity.total)}` : '正在读取容量...'}
                                    </div>
                                </div>
                             </div>
                             <button onClick={() => { setFiles([]); bluetoothService.fetchFileList(f => setFiles(f.sort((a,b) => b.time-a.time))); }} className="text-[10px] font-bold text-indigo-600 hover:underline">刷新列表</button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[350px] pr-2 space-y-2">
                            {files.length > 0 ? (
                                files.map((file, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => handleDownload(file)}
                                        className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <FileAudio className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-800 truncate">{file.name}</div>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(file.time)}</span>
                                                    <span>•</span>
                                                    <span>{formatSize(file.size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md shadow-indigo-200">
                                                <Download className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-200" />
                                    <p className="text-sm font-medium">正在读取设备文件库...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'syncing' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in zoom-in-95">
                        <div className="relative w-40 h-40">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                    strokeDasharray={440} 
                                    strokeDashoffset={440 - (440 * syncProgress) / 100} 
                                    strokeLinecap="round"
                                    className="text-indigo-600 transition-all duration-300" 
                                />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Download className="w-8 h-8 text-indigo-600 animate-bounce mb-1" />
                                <span className="text-2xl font-black text-slate-800">{syncProgress}%</span>
                             </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-slate-800">正在同步录音数据</h3>
                            <p className="text-xs text-slate-400 font-medium">采用 5.3 蓝牙高速传输技术，请保持连接稳定...</p>
                        </div>
                    </div>
                )}

                {step === 'complete' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 animate-in zoom-in">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-slate-800">数据同步成功</h3>
                            <p className="text-sm text-slate-500 font-medium">即将进入 AI 总结与逐字稿核对流程</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
