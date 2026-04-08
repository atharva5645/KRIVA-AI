import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export function VoiceInput({ onActionComplete, className }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [reply, setReply] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    const speak = (text, langCode = 'en') => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        // Map language codes to BCP-47 locale tags
        const langMap = { hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', en: 'en-IN' };
        const targetLang = langMap[langCode] || 'en-IN';
        utterance.voice =
            voices.find(v => v.lang === targetLang) ||
            voices.find(v => v.lang.startsWith(langCode)) ||
            voices.find(v => v.lang.includes('IN')) ||
            voices[0];
        utterance.lang = targetLang;
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'voice.webm');

                try {
                    setTranscript("Analyzing...");
                    const response = await axios.post('/api/ai/voice-assistant', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    if (response.data.success) {
                        setTranscript(response.data.transcript);
                        setReply(response.data.reply);
                        speak(response.data.reply, response.data.language || 'en');

                        // Handle Actions Globally
                        const { action, target } = response.data;

                        if (action === 'NAVIGATE') {
                            // Ensure target is a relative path to stay in the same tab
                            const path = target.startsWith('http') ? new URL(target).pathname : target;
                            navigate(path);
                            onActionComplete?.();
                        } else if (action === 'SEARCH_PRODUCT') {
                            const searchQuery = encodeURIComponent(target);
                            navigate(`/marketplace?search=${searchQuery}`);
                            onActionComplete?.();
                        }
                    }
                } catch (err) {
                    console.error("AI Assistant Error:", err);
                    const msg =
                        err?.response?.data?.error ||
                        err?.message ||
                        "Error processing voice.";
                    setTranscript(msg);
                }
            };

            mediaRecorderRef.current.start();
            setIsListening(true);
            setTranscript('');
            setReply('');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied or not supported.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-4 p-6 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-zinc-200 shadow-2xl w-80", className)}>
            <div className="text-center space-y-1 mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">AI Assistant</h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase">KRIVA Digital Market</p>
            </div>

            <button
                onClick={isListening ? stopRecording : startRecording}
                className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative group",
                    isListening ? "bg-red-500 animate-pulse scale-110 shadow-2xl shadow-red-200" : "bg-zinc-900 text-white hover:scale-105 shadow-xl"
                )}
            >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />}
                {isListening && <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-25" />}
            </button>

            <div className="text-center space-y-3 w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                    {isListening ? "Recording..." : "Tap to speak"}
                </p>

                {(transcript || reply) && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {transcript && (
                            <p className="text-xs font-bold text-zinc-400 italic px-4 py-2 bg-zinc-50 rounded-xl">
                                "{transcript}"
                            </p>
                        )}
                        {reply && (
                            <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100 text-sm font-medium leading-relaxed shadow-sm">
                                {reply}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => onActionComplete?.()}
                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors pt-2"
            >
                Close Assistant
            </button>
        </div>
    );
}
