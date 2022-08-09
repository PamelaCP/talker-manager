const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.listen(PORT, () => {
  console.log('Online');
});

// não remova esse endpoint, e para o avaliador funcionar

// funcão auxiliar de validação 

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const result = await fs.readFile('./talker.json', 'utf8', (err) => {
    if (err) {
      console.log(err);
      return err;
    }
  });
  console.log(result);
  const talkers = JSON.parse(result);

  return res.status(200).json(talkers);
});

const generateToken = () => {
  const token = crypto.randomBytes(8).toString('hex');
  return token;
};

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const result = await fs.readFile('./talker.json', 'utf8');

  const talkers = JSON.parse(result);

  const talkerFiltered = talkers.find((talker) => talker.id === parseInt(id, 10));

  if (!talkerFiltered) {
    return res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }

  console.log(talkerFiltered);

  return res.status(200).json(talkerFiltered);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  } if (!email.includes('@')) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  } if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  const token1 = generateToken();
  console.log(token1);
  return res.status(200).json({ token: token1 });
});

function tokenValidator(res, req, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado' });
  } if (token.length !== 16) { 
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
} 

function nameValidator(res, req, next) {
  const { name } = req.body.name;
  if (!name) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  } if (name.length < 3) {
   return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
}

function ageValidator(res, req, next) {
  const { age } = req.body.age;
  if (!age) {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  } if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
}

app.post('/talker', tokenValidator, nameValidator, ageValidator, async (req, res) => {
  const talkers = await fs.readFile('./talker.json', 'utf8');
  const { name, age, talk } = req.body;
  const newTalker = createNewTalker(name, age, talk);
  if (talkerValidator(newTalker)) {
    return res.status(400).send(talkerValidator(newTalker));
  }
  newTalker.id = talkers.length + 1;
  const newTalkers = talkers;
  newTalkers.push(newTalker);
  fs.writeFileSync(
    path.join(__dirname, '', 'talker.json'), JSON.stringify(newTalkers), 
  );

  return res.status(201).send(newTalker);
});