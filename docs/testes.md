# Plano de Testes de Aplicação - EcoScore Scanner

Este documento mapeia os casos de teste do EcoScore Scanner. Seguindo as diretrizes de garantia de qualidade, foram elaborados 3 cenários de teste para cada um dos 5 Casos de Uso mapeados no modelo arquitetural do sistema.

---

### Caso de Uso 1: Buscar Produto
#### CT01.1 - Busca por correspondência exata com sucesso
* **Objetivo:** Garantir que um usuário encontre um produto cadastrado ao digitar seu nome exato.
* **Entrada:** String "Garrafa de Agua" no campo de busca.
* **Passos:** Acessar a aba de busca, digitar o termo e clicar no botão "Buscar".
* **Resultado Esperado:** O sistema exibe o bloco com as informações completas da "Garrafa de Agua".

#### CT01.2 - Busca com variação de maiúsculas/minúsculas (Case Insensitive)
* **Objetivo:** Validar que o banco de dados e a API ignoram diferenças de caixa alta/baixa.
* **Entrada:** String "gArRaFa" no campo de busca.
* **Passos:** Digitar o termo com letras misturadas e acionar a busca.
* **Resultado Esperado:** O registro contendo "Garrafa de Agua" é localizado com sucesso.

#### CT01.3 - Busca por produto inexistente
* **Objetivo:** Tratar o fluxo de exceção quando o produto não consta no catálogo.
* **Entrada:** String "Produto Inexistente X".
* **Passos:** Digitar o termo inexistente e acionar a busca.
* **Resultado Esperado:** A interface exibe a mensagem de erro amigável: "Produto não encontrado."

---

### Caso de Uso 2: Visualizar Eco-Score e Detalhes
#### CT02.1 - Cálculo correto para impacto máximo (Penalidade máxima)
* **Objetivo:** Verificar se o motor de cálculo subtrai os pontos corretos para produtos com plástico e importados.
* **Entrada:** Produto com atributos `packaging: "plastico"` e `origin: "importado"`.
* **Passos:** Realizar a busca de um produto com essas características e inspecionar a nota.
* **Resultado Esperado:** Nota final calculada de forma exata: $10 - 4 (plástico) - 3 (importado) = 3 / 10$.

#### CT02.2 - Exibição de atributos ecológicos detalhados
* **Objetivo:** Validar se a interface exibe a categoria, tipo de embalagem e origem corretamente no card de resultados.
* **Entrada:** Busca pelo produto "Shampoo Solido".
* **Passos:** Executar a busca e ler os metadados renderizados em tela.
* **Resultado Esperado:** Exibição explícita de "Embalagem: reciclavel" e "Origem: local".

#### CT02.3 - Impedimento de nota negativa (Limite inferior)
* **Objetivo:** Garantir estabilidade matemática caso regras cumulativas ultrapassassem a nota zero.
* **Entrada:** Cenário hipotético de acumulação extrema de penalidades.
* **Passos:** Chamar o motor de cálculo simulando penalidades superiores a 10 pontos.
* **Resultado Esperado:** O algoritmo impede notas negativas através do limitador `Math.max(0, score)`.

---

### Caso de Uso 3: Visualizar Sugestões de Alternativas
#### CT03.1 - Exibição de alternativas da mesma categoria com nota superior
* **Objetivo:** Garantir o cumprimento do requisito de recomendação de consumo consciente.
* **Entrada:** Busca por um produto de baixa pontuação (ex: "Garrafa de Agua" - Nota 6).
* **Passos:** Analisar a seção inferior do card de resultados.
* **Resultado Esperado:** O sistema exibe o bloco "Alternativas mais Sustentáveis" listando a "Garrafa de Vidro Coletiva" (Nota 9).

#### CT03.2 - Limite máximo de sugestões recomendadas
* **Objetivo:** Certificar que a interface não fique poluída visualmente.
* **Entrada:** Existência de mais de 5 alternativas melhores no banco de dados.
* **Passos:** Executar a busca por um item poluente.
* **Resultado Esperado:** O backend limita e retorna o teto de no máximo 3 alternativas ecológicas (`slice(0, 3)`).

#### CT03.3 - Não exibição de bloco de alternativas para produtos perfeitos
* **Objetivo:** Evitar redundância visual caso o produto buscado já possua nota máxima.
* **Entrada:** Busca por um item com nota 10/10.
* **Passos:** Avaliar o retorno de um produto excelente.
* **Resultado Esperado:** O bloco de alternativas ecológicas não deve ser renderizado, já que não há substituto melhor.

---

### Caso de Uso 4: Fazer Login (Simulado para o MVP)
#### CT04.1 - Alternância entre visão de usuário e administrador
* **Objetivo:** Validar o controle de acesso de escopo e visão na arquitetura Client-Server.
* **Entrada:** Clique no botão "Painel Administrativo" no menu superior.
* **Passos:** Clicar nos botões de navegação de contexto.
* **Resultado Esperado:** A tela de busca é ocultada e o formulário de gestão administrativa é renderizado imediatamente.

#### CT04.2 - Manutenção de estado durante navegação
* **Objetivo:** Garantir integridade de renderização da SPA (Single Page Application).
* **Entrada:** Mudar para a aba administrativa e voltar para a aba de buscas.
* **Passos:** Alternar entre abas rapidamente.
* **Resultado Esperado:** O estado anterior e resultados já buscados não causam quebra ou travamento da interface React.

#### CT04.3 - Proteção visual de ações restritas
* **Objetivo:** Isolar o formulário de inserção direta de dados do escopo do consumidor geral.
* **Entrada:** Acesso padrão do cliente ao sistema.
* **Passos:** Abrir a aplicação em modo padrão.
* **Resultado Esperado:** O formulário de POST fica oculto por padrão até que a aba explícita de administração seja acionada.

---

### Caso de Uso 5: Cadastrar/Gerenciar Produtos
#### CT05.1 - Inserção de novo produto com sucesso via formulário
* **Objetivo:** Testar o fluxo ponta a ponta da API REST (PostgreSQL -> Prisma -> Node -> React).
* **Entrada:** Nome: "Escova Biodegradavel", Categoria: "Cosmeticos", Embalagem: "nenhuma", Origem: "local".
* **Passos:** Preencher o formulário administrativo e clicar em "Cadastrar Produto".
* **Resultado Esperado:** Exibição da mensagem: "✅ Produto cadastrado com sucesso!" e persistência real no banco de dados do Docker.

#### CT05.2 - Bloqueio de requisição com campos nulos (Validação)
* **Objetivo:** Evitar corrupção de dados e inconsistências no banco relacional.
* **Entrada:** Enviar o formulário deixando o campo "Nome" em branco.
* **Passos:** Limpar o campo de texto e forçar a submissão do cadastro.
* **Resultado Esperado:** A API intercepta a requisição com status `400 Bad Request` e impede a gravação de registros corrompidos.

#### CT05.3 - Disponibilidade imediata para busca pós-cadastro
* **Objetivo:** Garantir a consistência em tempo real dos dados (Eventual Consistency/Real-time).
* **Entrada:** Cadastrar um item inédito na aba administrativa e em seguida ir para a aba de buscas procurá-lo.
* **Passos:** Cadastrar "Produto Teste Novo", alternar de aba e digitar "Produto Teste Novo".
* **Resultado Esperado:** O item recém-cadastrado é localizado de imediato e sua nota correspondente é calculada em tempo real.