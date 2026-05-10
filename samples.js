// Sample Expressions & Presets
const SAMPLES = {
    sine: 'Math.sin(t * 440 * 2 * Math.PI) * 0.3',
    square: '(Math.sin(t * 440 * 2 * Math.PI) > 0 ? 1 : -1) * 0.3',
    sawtooth: '((t * 440) % 1) * 2 - 1) * 0.3',
    triangle: '(Math.abs(((t * 440) % 1) * 4 - 2) - 1) * 0.3',
    bytebeat1: '(t >> 8) & (t << 2)',
    bytebeat2: 't * (((t >> 10) | (t >> 8)) & 63 & (t >> 4))'
};

function loadSample(sampleName) {
    if (SAMPLES[sampleName]) {
        document.getElementById('expression').value = SAMPLES[sampleName];
        showStatus(`Loaded sample: ${sampleName}`, 'success');
    }
}

function uploadAudio() {
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];
    const statusEl = document.getElementById('uploadStatus');

    if (!file) {
        statusEl.textContent = 'Please select a file';
        statusEl.className = 'status error';
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const context = generator.initAudioContext();
            context.decodeAudioData(e.target.result, (audioBuffer) => {
                const channelData = audioBuffer.getChannelData(0);
                generator.samples = new Float32Array(channelData);
                
                const sampleRate = audioBuffer.sampleRate;
                document.getElementById('sampleRate').value = sampleRate;
                
                visualizeWaveform(generator.samples, sampleRate);
                updateAudioInfo();

                statusEl.textContent = `✓ Loaded: ${file.name} (${(audioBuffer.duration).toFixed(2)}s, ${sampleRate}Hz)`;
                statusEl.className = 'status success';
            }, (error) => {
                statusEl.textContent = `Error decoding audio: ${error}`;
                statusEl.className = 'status error';
            });
        } catch (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'status error';
        }
    };

    reader.readAsArrayBuffer(file);
}