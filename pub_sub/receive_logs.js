let amqp = require('amqplib/callback_api')

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => process.exit(1))
}

function on_connect (err, conn) {
  if (err) return bail(err)
  process.once('SIGINT', () => conn.close())

  let ex = 'logs'

  function on_channel_open(err, ch) {
    if (err) return bail(err, conn)
    ch.assertExchange(ex, 'fanout', { durable: false }, err => {
      ch.assertQueue('', { exclusive: true }, (err, ok) => {
        let q = ok.queue
        ch.bindQueue(q, ex, '')
        ch.consume(q, logMessage, { noAck: true }, (err, ok) => {
          if (err) return bail(err, conn)
          console.log('[*] Waiting for logs. To exit press CTRL + C.')
        })
      })
    })
  }

  function logMessage (msg) {
    if (msg) console.log('[x] \'%s\'', msg.content.toString())
  }
  conn.createChannel(on_channel_open)
}

amqp.connect('amqp://localhost', on_connect)
