// Bytebeat Generator
class BytebeatGenerator {
    static generate(expression, duration, sampleRate) {
        try {
            const numSamples = Math.floor(duration * sampleRate);
            const samples = new Float32Array(numSamples);

            // Create evaluation function with bitwise operations available
            const func = new Function('t', `
                const result = ${expression};
                return (result & 0xFF) / 128 - 1;
            `);

            for (let i = 0; i < numSamples; i++) {
                try {
                    let sample = func(i);
                    sample = Math.max(-1, Math.min(1, parseFloat(sample) || 0));
                    samples[i] = sample;
                } catch (e) {
                    samples[i] = 0;
                }
            }

            return {
                success: true,
                samples: samples,
                sampleRate: sampleRate,
                duration: duration
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static generateChord(baseFreq, harmonics, duration, sampleRate) {
        const numSamples = Math.floor(duration * sampleRate);
        const samples = new Float32Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;

            for (const harmonic of harmonics) {
                const freq = baseFreq * harmonic.ratio;
                sample += Math.sin(t * freq * 2 * Math.PI) * harmonic.amplitude;
            }

            samples[i] = sample / harmonics.length;
        }

        return samples;
    }

    static generateArpeggio(notes, duration, sampleRate) {
        const numSamples = Math.floor(duration * sampleRate);
        const samples = new Float32Array(numSamples);
        const noteLength = Math.floor(numSamples / notes.length);

        for (let i = 0; i < numSamples; i++) {
            const noteIdx = Math.floor(i / noteLength) % notes.length;
            const freq = notes[noteIdx];
            const t = i / sampleRate;

            samples[i] = Math.sin(t * freq * 2 * Math.PI) * 0.3;
        }

        return samples;
    }
}

// Note frequency mapping
const NOTE_FREQUENCIES = {
    'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.96, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
};

// Frequency to note
function frequencyToNote(freq) {
    for (const [note, frequency] of Object.entries(NOTE_FREQUENCIES)) {
        if (Math.abs(frequency - freq) < 5) {
            return note;
        }
    }
    return `${freq.toFixed(2)}Hz`;
}