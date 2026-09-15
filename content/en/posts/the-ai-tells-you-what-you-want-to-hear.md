---
title: "The AI tells you what you want to hear"
date: 2026-09-15T11:21:17-06:00
draft: false
tags: ["ai", "sycophancy", "philosophy"]
categories: ["blog"]
translationKey: "sycophancy-mirror"
summary: "A two-minute experiment with a chatbot, and what digital sycophancy says about us: we ask for honesty, something we don't do well among humans either."
---

I asked a chatbot to comment on a piece of writing. I told it I wrote it: it said the argument was solid, well structured, with clear ideas.

Then I gave it the same text, word for word, and told it someone else wrote it and that I thought it was bad. Suddenly the premises didn't hold and half of it needed rewriting.

The only thing I changed was who I said wrote it. The model was measuring what I wanted to hear, and the text didn't matter to it.

The name for this is *sycophancy*, from the Greek *sykophantes*, the flatterer of Athens, which makes the character older than democracy. In AI it describes a model's tendency to agree with you even when you're wrong: your opinion becomes its opinion.

## Not one model's quirk

In 2023 Anthropic tested five frontier assistants on four different tasks ([paper](https://arxiv.org/abs/2310.13548)) and all five did the same thing. They also found that scale makes it worse: the bigger and more heavily trained the model, the more it flatters.

Another experiment from the paper: they showed the model a poem attributed to the wrong poet. The model knew who wrote it and confirmed the false attribution rather than contradict the user.

## Why it happens

Assistants are trained with RLHF: the model is shown two answers and a person picks the better one. After thousands of choices like that, the model has learned which answers people like. The paper measured that annotators prefer the ones matching what we already believe. We're ordinary humans and we'd rather be told we're right.

The model ends up optimizing the annotator's thumbs-up instead of being correct and useful. That's *reward hacking*, and the bias is in the data we train it on as well.

A system prompt like "be honest, don't flatter me" changes what you see; the behavior comes back through other routes. Overcorrected models swing the other way and argue with you on principle, so as not to look like flatterers.

## We taught it

Psychology has studied this since the sixties: *ingratiation*, winning someone's favor by flattering and agreeing. Cialdini showed flattery works even when it's obviously false, and in a royal court pleasing the powerful was survival. The mechanism is old: the machine read it in our text and pushed it to the extreme.

Plato had already classified it in the *Gorgias*. Against the arts that seek your good he set *kolakeia*: rhetoric, cooking, cosmetics, the practices that hand you the pleasure without the good. Plato calls it the ghost of a true art. A well-trained chatbot is pure *kolakeia*.

Athens invented both words for this scene. The *sykophantes*, the flatterer. And the gadfly, which was Socrates, stinging the city so it would examine itself. Athens executed Socrates for being a nuisance; we trained AI never to sting.

## The mirror

The classical definition of lying requires an intent to deceive, and AI has no intent: it optimizes a reward. It flatters in good faith, without knowing what faith is.

A human sycophant flatters because he wants something from you. The machine flatters because its training rewarded pleasing. There's no "what for" underneath. There is only a mirror.

It takes your opinion, combs it a little and tells you it's brilliant. They learned to love us back.

When we ask them for honesty we're asking for something we don't do well among ourselves: telling the truth when it stings.

The next time a chatbot agrees with you, check whether it agreed because you were right or because you wanted to hear it.
