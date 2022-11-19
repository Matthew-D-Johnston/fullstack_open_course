require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const config = require('./utils/config');
const http = require('http');

const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

// const PORT = config.PORT;
// app.listen(PORT, () => {
//   logger.info(`Server running on port ${PORT}`);
// });
