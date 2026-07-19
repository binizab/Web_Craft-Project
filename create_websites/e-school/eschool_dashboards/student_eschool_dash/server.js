const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Note: Always use Secret Key (CHASECK) on the backend
const CHAPA_AUTH = 'CHASECK_TEST-l24vQEogaPAehmhcYfumNEsSjXMSEv4E'; 

// 1. Initialize Payment
app.post('/create-payment', async (req, res) => {
    try {
        // FIXED: Added 'email' to the destructured body
        const { amount, userID, email } = req.body; 

        if (!email || !amount) {
            return res.status(400).send({ error: "Missing required fields: amount or email" });
        }

        const tx_ref = "tx-" + Date.now();

        const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
            amount: amount,
            currency: 'ETB',
            email: email,
            tx_ref: tx_ref,
            callback_url: 'https://webhook.site/79b5adbf-8de2-4214-81f7-71529aa40000', 
            return_url: `http://127.0.0.1:5500/verify-page.html?tnx_ref=${tx_ref}`, 
        }, { 
            headers: { 
                Authorization: `Bearer ${CHAPA_AUTH}`,
                'Content-Type': 'application/json'
            } 
        });

        res.send({ checkout_url: response.data.data.checkout_url });
    } catch (e) {
        console.error("Chapa Error:", e.response ? e.response.data : e.message);
        res.status(500).send({ error: "Failed to initialize payment" });
    }
});

// 2. Verify Payment Status
app.get('/verify-payment/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${req.params.id}`, {
            headers: { Authorization: `Bearer ${CHAPA_AUTH}` }
        });
        res.send(response.data);
    } catch (e) {
        res.status(500).send({ error: "Verification failed" });
    }
});

// 3. Webhook Route
app.post('/chapa-webhook', (req, res) => {
    const data = req.body;
    console.log("Webhook Received:", data);

    if (data.status === 'success') {
        console.log(`Payment confirmed for ${data.email}`);
    }
    res.sendStatus(200);
});

app.listen(4242, () => console.log('🚀 Server running on http://localhost:4242'));