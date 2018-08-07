const app = require('express')();
const fs = require('fs');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const cors = require('cors');
const io = require('socket.io')(http);
const mysql = require('./mysqli');
const fileUpload = require('express-fileupload');
const gm = require('gm');

app.use(cors());
app.use(fileUpload());
app.post("/check_login", jsonParser, function (request, response) {
    let mail = request.body.login;
    let password = request.body.password;

    mysql.mysql.checkLogin(mail, password, response);

});

app.post("/save_user", jsonParser, function (request, response) {

    mysql.mysql.saveUser(request, response);

});

app.post("/search_user", jsonParser, function (request, response) {
    let search = request.body.search;
    mysql.mysql.searchUser(search, response);


});
app.post("/get_users_confirm", jsonParser, function (request, response) {
    let user_id = request.body.user_id.id;
    mysql.mysql.getUsersConfirm(user_id, response);

});
app.post("/search_not_added_to_friends", jsonParser, function (request, response) {
    let user_id = request.body.user_id.id;
    mysql.mysql.search_not_added_to_friends(user_id, response);

});

app.post("/add_friends", jsonParser, function (request, response) {
    mysql.mysql.addFriends(request, response)

});


app.post("/get_friends", jsonParser, function (request, response) {
    let user_id = request.body.user_id.id;
    mysql.mysql.getFriends(user_id, response);

});

app.post("/update_friends", jsonParser, function (request, response) {
    let user = request.body.friends;
    mysql.mysql.updateFriends(user, response);

});

app.post("/remove_request_friends", jsonParser, function (request, response) {
    let user = request.body.friends;
    mysql.mysql.removeRequestFriends(user, response);

});

app.post("/create_rooms", jsonParser, function (request, response) {
    let user_id = request.body.user_id;
    let friends_id = request.body.friends_id;
    mysql.mysql.createRooms(user_id, friends_id, response);
});

app.post("/get_rooms", jsonParser, function (request, response) {
    let user_id = request.body.user_id;
    mysql.mysql.getRooms(user_id, response);
});
app.post("/save_messages", jsonParser, function (request, response) {
    mysql.mysql.saveMessages(request, response);
});

app.post("/get_messages_for_rooms", jsonParser, function (request, response) {
    let room_id = request.body.room_id;
    mysql.mysql.getMessagesForRooms(room_id, response);
});

app.post("/get_one_friend", jsonParser, function (request, response) {
    let room_id = request.body.room;
    mysql.mysql.getOneFriend(room_id, response);
});

app.post("/get_one_user", jsonParser, function (request, response) {
    let id = request.body.id;
    mysql.mysql.getOneUser(id, response);
});
app.get('/image/:name', (req, res) => {
    fs.readFile("image/" + req.params.name, (err, image) => {
        res.end(image);
    });
});
app.get('/user-image/:name', (req, res) => {
    fs.readFile("resize/" + req.params.name, (err, image) => {
        res.end(image);
    });
});
app.get('/user-gallery/:name', (req, res) => {
    fs.readFile("gallery/" + req.params.name, (err, image) => {
        res.end(image);
    });
});

app.get('/user_profile/:name', (req, res) => {
    fs.readFile("users/" + req.params.name, (err, image) => {
        res.end(image);
    });
});
app.post("/upload", jsonParser, function (request, response) {
    let new_name = null;
    let post = request.body.post;
    let user_id = request.body.user_id;
    let from_user_id = request.body.from_user_id;
    let image = null;
    if (request.files) {

        let sampleFile = request.files.files;
        let name_image = sampleFile.name.split('.');
        new_name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        let url = "image/" + new_name + sampleFile.name;

        sampleFile.mv(url, function (err) {
            if (err) {
                response.json(false);
            } else {
                image = new_name + sampleFile.name;
                mysql.mysql.saveUserPost(user_id, from_user_id, post, image, response);
            }
        });
    } else {
        image = false;
        if (request.body.post.trim() !== '') {
            mysql.mysql.saveUserPost(user_id, from_user_id, post, image, response);
        }
    }
});

