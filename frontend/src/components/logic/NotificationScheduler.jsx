import React, { useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';


const NotificationScheduler = () => {
    const { addToast } = useNotification();

    useEffect(() => {
        const checkSchedule = () => {
            const now = new Date();
            const hour = now.getHours();
            const nowTs = now.getTime();

            // --- Hydration Reminder (Every 2 hours) ---
            const lastWater = localStorage.getItem('last_water_notification');
            if (!lastWater || (nowTs - parseInt(lastWater) > 2 * 60 * 60 * 1000)) {
                addToast("Time to drink a glass of water! 💧", "info");
                localStorage.setItem('last_water_notification', nowTs.toString());
            }

            // --- Breakfast Reminder (8 AM - 10 AM) ---
            // We check if it's the correct hour AND if we haven't notified today
            const lastBreakfast = localStorage.getItem('last_breakfast_notification');
            const todayString = now.toDateString();

            if (hour >= 8 && hour < 10) {
                if (lastBreakfast !== todayString) {
                    addToast("Good Morning! Don't forget your healthy breakfast. 🥞", "success");
                    localStorage.setItem('last_breakfast_notification', todayString);
                }
            }

            // --- Lunch Reminder (1 PM - 2 PM) ---
            const lastLunch = localStorage.getItem('last_lunch_notification');
            if (hour >= 13 && hour < 14) {
                if (lastLunch !== todayString) {
                    addToast("It's Lunch Time! Have a balanced meal. 🥗", "success");
                    localStorage.setItem('last_lunch_notification', todayString);
                }
            }

            // --- Dinner Reminder (8 PM - 9 PM) ---
            const lastDinner = localStorage.getItem('last_dinner_notification');
            if (hour >= 20 && hour < 21) {
                if (lastDinner !== todayString) {
                    addToast("Dinner Time! Keep it light and early. 🍲", "success");
                    localStorage.setItem('last_dinner_notification', todayString);
                }
            }
        };

        // Check every minute
        const interval = setInterval(checkSchedule, 60000);

        // Also run once on mount
        checkSchedule();

        return () => clearInterval(interval);
    }, [addToast]);

    return null; // This component renders nothing visual
};

export default NotificationScheduler;
