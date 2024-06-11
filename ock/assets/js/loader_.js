let loader_ = {
    data() {
        return {
            load: false,
            message: '',
            loading: {}

        };
    },
    methods: {
        add(p) {
            let app = this;
            app.loading[p['id']] = p;
            if (p['text'] !== undefined || p['text'] !== '') {
                app.message = p['text'];
            }
            app.load = true;
        },
        del(id) {
            let app = this;
            delete app.loading[id];
            if (Object.keys(app.loading).length == 0) {
                app.load = false;
            }
        }
    },
};