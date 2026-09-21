# Pokédex JavaScript

Uma Pokédex web feita com HTML, CSS e JavaScript usando módulos ES6. O projeto combina dados locais traduzidos das gerações 3–7 com a PokéAPI para oferecer busca, sprites por geração, descrições, evoluções, golpes, favoritos, áudio e suporte a instalação como PWA.

## Funcionalidades

- Busca por nome ou número com autocomplete local.
- Modo clássico com sprites correspondentes à geração selecionada.
- Modo 3D, sprites shiny, áudio e leitura por voz.
- Dados locais traduzidos para as gerações 3–7.
- Cache e suporte offline para a interface e dados JSON locais.
- Favoritos persistidos no navegador.
- Estatísticas, fraquezas, evoluções e golpes.
- Tema claro/escuro e layout responsivo.

## Desenvolvimento

O código principal está organizado em módulos:

- `js/api.js`: carregamento, adaptação e cache de dados;
- `js/state.js`: estado persistente da aplicação;
- `js/ui.js`: renderização da interface;
- `js/utils.js`: sprites, áudio e utilitários;
- `js/main.js`: eventos e inicialização;
- `data/`: base local por geração;
- `test/`: testes automatizados.

Para validar o projeto:

```bash
npm test
npm run check
```

O modo offline depende da instalação do Service Worker e pré-carrega os dados JSON locais. Dados que não existem na base local, como algumas gerações fora do intervalo 3–7, podem depender da PokéAPI.

## Demonstração

[Acessar a Pokédex](https://carlosmozart.github.io/Pokedex-Javascript-htmll/)

---

Versão atual: **3.0**.

