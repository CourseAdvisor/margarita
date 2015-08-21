

function ActionError(message, status) {
  if (message == null || status == null) {
    throw new Error('Cannot construct ActionError: missing argument');
  }
  var err = new Error(message);
  err.status = status;

  return err;
}

module.exports = ActionError;
