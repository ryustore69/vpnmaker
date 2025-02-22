document.getElementById("vpnForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const sni_bug = document.getElementById("sni_bug").value.trim();
    const protocol = document.getElementById("protocol").value;
    const ssidElement = document.getElementById("ssid");
    const captchaElement = document.getElementById("g-recaptcha-response");
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "⏳ Mengambil SSID dan menyelesaikan Captcha...";

    async function getSSID() {
        try {
            const response = await fetch("http://localhost:3000/get-ssid");
            const html = await response.text();
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
    
            const ssidInput = tempDiv.querySelector("input[name='ssid']");
            return ssidInput ? ssidInput.value.trim() : null;
        } catch (error) {
            console.error("❌ Gagal mengambil SSID:", error);
            return null;
        }
    }    

    async function solveCaptcha() {
        return new Promise((resolve, reject) => {
            const solverInterval = setInterval(() => {
                if (captchaElement.value.trim()) {
                    clearInterval(solverInterval);
                    resolve(captchaElement.value.trim());
                }
            }, 3000);

            setTimeout(() => {
                clearInterval(solverInterval);
                reject("❌ Captcha tidak dapat diselesaikan.");
            }, 20000);
        });
    }

    const ssid = await getSSID();
    if (!ssid) {
        resultDiv.innerHTML = "⚠️ Gagal mendapatkan SSID. Coba lagi.";
        return;
    }
    ssidElement.value = ssid;

    try {
        const captcha = await solveCaptcha();
        if (!captcha) {
            resultDiv.innerHTML = "⚠️ Captcha kosong! Mohon selesaikan captcha.";
            return;
        }

        const url = "https://sparkling-limit-b5ca.corspass.workers.dev/?apiurl=https://www.fastssh.com/page/create-obfs-process";
        const payload = new URLSearchParams({
            "serverid": "3",
            "username": username,
            "sni_bug": sni_bug,
            "protocol": protocol,
            "ssid": ssid,
            "captcha": captcha
        });

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload
        });

        const responseText = await response.text();
        if (responseText.startsWith("{") || responseText.startsWith("[")) {
            const data = JSON.parse(responseText);
            resultDiv.innerHTML = `✅ Akun berhasil dibuat!<br>Username: ${data.username}`;
        } else {
            extractVLESSAccount(responseText);
        }
    } catch (error) {
        console.error("❌ Gagal mengirim permintaan:", error);
        resultDiv.innerHTML = "❌ Gagal membuat akun. Coba lagi nanti.";
    }
});

function extractVLESSAccount(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const textareas = tempDiv.querySelectorAll("textarea");
    const resultDiv = document.getElementById("result");

    if (textareas.length > 0) {
        resultDiv.innerHTML = `✅ Akun berhasil dibuat:<br><textarea readonly>${textareas[0].value}</textarea>`;
    } else {
        resultDiv.innerHTML = "⚠️ Akun tidak ditemukan. Coba lagi.";
    }
}
