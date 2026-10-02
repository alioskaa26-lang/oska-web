"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceStatus() {
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("Hazırım Ali Bey. Bana OSKA ile ilgili istediğinizi sorabilirsiniz.");

  const restartListening = useCallback(() => {
    if (!shouldListenRef.current || speakingRef.current || processingRef.current) return;
    window.setTimeout(() => {
      try {
        recognitionRef.current?.start();
        setListening(true);
        setMessage("Sizi dinliyorum Ali Bey.");
      } catch {
        // Recognition may already be active.
      }
    }, 550);
  }, []);

  const finishSpeaking = useCallback(() => {
    speakingRef.current = false;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    audioRef.current = null;
    restartListening();
  }, [restartListening]);

  const browserFallback = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setMessage(text);
      finishSpeaking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 0.95;
    utterance.pitch = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const turkish =
      voices.find((voice) => voice.lang.toLowerCase() === "tr-tr") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("tr")) ||
      voices.find((voice) => /zira|female|woman/i.test(voice.name)) ||
      voices[0];
    if (turkish) utterance.voice = turkish;
    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [finishSpeaking]);

  const speak = useCallback(async (text: string) => {
    speakingRef.current = true;
    try {
      recognitionRef.current?.stop();
    } catch {}

    try {
      const response = await fetch("http://127.0.0.1:5683/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("LOCAL_TTS_FAILED");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = finishSpeaking;
      audio.onerror = () => browserFallback(text);
      await audio.play();
    } catch {
      browserFallback(text);
    }
  }, [browserFallback, finishSpeaking]);

  const askJarves = useCallback(async (question: string) => {
    const clean = question.trim();
    if (!clean || processingRef.current) return;

    const onlyWake = clean
      .toLocaleLowerCase("tr-TR")
      .replace(/[.,!?]/g, "")
      .trim();

    if (onlyWake === "jarvis" || onlyWake === "jarves") {
      setMessage("Buradayım Ali Bey.");
      await speak("Buradayım Ali Bey. Sizi dinliyorum.");
      return;
    }

    processingRef.current = true;
    setListening(false);
    setMessage(`Duydum: “${clean}” · Kontrol ediyorum...`);
    try {
      recognitionRef.current?.stop();
    } catch {}

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean }),
      });
      const data = await response.json();
      const answer = String(data?.answer || "Ali Bey, bu soruya şu anda cevap üretemedim.");
      setMessage(answer);
      processingRef.current = false;
      await speak(answer);
    } catch {
      const answer = "Ali Bey, asistan bağlantısında geçici bir sorun var. OSKA CORE arka planda çalışmaya devam ediyor.";
      setMessage(answer);
      processingRef.current = false;
      await speak(answer);
    }
  }, [speak]);

  const startListening = useCallback(() => {
    shouldListenRef.current = true;
    const RecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setListening(false);
      setMessage("Bu tarayıcı sesli komutu desteklemiyor Ali Bey.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition: RecognitionLike = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "tr-TR";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (!event.results[i].isFinal) continue;
          const transcript = String(event.results[i][0]?.transcript || "").trim();
          if (transcript) {
            void askJarves(transcript);
            break;
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
          shouldListenRef.current = false;
          setListening(false);
          setMessage("Mikrofon izni gerekli Ali Bey.");
          return;
        }
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        restartListening();
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setListening(true);
      setMessage("Sizi dinliyorum Ali Bey.");
    } catch {
      restartListening();
    }
  }, [askJarves, restartListening]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startListening();
      void speak("Ali Bey, JARVES hazır. OSKA ile ilgili istediğinizi sorabilirsiniz.");
    }, 700);

    return () => {
      window.clearTimeout(timer);
      shouldListenRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [startListening, speak]);

  return (
    <section className={"voicePanel " + (listening ? "voicePanelListening" : "")} aria-live="polite">
      <div className="jarvesOrbWrap" aria-hidden="true">
        <div className="jarvesOrb">
          <span className="jarvesCore" />
          <span className="jarvesRing jarvesRingOne" />
          <span className="jarvesRing jarvesRingTwo" />
          <span className="jarvesSpark jarvesSparkOne" />
          <span className="jarvesSpark jarvesSparkTwo" />
          <span className="jarvesSpark jarvesSparkThree" />
        </div>
      </div>

      <div className="voiceCopy">
        <div className="voiceTitleRow">
          <strong className="jarvesVoiceTitle">JARVES</strong>
          <span className="voicePreset">Türkçe kadın sesi · OSKA A–Z</span>
        </div>
        <p className="muted voiceHint">{message}</p>
      </div>

      <div className="voiceActions">
        <span className={"voiceDot " + (listening ? "isListening" : "")} aria-hidden="true" />
        <button className="voiceButton" onClick={startListening}>
          🎙 Dinle
        </button>
        <button className="voiceButton primary" onClick={() => void askJarves("Sistem ne durumda?")}>
          🔊 Genel durumu anlat
        </button>
      </div>
    </section>
  );
}
