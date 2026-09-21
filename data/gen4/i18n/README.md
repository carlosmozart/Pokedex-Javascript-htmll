# Traduções da Geração 4

Estes catálogos são independentes de `data/gen3/i18n/`, usado pela Geração 3.

- `en.json` contém os textos históricos em inglês da base Gen 4.
- `pt.json` contém as mesmas chaves, inicialmente vazias para indicar o que ainda precisa de tradução.

Não copie automaticamente descrições da Gen 3: a PokéAPI fornece entradas
diferentes para Diamond/Pearl, Platinum e HeartGold/SoulSilver. Preserve nomes
de golpes, habilidades, tipos e termos de batalha conforme o padrão já usado
no catálogo PT-BR da Gen 3. Nomes próprios de locais e personagens permanecem
no original; traduza somente os termos funcionais e sufixos. Exemplos:
`Route 104` vira `Rota 104`, enquanto `Outside Mt. Pyre` vira `Do lado de fora
da Mt. Pyre`.

Regenerar as bases:

```text
python tools/build_gen4_translations.py
```
