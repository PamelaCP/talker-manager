const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.listen(PORT, () => {
  console.log('Online');
});

// não remova esse endpoint, e para o avaliador funcionar

// funcão auxiliar de validação:

function tokenValidator(token) {
  if (!token) {
    return { message: 'Token não encontrado' };
  } if (token.length !== 16) {
    return { message: 'Token inválido' };
  }
  return false;
} 

function getTalkers() {
 const talkers = fs.readFileSync(
    path.join(__dirname, '', 'talker.json'), 'utf8',
  );
  return JSON.parse(talkers);
}

function createNewTalker(name, age, talk) {
  return { name, age, talk };
}

function nameValidator(name) {
  if (!name) {
    return { message: 'O campo "name" é obrigatório' };
  } if (name.length < 3) {
    return { message: 'O "name" deve ter pelo menos 3 caracteres' };
  }
}

function ageValidator(age) {
  if (!age) {
    return { message: 'O campo "age" é obrigatório' };
  } if (age < 18) {
    return { message: 'A pessoa palestrante deve ser maior de idade' };
  }
}

function talkWatchedAtValidator(talk) {
  const dateRegex = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;
  if (!talk.watchedAt) {
    return { message: 'O campo "watchedAt" é obrigatório' };
  } if (!dateRegex.test(talk.watchedAt)) {
    return { message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' };
  }
}

function talkRateValidator(talk) {
  if (talk.rate < 1 || talk.rate > 5) {
  return { message: 'O campo "rate" deve ser um inteiro de 1 à 5' };
  } if (!talk.rate) {
    return { message: 'O campo "rate" é obrigatório' };
  }
}

function talkValidator(talk) {
  if (!talk) {
    return { message: 'O campo "talk" é obrigatório' };
  }
  const watchedAt = talkWatchedAtValidator(talk);
  const rate = talkRateValidator(talk);
  if (watchedAt) {
    return (watchedAt);
  } if (rate) {
    return (rate);
  }
}

function talkerValidator(talker) {
  const name = nameValidator(talker.name);
  const age = ageValidator(talker.age);
  const talk = talkValidator(talker.talk);

  if (name) {
    return name;
  } if (age) {
    return age;
  } if (talk) {
    return talk;
  }
  return false;
}

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
app.post('/talker', (req, res) => {
  if (tokenValidator(req.headers.authorization)) {
    return res.status(401).send(tokenValidator(req.headers.authorization));
  }

  const { name, age, talk } = req.body;
  const talkers = getTalkers();
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
