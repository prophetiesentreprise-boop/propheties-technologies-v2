import { Pause, Play, Square, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getNarrationScript } from "@/data/narrationScripts";

export default function PageAudioControl() {
  const [pathname] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notice, setNotice] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopRequestedRef = useRef(false);
  const narration = getNarrationScript(pathname);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    stopRequestedRef.current = true;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setNotice("");
  }, [pathname]);

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

  const reportPlaybackIssue = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setNotice("La narration naturelle ne peut pas être lue pour le moment. Vérifiez votre connexion puis réessayez.");
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) {
      reportPlaybackIssue();
      return;
    }

    stopRequestedRef.current = false;
    try {
      await audio.play();
    } catch {
      reportPlaybackIssue();
    }
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    stopRequestedRef.current = true;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setNotice("Lecture arrêtée.");
  };

  return (
    <div className="flex items-center gap-1.5" aria-label={`Lecture audio de ${narration.label}`}>
      <audio
        ref={audioRef}
        src={narration.audioUrl}
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
      <button
        type="button"
        onClick={play}
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
