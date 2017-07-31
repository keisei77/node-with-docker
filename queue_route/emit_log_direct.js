let amqp = require('amqplib/callback_api')

let args = process.argv.slice(2)
let severity = (args.length > 0) ? args[0] : 'info'
let message = args.slice(1).join(' ') || 'Hello World!'

function bail (err, conn) {
  console.error(err)
  if (conn) conn.close(() => process.exit(1))
}

function on_connect (err, conn) {
  if (err) return bail(err)
  
  let ex = 'direct_logs'
  let exopts = { durable: false }

  function on_channel_open (err, ch) {
    if (err) return bail(err, conn)
    ch.assertExchange(ex, 'direct', exopts, (err, ok) => {
      ch.publish(ex, severity, new Buffer(message))
      ch.close(() => conn.close())
    })
  }
  conn.createChannel(on_channel_open)
}

amqp.connect('amqp://localhost', on_connect)