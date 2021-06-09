/**
 * Created by egor on 09.06.21.
 */

var jwt = require('jsonwebtoken');
var express = require('express');
var app = express();
var db = require('./models/index');
var secret = 'secretKey';
var WebSocketServer = new require('ws');
var uuid = require('uuid');

app.use(express.json());

// Сервис авторизации
app.post('/auth', function(req, res) {


    if (req.body.name && req.body.password) {

        db.User.findOne({
            where: {
                userName: req.body.name,
                password: req.body.password
            }
        }).then(user => {
            if (user != null) {

                var token = jwt.sign({ name: req.body.name }, secret);

                user.token = token;
                user.save(); //promise?

                res.send({
                    'status': 'ok',
                    'token': token
                });
            } else {
                res.send({
                    'status': 'error',
                    'message': 'incorrect login or password'
                });
            }
        });
    } else {
        res.send({
            'status': 'error',
            'message': 'Send please name and password to get auth token.'
        });
    }

});

console.log('Listen 3001');
app.listen(3001);

// ----------------------------------------------------------------

// Основное приложение
var clients = {};
var webSocketServer = new WebSocketServer.Server({
    port: 3002
});
webSocketServer.on('connection', function(ws) {

    ws.user=false;
    console.log("новое соединение ");

    ws.on('message', function(message) {
        console.log('получено сообщение ' + message);

        var jsonMessage=false;
        // Првоеряем системные запросы
        try {
            jsonMessage = JSON.parse(message).message;
        } catch (e) {

        }

        // Авторизация
        if (jsonMessage && jsonMessage.search('auth ') != -1) {

            var match = jsonMessage.match('auth (.+)');
            var token = match[1];

            console.log('Получили токен '+token);

            // Првоеряем токен
            var checkResult = db.User.checkToken(token, secret);
            if (checkResult)
                checkResult.then(function(user){
                    if (user) {
                        console.log('Найден пользователь по токену' + user.id);
                        ws.send('Авторизован!');
                        ws.user=user;
                    } else {
                        ws.send(JSON.stringify({
                            'error': 'Incorrect token'
                        }));
                        console.log("Некорректный токен", err);
                        return;
                    }
            });

            return;
        }

        // Последние 10 сообщений
        if (jsonMessage && jsonMessage.search('history ') != -1) {
            var match = jsonMessage.match(/\d+/);
            var msgCount = match.pop();


            // Проверим авторизацию и адекватность запроса
            if (ws.user && msgCount && msgCount>0) {

                db.Message.findAll({
                    order: [['id', 'desc']],
                    limit: parseInt(msgCount)
                }).then(function(messages){
                    console.log("найдено " + messages.length + ' сообщений' );

                        // Промисы!
                        var promises=[];
                        messages.forEach(message => {
                            promises.push(
                                new Promise((resolve, reject) => {
                                                            ws.send(message.id + '# '+message.content);
                                                            resolve();
                                                     })
                            );
                        });

                        return Promise.all(promises);

                }).then(function(items){
                    console.log('Отправлено ' + items.length + ' сообщений');
                });

            }

          return;
        }


        // Проверяем пользователя, делаем броадкаст рассылку, сохраняем сообщение
        if (ws.user) {

            console.log('Сообщение от авторизованного');

            // Отправляем всем сообщение
            webSocketServer.clients.forEach(function each(client) {

                console.log("Отправляем клиенту " + client.id);

                if (client.readyState === WebSocketServer.OPEN) {
                   client.send(message);
                }
            });

            //Сохраняем сообщение в бд
            db.Message.create({userId: ws.user.id, content: message});

        }

    });

    ws.on('close', function() {

        console.log('соединение закрыто');

    });

});

console.log('Listen 3002');