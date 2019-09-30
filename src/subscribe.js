const debug = require('debug')

module.exports = ({ ipfs, topic, logSuffix }) => {
  const log = debug('chatterbox-relay:' + logSuffix)
  log('listening for pubsub messages on %s', topic)

  ipfs.pubsub.subscribe(topic, msg => {
    if (log.enabled) {
      log('received message %s from %s', msg.seqno.toString('hex'), msg.from)
      try {
        const data = JSON.parse(msg.data)
        log(data)
      } catch (err) {
        log('failed to parse %s %s', err, msg.data)
      }
    }
  })
}
