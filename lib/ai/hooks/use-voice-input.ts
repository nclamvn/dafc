'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseVoiceInputOptions {
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Get SpeechRecognition class - only call on client
const getSpeechRecognitionClass = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { language = 'en-US', onResult, onError } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Initialize as false to match server render, then update on client
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const languageRef = useRef(language);

  // Check support only on client after mount (avoids hydration mismatch)
  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionClass());
  }, []);

  // Update refs synchronously (no useEffect needed)
  onResultRef.current = onResult;
  onErrorRef.current = onError;
  languageRef.current = language;

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) return;

    // Create new instance each time
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageRef.current;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript) {
        onResultRef.current?.(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your settings.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      setError(errorMessage);
      setIsListening(false);
      onErrorRef.current?.(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    setError(null);
    setTranscript('');

    try {
      recognition.start();
    } catch {
      console.warn('Speech recognition already started');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// Language codes for voice input
export const VOICE_LANGUAGES = {
  en: 'en-US',
  vi: 'vi-VN',
};