app.post('/uploadImageServices', jsonParser, function (request, response) {
    if (request.files) {
        let user_id = request.body.from_user_id,
            sampleFile = request.files.files,
            new_name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            url = "gallery/" + new_name + sampleFile.name,
            width = null,
            height = null;

        sampleFile.mv(url, function (err) {
            if (err) {
                response.json(false);
            } else {

                gm('./gallery/' + new_name + sampleFile.name)
                    .resize(183, 183, '!')
                    .write('./resize/' + new_name + sampleFile.name, function (err) {
                        if (!err) {
                            mysql.mysql.saveImageFromUser(user_id, new_name + sampleFile.name, response);
                            response.json(true);
                        }
                    });
                // gm('./gallery/' + new_name + sampleFile.name).size(function (err, size) {
                //     if (Number(size.width) > Number(size.height)) {
                //         width = 500;
                //         height = 300;
                //         this.resize(width, height, '!')
                //             .write('./gallery/' + new_name + sampleFile.name, function (err) {
                //                 if (!err) console.log('done');
                //
                //             });
                //     } else {
                //         width = 300;
                //         height = 500;
                //         this.resize(width, height, '!')
                //             .write('./gallery/' + new_name + sampleFile.name, function (err) {
                //                 if (!err) console.log('done');
                //             });
                //     }
                // });
            }
        });

    }
});

app.post('/getUsersImages', jsonParser, function (request, response) {
    let user_id = request.body.user_id;
    mysql.mysql.getUserImage(user_id, response);
});

app.post('/getUserPosts', jsonParser, function (request, response) {
    let user_id = request.body.user_id;
    mysql.mysql.getUsersPost(user_id, response);
});

app.post('/saveComment', jsonParser, function (request, response) {
    let comment_info = request.body.comment_info;
    mysql.mysql.saveComments(comment_info, response);
});

app.post('/deleteFriend', jsonParser, function (request, response) {
    let user = request.body.friend.user_id;
    let friend = request.body.friend.friends_id;
    mysql.mysql.deleteFriend(user, friend, response);

});
app.post('/delete_room', jsonParser, function (request, response) {
    mysql.mysql.updateStatusRoom(request, response);

});

app.post('/get_info_for_room', jsonParser, function (request, response) {
    let id = request.body.room;
    mysql.mysql.getInfoForRoom(id, response);
});
let users = new Map();
io.on('connection', function (socket) {

    socket.on('add_user', function (data) {
        users.set(data.user, socket.id);
    });

    socket.on('add_friend', function (data) {
        io.sockets.in(users.get(data.user.id)).emit('new_friend', data);
    });

    socket.on('confirm_friends_request', function (data) {
        io.to(users.get(data.user.user_id)).emit('confirm_friends', data);
        io.to(users.get(data.user.friends_id)).emit('confirm_friends', data);
    });

    socket.on('cancel_friends_emit', function (data) {
        io.sockets.in(users.get(data.user.friends_id)).emit('cancel_friends_on', data);
    });

    socket.on('delete_friend', function (data) {
        io.sockets.in(users.get(data.user.friends_id)).emit('delete_friend_on', data);
    });

    socket.on('join', function (data) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('new_chat_message', data.text);
    });

    socket.on('new_message', function (data) {
        io.to(users.get(data.data.friend)).emit('get_notification_mess', data);
        io.in(data.room).emit('get_new_message', {data: data.data, room: data.room});
    });

    socket.on('connect_user_posts', function (data) {
        socket.join(data.user);
    });

    socket.on('checkNewPost', function (data) {
        io.to(users.get(Number(data.user))).emit('get_new_posts', {data: data.user});
        io.in(data.user).emit('get_new_posts', {data: data.user});
    });

    socket.on('check_comment', function (data) {
        io.to(users.get(Number(data.comment.user_id))).emit('response_comment', {data: data});
        io.in(data.comment.user_id).emit('response_comment', {data: data});
    });

    socket.on('leave_posts', function (data) {
        socket.leave(data.user);
    });

    socket.on('notification_deleteRooms', function (data) {
        socket.broadcast.to(users.get(data.notification_id)).emit('get_notification_room', data);
    });


    socket.on('disconnect', function () {
        users.forEach((value, key, map) => {
            if (value === socket.id) {
                map.delete(key);
            }
        });
    });

});

http.listen(8080, function () {
    console.log('connect');
});