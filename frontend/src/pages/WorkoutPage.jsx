import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ChevronLeft, Dumbbell, Activity, RefreshCw, Clock, Play } from 'lucide-react';

const WorkoutPage = () => {
    const navigate = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchWorkout();
    }, []);

    const fetchWorkout = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/workout/today', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data) setWorkout(data);
        } catch (error) {
            console.error("Failed to fetch workout", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/workout/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setWorkout(data);
        } catch (error) {
            alert("Failed to generate workout. " + error.message);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Activity className="animate-spin" /></div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '6rem' }}>
            {/* Header */}
            <div className="flex items-center gap-md mb-8">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}><ChevronLeft size={20} /> Back</Button>
                <h1 className="text-gradient">Today's Workout</h1>
            </div>

            {!workout ? (
                <div className="glass-panel flex-col items-center justify-center p-8 text-center" style={{ minHeight: '400px' }}>
                    <Dumbbell size={64} color="var(--color-neon-primary)" className="mb-4" />
                    <h2 className="text-2xl mb-2">Ready to Sweat?</h2>
                    <p className="text-muted mb-8" style={{ maxWidth: '400px' }}>
                        Your AI Personal Trainer will create a custom routine based on your goals and condition.
                    </p>
                    <Button onClick={handleGenerate} disabled={generating} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                        {generating ? <RefreshCw className="animate-spin mr-2" /> : <Play className="mr-2" />}
                        {generating ? 'Designing Workout...' : 'Generate Workout'}
                    </Button>
                </div>
            ) : (
                <div className="flex-col gap-lg">
                    {/* Overview Card */}
                    <div className="glass-panel p-6 border-neon">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl text-neon-primary mb-1">{workout.focus || "Full Body Workout"}</h2>
                                <div className="flex items-center gap-sm text-muted">
                                    <Clock size={16} />
                                    <span>{workout.duration || "45 mins"}</span>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleGenerate} disabled={generating} size="sm">
                                <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
                            </Button>
                        </div>
                    </div>

                    {/* Warmup */}
                    {workout.warmup && (
                        <div className="glass-panel p-6">
                            <h3 className="text-xl text-neon-secondary mb-4">Warmup</h3>
                            <ul className="space-y-2">
                                {workout.warmup.map((item, i) => (
                                    <li key={i} className="flex items-center gap-md">
                                        <div className="h-2 w-2 rounded-full bg-neon-secondary"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Main Exercises */}
                    <div className="space-y-4">
                        <h3 className="text-xl pl-2">Exercises</h3>
                        {workout.exercises.map((ex, i) => (
                            <div key={i} className="glass-panel p-4 flex-col gap-sm">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-bold">{ex.name}</h4>
                                    <span className="badge bg-primary-10 text-primary">{ex.sets} Sets</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 my-2">
                                    <div className="bg-dark-50 p-2 rounded">
                                        <div className="text-xs text-muted uppercase">Reps</div>
                                        <div className="font-mono">{ex.reps}</div>
                                    </div>
                                    <div className="bg-dark-50 p-2 rounded">
                                        <div className="text-xs text-muted uppercase">Rest</div>
                                        <div className="font-mono">{ex.rest}</div>
                                    </div>
                                </div>
                                {ex.tips && (
                                    <p className="text-sm text-muted italic mt-2">💡 Tip: {ex.tips}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Cooldown */}
                    {workout.cooldown && (
                        <div className="glass-panel p-6">
                            <h3 className="text-xl text-neon-secondary mb-4">Cooldown</h3>
                            <ul className="space-y-2">
                                {workout.cooldown.map((item, i) => (
                                    <li key={i} className="flex items-center gap-md">
                                        <div className="h-2 w-2 rounded-full bg-neon-secondary"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }} variant="outline" className="w-full">
                        Mark Workout Complete
                    </Button>
                </div>
            )}
        </div>
    );
};

export default WorkoutPage;
