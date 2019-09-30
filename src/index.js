const Os = require('os')
const Path = require('path')
const Fs = require('fs').promises
const IPFS = require('ipfs')
const subscribe = require('./subscribe')

const Config = {
  topics: {
    broadcast: process.env.CHATTERBOX_TOPIC_BROADCAST || '/chatterbox/broadcast',
    beacon: process.env.CHATTERBOX_TOPIC_BEACON || '/chatterbox/beacon'
  },
  repoPath: process.env.IPFS_PATH || Path.join(Os.homedir(), '.chatterbox-relay'),
  wsAddr: process.env.CHATTERBOX_WS_ADDR || '/ip4/127.0.0.1/tcp/4138/ws'
}

async function main () {
  await Fs.mkdir(Config.repoPath, { recursive: true })

  const ipfs = await IPFS.create({
    repo: Config.repoPath,
    config: {
      Bootstrap: [],
      Addresses: {
        Swarm: [Config.wsAddr]
      },
      Discovery: {
        MDNS: { Enabled: false },
        webRTCStar: { Enabled: false }
      }
    }
  })

  await subscribe({ ipfs, topic: Config.topics.broadcast, logSuffix: 'broadcast' })
  await subscribe({ ipfs, topic: Config.topics.beacon, logSuffix: 'beacon' })

  console.log('🎾 Chatterbox pubsub relay server ready...')

  const localAddrs = await ipfs.swarm.localAddrs()

  console.log('☎️  Connect to one of these websocket addresses:')

  localAddrs
    .map(a => `${a}`)
    .filter(a => !a.startsWith('/p2p-circuit'))
    .forEach(a => console.log(a))
}

main().catch(console.error)
