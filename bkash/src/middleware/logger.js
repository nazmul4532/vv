const Log = require('../models/Log');

const overrideConsole = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args) => {
    const message = args.join(' ');
    originalLog(message);
    void Log.create({ type: 'info', message }).catch(() => {}); // fire-and-forget
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    originalWarn(message);
    void Log.create({ type: 'warn', message }).catch(() => {});
  };

  console.error = (...args) => {
    const message = args.join(' ');
    originalError(message);
    void Log.create({ type: 'error', message }).catch(() => {});
  };
};

module.exports = overrideConsole;
