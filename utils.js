const fs = require('fs');

const writeDataToFile = (filename, content) => {
  fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (error, data) => {
    if (error) console.log(error);
    console.log(data);
  });
};

module.exports = {
  writeDataToFile,
};
