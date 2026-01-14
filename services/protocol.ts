import { calculateCRC16 } from './crc16';

export const BLE_UUIDS = {
  SERVICE: '0000ae20-0000-1000-8000-00805f9b34fb',
  CHAR_WRITE: '0000ae21-0000-1000-8000-00805f9b34fb',
  CHAR_NOTIFY_DATA: '0000ae22-0000-1000-8000-00805f9b34fb',
  CHAR_NOTIFY_STATUS: '0000ae23-0000-1000-8000-00805f9b34fb',
};

export const DATA_TYPES = {
  CONTROL: 0,
  AUDIO_STREAM: 1,
  FILE_TRANSFER: 2,
  BUTTON_CMD: 3,
};

export const CMD = {
  SYNC_TIME: 0,
  GET_CAPACITY: 1,
  RET_CAPACITY: 2,
  GET_BATTERY: 3,
  RET_BATTERY: 4,
  GET_VERSION: 10,
  RET_VERSION: 11,
  ENABLE_HIGH_SPEED: 20,
  
  GET_FILE_LIST: 0,
  RET_FILE_LIST: 1,
  REQ_IMPORT_FILE: 2,
  START_IMPORT_FILE: 3, 
  FILE_DATA: 4,         
  IMPORT_COMPLETE: 5,   
  STOP_IMPORT: 7,
  LIST_TRANSFER_COMPLETE: 18
};

export interface Packet {
  seq: number;
  crc: number;
  length: number;
  payload: Uint8Array;
  isValid: boolean;
}

const HEADER_SIZE = 6; 

export const buildPacket = (seq: number, dataType: number, cmd: number | null, data: Uint8Array | null): Uint8Array => {
  const dataLen = data ? data.length : 0;
  const hasCmd = cmd !== null;
  const payloadLen = 1 + (hasCmd ? 1 : 0) + dataLen;
  
  const payload = new Uint8Array(payloadLen);
  let offset = 0;
  payload[offset++] = dataType;
  if (hasCmd) payload[offset++] = cmd!;
  if (data) payload.set(data, offset);

  const buffer = new ArrayBuffer(HEADER_SIZE + payloadLen);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  uint8[0] = 0x5A;
  uint8[1] = seq & 0xFF;
  view.setUint16(4, payloadLen, true);
  uint8.set(payload, 6);

  const crcBuffer = new Uint8Array(2 + payloadLen);
  crcBuffer[0] = payloadLen & 0xFF;      
  crcBuffer[1] = (payloadLen >> 8) & 0xFF; 
  crcBuffer.set(payload, 2);
  
  const crc = calculateCRC16(crcBuffer);
  view.setUint16(2, crc, false); 

  return uint8;
};

export const parsePacket = (dataView: DataView): Packet | null => {
  if (dataView.byteLength < HEADER_SIZE) return null;

  const magic = dataView.getUint8(0);
  if (magic !== 0x5A) return null;

  const seq = dataView.getUint8(1);
  const remoteCrc = dataView.getUint16(2, false); 
  const length = dataView.getUint16(4, true); 

  if (dataView.byteLength < HEADER_SIZE + length) return null; 

  const payload = new Uint8Array(dataView.buffer, dataView.byteOffset + HEADER_SIZE, length);

  const crcCheckBuffer = new Uint8Array(2 + length);
  crcCheckBuffer[0] = length & 0xFF;
  crcCheckBuffer[1] = (length >> 8) & 0xFF;
  crcCheckBuffer.set(payload, 2);
  
  const calcCrc = calculateCRC16(crcCheckBuffer);

  return {
    seq,
    crc: remoteCrc,
    length,
    payload,
    isValid: calcCrc === remoteCrc
  };
};