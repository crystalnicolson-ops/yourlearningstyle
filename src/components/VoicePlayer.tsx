import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface VoicePlayerProps {
  audioBase64?: string;
  title?: string;
  text?: string;
  message?: string;
  useBrowserSpeech?: boolean;
}

const VoicePlayer = ({ audioBase64, title, text, message, useBrowserSpeech }: VoicePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioBase64) return;

    const audioBlob = new Blob(
      [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
      { type: 'audio/mp3' }
    );
    const audioUrl = URL.createObjectURL(audioBlob);
    audio.src = audioUrl;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioBase64]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlayPause = async () => {
    if (useBrowserSpeech) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        if (text) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.onend = () => setIsPlaying(false);
          speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio play failed:', error);
      setIsPlaying(false);
      
      // Handle autoplay restrictions
      if (error.name === 'NotAllowedError') {
        // Browser blocked autoplay - user needs to interact first
        console.log('Audio play blocked by browser autoplay policy');
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (!audioBase64) return;

    const audioBlob = new Blob(
      [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))],
      { type: 'audio/mp3' }
    );
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'voice-notes'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!audioBase64 && !useBrowserSpeech) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div>
          <p className="text-muted-foreground mb-2">
            {message || "No audio generated yet."}
          </p>
          {title && (
            <Badge variant="outline" className="text-xs">
              {title}
            </Badge>
          )}
        </div>
        {text && (
          <div className="p-4 bg-background/50 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Text Content:</p>
            <p className="text-sm leading-relaxed">{text}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="space-y-4">
        {/* Progress Bar - only for downloadable audio */}
        {!useBrowserSpeech && (
          <div className="space-y-2">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayPause}
            className="flex items-center gap-2"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          {/* Volume Control - only for downloadable audio */}
          {!useBrowserSpeech && (
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Vol</span>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-16"
              />
              <span className="text-xs text-muted-foreground w-8">
                {volume[0]}%
              </span>
            </div>
          )}

          {useBrowserSpeech && (
            <Badge variant="outline" className="text-xs">
              Free Browser Voice
            </Badge>
          )}

          {!useBrowserSpeech && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAudio}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>

        {/* Text Preview */}
        {text && (
          <div className="mt-4 p-4 bg-background/50 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Original Text:</p>
            <p className="text-sm leading-relaxed line-clamp-3">{text}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoicePlayer;