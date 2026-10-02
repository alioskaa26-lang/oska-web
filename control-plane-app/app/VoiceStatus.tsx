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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("Hazırım Ali Bey.");

  const restartListening = useCallback(() => {
    if (!shouldListenRef.current || speakingRef.current) return;
    window.setTimeout(() => {
      try {
        recognitionRef.current?.start();
        setListening(true);
        setMessage('Sizi dinliyorum Ali Bey. "Son durum nedir?" diyebilirsiniz.');
      } catch {
        // Recognition may already be running.
      }
    }, 650);
  }, []);

  const finishSpeaking = useCallback(() => {
    speakingRef.current = false;
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    currentAudioRef.current = null;
    restartListening();
  }, [restartListening]);

  const browserVoiceFallback = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setMessage("Ses çıkışı kullanılamıyor.");
      finishSpeaking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 0.94;
    utterance.pitch = 1.08;
    const voices = window.speechSynthesis.getVoices();
    const female =
      voices.find((voice) => /zira|samantha|aria|susan|female|woman/i.test(voice.name)) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("tr")) ||
      voices[0];
    if (female) utterance.voice = female;
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
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("VOICE_API_FAILED");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentAudioUrlRef.current = url;
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = finishSpeaking;
      audio.onerror = () => browserVoiceFallback(text);
      await audio.play();
    } catch {
      browserVoiceFallback(text);
    }
  }, [browserVoiceFallback, finishSpeaking]);

  const speakSummary = useCallback(async () => {
    setMessage("Canlı durum okunuyor...");
    try {
      const response = await fetch("/api/control/health", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "STATUS_FETCH_FAILED");

      const leads = data.leads || {};
      const pipeline = data.pipeline || {};
      const geo = data.geography || {};
      const providers = Array.isArray(data.providers) ? data.providers : [];
      const healthy = providers.filter((p: any) => p.status === "healthy").length;
      const unhealthy = providers
        .filter((p: any) => p.status !== "healthy")
        .map((p: any) => p.provider);

      const parts = [
        "Ali Bey, OSKA CORE son durum.",
        data.database === "ok"
          ? "Bulut kontrol düzlemi ve veritabanı çalışıyor."
          : "Veritabanı durumunda sorun görünüyor.",
        `Toplam ${Number(leads.total || 0)} potansiyel müşteri var.`,
        `İletişime hazır ${Number(leads.contact_ready || 0)}. Son 24 saatte ${Number(leads.last_24h || 0)} kayıt işlendi.`,
        `Türkiye içi ${Number(geo.turkey_domestic || 0)} müşteri adayı var; bunların ${Number(geo.turkey_domestic_email_ready || 0)} tanesinde e-posta hazır.`,
        `Aktif kuyrukta ${Number(pipeline.total_backlog || 0)} görev var. ${Number(pipeline.running || 0)} görev şu anda çalışıyor, ${Number(pipeline.retry || 0)} görev yeniden denemede.`,
        `Son 24 saatte ${Number(pipeline.discovery_jobs_24h || 0)} keşif görevi ve ${Number(pipeline.verify_completed_24h || 0)} tamamlanmış doğrulama var.`,
        `Ölü kuyruğa düşen ${Number(pipeline.dead_letter || 0)} görev var.`,
        unhealthy.length === 0
          ? `${healthy} aktif sağlayıcının tamamı sağlıklı.`
          : `Sorun görünen sağlayıcılar: ${unhealthy.join(", ")}.`,
        data.humanApprovalRequiredForOutbound
          ? "Müşteriye gönderim ve dışa dönük işlemler insan onayı olmadan yapılmıyor."
          : "",
      ].filter(Boolean);

      const summary = parts.join(" ");
      setMessage(summary);
      await speak(summary);
    } catch {
      const text = "Ali Bey, OSKA CORE canlı durumuna şu anda ulaşılamıyor. Bulut bağlantısını kontrol ediyorum.";
      setMessage(text);
      await speak(text);
    }
  }, [speak]);

  const startListening = useCallback(() => {
    shouldListenRef.current = true;
    const RecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setListening(false);
      setMessage("Mikrofon komut desteği kullanılamıyor.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition: RecognitionLike = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "tr-TR";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = String(event.results[i][0]?.transcript || "").toLocaleLowerCase("tr-TR");
          const asksStatus =
            transcript.includes("son durum") ||
            transcript.includes("durum nedir") ||
            (transcript.includes("oska") && transcript.includes("durum"));

          if (asksStatus) {
            void speakSummary();
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
      setMessage('Sizi dinliyorum Ali Bey. "Son durum nedir?" diyebilirsiniz.');
    } catch {
      restartListening();
    }
  }, [restartListening, speakSummary]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startListening();
      void speak("Ali Bey, JARVES hazır. Sizi dinliyorum.");
    }, 700);

    return () => {
      window.clearTimeout(timer);
      shouldListenRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      currentAudioRef.current?.pause();
      if (currentAudioUrlRef.current) URL.revokeObjectURL(currentAudioUrlRef.current);
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
          <span className="voicePreset">Türkçe · Rus kadın aksanı</span>
        </div>
        <p className="muted voiceHint">{message}</p>
      </div>

      <div className="voiceActions">
        <span className={"voiceDot " + (listening ? "isListening" : "")} aria-hidden="true" />
        <button className="voiceButton" onClick={startListening}>
          🎙 Konuşmayı başlat
        </button>
        <button className="voiceButton primary" onClick={() => void speakSummary()}>
          🔊 Son durumu anlat
        </button>
      </div>
    </section>
  );
}
