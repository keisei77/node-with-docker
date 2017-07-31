let amqp = require('amqplib/callback_api')
let basename = require('path').basename
let uuid = require('uuid/v4')

let n
try {
  if (process.argv.length < 3) throw Error('Too few args')
  n = parseInt(process.argv[2])
} catch (e) {
  console.error(e)
  console.warn('Usage: %s number', basename(process.argv[1]))
  process.exit(1)
}

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => process.exit(1))
}

function on_connect (err, conn) {
  if (err) return bail(err)
  conn.createChannel((err, ch) => {
    if (err) return bail(err, conn)
    
    let correlationId = uuid()
    function maybeAnswer (msg) {
      if (msg.properties.correlationId === correlationId) {
        console.log('[.] Got %d', msg.content.toString())
      } else {
        return bail(new Error('Unexpected message'), conn)
      }
      ch.close(() => conn.close())
    }

    ch.assertQueue('', { exclusive: true }, (err, ok) => {
      if (err) return bail(err, conn)
      let queue = ok.queue
      ch.consume(queue, maybeAnswer, { noAck: true })
      console.log('[x] Requesting fib(%d)', n)
      ch.sendToQueue('rpc_queue', new Buffer(n.toString()), {
        replyTo: queue,
        correlationId: correlationId
      })
    })
  })
}

amqp.connect('amqp://localhost', on_connect)