# web-rtc-broadcast
## Overview
Very Small radio application that allows users to join the room where the song I made is played on loop.
The project gave me the foundations of real-time applications and allowed me to start working on [tunetalk](https://github.com/krzysztofmech/tunetalk).

## Core Components

  - Its built on top of [Mediasoup v3](https://mediasoup.org/documentation/v3/)
  - Signaling is done with Socket.io
  - Served by the Express application
  - The looped song is being injected by running [ffmpeg](https://ffmpeg.org/ffmpeg.html) process
  - Client application uses React bundled by Vite and styled with Tailwind

## Requirements

  - ffmpeg installed</li>
  - Bun and pnpm installed</li>
  - [Mediasoup requirements](https://mediasoup.org/documentation/v2/mediasoup/installation/#requirements)</li>


## Installation
- Go to the `app` and run `bun install` and then `bun dev`
- Inside the `server` run `pnpm install` then in one terminal run `pnpm watch`, in a second `pnpm dev`

## How does it work?

- Enter the username
- Join the room
- Start listening with others

