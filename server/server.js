import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import OpenAI from 'openai'

dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'user', content: prompt }],
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      res.status(200).send({
        bot: response.choices[0].message.content
      });
    } else {
      console.log('Unexpected response:', response);
      res.status(500).send({error: 'Unexpected response from OpenAI API'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({error});
  }
});

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
