import axios from "axios";

export default async function handler(req, res) {
    if (req.method === "POST") {
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

            return res.status(200).json({ success: true, data: response.data });
        } catch (error) {
            return res.status(500).json({ error: "Error creating VPN account" });
        }
    } else if (req.method === "GET") {
        try {
            const ssidResponse = await axios.get("https://www.fastssh.com/page/create-obfs-account/server/3/obfs-asia-sg");
            return res.status(200).send(ssidResponse.data);
        } catch (error) {
            return res.status(500).send("Error mengambil SSID");
        }
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
}
