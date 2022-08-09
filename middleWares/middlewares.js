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

  function talkValidator(req, res, next) {
    const { talk } = req.body;
  
    if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
    next();
  }

  module.exports = {
    tokenValidator,
    nameValidator,
    ageValidator,
    talkValidator,
  };