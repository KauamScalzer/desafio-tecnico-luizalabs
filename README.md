# Desafio Técnico – Vertical Logística

Este repositório foi criado para resolver o desafio técnico proposto pela LuizaLabs.  
O documento com os requisitos pode ser acessado [aqui](./requirements/Desafio%20t%C3%A9cnico%20-%20Vertical%20Logistica.pdf).

---

## Decisões de Projeto

**Node.js** foi escolhido por ser a tecnologia com a qual tenho maior familiaridade, além da experiência prévia utilizando o *Multer* para o recebimento e manipulação de arquivos em APIs REST.

**NestJS** foi selecionado devido à sua simplicidade na estruturação e inicialização de projetos, facilitando o desenvolvimento e a manutenção da aplicação, além da facilidade na documentação utilizando *@nestjs/swagger*.

**TypeORM** e **SQLite** foram escolhidos para facilitar o setup local e os testes automatizados, garantindo portabilidade e facilidade de uso em ambientes de desenvolvimento.

A **arquitetura** do projeto segue o padrão NestJS (módulos, controllers, services e injeção de dependências), sempre buscando a simplicidade para resolver o desafio.

---

## Sobre o fluxo de dados

Minha ideia foi tratar o upload do arquivo legado em uma rota específica, dedicada apenas ao recebimento e processamento inicial dos dados.
A partir desse ponto, os dados já normalizados são persistidos no banco de dados, e as demais rotas seguirem um padrão tradicional de acesso e manipulação via banco, conforme práticas comuns de projetos back-end.

---

## Como rodar o projeto

**Clone o repositório:**  
```bash
git clone git@github.com:KauamScalzer/desafio-tecnico-luizalabs.git
cd desafio-vertical-logistica
```

### Rodando com Docker (recomendado)

**Construa a imagem:**  
```bash
docker build -t desafio-vertical-logistica .
```

**Execute o container:**  
```bash
docker run --rm -p 3000:3000 desafio-vertical-logistica
```
**A migration executará automaticamente no dockerfile**

**Acesse a documentação da API (Swagger):**  
[http://localhost:3000/api](http://localhost:3000/api)

---

### Rodando localmente

**Pré-requisitos:** Node.js 20+ e npm.

**Instale as dependências:**  
```bash
npm install
```

**Execute a migration:**  
```bash
npm run migration:run
```

**Execute o projeto:**  
```bash
npm run start:dev
```

**Acesse a documentação da API (Swagger):**  
[http://localhost:3000/api](http://localhost:3000/api)

---
###  Banco de dados

<img width="717" height="495" alt="{0E0EA4C4-8078-478A-AFFE-BFE6752F6E20}" src="https://github.com/user-attachments/assets/827d6739-3948-4c24-b285-518cddc58370" />

---

## Comandos úteis

- `npm run build`  
  *Compila o projeto para a pasta de build.*

- `npm run start:dev`  
  *Inicia o servidor em modo desenvolvimento.*

- `npm run migration:run`  
  *Executa as migrations no banco de dados.*

- `npm run migration:generate`  
  *Gera uma nova migration baseada nas entities.*

- `npm run test`  
  *Executa os testes unitários.*

- `npm run test:e2e`  
  *Executa os testes de integração (end-to-end).*
