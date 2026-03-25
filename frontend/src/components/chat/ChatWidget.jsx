import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../services/api';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "System Online. 🟢 I am NutriBharat AI. How can I assist with your health goals today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => scrollToBottom(), [messages, isOpen]);

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await api.post('/chat', { message: userMsg.text });
            setMessages(prev => [...prev, { text: data.reply, sender: 'ai' }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Connection interrupted.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {isOpen && (
                <div className="glass-panel animate-fade-in-up" style={{
                    width: '350px', height: '500px', marginBottom: '1rem', display: 'flex', flexDirection: 'column',
                    background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid var(--color-neon-secondary)',
                    boxShadow: '0 0 30px rgba(0, 210, 255, 0.15)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem', background: 'rgba(0, 210, 255, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div className="flex items-center gap-sm">
                            <div style={{ width: '8px', height: '8px', background: 'var(--color-neon-primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-neon-primary)' }}></div>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-neon-secondary)', letterSpacing: '0.05em' }}>AI ASSISTANT</h4>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', padding: '0.8rem 1rem', borderRadius: '12px',
                                background: msg.sender === 'user' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                color: msg.sender === 'user' ? 'var(--color-neon-primary)' : 'var(--color-text-main)',
                                border: msg.sender === 'user' ? '1px solid rgba(0, 255, 157, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '0.9rem', lineHeight: '1.5'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div style={{ alignSelf: 'flex-start', color: 'var(--color-neon-secondary)', fontSize: '0.8rem', paddingLeft: '1rem' }}>Processing data...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '50px', padding: '0.3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <input
                                value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={listening ? "Listening..." : "Type command..."}
                                style={{
                                    flex: 1, padding: '0.5rem 1rem', background: 'transparent', border: 'none',
                                    color: 'white', outline: 'none', fontSize: '0.9rem'
                                }}
                            />
                            {browserSupportsSpeechRecognition && (
                                <button
                                    onClick={listening ? SpeechRecognition.stopListening : SpeechRecognition.startListening}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: listening ? 'var(--color-neon-danger)' : 'rgba(255,255,255,0.1)',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Mic size={16} className={listening ? 'animate-pulse' : ''} />
                                </button>
                            )}
                            <button onClick={handleSend} disabled={isLoading} style={{
                                width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-neon-secondary)',
                                color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.5 : 1
                            }}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Button onClick={() => setIsOpen(!isOpen)} style={{
                width: '60px', height: '60px', borderRadius: '50%', padding: 0,
                background: 'linear-gradient(135deg, var(--color-neon-secondary), #0060ff)',
                boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
                {isOpen ? <X size={28} /> : <MessageCircle size={28} color="black" />}
            </Button>
        </div>
    );
};

export default ChatWidget;
