let checklist_ = {
    data() {
        return {
            checklist: {},
        };
    },
    methods: {
        new_id() {
            return (new Date()).toJSON().replace(/\D/g, '').substring(8) + (Math.floor(5 + Math.random() * (16)))
        },
        add(p) {
            let app = this;

            if (p == undefined) {
                return app.add({
                    'message': 'alert parameters missings',
                    'type': 'error'
                })
            }
            let err = [];
            if (p['message'] == undefined) { err.push('alert {message} missing') }
            if (p['type'] == undefined) { err.push('alert {type} missing') }
            if ((['error', 'info', 'success']).indexOf(p['type']) == -1
                && p['type'] != undefined) { err.push("invalid alert types.\r\nonly {error}, {info} or {success} is accepted") }
            if (err.length != 0) {
                return app.add({
                    'message': err.join("\r\n"),
                    'type': 'error'
                })
            }
            let id = app.new_id();
            p['id'] = id;
            p['view'] = true;
            app.alerts[id] = p;
        },
        get(id) {
            let app = this;
            if (id == undefined) {
                return app.add({
                    'message': 'id is missings',
                    'type': 'error'
                })
            }
            if (app.alerts[id] == undefined) {
                return app.add({
                    'message': 'id is invalid',
                    'type': 'error'
                })
            }
            if (app.alerts[id]['view'] == false) {
                return app.add({
                    'message': 'id is invalid',
                    'type': 'error'
                })
            }
            return app.alerts[id]
        },
        open() {
            let app = this;
            let data_ = Object.values(app.alerts);
            return data_.filter(function (e) { return e['view'] })
        },
        all() {
            let app = this;
            return Object.values(app.alerts)
        },
        remove(id) {
            let app = this;
            if (id == undefined) {
                return app.add({
                    'message': 'id is missings',
                    'type': 'error'
                })
            }
            if (app.alerts[id] == undefined) {
                return app.add({
                    'message': 'id is invalid',
                    'type': 'error'
                })
            }
            app.alerts[id]['view'] = false
        }
    },
};