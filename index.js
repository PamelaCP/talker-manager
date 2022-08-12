const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const {
  tokenValidator,
  nameValidator,
  ageValidator,
  talkValidator,
  talkWatchedAtValidator,
  talkRateValidator,
} = require('./middleWares/middlewares');

const file = path.resolve(__dirname, 'talker.json');
const getTalker = async () => fs.readFile(file, 'utf8');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.listen(PORT, () => {
  console.log('Online');
});

// não remova esse endpoint, e para o avaliador funcionar

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const result = await getTalker();
  const talkers = JSON.parse(result);
  console.log(talkers);

  return res.status(200).json(talkers);
});

const generateToken = () => {
  const token = crypto.randomBytes(8).toString('hex');
  return token;
};

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const result = await getTalker();

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

app.post('/talker', 
tokenValidator, 
nameValidator, 
ageValidator, 
talkValidator, 
talkWatchedAtValidator,
talkRateValidator,
async (req, res) => {
  const newTalker = req.body;
  const talkers = await getTalker();
  const arrTalkers = JSON.parse(talkers);

  const addNewTalker = {
    id: arrTalkers.length + 1,
    ...newTalker,
  };

  arrTalkers.push(addNewTalker);
  await fs.writeFile('./talker.json', JSON.stringify(arrTalkers));
  res.status(201).json(addNewTalker);
});

app.put('/talker/:id', 
tokenValidator, 
nameValidator, 
ageValidator, 
talkValidator, 
talkWatchedAtValidator,
talkRateValidator,
async (req, res) => {
  const { id } = req.params;
  const editTalker = req.body;
  const result = await getTalker();
  const talkers = JSON.parse(result);
  let talkerUpdate = {};
  const editTalkers = talkers.map((talker) => {
    if (talker.id === +id) {
      talkerUpdate = {
        id: talker.id,
        ...editTalker,
      };
      return talkerUpdate;
    }
    return talker;
  });
  await fs.writeFile('./talker.json', JSON.stringify(editTalkers));
  return res.status(200).json(talkerUpdate);
});
