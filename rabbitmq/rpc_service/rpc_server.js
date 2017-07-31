let amqp = require('amqplib/callback_api')

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => process.exit(1))
}

function fib (n) {
  let a = 0
  let b = 1
  for (let i = 0; i < n; i++) {
    let c = a + b
    a = b
    b = c
  }
  return a
}

function on_connect (err, conn) {
  if (err) return bail(err)

  process.once('SIGINT', () => {
    conn.close()
  })

  let q = 'rpc_queue'

  conn.createChannel((err, ch) => {
    ch.assertQueue(q, { durable: false })
    ch.prefetch(1)
    ch.consume(q, reply, { noAck: false }, err => {
      if (err) return bail(err, conn)
      console.log('[x] Awaiting RPC requests')
    })
    function reply (msg) {
      let n = parseInt(msg.content.toString())
      console.log('[.] fib(%d)', n)
      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(fib(n).toString()),
        { correlationId: msg.properties.correlationId })
      ch.ack(msg)
    }
  })
}

amqp.connect('amqp://localhost', on_connect)