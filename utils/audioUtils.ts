
export async function convertToWav(chunks: Uint8Array[]): Promise<File> {
  const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combinedData = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    combinedData.set(chunk, offset);
    offset += chunk.length;
  }

  // Assuming PCM 16-bit 16kHz mono as default hardware output
  const wavData = addWavHeader(combinedData, 16000, 1, 16);
  const blob = new Blob([wavData], { type: 'audio/wav' });
  return new File([blob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
}

function addWavHeader(samples: Uint8Array, sampleRate: number, numChannels: number, bitDepth: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length, true);

  const u8 = new Uint8Array(buffer);
  u8.set(samples, 44);
  return u8;
}
