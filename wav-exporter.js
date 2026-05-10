// WAV File Exporter
class WAVExporter {
    static encodeWAV(samples, sampleRate) {
        const numChannels = 1;
        const bitsPerSample = 16;

        const bytesPerSample = bitsPerSample / 8;
        const blockAlign = numChannels * bytesPerSample;

        const wavSize = 36 + samples.length * bytesPerSample;
        const arrayBuffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
        const view = new DataView(arrayBuffer);

        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        const writeFloat = (offset, value) => {
            view.setFloat32(offset, value, true);
        };

        const writeInt = (offset, value, bytes, littleEndian) => {
            for (let i = 0; i < bytes; i++) {
                view.setUint8(offset + i, (value >> (i * 8)) & 0xFF);
            }
        };

        // WAV Header
        writeString(0, 'RIFF');
        writeInt(4, wavSize, 4, true);
        writeString(8, 'WAVE');

        // fmt sub-chunk
        writeString(12, 'fmt ');
        writeInt(16, 16, 4, true);
        writeInt(20, 1, 2, true); // PCM
        writeInt(22, numChannels, 2, true);
        writeInt(24, sampleRate, 4, true);
        writeInt(28, sampleRate * blockAlign, 4, true);
        writeInt(32, blockAlign, 2, true);
        writeInt(34, bitsPerSample, 2, true);

        // data sub-chunk
        writeString(36, 'data');
        writeInt(40, samples.length * bytesPerSample, 4, true);

        // Write audio samples
        let offset = 44;
        const volume = 0.8;
        for (let i = 0; i < samples.length; i++) {
            let sample = Math.max(-1, Math.min(1, samples[i])) * volume;
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, sample, true);
            offset += 2;
        }

        return arrayBuffer;
    }

    static downloadWAV(samples, sampleRate, filename = 'audio.wav') {
        const wavBuffer = this.encodeWAV(samples, sampleRate);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static exportJSON(samples, sampleRate, metadata = {}) {
        const data = {
            format: 'raw-audio-json',
            version: 1,
            metadata: {
                sampleRate: sampleRate,
                duration: samples.length / sampleRate,
                numSamples: samples.length,
                numChannels: 1,
                ...metadata
            },
            samples: Array.from(samples)
        };

        return JSON.stringify(data, null, 2);
    }

    static downloadJSON(samples, sampleRate, metadata = {}, filename = 'audio.json') {
        const json = this.exportJSON(samples, sampleRate, metadata);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Download functions
function downloadWAV() {
    if (generator.samples.length === 0) {
        showStatus('Please generate audio first', 'error');
        return;
    }

    const sampleRate = parseInt(document.getElementById('sampleRate').value);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `audio-${timestamp}.wav`;

    WAVExporter.downloadWAV(generator.samples, sampleRate, filename);
    showStatus(`Downloaded ${filename}`, 'success');
}

function downloadJSON() {
    if (generator.samples.length === 0) {
        showStatus('Please generate audio first', 'error');
        return;
    }

    const sampleRate = parseInt(document.getElementById('sampleRate').value);
    const expression = document.getElementById('expression').value;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `audio-${timestamp}.json`;

    const metadata = {
        expression: expression,
        volume: parseInt(document.getElementById('volume').value),
        pitchShift: parseInt(document.getElementById('pitchShift').value),
        generatedAt: new Date().toISOString()
    };

    WAVExporter.downloadJSON(generator.samples, sampleRate, metadata, filename);
    showStatus(`Downloaded ${filename}`, 'success');
}