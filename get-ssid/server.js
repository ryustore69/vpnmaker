const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const RECAPTCHA_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Test Secret Key

// Endpoint untuk memverifikasi reCAPTCHA
app.post("/verify-captcha", async (req, res) => {
    const captchaResponse = req.body["g-recaptcha-response"];

    if (!captchaResponse) {
        return res.status(400).json({ error: "Captcha response is missing" });
    }

    try {
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaResponse}`;
        const response = await axios.post(verificationUrl);
        
        if (!response.data.success) {
            return res.status(400).json({ error: "Invalid captcha" });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error verifying captcha" });
    }
});

// Endpoint untuk mendapatkan SSID
app.get("/get-ssid", async (req, res) => {
    try {
        const response = await axios.get("https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg");
        res.send(response.data);
    } catch (error) {
        res.status(500).send("Error mengambil SSID");
    }
});

// Endpoint untuk membuat akun VPN
app.post("/create-vpn", async (req, res) => {
    const { username, sni_bug, protocol, ssid, captcha } = req.body;

    if (!captcha) {
        return res.status(400).json({ error: "Captcha is required" });
    }

    try {
        const formData = new URLSearchParams({
            "serverid": "3",
            "username": username,
            "sni_bug": sni_bug,
            "protocol": protocol,
            "ssid": ssid,
            "captcha": captcha
        });

        const response = await axios.post("https://www.fastssh.com/page/create-obfs-process", formData.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error creating VPN account" });
    }
});

app.listen(3000, () => console.log("✅ Server berjalan di http://localhost:3000"));
