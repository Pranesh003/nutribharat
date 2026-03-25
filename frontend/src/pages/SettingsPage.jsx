import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { calculateBMI, calculateBMR, calculateTDEE, getHealthStatus } from '../utils/calculator';
import { ChevronRight, ChevronLeft, Activity, Heart, Utensils, Save, User } from 'lucide-react';
import authService from '../services/authService';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        activity: 'sedentary',
        preference: 'vegetarian',
        goal: 'General Fitness',
        cuisine: 'North Indian',
        allergies: '',
        conditions: []
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await authService.fetchProfile();
                if (user && user.profile) {
                    setFormData({
                        age: user.profile.age || '',
                        gender: user.profile.gender || 'male',
                        height: user.profile.height || '',
                        weight: user.profile.weight || '',
                        activity: user.profile.activity || 'sedentary',
                        preference: user.profile.preference || 'vegetarian',
                        goal: user.profile.goal || 'General Fitness',
                        cuisine: user.profile.cuisine || 'North Indian',
                        allergies: user.profile.allergies || '',
                        conditions: user.profile.conditions || []
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                conditions: checked
                    ? [...prev.conditions, value]
                    : prev.conditions.filter(c => c !== value)
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSave = async () => {
        const bmi = calculateBMI(formData.weight, formData.height);
        const bmr = calculateBMR(formData.weight, formData.height, formData.age, formData.gender);
        const tdee = calculateTDEE(bmr, formData.activity);
        const healthStatus = getHealthStatus(bmi);

        const userProfile = {
            ...formData,
            bmi,
            bmr,
            tdee,
            healthStatus
        };

        try {
            await authService.updateProfile(userProfile);
            // Invalidate/update local storage user
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                currentUser.profile = userProfile;
                localStorage.setItem('user', JSON.stringify(currentUser));
            }
            alert('Profile updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to save profile: ' + error.message);
        }
    };

    if (loading) return <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}><Activity className="animate-pulse" /></div>;

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1rem' }}>
            <div className="flex items-center gap-md" style={{ marginBottom: '2rem' }}>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}><ChevronLeft size={20} /> Back</Button>
                <h1 className="text-gradient">Edit Profile</h1>
            </div>

            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--glass-border)', background: 'var(--color-bg-card)', boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)' }}>

                <h2 className="flex items-center gap-sm" style={{ marginBottom: '1.5rem' }}><User size={24} color="var(--color-neon-primary)" /> Basic Info</h2>
                <div className="flex-col gap-md" style={{ marginBottom: '2.5rem' }}>
                    <div className="flex gap-md">
                        <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} style={{ width: '100%' }} />
                        <div className="flex-col gap-sm" style={{ width: '100%' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                <option value="male" style={{ color: 'black' }}>Male</option>
                                <option value="female" style={{ color: 'black' }}>Female</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-md">
                        <Input label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
                        <Input label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
                    </div>
                    <div className="flex-col gap-sm">
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Activity Level</label>
                        <select name="activity" value={formData.activity} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            <option value="sedentary" style={{ color: 'black' }}>Sedentary (Little/No Exercise)</option>
                            <option value="light" style={{ color: 'black' }}>Lightly Active (1-3 days/week)</option>
                            <option value="moderate" style={{ color: 'black' }}>Moderately Active (3-5 days/week)</option>
                            <option value="active" style={{ color: 'black' }}>Very Active (6-7 days/week)</option>
                        </select>
                    </div>
                    <div className="flex-col gap-sm">
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Fitness Goal</label>
                        <select name="goal" value={formData.goal} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            <option value="General Fitness" style={{ color: 'black' }}>General Fitness</option>
                            <option value="Fat Loss" style={{ color: 'black' }}>Fat Loss</option>
                            <option value="Muscle Gain" style={{ color: 'black' }}>Muscle Gain</option>
                            <option value="Endurance" style={{ color: 'black' }}>Endurance / Stamina</option>
                            <option value="Flexibility" style={{ color: 'black' }}>Flexibility / Yoga</option>
                        </select>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '2.5rem' }}></div>

                <h2 className="flex items-center gap-sm" style={{ marginBottom: '1.5rem' }}><Utensils size={24} color="var(--color-neon-secondary)" /> Diet & Cuisine</h2>
                <div className="flex-col gap-md" style={{ marginBottom: '2.5rem' }}>
                    <div className="flex-col gap-sm">
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Diet Preference</label>
                        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                            {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Jain', 'Vegan'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, preference: type.toLowerCase() })}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        border: `1px solid ${formData.preference === type.toLowerCase() ? 'var(--color-neon-primary)' : 'rgba(255,255,255,0.1)'}`,
                                        background: formData.preference === type.toLowerCase() ? 'rgba(0, 255, 157, 0.1)' : 'transparent',
                                        color: formData.preference === type.toLowerCase() ? 'var(--color-neon-primary)' : 'var(--color-text-muted)',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-col gap-sm">
                        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Cuisine</label>
                        <select name="cuisine" value={formData.cuisine} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            <option value="North Indian" style={{ color: 'black' }}>North Indian</option>
                            <option value="South Indian" style={{ color: 'black' }}>South Indian</option>
                            <option value="East Indian" style={{ color: 'black' }}>East Indian</option>
                            <option value="West Indian" style={{ color: 'black' }}>West Indian</option>
                            <option value="Mixed" style={{ color: 'black' }}>Mixed Indian</option>
                        </select>
                    </div>
                    <Input label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
                </div>

                <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '2.5rem' }}></div>

                <h2 className="flex items-center gap-sm" style={{ marginBottom: '1.5rem' }}><Heart size={24} color="var(--color-neon-danger)" /> Conditions</h2>
                <div className="flex-col gap-sm" style={{ margin: '1rem 0', marginBottom: '2.5rem' }}>
                    {['Diabetes (Type 2)', 'Hypertension (BP)', 'Thyroid (Hypo/Hyper)', 'PCOS/PCOD', 'High Cholesterol'].map(condition => (
                        <label key={condition} className="flex items-center gap-sm" style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                            <input
                                type="checkbox"
                                name="conditions"
                                value={condition}
                                checked={formData.conditions.includes(condition)}
                                onChange={handleChange}
                                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-neon-primary)' }}
                            />
                            <span>{condition}</span>
                        </label>
                    ))}
                </div>

                <Button onClick={handleSave} style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
                    <Save size={20} style={{ marginRight: '0.5rem' }} /> Save Changes
                </Button>

            </div>
        </div>
    );
};

export default SettingsPage;
