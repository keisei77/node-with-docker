let amqp = require('amqplib')
amqp.connect('amqp://127.0.0.1').then(conn => {
  process.once('SIGINT', () => conn.close())

  return conn.createChannel().then(ch => {
    let ok = ch.assertQueue('hello', { durable: false })

    ok = ok.then(_qok => {
      return ch.consume('hello', msg => {
        console.log('[x] Received \'%s\'', msg.content.toString())
      }, { noAck: true })
    })

    return ok.then(_consumeOk => {
      console.log('[*] Waiting for message. To exit press CTRL + C')
    })
  })
}).then(null, console.warn)