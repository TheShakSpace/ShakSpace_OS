function timestamp() {
  return new Date().toLocaleTimeString();
}

function format(emoji, label, message, meta) {
  const metaText = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp()}] ${emoji} ${label} ${message}${metaText}`;
}

module.exports = {
  info(message, meta) {
    console.log(format('ℹ️ ', 'INFO ', message, meta));
  },
  success(message, meta) {
    console.log(format('✅', 'OK   ', message, meta));
  },
  warn(message, meta) {
    console.warn(format('⚠️ ', 'WARN ', message, meta));
  },
  error(message, meta) {
    console.error(format('❌', 'ERROR', message, meta));
  },
};
