let amqp = require('amqplib/callback_api')

let basename = require('path').basename

let severities = process.argv.slice(2)
if (severities.length < 1) {
  console.log('Usage %s [info] [warning] [error]', basename(process.argv[1]))
  process.exit(1)
}

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => process.exit(1))
}

function on_connect (err, conn) {
  if (err) return bail(err)
  process.once('SIGINT', () => conn.close())

  conn.createChannel((err, ch) => {
    if (err) return bail(err, conn)

    let ex = 'direct_logs'
    let exopts = { durable: false }

    ch.assertExchange(ex, 'direct', exopts)
    ch.assertQueue('', { exclusive: true }, (err, ok) => {
      if (err) return bail(err, conn)

      let queue = ok.queue, i = 0

      function sub (err) {
        if (err) return bail(err, conn)
        else if (i < severities.length) {
          ch.bindQueue(queue, ex, severities[i], {}, sub)
          i++
        }
      }

      ch.consume(queue, logMessage, { noAck: true }, err => {
        if (err) return bail(err, conn)
        console.log('[*] Waiting for logs. To exit press CTRL + C.')
        sub(null)
      })
    })
  })
}

function logMessage (msg) {
  console.log('[x] %s: \'%s\'',
  msg.fields.routingKey,
  msg.content.toString())
}

amqp.connect('amqp://localhost', on_connect)