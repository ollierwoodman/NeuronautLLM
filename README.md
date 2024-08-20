# NeuronautLLM

## Intro video and demo

https://youtu.be/ojrl6XRTVD0

## Running the application

First, run the activation server from [Transformer Debugger](https://github.com/openai/transformer-debugger/) on `localhost:8000`.

Secondly, initialize and populate the database via the repo [NeuronautLLM-database](https://github.com/ollierwoodman/NeuronautLLM-database).

Finally, add the file path to the database file to a `.env.local` file according to the format shown in `.env.example` and run the application in dev mode with `npm run dev`.

## API

For the React front-end to retrieve data from the database, a simple HTTP API was implemented in the Next.js project. The API consists of three routes for retrieving neurons, activations and topics, which can be accessed via GET requests to following paths:

```text
GET /neurons/:layer_index/:neuron_index
GET /activations/:layer_index/:neuron_index
GET /topics
```

The activations API route has two optional query parameters:

- category: string, either `top` or `random` (default: 'top')
- limit: integer, between 1 and 50 inclusive (default: 10)
