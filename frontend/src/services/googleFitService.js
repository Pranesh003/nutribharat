import axios from 'axios';

const GOOGLE_FIT_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

export const fetchTodaySteps = async (accessToken) => {
    try {
        const startTime = new Date();
        startTime.setHours(0, 0, 0, 0);
        const endTime = new Date();

        const response = await axios.post(GOOGLE_FIT_URL, {
            "aggregateBy": [{
                "dataTypeName": "com.google.step_count.delta",
                "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            }],
            "bucketByTime": { "durationMillis": 86400000 },
            "startTimeMillis": startTime.getTime(),
            "endTimeMillis": endTime.getTime()
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse response
        const bucket = response.data.bucket[0];
        if (bucket && bucket.dataset[0].point.length > 0) {
            return bucket.dataset[0].point[0].value[0].intVal;
        }
        return 0;

    } catch (error) {
        console.error("Error fetching steps from Google Fit:", error);
        throw error;
    }
};
