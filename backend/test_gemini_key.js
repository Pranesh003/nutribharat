const GEMINI_API_KEY = 'AIzaSyAYqx6Gf1KrbNA3CoPweAMgoYJyrfopl2Q';

async function testGemini() {
    console.log('Testing Gemini API Key...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Explain how AI works in one sentence." }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('✅ Success! AI Response:', text);
    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
}

testGemini();
