# Dataset da Geração 4

Este diretório é uma saída independente do dataset da Geração 3. Ele contém os
493 Pokémon da PokéAPI com dados históricos dos grupos de versão:

- `diamond-pearl`
- `platinum`
- `heartgold-soulsilver`

Para regenerar os arquivos usando o cache local da PokéAPI:

```text
python tools/build_data.py --gen4
```

Os arquivos principais são `pokedex.json`, `moves.json` e `abilities.json`;
as fichas completas ficam em `pokemon/<id>.json`.
