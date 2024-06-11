This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

\subsection{Development}\label{md_development}
The NeuronautLLM application is built in TypeScript using the Next.js framework employing the \textit{App Router} model and using React for front-end development. In this section, we will outline the development process and the key .

\subsubsection{API}\label{md_dev_api}
For the React front-end to retrieve data from the database, a simple HTTP API was implemented in the Next.js project. The API consists of two routes for retrieving neurons and activations, which can be accessed via GET requests to following paths:
\begin{verbatim}
GET /neurons/:layer_index/:neuron_index
GET /activations/:layer_index/:neuron_index
\end{verbatim}

The activations API route has two optional query parameters:
\begin{enumerate}
    \item category - string, either ``top'' or ``random'' (default: top)
    \item limit - integer, between 1 and 50 inclusive (default: 10)
\end{enumerate}

\subsubsection{Front-end and user interface}\label{md_dev_ui}
As covered in 