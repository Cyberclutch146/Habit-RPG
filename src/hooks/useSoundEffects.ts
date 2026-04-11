import { useCallback, useRef } from 'react';

export const useSoundEffects = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const getContext = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, sweepFreq?: number) => {
        try {
            const ctx = getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            if (sweepFreq) {
                osc.frequency.exponentialRampToValueAtTime(sweepFreq, ctx.currentTime + duration);
            }

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch(e) {
            // ignore audio context failures (e.g. autoplay blocked)
        }
    }, []);

    const playClick = useCallback(() => {
        playTone(600, 'sine', 0.05, 800);
    }, [playTone]);

    const playSuccess = useCallback(() => {
        playTone(400, 'square', 0.1, 600);
        setTimeout(() => playTone(600, 'square', 0.2, 1000), 100);
    }, [playTone]);

    const playLevelUp = useCallback(() => {
        const ctx = getContext();
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(500, ctx.currentTime + 0.2);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.3);
            osc.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch(e) {}
    }, []);

    const playLootDrop = useCallback(() => {
        playTone(800, 'triangle', 0.1, 1200);
        setTimeout(() => playTone(1200, 'triangle', 0.2, 1600), 100);
        setTimeout(() => playTone(1600, 'triangle', 0.3, 2000), 200);
    }, [playTone]);

    const playError = useCallback(() => {
        playTone(300, 'sawtooth', 0.2, 150);
    }, [playTone]);

    return { playClick, playSuccess, playLevelUp, playLootDrop, playError };
};
