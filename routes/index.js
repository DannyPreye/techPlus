require("dotenv").config();

const router = require("express").Router();
const { Configuration, OpenAIApi } = require("openai");

// configure the openai api
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

router.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    console.log("prompt", prompt);
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.86,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 1.83,
            presence_penalty: 0.33,
        });
        console.log(response.data.choices[0].text);
        res.status(200).json({ data: response.data.choices[0].text });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

module.exports = router;
