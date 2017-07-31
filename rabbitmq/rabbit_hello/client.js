let amqp = require('amqplib')
let when = require('when')

amqp.connect('amqp://localhost').then(conn => {
  return when(conn.createChannel().then(ch => {
    let q = 'hello'
    let msg = 'Hello World!'

    let ok = ch.assertQueue(q, { durable: false })

    return ok.then(_qok => {
      ch.sendToQueue(q, new Buffer(msg))
      console.log('[x] Sent \'%s\'', msg)
      return ch.close()
    })
  })).ensure(() => conn.close())
}).then(null, console.warn)