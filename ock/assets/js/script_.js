function loader_msg(msg) {
    if (msg == undefined) { App.loader.message = '' }
    else { App.loader.message = msg }
}

function loader_off() { App.loader.load = false }

function add_loader(id, text) {
    let payload = { 'id': id };
    if (text !== undefined || text !== '') { payload['text'] = text }
    App.loader.add(payload);
}

function del_loader(id) { App.loader.del(id) }


function alrt(typ, msg) {
    return App.alert.add(
        {
            'message': msg,
            'type': typ
        }
    )
}

function min_params(p) {
    let loadid = 'min_params' + (new Date()).toJSON().replace(/\D/g, '');
    add_loader(loadid, 'checking parameters');
    return new Promise(function (resolve, reject) {
        if (p == undefined) { return reject('parameters missings') }
        let err = [];
        if (p['tenant'] == undefined) { err.push('tenant not specified') }
        if (p['tenant'] == '') { err.push('tenant not specified') }
        if (p['userid'] == undefined) { err.push('userid not specified') }
        if (p['userid'] == '') { err.push('userid not specified') }
        if (p['task'] == undefined) { err.push('task not specified') }
        if (p['task'] == '') { err.push('task not specified') }
        if (p['organization'] == undefined) { err.push('organization not specified') }
        if (p['organization'] == '') { err.push('organization not specified') }
        if (p['equipmentno'] == undefined) { err.push('equipmentno not specified') }
        if (p['equipmentno'] == '') { err.push('equipmentno not specified') }
        if (err != '') { return reject(err.join('\r\n')) }
        del_loader(loadid);
        return resolve({
            'status': true,
            'text': ''
        })
    });
}

function refresh_data(p) {
    let loadid = 'get_checklist_data' + (new Date()).toJSON().replace(/\D/g, '');
    add_loader(loadid, 'loading unfinished checklist');

    if (p == undefined) { return alrt('error', 'parameters missings') }

    let err = [];
    if (p['param']['tenant'] == undefined) { err.push('tenant not specified') }
    if (p['param']['tenant'] == '') { err.push('tenant not specified') }
    if (p['param']['userid'] == undefined) { err.push('userid not specified') }
    if (p['param']['userid'] == '') { err.push('userid not specified') }
    if (p['param']['task'] == undefined) { err.push('task not specified') }
    if (p['param']['task'] == '') { err.push('task not specified') }
    if (p['param']['task'].split('#').indexOf('') != -1) { err.push('invalid task') }
    if (p['param']['organization'] == undefined) { err.push('organization not specified') }
    if (p['param']['organization'] == '') { err.push('organization not specified') }
    if (p['param']['equipmentno'] == undefined) { err.push('equipmentno not specified') }
    if (p['param']['equipmentno'] == '') { err.push('equipmentno not specified') }
    if (err != '') { return alrt('error', err.join('\r\n')) }

    let request_ = new Request(gas + '?method=get_checklist', {
        redirect: "follow",
        method: 'POST',
        body: JSON.stringify(
            {
                'tenant': p['param']['tenant'],
                'user': p['param']['userid'],
                'obj_org': p['param']['organization'],
                'obj_code': p['param']['equipmentno'],
                'tsk_org': p['param']['task'].split('#')[0],
                'tsk_code': p['param']['task'].split('#')[1]
            }
        ),
        headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    fetch(request_)
        .then(function (response) { return response.json() })
        .then(function (data) {
            console.log(data)
            if (!data['status']) {
                return alrt('error', data['text'])
            }
            del_loader(loadid);
            return data
        });
}