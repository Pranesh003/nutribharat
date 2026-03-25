export const calculateBMI = (weightKg, heightCm) => {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
};

export const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }
    return Math.round(bmr);
};

export const calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
        sedentary: 1.2,      // Little or no exercise
        light: 1.375,        // Light exercise 1-3 days/week
        moderate: 1.55,      // Moderate exercise 3-5 days/week
        active: 1.725,       // Hard exercise 6-7 days/week
        very_active: 1.9     // Very hard exercise/physical job
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

export const getHealthStatus = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 24.9) return 'Healthy Weight';
    if (bmi < 29.9) return 'Overweight';
    return 'Obese';
};
