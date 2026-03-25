// Simple rule-based generator with Alternatives
export const generateMealPlan = (calories, cuisine, preference) => {
    const plans = getPlans(cuisine);

    // Helper to pick random
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
        breakfast: { item: getRandom(plans.breakfast), calories: Math.round(calories * 0.25) },
        lunch: { item: getRandom(plans.lunch), calories: Math.round(calories * 0.35) },
        snack: { item: getRandom(plans.snack), calories: Math.round(calories * 0.15) },
        dinner: { item: getRandom(plans.dinner), calories: Math.round(calories * 0.25) }
    };
};

export const getAlternative = (mealType, currentItem, cuisine) => {
    const plans = getPlans(cuisine);
    const categoryLower = mealType.toLowerCase().includes('snack') ? 'snack' : mealType.toLowerCase();

    const options = plans[categoryLower] || [];
    // Filter out current item to avoid swap to same
    const alts = options.filter(item => item !== currentItem);

    if (alts.length === 0) return currentItem;
    return alts[Math.floor(Math.random() * alts.length)];
};

const getPlans = (cuisine) => {
    const db = {
        'North Indian': {
            breakfast: ['Paratha with Curd', 'Poha with Peanuts', 'Besan Chilla', 'Aloo Paratha (Low Oil)', 'Paneer Bhurji + Toast'],
            lunch: ['Roti + Dal Tadka + Sabzi', 'Rajma Chawal', 'Paneer Curry + Roti', 'Chole + Brown Rice', 'Bhindi Masala + 2 Roti'],
            snack: ['Roasted Makhana', 'Masala Chai + 2 Biscuits', 'Fruit Chat', 'Sprouts Salad', 'Roasted Chana'],
            dinner: ['Roti + Mix Veg', 'Dal Khichdi', 'Moong Dal Cheela', 'Bottle Gourd (Lauki) Sabzi + Roti', 'Soup + Grilled Paneer']
        },
        'South Indian': {
            breakfast: ['Idli Sambar', 'Dosa with Chutney', 'Upma', 'Uttapam', 'Pesarattu'],
            lunch: ['Rice + Sambar + Poriyal', 'Lemon Rice + Curd', 'Curd Rice + Pickle', 'Rice + Rasam + Veggie', 'Tamarind Rice'],
            snack: ['Filter Coffee', 'Sundal (Chickpeas)', 'Banana Chips (Portioned)', 'Murukku (Small)', 'Steam Corn'],
            dinner: ['Chapati + Kurma', 'Idli + Chutney', 'Rava Dosa', 'Semiya Upma', 'Millet Dosa']
        }
    };
    return db[cuisine] || db['North Indian'];
};
