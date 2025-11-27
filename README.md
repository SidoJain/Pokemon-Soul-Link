# Pokémon Soul Link Tracker

A full-stack web app for tracking cooperative Soul Link Nuzlocke runs of Pokémon games.  
Features include game management, Pokémon pair tracking, player profiles, and detailed death analytics.  

👉 [View Live](https://pokemon-soul-link.vercel.app/)

## Overview

The Pokémon Soul Link Nuzlocke is a cooperative challenge: two trainers link their Pokémon caught in the same area, so that if one Pokémon faints, its partner on the other team is also considered “dead.” This site helps manage your runs, pairs, and victory/defeat stats—making Soul Link easier and more engaging for Pokémon fans.

## Features

- **Game Management:** Create and manage Soul Link games with paired runs and players.  
- **Profile System:** Register as a trainer, set your username, and team up with friends.  
- **Pokemon Pair Tracker:** Assign, nickname, and record “soul linked” Pokémon pairs by game and route.  
- **Death Analytics:** View statistics on pair deaths, individual Pokémon, routes, games, and player performance.  
- **Responsive UI:** Easy navigation for desktop and mobile.  
- **Authentication:** Secure login for trainers.  
- **Peer Collaboration:** Real-time updates for both players.  

## Rules (for reference)

- Usually played with a Pokémon Randomizer.
- Only the first Pokémon encountered in each area can be caught.
- The Pokémon in each area by each player are linked.  
- No two linked pairs may share the same primary type across the team.
- If a new encounter would give either player a Pokémon whose primary type is already present in that player’s party, that encounter must be boxed.
- Species Clause: You cannot catch a Pokémon if either player has that exact species already in the Soul Link. That encounter must be rerolled.
- If a Pokémon in a Soul Link pair faints, both are recorded as dead.  
- Linked pairs must be stored or released together.  
- If one player fails to catch, both Pokémon for that route are forfeited.  

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Lucide React
- Backend: Supabase (PostgreSQL, Auth, RLS, REST)
- APIs: Real-time, RESTful endpoints for game and analytics data
- Deployment: Vercel

## Getting Started

1. Clone the repo:

    ```bash
    git clone https://github.com/SidoJain/Pokemon-Soul-Link.git
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure environment:

    - Add your Supabase URL and anon key to .env.local  
    - Set up your database and run migrations  

4. Start development server:

    ```bash
    npm run dev
    ```

## Usage

- Register/log in as a trainer.  
- Create or join a new Soul Link game.  
- Add paired Pokémon (one per route for each player).  
- Manage pairs and track their deaths in real-time.  
- Analyze game stats and pair histories.  
