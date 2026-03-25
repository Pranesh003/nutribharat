import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import BentoCard from '../components/ui/BentoCard';

const ScanResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data } = location.state || {}; // Expecting { item, calories, protein, ... }

    if (!data) {
        return (
            <div className="container flex-col items-center justify-center h-screen">
                <p>No scan data found.</p>
                <Button onClick={() => navigate('/dashboard')}>Go Back</Button>
            </div>
        );
    }

    const handleLog = async (mealType) => {
        try {
            const token = localStorage.getItem('token');
            const selectedDate = new Date().toISOString().split('T')[0];
            await fetch('http://localhost:5000/api/user/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ meal: mealType, status: 'eaten', date: selectedDate })
            });
            alert("Logged successfully!"); // Or use a nice toast notification
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Failed to log.");
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="flex items-center gap-md">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
                </Button>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>
                    Scan <span style={{ color: 'var(--color-neon-primary)' }}>Result</span>
                </h1>
            </div>

            <div className="grid-bento">
                <BentoCard colSpan={6} title="Detected Food">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div style={{
                            width: '100%', height: '200px',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '12px', border: '1px solid var(--color-neon-secondary)',
                            boxShadow: '0 0 20px rgba(0,210,255,0.1)'
                        }}>
                            <h2 style={{ fontSize: '2.5rem', color: 'white', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>{data.item}</h2>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard colSpan={6} title="Nutritional Info">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '100%', alignContent: 'center' }}>
                        <div className="glass-panel p-4 flex flex-col items-center justify-center" style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--color-neon-primary)', fontSize: '1.8rem', margin: 0 }}>{data.calories}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Calories</p>
                        </div>
                        <div className="glass-panel p-4 flex flex-col items-center justify-center" style={{ textAlign: 'center' }}>
                            <h3 style={{ color: '#00d2ff', fontSize: '1.8rem', margin: 0 }}>{data.protein || 'N/A'}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Protein</p>
                        </div>
                        <div className="glass-panel p-4 flex flex-col items-center justify-center" style={{ textAlign: 'center' }}>
                            <h3 style={{ color: '#ff00ff', fontSize: '1.8rem', margin: 0 }}>{data.carbs || 'N/A'}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Carbs</p>
                        </div>
                        <div className="glass-panel p-4 flex flex-col items-center justify-center" style={{ textAlign: 'center' }}>
                            <h3 style={{ color: '#ffff00', fontSize: '1.8rem', margin: 0 }}>{data.fat || 'N/A'}</h3>
                            <p className="text-muted" style={{ margin: 0 }}>Fat</p>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard colSpan={12} title="Add to Meal Plan">
                    <div className="flex flex-col items-center justify-center gap-md" style={{ padding: '1rem' }}>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Select a meal time to log this entry:</p>
                        <div className="flex gap-lg flex-wrap justify-center">
                            {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(meal => (
                                <Button
                                    key={meal}
                                    variant="outline"
                                    onClick={() => handleLog(meal.toLowerCase())}
                                    style={{
                                        minWidth: '120px',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        fontSize: '1.1rem',
                                        padding: '0.8rem 1.5rem'
                                    }}
                                >
                                    {meal}
                                </Button>
                            ))}
                        </div>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};

export default ScanResult;
