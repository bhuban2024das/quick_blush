import axios from 'axios';

async function runTests() {
    try {
        console.log("Testing verify-otp for new user...");
        const res1 = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            mobile: '5555555555',
            otp: '123456'
        });
        console.log("Success 1:", res1.status);

        console.log("Testing verify-otp again for existing user...");
        const res2 = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            mobile: '5555555555',
            otp: '123456'
        });
        console.log("Success 2:", res2.status);
    } catch (e: any) {
        console.error("Error Status:", e.response?.status);
        console.error("Error Data:", e.response?.data);
    }
}
runTests();
