---
title: "A fly plays Pokémon, Part 1"
date: 2026-09-17
description: "Hooking a simulated fly brain up to Pokémon, with sugar rewards, checkpoints, and a Twitch stream."
---

So, a fly neural map just dropped, and the internet has been getting up to some delightful, borderline horrifying shenanigans. A team led by [HHMI Janelia, working with Google Research and collaborators](https://research.google/blog/a-connectomics-milestone-mapping-the-complete-male-fruit-fly-brain/), mapped a male fruit fly's brain and nerve cord. Thin slices, electron microscope images, a whole lotta analysis, and the dataset is now on the internet.

<figure>
  <a href="/media/log/a-fly-plays-pokemon/male-fly-connectome.webp">
    <img src="/media/log/a-fly-plays-pokemon/male-fly-connectome.webp" width="1250" height="797" alt="Two views of reconstructed male fruit fly neurons, with dense brain lobes connected to a long ventral nerve cord. Individual cells are shown in different colors." loading="lazy" decoding="async" />
  </a>
  <figcaption>Some of the reconstructed cells in the male fly's brain and nerve cord, viewed from two angles. Image: <a href="https://research.google/blog/a-connectomics-milestone-mapping-the-complete-male-fruit-fly-brain/">Google Research</a>, from the connectome work by HHMI Janelia, the Cambridge Connectomics Group, Google Research, and collaborators.</figcaption>
</figure>

I was introduced to this madness with [Infinite Sugar](https://infinitesugar.cnqso.com/), where [William Kelly (cnqso)](https://github.com/cnqso/infinite-sugar) uses the earlier [FlyWire connectome](https://flywire.ai/), published in 2024, to simulate a fly's brain. Some neural activity drives movement in a simulated body, and a button "feeds" the fly infinite sugar by triggering sweet-sensing neurons. Most motor output is disconnected, and the fly doesn't get visual input from its terrarium.

<figure>
  <a href="/media/log/a-fly-plays-pokemon/infinite-sugar.webp">
    <img src="/media/log/a-fly-plays-pokemon/infinite-sugar.webp" width="1280" height="889" alt="Infinite Sugar shows a rendered fruit fly in a rocky terrarium, a colored neural-activity display, a feeding-signal counter, and a Sugar on button." loading="lazy" decoding="async" />
  </a>
  <figcaption>Infinite Sugar, with the sugar stimulus on and neural activity shown at lower left. Screenshot of <a href="https://infinitesugar.cnqso.com/">William Kelly's Infinite Sugar</a>; the project uses FlyWire connectome data and the FlyBody model.</figcaption>
</figure>

I was on the road when I read about this and began doom-coding (prompting an LLM on my phone instead of binging social media) a prototype. It started with questions about the dataset Infinite Sugar used, and the conversation meandered into project territory.

I wanted to do something with this. People were already hooking these simulations up to games, including [Alex Wormuth's Doom project](https://github.com/nftechie/doomfly), which maps game frames to sensory input and neural activity to controls. There's also a [Minecraft fly mod](https://github.com/blendi-remade/fly-brain-minecraft) that uses the newer MaleCNS connectome, with simplified integrate-and-fire neurons driving a fly mob.

The first thing that came to mind was watching [SethBling's MarI/O](https://www.youtube.com/watch?v=qv6UVOQ0F44), which evolves neural networks to play Super Mario World. Then I remembered the various Twitch Plays Pokémon streams, specifically Fish Plays Pokémon.

So, fly plays Pokémon. But how? What would this look like?

A Twitch stream, obviously, an emulator, and mapping the fly to the game. Initially, the plan was to map motor neurons to buttons, the screen to visual neurons, and set up *some* kind of reward-based feedback mechanism. Additionally, some tracking mechanism to prevent regressions and take periodic snapshots of the game.

<figure>
  <a href="/media/log/a-fly-plays-pokemon/fly-pokemon-stream.webp">
    <img src="/media/log/a-fly-plays-pokemon/fly-pokemon-stream.webp" width="1280" height="516" alt="The A Fly Plays Pokémon stream shows Pokémon Red on the left and a simulation dashboard on the right, including progress toward Pewter City, retinal input, and activity bars for drive, buttons, dopamine, and taste." loading="lazy" decoding="async" />
  </a>
  <figcaption>My stream: Pokémon Red on the left, sensory input and neural activity on the right. The progress tracker is working on the route from Viridian Forest to Pewter City. Cropped still from <a href="https://www.twitch.tv/aflyplayspokemon">aflyplayspokemon</a> by Alex Camilo. Pokémon game imagery: Nintendo / Creatures / GAME FREAK.</figcaption>
</figure>

The tracking/checkpoint code analyzes the save file to determine how much progress was made and gives the fly sugar at milestones.

Additionally, I set up a macro system to connect some neurons to pre-canned actions that are state-dependent, again by watching emulator memory. So, for example, in battle there are neurons hooked up to things like "use an item," "make an attack," or "throw a Poké Ball." I know this is a little against the "fish plays" vibe I was going for, but I think it turns the whole thing into a low-key idle RPG by enabling more focused actions.

I'm still working on it. In my haste, I built it around the wrong connectome: the 2024 female FlyWire brain used by Infinite Sugar, rather than the newer male brain and nerve cord map. I don't expect swapping it to be too hard, but I haven't done it yet.

I'll do a more detailed write-up and a project page at a later point, but if you want to check it out, [the stream can be found here](https://www.twitch.tv/aflyplayspokemon).
