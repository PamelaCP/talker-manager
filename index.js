const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
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

app.listen(PORT, () => {
  console.log('Online');
});
