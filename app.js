require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { Configuration, OpenAIApi } = require("openai");
const qrcode = require("qrcode");
const cors = require("cors");
const routes = require("./routes");
const qrTerminal = require("qrcode-terminal");

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);
const app = express();
const port = 3000;

// middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use("/", routes);

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client1" }),
});

let qrCode;

client.on("qr", async (qr) => {
    console.log(
        "QR code received, generate the QR in the browser",
        qrTerminal.generate(qr, { small: true })
    );
    qrCode = await qrcode.toDataURL(qr);
});

client.on("ready", () => {
    console.log("Client is ready!");
});

// client.on("authenticated", (session) => {
//     console.log("Client is authenticated!");
// });

// client.on("auth_failure", () => {
//     console.log("Auth failure, restarting...");
// });

client.on("message", async (msg) => {
    if (msg.body.startsWith("chat:")) {
        const removePrefix = msg.body.replace("chat:", "");
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: removePrefix,
            temperature: 0.86,
            max_tokens: 4000,
            top_p: 1,
            frequency_penalty: 1.83,
            presence_penalty: 0.33,
        });
        msg.reply(response.data.choices[0].text);
    }
});

client.initialize();

app.get("/qr", (req, res) => {
    res.status(200).json({ qrCode });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
