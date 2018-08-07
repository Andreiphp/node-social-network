const mysqli = require('mysql');
let myDate = require('./getDate');

class Mysql {
    constructor() {
        this.connection = mysqli.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "social-network"
        });
    }

    checkLogin(mail, password, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = 'SELECT * FROM users WHERE mail = ? AND password = ?';
            self.connection.query(sql, [mail, password], function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    getOneUser(id, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "SELECT id, name, lastname, img FROM users WHERE id = " + id + " ";
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    saveUser(request, response) {
        let self = this;
        this.connection.connect(function (err) {
            let sql = "INSERT INTO users (name, lastname, mail, password, day, manth, year, sity, country) VALUES ?";
            let values = [
                [request.body.name, request.body.lastName, request.body.email,
                    request.body.password, request.body.city, request.body.day, request.body.month, request.body.year, request.body.country]
            ];
            self.connection.query("SET SESSION wait_timeout = 604800");
            self.connection.query(sql, [values], function (err, result) {
                if (err) {
                    response.json(false);
                } else {
                    response.json(true);
                }
            });
        })
    }

    searchUser(search, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "SELECT id,name,lastname,img FROM users WHERE name like '%" + search + "%'";
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    getUsersConfirm(user_id, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "SELECT * FROM usrs_friends WHERE status = 0 AND user_id=" + user_id +
                " UNION" +
                " SELECT * FROM usrs_friends WHERE status = 1 AND user_id=" + user_id;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    search_not_added_to_friends(user_id, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "SELECT * FROM usrs_friends WHERE status = 0 AND user_id=" + user_id +
                " UNION" +
                " SELECT * FROM usrs_friends WHERE status = 1 AND user_id=" + user_id +
                " UNION" +
                " SELECT * FROM usrs_friends WHERE status = 2 AND user_id=" + user_id;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    addFriends(request, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "INSERT INTO usrs_friends (user_id, friends_id, friends_name, friends_lastname, friends_img, status) VALUES ?";
            let values = [
                [request.body.user_id.id,
                    request.body.friends_id.id,
                    request.body.friends_id.name,
                    request.body.friends_id.lastname,
                    request.body.friends_id.img,
                    1
                ],
                [request.body.friends_id.id,
                    request.body.user_id.id,
                    request.body.user_id.name,
                    request.body.user_id.lastname,
                    request.body.user_id.img,
                    0
                ]
            ];
            self.connection.query(sql, [values], function (err, result) {
                if (err) {
                    response.json(false);
                } else {
                    response.json(true);
                }
            });
        });
    }

    getFriends(user_id, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "SELECT * FROM usrs_friends WHERE status = 2 AND user_id = " + user_id;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    updateFriends(user, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = " UPDATE usrs_friends SET status = 2 WHERE user_id = " + ` ${user.user_id}` + " AND friends_id= " + ` ${user.friends_id}`;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                let sql = " UPDATE usrs_friends SET status = 2 WHERE user_id = " + ` ${user.friends_id}` + " AND friends_id= " + ` ${user.user_id}`;
                self.connection.query(sql, function (err, result) {
                    if (err) throw err;
                    response.json(result);
                });

            });
        });
    }

    removeRequestFriends(user, response) {
        let self = this;
        this.connection.connect(function (err) {
            let sql = " DELETE FROM usrs_friends WHERE status = 1 AND user_id = " + ` ${user.user_id}` + " AND friends_id= " + ` ${user.friends_id}`;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                let sql = " DELETE FROM usrs_friends WHERE status = 0 AND user_id = " + ` ${user.friends_id}` + " AND friends_id= " + ` ${user.user_id}`;
                self.connection.query(sql, function (err, result) {
                    if (err) throw err;
                    response.json(result);
                });
            });
        });
    }

    createRooms(user_id, friends_id, response) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = "SELECT * FROM `users_rooms` WHERE (`creator` = " + user_id + " AND `participant` = " + friends_id + ")" +
                " OR (`creator` = " + friends_id + " AND `participant` = " + user_id + ")";
            self.connection.query(sql, function (err, result) {
                if (result.length > 0) {
                    self.updateStatusRoomNotCreate(result[0].id);
                    response.json(false);
                } else {
                    let sql = "INSERT INTO users_rooms (creator, participant) VALUES ?";
                    let values = [
                        [user_id, friends_id],
                    ];
                    self.connection.query(sql, [values], function (err, result) {
                        if (err) {
                            response.json(false);
                        } else {
                            response.json(true);
                        }
                    });
                }
            });

        });
    }

    getRooms(user_id, response) {
        let sql = "SELECT users_rooms.id, users_rooms.creator_status, users_rooms.participant_status, users_rooms.creator, (SELECT users.name FROM users WHERE users.id = users_rooms.creator) AS" +
            " creator_name, users_rooms.participant, (SELECT users.name FROM users WHERE users.id = users_rooms.participant) " +
            "AS participant_name," +
            "(SELECT users.img FROM users WHERE users.id = users_rooms.creator) AS creator_img," +
            "(SELECT users.img FROM users WHERE users.id = users_rooms.participant) AS participant_img," +
            " (SELECT message.text FROM message WHERE users_rooms.id = message.room_id ORDER BY id DESC LIMIT 1  ) AS last_mess FROM users_rooms, users WHERE (users_rooms.creator = " + user_id + " OR users_rooms.participant = " + user_id + ")" +
            " GROUP BY users_rooms.id";
        this.connection.query(sql, function (err, result) {
            if (err) throw err;
            response.json(result);
        });
    }

    saveMessages(request, response) {
        let self = this;
        let date = new Date();
        this.connection.connect(function (err) {
            let sql = "INSERT INTO message (room_id, user_id, text, date) VALUES ?";
            let values = [[request.body.room_id, request.body.user_id, request.body.message, `${date}`]];
            self.connection.query("SET SESSION wait_timeout = 604800");
            self.connection.query(sql, [values], function (err, result) {
                if (err) {
                    response.json(false);
                } else {
                    response.json(true);
                }
            });
        });
    }

    getMessagesForRooms(room_id, response) {
        let sql = "SELECT message.id `w`, message.user_id `id`, message.text `message`, message.date `date`, message.time `time`, users.name, users.lastname, users.img FROM `message` " +
            "JOIN users ON message.user_id = users.id WHERE `room_id` = " + room_id + " ORDER BY message.id  ";
        this.connection.query(sql, function (err, result) {
            if (err) throw err;
            response.json(result);
        });
    }

    getOneFriend(room_id, response) {
        let sql = "SELECT * FROM users_rooms WHERE id = " + room_id + "";
        this.connection.query(sql, function (err, result) {
            if (err) throw err;
            response.json(result);
        });
    }

    saveUserPost(user_id, from_user_id, post_text, image, response) {

        let self = this;
        let date = new Date();
        // date = myDate.MyDate.getDay(),
        // year = myDate.MyDate.getYear(),
        // month = myDate.MyDate.parseMonth(),
        // Hour = ('0' + new Date().getHours()).slice(-2),
        // Minutes = ('0' + new Date().getMinutes()).slice(-2);

        this.connection.connect(function (err) {
            let sql = "INSERT INTO user_posts (user_id, from_user_id, post_text, image, date) VALUES ?";
            let values = [[user_id, from_user_id, post_text, image, `${date}`]];
            self.connection.query("SET SESSION wait_timeout = 604800");
            self.connection.query(sql, [values], function (err, result) {
                if (err) {
                    response.json(false);
                } else {
                    response.json(true);
                }
            });
        });
    }

    getUsersPost(user_id, response) {
        let self = this;
        let posts = null;
        let comments = null;
        this.connection.query("SET SESSION wait_timeout = 604800");
        let sql = "SELECT user_posts.*, users.name, users.lastname, users.img FROM users INNER JOIN user_posts" +
            " ON user_posts.from_user_id = users.id WHERE user_posts.user_id = " + user_id + " ORDER BY id DESC";
        this.connection.query(sql, function (err, result) {
            if (err) throw err;
            if (result) {
                posts = result;
                let sql = "SELECT * FROM comment WHERE user_id = " + user_id + " ORDER BY id ASC";
                self.connection.query(sql, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        comments = result;
                        for (let i = 0; i <= posts.length - 1; i++) {
                            posts[i].comment = [];
                            for (let j = 0; j <= comments.length - 1; j++) {
                                if (posts[i].id === comments[j].post_id) {
                                    posts[i].comment.unshift(comments[j]);
                                }
                            }
                        }
                        response.json(posts);
                    }
                });
            }

        });
    }

    saveComments(comment_info, response) {
        let sql = "INSERT INTO comment (post_id, user_id, from_user_id, user_name, user_last_name,  user_image, user_comment, date) VALUES ?";
        let values = [[comment_info.post_id, comment_info.user_id, comment_info.from_user_id, comment_info.user_name,
            comment_info.user_last_name, comment_info.user_image, comment_info.user_comment,comment_info.date ]];
        this.connection.query("SET SESSION wait_timeout = 604800");
        this.connection.query(sql, [values], function (err, result) {
            if (err) {
                response.json(false);
            } else {
                response.json(true);
            }
        });
    }

    deleteFriend(user, friend, response) {
        let self = this;
        this.connection.connect(function (err) {
            let sql = " DELETE FROM usrs_friends WHERE status = 2 AND (user_id = " + user + " AND friends_id= " + friend + ") OR (user_id = " + friend + " AND friends_id= " + user + ")";
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                response.json(result);
            });
        });
    }

    deleteRoom(request, response) {
        let self = this;
        let creator = request.body.room.creator;
        let participant = request.body.room.participant;
        this.connection.connect(function (err) {
            let sql = " DELETE FROM users_rooms WHERE creator_status = 2 AND participant_status = 2 AND (creator = " + creator + " AND participant = " + participant + ")  OR (creator = " + participant + " AND participant = " + creator + ") ";
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
            });
        });
    }

    updateStatusRoom(request, response) {
        let self = this;
        let status = request.body.status;
        let id = request.body.room.id;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = " UPDATE users_rooms SET " + status + " = 2 WHERE id = " + id;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
                self.deleteRoom(request, response);
                response.json(true);
            });
        });
    }

    updateStatusRoomNotCreate(id) {
        let self = this;
        this.connection.connect(function (err) {
            self.connection.query("SET SESSION wait_timeout = 604800");
            let sql = " UPDATE users_rooms SET creator_status = 0 , participant_status = 0  WHERE id = " + id;
            self.connection.query(sql, function (err, result) {
                if (err) throw err;
            });
        });
    }

    getInfoForRoom(room_id, response) {
        let sql = "SELECT * FROM users_rooms WHERE id = " + room_id + "";
        this.connection.query(sql, function (err, result) {
            if (err) throw err;
            response.json(result);
        });
    }

    getUserImage(user_id, response) {
        this.connection.query("SET SESSION wait_timeout = 604800");
        let sql = "SELECT * FROM users_images WHERE user_id = " + user_id + " ORDER BY id DESC";
        this.connection.query(sql, function (err, result) {
            if (err) throw err;
            response.json(result);
        });
    }

    saveImageFromUser(user_id, image, response) {
        let sql = "INSERT INTO users_images (user_id, image) VALUES ?";
        let values = [[user_id, image]];
        this.connection.query("SET SESSION wait_timeout = 604800");
        this.connection.query(sql, [values], function (err, result) {
            if (err) {
                response.json(false);
            }
        });
    }

}

module.exports.mysql = new Mysql();