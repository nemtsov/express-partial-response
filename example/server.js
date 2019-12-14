const express = require('express');
const partialResponse = require('../');
const app = express();

app.use(partialResponse());

app.get('/', (req, res) => {
  res.json({
    firstName: 'Mohandas',
    lastName: 'Gandhi',
    aliases: [
      {
        firstName: 'Mahatma',
        lastName: 'Gandhi'
      },
      {
        firstName: 'Bapu'
      }
    ]
  });
});

app.listen(4000, () => {
  const prefix = "curl 'http://localhost:4000?fields=%s'";
  console.log('Server running on :4000, try the following:');
  console.log(prefix, '*');
  console.log(prefix, 'lastName');
  console.log(prefix, 'firstName,aliases(firstName)');
});
