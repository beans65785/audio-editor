// Audio Generator Core
class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.audioSource = null;
        this.isPlaying = false;
        this.samples = [];
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    generateFromExpression(expression, duration, sampleRate) {
        try {
            const numSamples = Math.floor(duration * sampleRate);
            this.samples = new Float32Array(numSamples);

            // Create a safe function to evaluate the expression
            const func = new Function('t', 'Math', `return ${expression}`);

            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                try {
                    let sample = func(t, Math);
                    // Clamp to [-1, 1]
                    sample = Math.max(-1, Math.min(1, parseFloat(sample) || 0));
                    this.samples[i] = sample;
                } catch (e) {
                    this.samples[i] = 0;
                }
            }

            return {
                success: true,
                samples: this.samples,
                sampleRate: sampleRate,
                duration: duration,
                numSamples: numSamples
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    applyVolume(samples, volume) {
        const factor = volume / 100;
        return samples.map(s => s * factor);
    }

    applyPitchShift(samples, semitones, sampleRate) {
        if (semitones === 0) return samples;
        
        const ratio = Math.pow(2, semitones / 12);
        const newLength = Math.floor(samples.length / ratio);
        const newSamples = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const sourceIndex = i * ratio;
            const intPart = Math.floor(sourceIndex);
            const fracPart = sourceIndex - intPart;

            if (intPart + 1 < samples.length) {
                // Linear interpolation
                newSamples[i] = samples[intPart] * (1 - fracPart) + samples[intPart + 1] * fracPart;
            } else if (intPart < samples.length) {
                newSamples[i] = samples[intPart];
            }
        }

        return newSamples;
    }

    createAudioBuffer(samples, sampleRate) {
        const context = this.initAudioContext();
        const audioBuffer = context.createBuffer(1, samples.length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < samples.length; i++) {
            channelData[i] = samples[i];
        }

        return audioBuffer;
    }

    play(audioBuffer) {
        const context = this.initAudioContext();
        
        if (this.isPlaying) {
            this.stop();
        }

        this.audioSource = context.createBufferSource();
        this.audioSource.buffer = audioBuffer;
        this.audioSource.connect(context.destination);
        this.audioSource.start(0);
        this.isPlaying = true;
    }

    stop() {
        if (this.audioSource) {
            this.audioSource.stop();
            this.isPlaying = false;
        }
    }
}

// Global generator instance
const generator = new AudioGenerator();

// UI Functions
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    if (type === 'success') {
        setTimeout(() => statusEl.className = 'status', 3000);
    }
}

function updateAudioInfo() {
    if (generator.samples.length === 0) return;

    const sampleRate = parseInt(document.getElementById('sampleRate').value);
    const duration = generator.samples.length / sampleRate;
    const byteSize = generator.samples.length * 4;

    const info = `Duration: ${duration.toFixed(2)}s | Sample Rate: ${sampleRate}Hz | Samples: ${generator.samples.length} | Size: ${(byteSize / 1024).toFixed(2)}KB`;
    document.getElementById('audioInfo').value = info;
}

function generateAudio() {
    try {
        const expression = document.getElementById('expression').value;
        const duration = parseFloat(document.getElementById('duration').value);
        const sampleRate = parseInt(document.getElementById('sampleRate').value);
        const volume = parseInt(document.getElementById('volume').value);
        const pitchShift = parseInt(document.getElementById('pitchShift').value);

        if (!expression.trim()) {
            showStatus('Please enter an expression', 'error');
            return;
        }

        showStatus('Generating audio...', 'info');

        // Generate base audio
        const result = generator.generateFromExpression(expression, duration, sampleRate);
        
        if (!result.success) {
            showStatus(`Error: ${result.error}`, 'error');
            return;
        }

        let samples = result.samples;

        // Apply pitch shift
        if (pitchShift !== 0) {
            samples = generator.applyPitchShift(samples, pitchShift, sampleRate);
        }

        // Apply volume
        samples = generator.applyVolume(samples, volume);

        // Update samples
        generator.samples = samples;

        // Visualize
        visualizeWaveform(samples, sampleRate);
        updateAudioInfo();

        showStatus(`Audio generated successfully (${result.numSamples} samples)`, 'success');
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    }
}

function playAudio() {
    try {
        if (generator.samples.length === 0) {
            showStatus('Please generate audio first', 'error');
            return;
        }

        const sampleRate = parseInt(document.getElementById('sampleRate').value);
        const audioBuffer = generator.createAudioBuffer(generator.samples, sampleRate);
        generator.play(audioBuffer);
        showStatus('Playing...', 'info');
    } catch (error) {
        showStatus(`Playback error: ${error.message}`, 'error');
    }
}

function stopAudio() {
    generator.stop();
    showStatus('Stopped', 'info');
}

function visualizeWaveform(samples, sampleRate) {
    const canvas = document.getElementById('waveform');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const samplesPerPixel = Math.ceil(samples.length / width);
    for (let x = 0; x < width; x++) {
        const startIdx = x * samplesPerPixel;
        const endIdx = Math.min(startIdx + samplesPerPixel, samples.length);

        let min = 0, max = 0;
        for (let i = startIdx; i < endIdx; i++) {
            const val = samples[i];
            if (val < min) min = val;
            if (val > max) max = val;
        }

        const centerY = height / 2;
        const y = centerY - (max * height / 2);

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

function updateVolumeLabel() {
    const vol = document.getElementById('volume').value;
    document.getElementById('volumeLabel').textContent = vol + '%';
}

function updatePitchLabel() {
    const pitch = document.getElementById('pitchShift').value;
    document.getElementById('pitchLabel').textContent = pitch;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    updateVolumeLabel();
    updatePitchLabel();
});