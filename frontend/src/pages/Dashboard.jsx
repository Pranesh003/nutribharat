import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BentoCard from '../components/ui/BentoCard';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import ChatWidget from '../components/chat/ChatWidget';
import WeightChart from '../components/ui/WeightChart';
import { useGoogleLogin } from '@react-oauth/google';
import { fetchTodaySteps } from '../services/googleFitService';
import { generateMealPlan, getAlternative } from '../utils/dietGenerator';
import { generateDailyReport } from '../utils/reportGenerator';
import { translations } from '../utils/translations';
import {
    RefreshCw, Globe, Footprints, Download, Activity,
    BookOpen, X, ShoppingBag, Bell, Flame, Sun, Moon,
    Coffee, Zap, Droplet, Calendar, Camera, Dumbbell, Users
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [mealPlan, setMealPlan] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [logs, setLogs] = useState({});
    const [insight, setInsight] = useState(null);
    const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');


    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [steps, setSteps] = useState(0);
    const [debugMsg, setDebugMsg] = useState('Initializing...');
    const [recipe, setRecipe] = useState(null); // { title, ingredients, instructions }
    const [viewingRecipe, setViewingRecipe] = useState(false);
    const [shoppingList, setShoppingList] = useState(null);
    const [viewingShoppingList, setViewingShoppingList] = useState(false);

    console.log("Dashboard Render. User:", user, "MealPlan:", mealPlan, "Date:", selectedDate);

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;
    const tMeal = (type) => {
        const key = type.toLowerCase().includes('snack') ? 'snack' : type.toLowerCase();
        return translations[lang]?.[key] || type;
    };

    const handleSwap = async (mealType, currentItem) => {
        const newItem = getAlternative(mealType, currentItem, user.cuisine);
        const key = mealType.toLowerCase().includes('snack') ? 'snack' : mealType.toLowerCase();
        const newMealPlan = { ...mealPlan, [key]: { ...mealPlan[key], item: newItem } };
        setMealPlan(newMealPlan);
        try {
            await authService.updateProfile({ mealPlan: newMealPlan });
        } catch (e) {
            console.error("Failed to save swap", e);
        }
    };

    const handleLog = async (mealType, status) => {
        setLogs(prev => ({ ...prev, [mealType]: status }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/user/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ meal: mealType, status, date: selectedDate })
            });
            const data = await res.json();
            if (data.insight) setInsight(data.insight);
        } catch (err) { console.error(err); }
    };

    const handleStepsChange = async (val) => {
        setSteps(parseInt(val) || 0);
    };

    const saveSteps = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/user/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ steps, date: selectedDate })
            });
        } catch (e) { }
    };

    const handleWeightLog = async (weight) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/user/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ weight, date: selectedDate })
            });
            setUser(prev => ({ ...prev, weight: parseFloat(weight) }));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDownload = () => {
        try {
            generateDailyReport(user, selectedDate, mealPlan, logs, steps);
        } catch (e) {
            console.error('PDF Generation failed', e);
            alert("Could not generate PDF report.");
        }
    };

    const handleViewRecipe = async (item) => {
        setViewingRecipe(true);
        setRecipe(null); // Clear previous
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/plan/recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ item, cuisine: user.cuisine })
            });
            const data = await res.json();
            setRecipe({ title: item, ...data });
        } catch (e) {
            console.error(e);
            setRecipe({ title: item, ingredients: ["Error loading recipe"], instructions: ["Please try again later"] });
        }
    };

    const handleShoppingList = async () => {
        setViewingShoppingList(true);
        setShoppingList(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/plan/shopping-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ mealPlan })
            });
            const data = await res.json();
            setShoppingList(data);
        } catch (e) {
            console.error(e);
            setShoppingList({ "Error": ["Could not generate list. Try again."] });
        }
    };

    const handleGoogleConnect = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                console.log("Google Login Success", tokenResponse);
                setDebugMsg("Syncing Google Fit...");
                const steps = await fetchTodaySteps(tokenResponse.access_token);
                setSteps(steps);
                setDebugMsg("Synced with Google Fit!");
                saveSteps(); // Persist to backend
            } catch (error) {
                console.error("Fit Sync Error", error);
                setDebugMsg("Failed to sync Google Fit");
            }
        },
        onError: () => console.log("Google Login Failed"),
        scope: 'https://www.googleapis.com/auth/fitness.activity.read'
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDebugMsg("Scanning food...");
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/scan/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.error) {
                alert("Scan Error: " + data.error);
            } else {
                // Navigate to result page instead of popup
                navigate('/scan-result', { state: { data } });
            }
        } catch (error) {
            console.error("Scan failed", error);
            alert("Could not analyze image. Try again.");
        } finally {
            setDebugMsg("");
        }
    };

    // Water Reminder Logic
    useEffect(() => {
        if (!user || logs?.water >= (user.waterTarget || 3)) return;

        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            if (Notification.permission === "granted" && logs?.water < (user.waterTarget || 3)) {
                new Notification("Hydration Check! 💧", {
                    body: "Time to drink some water to hit your daily goal!",
                });
            }
        }, 60 * 60 * 1000); // Check every hour

        return () => clearInterval(interval);
    }, [user, logs]);

    useEffect(() => {
        const fetchData = async () => {
            setDebugMsg(`Fetching data for ${selectedDate}...`);
            try {
                const token = localStorage.getItem('token');

                // If fetching past date, check history first
                const today = new Date().toISOString().split('T')[0];
                if (selectedDate !== today) {
                    console.log("Fetching history for", selectedDate);
                    const res = await fetch(`http://localhost:5000/api/user/history/${selectedDate}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const history = await res.json();

                    if (history.found) {
                        console.log("History found", history.data);
                        setMealPlan(history.data.mealPlan || {});
                        setLogs(history.data.consumptionLogs || {});
                        setSteps(history.data.steps || 0);
                        setInsight(history.data.insight);
                        // Ensure user is set if we navigated here directly
                        if (!user) {
                            const userData = await authService.fetchProfile();
                            if (userData && userData.profile) {
                                setUser({ name: userData.name, ...userData.profile });
                            }
                        }
                        return;
                    } else {
                        console.log("No history found");
                        setMealPlan(null);
                        setLogs({});
                        setSteps(0);
                        // Ensure user is set
                        if (!user) {
                            const userData = await authService.fetchProfile();
                            if (userData && userData.profile) {
                                setUser({ name: userData.name, ...userData.profile });
                            }
                        }
                        return;
                    }
                }

                // Normal Load for Today
                console.log("Fetching profile for today");
                const userData = await authService.fetchProfile();
                console.log("User Data Received:", userData);

                if (!userData || !userData.profile) {
                    console.warn("Invalid user data, redirecting to onboarding");
                    navigate('/onboarding');
                    return;
                }
                const fullProfile = { name: userData.name, ...userData.profile };
                setUser(fullProfile);

                if (fullProfile.dailySteps) setSteps(fullProfile.dailySteps);
                if (fullProfile.mealPlan) {
                    setMealPlan(fullProfile.mealPlan);
                    if (fullProfile.logs) {
                        try {
                            const res = await fetch(`http://localhost:5000/api/user/history/${today}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const todayLog = await res.json();
                            if (todayLog.found) {
                                setLogs(todayLog.data.consumptionLogs || {});
                                setSteps(todayLog.data.steps || 0);
                            }
                        } catch (err) { console.error("History fetch error:", err); }
                    }
                } else {
                    console.log("Generating initial plan...");
                    setDebugMsg("Generating plan...");
                    const newPlan = generateMealPlan(fullProfile.tdee, fullProfile.cuisine, fullProfile.preference);
                    setMealPlan(newPlan);
                }
            } catch (error) {
                console.error("Fetch Data Error:", error);
                setDebugMsg("Error: " + error.message);
                // navigate('/login'); // Disable direct redirect to debug
            }
        };
        fetchData();
    }, [navigate, selectedDate]);

    const handleRegenerate = async () => {
        setGenerating(true);
        try {
            const newPlan = await authService.generatePlan();
            setMealPlan(newPlan);
        } catch (error) {
            console.error("Failed to regenerate", error);
            alert("AI Chef is busy. Try again!");
        } finally {
            setGenerating(false);
        }
    };

    if (!user || (!mealPlan && !generating && selectedDate === new Date().toISOString().split('T')[0])) return (
        <div className="flex flex-col items-center justify-center" style={{ height: '100vh', color: 'var(--color-neon-primary)' }}>
            <Activity className="animate-pulse" size={48} />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-main)' }}>{debugMsg}</p>
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center" style={{ height: '100vh', color: 'var(--color-text-main)' }}>
            <Activity className="animate-spin" size={48} />
            <p style={{ marginTop: '1rem' }}>Loading User Profile... ({debugMsg})</p>
        </div>
    );

    const StatRing = ({ value, label, icon: Icon, color }) => (
        <div className="flex items-center gap-md">
            <div style={{
                position: 'relative', width: '60px', height: '60px', borderRadius: '50%',
                background: `conic-gradient(${color} 0%, rgba(255,255,255,0.1) 0%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 15px ${color}40`
            }}>
                <div style={{ position: 'absolute', inset: '4px', background: 'var(--color-bg-dark)', borderRadius: '50%' }}></div>
                <Icon size={24} color={color} style={{ position: 'relative', zIndex: 2 }} />
            </div>
            <div>
                <h2 style={{ fontSize: '1.8rem', margin: 0, lineHeight: 1 }}>{value}</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>{label}</p>
            </div>
        </div>
    );

    const RecipeModal = () => {
        if (!viewingRecipe) return null;
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
            }} onClick={() => setViewingRecipe(false)}>
                <div className="glass-panel" style={{
                    padding: '2rem', borderRadius: '16px',
                    width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
                    border: '1px solid var(--color-neon-primary)'
                }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-neon-primary)' }}>{recipe ? recipe.title : 'Loading...'}</h2>
                        <button onClick={() => setViewingRecipe(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {!recipe ? (
                        <div className="flex justify-center p-8"><Activity className="animate-spin" size={32} /></div>
                    ) : (
                        <div>
                            <h4 style={{ color: 'var(--color-neon-secondary)', marginBottom: '0.5rem' }}>Ingredients</h4>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                {recipe.ingredients?.map((ing, i) => (
                                    <li key={i} style={{ padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>• {ing}</li>
                                ))}
                            </ul>

                            <h4 style={{ color: 'var(--color-neon-secondary)', marginBottom: '0.5rem' }}>Instructions</h4>
                            <ol style={{ paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
                                {recipe.instructions?.map((inst, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{inst}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ShoppingListModal = () => {
        if (!viewingShoppingList) return null;
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
            }} onClick={() => setViewingShoppingList(false)}>
                <div className="glass-panel" style={{
                    padding: '2rem', borderRadius: '16px',
                    width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
                    border: '1px solid var(--color-neon-secondary)',
                }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-neon-secondary)' }}>Today's Shopping List</h2>
                        <button onClick={() => setViewingShoppingList(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {!shoppingList ? (
                        <div className="flex justify-center p-8"><Activity className="animate-spin" size={32} /></div>
                    ) : (
                        <div>
                            {Object.entries(shoppingList).map(([category, items]) => (
                                <div key={category} style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ color: 'var(--color-neon-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.2rem' }}>{category}</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {items.map((item, i) => (
                                            <li key={i} className="flex items-center gap-sm" style={{ padding: '0.2rem 0' }}>
                                                <input type="checkbox" style={{ accentColor: 'var(--color-neon-secondary)' }} />
                                                <span style={{ opacity: 0.8 }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
            <RecipeModal />
            <ShoppingListModal />
            {/* Header */}
            <header className="flex justify-between items-center" style={{ padding: '2rem 0', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        Hello, <span style={{ color: 'var(--color-neon-primary)' }}>{user.name?.split(' ')[0] || user.name}</span>
                    </h1>
                    <div className="flex items-center gap-md">
                        <div className="flex items-center gap-xs">
                            <div style={{ width: '8px', height: '8px', background: 'var(--color-neon-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-neon-primary)' }}></div>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>System Operational • AI Active</span>
                        </div>
                        <div className="glass-panel flex items-center gap-xs" style={{ padding: '0.3rem 0.8rem' }}>
                            <Calendar size={14} color="var(--color-neon-secondary)" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    background: 'transparent', border: 'none', color: 'white',
                                    outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-md items-center">
                    <div className="glass-panel flex items-center gap-xs" style={{ padding: '0.5rem 1rem' }}>
                        <Globe size={16} color="var(--color-neon-secondary)" />
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            style={{ border: 'none', background: 'transparent', color: 'white', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="en" style={{ color: 'black' }}>English</option>
                            <option value="hi" style={{ color: 'black' }}>Hindi</option>
                            <option value="ta" style={{ color: 'black' }}>Tamil</option>
                        </select>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/social')} style={{ color: 'var(--color-neon-primary)' }}>
                        <Users size={20} />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/settings')} style={{ borderColor: 'var(--color-neon-secondary)', color: 'var(--color-neon-secondary)' }}>
                        Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => { authService.logout(); navigate('/'); }} style={{ borderColor: 'var(--color-neon-danger)', color: 'var(--color-neon-danger)' }}>
                        {t('logout')}
                    </Button>
                </div>
            </header >

            {/* Bento Grid */}
            <div className="grid-bento">

                {/* Stats Row */}
                <BentoCard colSpan={3} title={t('daily_goal')}>
                    <StatRing value={(user.tdee || 2000) + Math.round(steps * 0.04)} label="Kcal Target" icon={Flame} color="var(--color-neon-primary)" />
                </BentoCard>

                <BentoCard colSpan={3} title={t('steps')}>
                    <div className="flex items-center gap-md h-full">
                        <Footprints size={32} color="var(--color-neon-secondary)" />
                        <div>
                            <input
                                type="number"
                                value={steps}
                                onChange={(e) => handleStepsChange(e.target.value)}
                                onBlur={saveSteps}
                                style={{
                                    fontSize: '2rem', fontWeight: 'bold', width: '120px',
                                    border: 'none', borderBottom: '2px solid var(--color-neon-secondary)',
                                    background: 'transparent', color: 'white', outline: 'none'
                                }}
                            />
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>+ {Math.round(steps * 0.04)} kcal bonus</p>
                        </div>
                        <Button variant="outline" onClick={() => handleGoogleConnect()} style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.3rem 0.6rem', borderColor: '#4285F4', color: '#4285F4' }}>
                            Sync Fit
                        </Button>
                    </div>
                </BentoCard>

                <BentoCard colSpan={3} title={t('bmi')}>
                    <div className="flex flex-col justify-center h-full">
                        <h2 style={{ fontSize: '2.5rem', color: user.healthStatus === 'Healthy Weight' ? 'var(--color-neon-primary)' : 'var(--color-neon-danger)' }}>
                            {user.bmi}
                        </h2>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{user.healthStatus}</span>
                    </div>
                </BentoCard>

                <BentoCard colSpan={3} title={t('water')}>
                    <div className="flex items-center gap-md">
                        <Droplet size={32} color="#00d2ff" />
                        <div>
                            <h2 style={{ fontSize: '2rem' }}>3.5 <span style={{ fontSize: '1rem', fontWeight: '400' }}>L</span></h2>
                            <div style={{ width: '100%', height: '4px', background: '#333', marginTop: '0.5rem', borderRadius: '2px' }}>
                                <div style={{ width: '70%', height: '100%', background: '#00d2ff', borderRadius: '2px', boxShadow: '0 0 10px #00d2ff' }}></div>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard colSpan={3} title="Workout">
                    <div className="flex flex-col justify-center h-full cursor-pointer" onClick={() => navigate('/workout')}>
                         <div className="flex items-center gap-md">
                            <div style={{ padding: '0.8rem', borderRadius: '50%', background: 'rgba(0, 255, 157, 0.1)' }}>
                                <Dumbbell size={24} color="var(--color-neon-primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>View Plan</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>Train now &rarr;</p>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard colSpan={4} title="Health">
                    <WeightChart user={user} onLogWeight={handleWeightLog} />
                </BentoCard>

                {/* Main Content: Meal Plan Timeline */}
                <BentoCard colSpan={8} rowSpan={2} title={t('plan_title')} icon={<Zap size={18} />}>
                    <div className="flex justify-end" style={{ marginBottom: '-2rem', position: 'relative', zIndex: 10 }}>
                        <Button variant="secondary" onClick={handleRegenerate} disabled={generating} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                            <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                            {generating ? 'Cooking...' : 'Regenerate'}
                        </Button>
                    </div>
                    {generating ? (
                        <div className="flex-col items-center justify-center h-full" style={{ minHeight: '300px' }}>
                            <Activity className="animate-spin" size={48} color="var(--color-neon-primary)" />
                            <p className="text-muted" style={{ marginTop: '1rem' }}>AI Chef is designing your menu...</p>
                        </div>
                    ) : (
                        <div className="flex-col gap-md" style={{ marginTop: '1rem' }}>
                            {mealPlan && [{ type: 'Breakfast', icon: <Sun size={20} />, data: mealPlan.breakfast, time: '08:00' },
                            { type: 'Lunch', icon: <Sun size={20} />, data: mealPlan.lunch, time: '13:00' },
                            { type: 'Evening Snack', icon: <Coffee size={20} />, data: mealPlan.snack, time: '17:00' },
                            { type: 'Dinner', icon: <Moon size={20} />, data: mealPlan.dinner, time: '20:30' }]
                                .map((meal, idx) => (
                                    <div key={idx} className="glass-panel flex items-center justify-between"
                                        style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderLeft: `4px solid ${idx % 2 === 0 ? 'var(--color-neon-primary)' : 'var(--color-neon-secondary)'}`
                                        }}>
                                        <div className="flex items-center gap-md">
                                            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{meal.time}</span>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{tMeal(meal.type)}</h4>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{meal.data?.item || 'Loading...'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-lg">
                                            <span style={{ fontWeight: 'bold', color: 'var(--color-neon-primary)' }}>{meal.data?.calories || 0} kcal</span>
                                            <div className="flex gap-sm">
                                                <button onClick={() => handleViewRecipe(meal.data?.item)} title="Recipe" style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                                    <BookOpen size={16} />
                                                </button>
                                                <button onClick={() => handleSwap(meal.type, meal.data?.item)} title="Swap" style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button onClick={() => handleLog(meal.type, 'eaten')} title="Done" style={{ padding: '0.5rem', borderRadius: '50%', background: logs[meal.type] === 'eaten' ? 'var(--color-neon-primary)' : 'rgba(255,255,255,0.1)', color: logs[meal.type] === 'eaten' ? 'black' : 'white' }}>
                                                    <Activity size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </BentoCard>

                {/* Sidebar: AI Insights & Actions */}
                <BentoCard colSpan={4} rowSpan={2} title="AI Assistant">
                    <div className="flex-col h-full justify-between">
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(0,255,157,0.1), rgba(0,210,255,0.1))',
                            padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div className="flex items-center gap-sm" style={{ marginBottom: '1rem' }}>
                                <div style={{ background: 'var(--color-neon-accent)', padding: '0.3rem', borderRadius: '4px' }}>
                                    <Zap size={16} color="white" />
                                </div>
                                <h4 style={{ fontSize: '1rem' }}>Active Insight</h4>
                            </div>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e0e0e0' }}>
                                {insight || "Analyzing your daily patterns... No anomalies detected. Maintain current trajectory for optimal results."}
                            </p>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="flex gap-md">
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('cameraInput').click()}
                                    style={{ flex: 1, borderColor: 'var(--color-neon-primary)', color: 'var(--color-neon-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Camera size={18} />
                                    Scan
                                </Button>
                                <input
                                    type="file"
                                    id="cameraInput"
                                    accept="image/*"
                                    capture="environment"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleDownload}
                                    style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Download size={18} />
                                    Report
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleShoppingList}
                                style={{ width: '100%', borderColor: 'var(--color-neon-secondary)', color: 'var(--color-neon-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <ShoppingBag size={18} />
                                View Shopping List
                            </Button>
                        </div>
                    </div>

                    <div style={{ height: '300px', marginTop: '1rem' }}>
                        <ChatWidget />
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};

export default Dashboard;
