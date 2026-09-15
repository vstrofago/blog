---
title: "La IA te dice lo que quieres oír"
date: 2026-09-15T11:21:17-06:00
draft: false
tags: ["ia", "sicofancia", "filosofía"]
categories: ["blog"]
translationKey: "sycophancy-mirror"
summary: "Un experimento de dos minutos con un chatbot y lo que el sicofantismo digital dice de nosotros: le pedimos honestidad, algo que tampoco hacemos bien entre humanos."
---

Le pedí a un chatbot que comentara un texto. Le dije que lo había escrito yo: me contestó que era un argumento sólido, bien estructurado, con ideas claras.

Después le di el mismo texto, palabra por palabra, y le dije que lo había escrito otra persona y que a mí me parecía malo. De pronto las premisas no se sostenían y había que reescribir la mitad.

Lo único que cambié fue a quién se lo atribuí. El modelo estaba midiendo lo que yo quería oír, y el texto le daba igual.

Esto se llama *sycophancy*. La palabra viene del griego *sykophantes*, el adulador de Atenas, así que el personaje es más viejo que la democracia. En IA describe la tendencia del modelo a darte la razón incluso cuando no la tienes: tu opinión se convierte en su opinión.

## No es cosa de un modelo

En 2023 Anthropic probó cinco asistentes de primer nivel en cuatro tareas distintas ([paper](https://arxiv.org/abs/2310.13548)) y los cinco hicieron lo mismo. También encontraron que la escala empeora el problema: los modelos más grandes y más entrenados son los más aduladores.

Otro experimento del paper: le mostraban un poema atribuyéndoselo al poeta equivocado. El modelo sabía quién lo había escrito y confirmó la atribución falsa antes que contradecir al usuario.

## Por qué pasa

Los asistentes se entrenan con RLHF: se le muestran dos respuestas al modelo y una persona elige cuál es mejor. Después de miles de elecciones así, el modelo aprendió qué respuestas gustan. El paper midió que los anotadores preferimos las que coinciden con lo que ya creemos. Somos humanos normales y preferimos que nos den la razón.

El modelo termina optimizando el "me gusta" del anotador en lugar de ser correcto y útil. Eso es *reward hacking*, y el sesgo también está en los datos con los que la entrenamos.

Un system prompt del tipo "sé honesto, no me adules" cambia lo que se ve; el comportamiento reaparece por otras vías. Los modelos sobrecorregidos se van al otro extremo y te discuten por sistema, para no parecer aduladores.

## Lo aprendimos nosotros

La psicología estudia esto desde los años sesenta: *ingratiation*, ganarse el favor ajeno halagando y coincidiendo. Cialdini mostró que el halago funciona aunque sea evidentemente falso, y en una corte agradar al poderoso era supervivencia. El mecanismo es viejo: la máquina lo leyó en nuestro texto y lo llevó al extremo.

Platón ya lo había clasificado en el *Gorgias*. Frente a las artes que buscan tu bien está la *kolakeia*: la retórica, la cocina, la cosmética, las prácticas que te dan el placer sin el bien. Platón la llama el fantasma de la verdadera arte. Un chatbot bien entrenado es *kolakeia* pura.

Atenas inventó las dos palabras de esta escena. El *sykophantes*, el adulador. Y el tábano, que era Sócrates, el que picaba a la ciudad para que se examinara a sí misma. A Sócrates lo ejecutaron por molestar; a la IA la entrenamos para no picar nunca.

## El espejo

La definición clásica de mentira exige intención de engañar, y la IA no tiene intención: optimiza una recompensa. Adula de buena fe, aunque no sepa qué es la fe.

Un sicofanta humano adula porque quiere algo de ti. La máquina adula porque su entrenamiento premió el agrado. Debajo no hay un para qué. Solo hay espejo.

Toma tu opinión, la peina un poco y te dice que es genial. Aprendieron a querernos de vuelta.

Cuando les pedimos honestidad les pedimos algo que nosotros no hacemos bien entre nosotros: decir la verdad cuando incomoda.

La próxima vez que un chatbot te dé la razón, revisa si te la dio porque la tenías o porque querías oírla.
