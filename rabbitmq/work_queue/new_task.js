let amqp = require('amqplib/callback_api')

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => process.exit(1))
}

function on_connect (err, conn) {
  if (err) return bail(err)

  let q = 'task_queue'

  conn.createChannel((err, ch) => {
    if (err) return bail(err, conn)
    ch.assertQueue(q, { durable: true }, (err, _ok) => {
      if (err) return bail(err, conn)
      let msg = process.argv.slice(2).join(' ') || 'Hello World!'
      ch.sendToQueue(q, new Buffer(msg), { persistent: true })
      console.log('[x] Sent \'%s\'', msg)
      ch.close(() => conn.close())
    })
  })
}

amqp.connect('amqp://localhost', on_connect)