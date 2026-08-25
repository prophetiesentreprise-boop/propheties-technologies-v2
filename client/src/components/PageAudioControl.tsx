import { Pause, Play, Square, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getNarrationScript } from "@/data/narrationScripts";

// Délai avant le déclenchement automatique de la narration après un
// changement de page. Les navigateurs bloquent parfois la lecture
// automatique tant que le visiteur n'a pas encore interagi avec la page
// (politique standard, pas un bug) — dans ce cas l'auto-déclenchement
// échoue silencieusement et le bouton "Écouter" reste disponible pour
// une lecture manuelle.
const AUTO_PLAY_DELAY_MS = 5_000;

const FRENCH_MALE_VOICE_HINTS = ["henri", "paul", "thomas", "nicolas", "guillaume", "yannick", "daniel", "matthieu", "antoine"];
const FRENCH_FEMALE_VOICE_HINTS = ["julie", "hortense", "amelie", "amélie", "audrey", "celine", "céline", "marie", "virginie", "sandrine", "aurelie", "aurélie"];

function pickBestFrenchMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const frVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("fr"));
  if (frVoices.length === 0) return null;
  const preferred = frVoices.find((voice) => FRENCH_MALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint)));
  if (preferred) return preferred;
  const notFemale = frVoices.find((voice) => !FRENCH_FEMALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint)));
  return notFemale ?? frVoices[0];
}

export default function PageAudioControl() {
  const [pathname] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notice, setNotice] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopRequestedRef = useRef(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const narration = getNarrationScript(pathname);
  const usesSynthesizedVoice = !narration.audioUrl;

  const resetPlaybackState = () => {
    stopRequestedRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setNotice("");
  };

  useEffect(() => {
    resetPlaybackState();

    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    autoPlayTimerRef.current = setTimeout(() => {
      play({ isAutoTriggered: true });
    }, AUTO_PLAY_DELAY_MS);

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const reportPlaybackIssue = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setNotice("La narration ne peut pas être lue pour le moment. Vérifiez votre connexion puis réessayez.");
  };

  const playSynthesized = ({ isAutoTriggered = false }: { isAutoTriggered?: boolean } = {}) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (!isAutoTriggered) reportPlaybackIssue();
      return;
    }

    stopRequestedRef.current = false;
    const utterance = new SpeechSynthesisUtterance(narration.text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.98;
    utterance.pitch = 0.92;
    const voice = pickBestFrenchMaleVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setNotice(`Lecture de ${narration.label} en cours.`);
    };
    utterance.onpause = () => {
      if (stopRequestedRef.current) return;
      setIsPlaying(false);
      setIsPaused(true);
      setNotice("Lecture en pause.");
    };
    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      if (stopRequestedRef.current) return;
      setIsPlaying(false);
      setIsPaused(false);
      setNotice("Lecture terminée.");
    };
    utterance.onerror = () => {
      if (!isAutoTriggered) reportPlaybackIssue();
    };

    utteranceRef.current = utterance;

    const voicesReady = window.speechSynthesis.getVoices().length > 0;
    if (voicesReady) {
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.speak(utterance);
      };
    }
  };

  const play = async ({ isAutoTriggered = false }: { isAutoTriggered?: boolean } = {}) => {
    if (usesSynthesizedVoice) {
      playSynthesized({ isAutoTriggered });
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      if (!isAutoTriggered) reportPlaybackIssue();
      return;
    }

    stopRequestedRef.current = false;
    try {
      await audio.play();
    } catch {
      // Un déclenchement automatique bloqué par le navigateur (politique de
      // lecture automatique) n'est pas une erreur à signaler à l'utilisateur —
      // le bouton "Écouter" reste disponible pour une lecture manuelle.
      if (!isAutoTriggered) reportPlaybackIssue();
    }
  };

  const pause = () => {
    if (usesSynthesizedVoice) {
      window.speechSynthesis?.pause();
      return;
    }
    audioRef.current?.pause();
  };

  const stop = () => {
    stopRequestedRef.current = true;
    if (usesSynthesizedVoice) {
      window.speechSynthesis?.cancel();
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
    setIsPlaying(false);
    setIsPaused(false);
    setNotice("Lecture arrêtée.");
  };

  return (
    <div className="flex items-center gap-1.5" aria-label={`Lecture audio de ${narration.label}`}>
      {!usesSynthesizedVoice && (
        <audio
          ref={audioRef}
          src={narration.audioUrl ?? undefined}
          preload="metadata"
          onPlay={() => {
            stopRequestedRef.current = false;
            setIsPlaying(true);
            setIsPaused(false);
            setNotice(`Lecture naturelle de ${narration.label} en cours.`);
          }}
          onPause={() => {
            if (stopRequestedRef.current || audioRef.current?.ended) return;
            setIsPlaying(false);
            setIsPaused(true);
            setNotice("Lecture en pause.");
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsPaused(false);
            setNotice("Lecture terminée.");
          }}
          onError={reportPlaybackIssue}
        />
      )}
      <button
        type="button"
        onClick={() => play()}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#18B7E8]/30 bg-[#EEF9FE] px-3 text-[#087EAD] transition hover:-translate-y-0.5 hover:bg-[#DCF4FD] active:scale-[.97]"
        aria-label={isPaused ? `Reprendre la lecture de ${narration.label}` : `Écouter ${narration.label}`}
        title={isPaused ? "Reprendre la lecture" : "Écouter la page"}
      >
        {isPaused ? <Play size={18} fill="currentColor" /> : <Volume2 size={18} />}
        <span className="hidden text-xs font-extrabold xl:inline">{isPaused ? "Reprendre" : "Écouter"}</span>
      </button>
      {isPlaying && (
        <button type="button" onClick={pause} className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-[.97]" aria-label="Mettre la lecture en pause" title="Pause">
          <Pause size={16} fill="currentColor" />
        </button>
      )}
      {(isPlaying || isPaused) && (
        <button type="button" onClick={stop} className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-[.97]" aria-label="Arrêter la lecture" title="Arrêter">
          <Square size={14} fill="currentColor" />
        </button>
      )}
      <span className="sr-only" role="status" aria-live="polite">{notice}</span>
    </div>
  );
}
