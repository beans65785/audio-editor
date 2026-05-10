# 🎵 Audio Editor

A powerful JavaScript-based audio generator with support for mathematical expressions, bytebeat generation, and WAV file export.

## Features

✨ **Core Functionality:**
- 🔤 **JavaScript Expression Evaluation** - Write custom audio expressions using `t` for time
- 📊 **Real-time Waveform Visualization** - See your audio as it generates
- 🎹 **Bytebeat Support** - Generate procedural audio with bitwise operations
- 🎚️ **Volume & Pitch Control** - Adjust master volume and pitch shift in semitones
- 📁 **WAV Export** - Download generated audio as 16-bit PCM WAV files
- 💾 **JSON Export** - Export audio data with metadata
- 📤 **Audio Upload** - Load and analyze existing audio files

## Getting Started

### Basic Usage

1. Enter a JavaScript expression in the Expression Input panel
   - Use `t` to represent time (0 to 1)
   - Examples:
     - Sine wave: `Math.sin(t * 440 * 2 * Math.PI) * 0.3`
     - Square wave: `(Math.sin(t * 440 * 2 * Math.PI) > 0 ? 1 : -1) * 0.3`
     - Bytebeat: `(t >> 8) & (t << 2)`

2. Configure parameters:
   - Duration (0.1 - 30 seconds)
   - Sample Rate (8kHz - 48kHz)
   - Master Volume (0 - 100%)
   - Pitch Shift (-12 to +12 semitones)

3. Click "Generate Audio" to synthesize

4. Click "Play" to preview or "Download WAV" to export

## Expression Examples

### Simple Waveforms

```javascript
// Sine Wave (440 Hz)
Math.sin(t * 440 * 2 * Math.PI) * 0.3

// Square Wave
(Math.sin(t * 440 * 2 * Math.PI) > 0 ? 1 : -1) * 0.3

// Sawtooth
((t * 440) % 1) * 2 - 1) * 0.3

// Triangle
(Math.abs(((t * 440) % 1) * 4 - 2) - 1) * 0.3
```

### Bytebeat

```javascript
// Simple bytebeat
(t >> 8) & (t << 2)

// Complex bytebeat
t * (((t >> 10) | (t >> 8)) & 63 & (t >> 4))
```

### Frequency Modulation

```javascript
// FM synthesis
Math.sin(t * 440 * 2 * Math.PI + Math.sin(t * 5 * 2 * Math.PI) * 50) * 0.3
```

### Amplitude Modulation

```javascript
// AM synthesis
Math.sin(t * 440 * 2 * Math.PI) * Math.sin(t * 5 * 2 * Math.PI) * 0.3
```

## Sample Rates

- **8000 Hz** - Telephone quality (low bandwidth)
- **16000 Hz** - Medium quality
- **22050 Hz** - Radio quality
- **44100 Hz** - CD quality (default)
- **48000 Hz** - Professional audio

## Files

- `audio-editor.html` - Main user interface
- `audio-generator.js` - Core audio synthesis engine
- `bytebeat.js` - Bytebeat and procedural audio utilities
- `wav-exporter.js` - WAV file encoding and export
- `samples.js` - Sample presets and file upload handling

## API Reference

### AudioGenerator Class

```javascript
const gen = new AudioGenerator();

// Generate from expression
const result = gen.generateFromExpression(
    'Math.sin(t * 440 * 2 * Math.PI) * 0.3',
    2,      // duration in seconds
    44100   // sample rate in Hz
);

// Apply effects
const withVolume = gen.applyVolume(samples, 50);    // 50% volume
const withPitch = gen.applyPitchShift(samples, 5, 44100); // +5 semitones

// Play audio
const buffer = gen.createAudioBuffer(samples, 44100);
gen.play(buffer);
gen.stop();
```

### WAVExporter Class

```javascript
// Download WAV
WAVExporter.downloadWAV(samples, 44100, 'output.wav');

// Export JSON
WAVExporter.downloadJSON(
    samples,
    44100,
    { expression: 'Math.sin(...)' },
    'output.json'
);
```

## Tips & Tricks

- Keep amplitude values between -1 and 1 for best results
- Use `* 0.3` to avoid clipping with multiple sine waves
- Bytebeat expressions use integer time (sample index)
- Pitch shift affects duration - use shorter durations for extreme shifts
- Multiple sine waves can be added: `Math.sin(...) + Math.sin(...)`

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires Web Audio API and FileReader support.

## License

MIT
