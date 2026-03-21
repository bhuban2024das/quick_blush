import axios from 'axios';

async function testOtp() {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            mobile: '1234567890',
            otp: '123456'
        });
        console.log("Success:", response.data);
    } catch (error: any) {
        console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);
    }
}
testOtp();
