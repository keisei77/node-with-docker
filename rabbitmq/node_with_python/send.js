let amqp = require('amqplib/callback_api')

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => {
    process.exit(1)
  })
}

function on_connect (err, conn) {
  if (err) return bail(err)
  
  let q = 'hello'
  let msg = 'Hello World!'

  function on_channel_open (err, ch) {
    if (err) return bail(err, conn)
    ch.assertQueue(q, { durable: false }, (err, ok) => {
      if (err) return bail(err, conn)
      ch.sendToQueue(q, new Buffer(msg))
      console.log('[x] Sent \'%s\'', msg)
      ch.close(() => {
        conn.close()
      })
    })
  }

  conn.createChannel(on_channel_open)
}

amqp.connect('amqp://localhost', on_connect)