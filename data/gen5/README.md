# Dataset da Geração 5

Este diretório é uma saída independente dos datasets das Gerações 3 e 4. Ele
contém os 649 Pokémon da PokéAPI com dados históricos dos grupos de versão:

- `black-white`
- `black-2-white-2`

Para regenerar os arquivos usando o cache local da PokéAPI:

```text
python tools/build_data.py --gen5
```

Os arquivos principais são `pokedex.json`, `moves.json` e `abilities.json`;
as fichas completas ficam em `pokemon/<id>.json`.

## O que a Gen 5 muda no formato

- `habilidades` inclui a **habilidade oculta** (`"oculta": true`), que estreia
  nesta geração. Nas Gerações 3 e 4 o campo continua só com as normais.
- Tipos, atributos, EVs e habilidades são os da Gen 5: o tipo Fada e os
  aumentos de atributos da Gen 6 ficam de fora (Clefairy é Normal, Pikachu tem
  Defesa 30, Gengar só tem Levitate).
- `golpes` separa `black-white` de `black-2-white-2`; tutores só existem de
  fato em B2/W2 (em B/W há apenas os golpes finais dos iniciais e Draco Meteor).
- `locais` usa as versões `black`, `white`, `black-2` e `white-2`, com os
  métodos da geração: `dark-grass`, `grass-spots`, `surf-spots`,
  `super-rod-spots`, `cave-spots`, `bridge-spots` (fenômenos) e
  `hidden-grotto` (B2/W2).

## Convenção da PokéAPI para valores antigos

`past_types`, `past_stats` e `past_abilities` marcam a **última geração em que
o valor antigo valia, inclusive**. `past_values` dos golpes marca o grupo de
versão em que a mudança entrou. O gerador segue as duas convenções.
