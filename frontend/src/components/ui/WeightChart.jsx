import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Button from './Button';

const WeightChart = ({ user, onLogWeight }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentWeight, setCurrentWeight] = useState(user?.weight || '');
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/user/export', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            // Filter logs with weight and sort by date
            const weightData = data
                .filter(log => log.weight)
                .map(log => ({ date: log.date, weight: log.weight })) // Use weight directly
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            // If no history, add current user weight as starting point if available
            if (weightData.length === 0 && user?.weight) {
                weightData.push({ date: new Date().toISOString().split('T')[0], weight: user.weight });
            }

            setHistory(weightData);
            
            if (weightData.length >= 2) {
                const last = weightData[weightData.length - 1].weight;
                const prev = weightData[weightData.length - 2].weight;
                setTrend(last - prev);
            }
        } catch (error) {
            console.error("Failed to load weight history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLog = () => {
        if (!currentWeight) return;
        onLogWeight(currentWeight);
        // Optimistic update
        const today = new Date().toISOString().split('T')[0];
        setHistory(prev => {
            const temp = prev.filter(p => p.date !== today);
            return [...temp, { date: today, weight: parseFloat(currentWeight) }].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
    };

    // SVG Graph Logic
    const getPath = () => {
        if (history.length < 2) return "";
        
        const minW = Math.min(...history.map(d => d.weight)) - 2;
        const maxW = Math.max(...history.map(d => d.weight)) + 2;
        const range = maxW - minW || 1;
        
        const width = 100; // viewBox units
        const height = 50;
        
        const points = history.map((d, i) => {
            const x = (i / (history.length - 1)) * width;
            const y = height - ((d.weight - minW) / range) * height;
            return `${x},${y}`;
        });
        
        return `M ${points.join(' L ')}`;
    };

    if (loading) return <div className="glass-panel p-4 flex justify-center"><Activity className="animate-spin" /></div>;

    return (
        <div className="glass-panel text-white relative overflow-hidden" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-neon-secondary flex items-center gap-2">
                        Weight Tracker
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                         <h2 className="text-3xl font-bold">{history.length > 0 ? history[history.length-1].weight : user?.weight || '--'} <span className="text-sm font-normal text-muted">kg</span></h2>
                         {trend !== null && (
                             <div className={`flex items-center text-sm ${trend < 0 ? 'text-neon-primary' : trend > 0 ? 'text-neon-danger' : 'text-muted'}`}>
                                 {trend < 0 ? <TrendingDown size={14}/> : trend > 0 ? <TrendingUp size={14}/> : <Minus size={14}/>}
                                 {Math.abs(trend.toFixed(1))}
                             </div>
                         )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-dark-50 p-1 rounded-lg">
                    <input 
                        type="number" 
                        value={currentWeight} 
                        onChange={e => setCurrentWeight(e.target.value)}
                        placeholder="kg"
                        className="bg-transparent border-none text-right w-12 text-sm outline-none text-white font-mono"
                    />
                    <Button size="sm" onClick={handleLog} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Log</Button>
                </div>
            </div>

            {/* Graph Visualization */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30 pointer-events-none">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                    {/* Gradient Defs */}
                    <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-neon-secondary)" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="var(--color-neon-secondary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={getPath()} fill="none" stroke="var(--color-neon-secondary)" strokeWidth="0.5" />
                    <path d={`${getPath()} V 50 H 0 Z`} fill="url(#lineGrad)" stroke="none" />
                </svg>
            </div>
            
             {/* Dates axis labels could go here but skipping for clean minimalist look */}
        </div>
    );
};

export default WeightChart;
