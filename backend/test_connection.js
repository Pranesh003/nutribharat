// Native fetch is available in Node 18+

// Mock login to get token (optional, but good if we can)
// Since we don't have easy access to a valid token without full login flow,
// we might check if we can bypass or just see if we get a 401 (which means server is reachable)

async function testEndpoint() {
    console.log("Attempting to hit http://localhost:5000/api/plan/generate...");
    try {
        const res = await fetch('http://localhost:5000/api/plan/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.status === 401) {
            console.log("✅ Server reached! (401 Unauthorized is expected without token)");
        } else if (res.status === 200) {
            const data = await res.json();
            console.log("✅ Success:", data);
        } else {
            const txt = await res.text();
            console.log("❌ Response:", txt);
        }
    } catch (e) {
        console.error("❌ Connection Failed:", e.message);
    }
}

testEndpoint();
