function tokenValidator(req, res, next) {
    const { authorization: token } = req.headers;
    if (!token) {
      return res.status(401).json({ message: 'Token não encontrado' });
    } if (token.length !== 16) { 
      return res.status(401).json({ message: 'Token inválido' });
    }
    next();
  } 
  
  function nameValidator(req, res, next) {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'O campo "name" é obrigatório' });
    } if (name.length < 3) {
     return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
    }
    next();
  }
  
  function ageValidator(req, res, next) {
    const { age } = req.body;
    if (!age) {
      return res.status(400).json({ message: 'O campo "age" é obrigatório' });
    } if (age < 18) {
      return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
    }
    next();
  }

  function talkValidator(req, res, next) {
    const { talk } = req.body;
  
    if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
    next();
  }

  function talkWatchedAtValidator(req, res, next) {
    const { talk } = req.body;
    const dateValidator = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
    console.log('estou aqui');
    if (!talk.watchedAt || talk.watchedAt === '') {
        return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
    } if (!dateValidator.test(talk.watchedAt)) {
        return res.status(400)
        .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
    }
    next();
  }

  function talkRateValidator(req, res, next) {
    const { talk } = req.body;
    if (talk.rate < 1 || talk.rate > 5) {
        return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
    } if (!talk.rate) {
        return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
    }
    next();
  }

  module.exports = {
    tokenValidator,
    nameValidator,
    ageValidator,
    talkValidator,
    talkWatchedAtValidator,
    talkRateValidator,
  };
