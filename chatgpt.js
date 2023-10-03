
const apiKey = '####';
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

async function chatGpt(Content) {
    
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: Content }],
    n: 3
  });
  return chatCompletion.data.choices[0].message.content;
}

module.exports = chatGpt;
