'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Square, 
  Pause, 
  Play,
  Trash2,
  Send,
  Loader2
} from 'lucide-react';

interface AudioRecorderProps {
  maxDuration?: number; // em segundos
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  className?: string;
}

export function AudioRecorder({ 
  maxDuration = 300, // 5 minutos por padrão
  onRecordingComplete,
  onCancel,
  className = ''
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      stopTimer();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  // Iniciar gravação
  const startRecording = async () => {
    try {
      setError(null);
      
      // Solicitar permissão do microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      // Eventos do MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsProcessing(false);
      };
      
      // Iniciar gravação
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsProcessing(true);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
      
      // Parar stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Pausar/retomar gravação
  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  // Cancelar gravação
  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    setError(null);
    
    onCancel?.();
  };

  // Enviar gravação
  const sendRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
      cancelRecording();
    }
  };

  // Timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Formatar duração
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Estados para o indicador de níveis de áudio
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const audioAnimationRef = useRef<number | null>(null);

  // Efeito para visualização de níveis de áudio
  useEffect(() => {
    if (!isRecording || isPaused || !streamRef.current) {
      setAudioLevels(Array(20).fill(0));
      return;
    }
    
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const newLevels = [];
      const barCount = 20;
      const step = Math.floor(dataArray.length / barCount);
      
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        newLevels.push(value / 255);
      }
      
      setAudioLevels(newLevels);
      audioAnimationRef.current = requestAnimationFrame(updateLevels);
    };
    
    updateLevels();
    
    return () => {
      if (audioAnimationRef.current !== null) {
        cancelAnimationFrame(audioAnimationRef.current);
        audioAnimationRef.current = null;
      }
      microphone.disconnect();
      audioContext.close();
    };
  }, [isRecording, isPaused]);

  return (
    <div className={`bg-card rounded-lg p-4 shadow-sm ${className}`}>
      {error && (
        <div className="text-sm text-destructive mb-3">{error}</div>
      )}
      
      {/* Visualização de áudio */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-1 h-12">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className="w-1 bg-primary transition-all duration-100"
              style={{ 
                height: `${Math.max(4, level * 48)}px`,
                opacity: isRecording && !isPaused ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Duração */}
      <div className="text-center mb-4">
        <span className="text-2xl font-mono">{formatDuration(duration)}</span>
        <span className="text-sm text-muted-foreground ml-2">
          / {formatDuration(maxDuration)}
        </span>
      </div>
      
      {/* Controles */}
      <div className="flex items-center justify-center gap-2">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            size="lg"
            className="rounded-full h-16 w-16"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}
        
        {isRecording && (
          <>
            <Button
              onClick={togglePause}
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
            >
              {isPaused ? (
                <Play className="h-5 w-5 ml-0.5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="icon"
              className="rounded-full h-16 w-16"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Square className="h-6 w-6" />
              )}
            </Button>
          </>
        )}
        
        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={cancelRecording}
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={sendRecording}
              size="icon"
              className="rounded-full h-16 w-16"
            >
              <Send className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
      
      {/* Preview do áudio gravado */}
      {audioUrl && !isRecording && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}