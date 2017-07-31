let amqp = require('amqplib/callback_api')

function bail (err, conn) {
  console.error(error)
  if (conn) conn.close(() => process.exit(1))
}

function on_connect (err, conn) {
  if (err) return bail(err)
  process.once('SIGINT', () => conn.close())

  let q = 'task_queue'

  conn.createChannel((err, ch) => {
    if (err) return bail(err, conn)
    ch.assertQueue(q, { durable: true }, (err, _ok) => {
      ch.consume(q, doWork, { noAck: false })
      console.log('[*] Waiting for message. To exit press CTRL + C')
    })

    function doWork (msg) {
      let body = msg.content.toString()
      console.log('[x] Received \'%s\'', body)
      let secs = body.split('.').length - 1
      setTimeout(() => {
        console.log('[x] Done')
        ch.ack(msg)
      }, secs * 1000)
    }
  })
}

amqp.connect('amqp://localhost', on_connect)