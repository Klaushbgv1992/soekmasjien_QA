// Importing modules for the Express application
import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

// Importing the OpenAI library using the new v4 syntax
import OpenAI from 'openai';

// Loading environment variables
dotenv.config();

// Configuring the OpenAI API with the API key from environment variables
const configuration = new OpenAI.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Creating an instance of the OpenAIApi with the configuration
const openai = new OpenAI.OpenAIApi(configuration);

// Setting up the Express application
const app = express();
app.use(cors());
app.use(express.json());

// GET route for basic testing
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  });
});

// POST route for handling OpenAI completions
app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages: [{
        role: "system",
        content: prompt
      }]
    });

    // Sending the response back to the client
    res.status(200).send({
      bot: response.choices[0].message.content
    });

  } catch (error) {
    // Handling errors and sending a response
    console.error(error);
    res.status(500).send(error || 'Something went wrong');
  }
});

// Starting the Express server on port 5000
app.listen(5000, () => console.log('AI server started on http://localhost:5000'));
