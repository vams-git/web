var alert_mod = {
  data() {
    return {
      datas: [],
    };
  },
  methods: {
    add(input) {
      var new_id = alert_id++;
      var prefix;
      var classfix;
      if (input.type == 'error') { prefix = 'E'; classfix = 'bg-danger' }
      if (input.type == 'info') { prefix = 'I'; classfix = 'bg-warning' }
      if (input.type == 'success') { prefix = 'S'; classfix = 'bg-primary' }
      this.datas.unshift({
        id: prefix + (new_id).toString().padStart(3, '0'),
        text: input.text,
        type: input.type,
        classfix: classfix
      });
    },
    remove(info) {
      this.datas = this.datas.filter(function (e) { return e.id !== info.id })
    }
  },
};

var form_mod = {
  data() {
    return {
      data: [],
      broken: false,
      loaded: false,
      form: false,
      new_form: true
    }
  },
  methods: {
    addItems(input) {
      this.data.push(input);
      if (this.data.filter(function (e) {
        return e.ock_status === 'U'
      }).length === 0) { this.new_form = true }
      else { this.new_form = false }
    },
    loadForm(event) {
      var target = event.target;
      if (target.tagName != 'button') { target = target.closest('button') }
      build_form(target.id)
    },
    newForm(event) { build_new_form() },
    getData() {
      var data = this.data;
      return data
    }
  }
}

var open_jobs_mod = {
  data() {
    return {
      data: [],
      loaded: false,
    }
  },
  methods: {
    addItems(input) {
      this.data.push(input);
      var count = this.data.length;
      document.getElementById('openjobmodalcount').innerHTML = count;
    },
    closeModal() { this.loaded = false },
    get_days(item) {
      var fetch = this.data.filter(function (e) { return e['evt_code'] === item['evt_code'] });
      if (fetch.length === 1) {
        var target_date = new Date(fetch[0].evt_created);
        return Math.ceil((new Date() - target_date) / (1000 * 60 * 60 * 24))
      }
      else { return 0 }
    },
    getData() {
      var data = this.data;
      return data
    }
  }
}

var photo_mod = {
  data() {
    return {
      'data': {
        'checklistcode': '',
        'checklistid': '',
        'org': '',
        'photoid': '',
        'src': '',
        'loaded': false
      },
      'list': false,
      'loaded': false
    }
  },
  methods: {
    updateList(url_prm, ock_code, c) {
      var app_data = this;
      var p = {
        'process': 'get_photos',
        'tenant': url_prm.tenant,
        'userid': url_prm.userid,
        'checklist': ock_code
      }
      var data_request = new Request(updateUrl(gas, p), {
        redirect: "follow",
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });
      fetch(data_request)
        .then(function (response) { return response.json() })
        .then(function (data) {
          if (data.status) {
            app_data.list = data.text;

            if (data.text.length > 0) {
              if (c !== undefined && c.close !== undefined) {
                document.getElementById('photo_close_btn').click();
                app_data.list.forEach(function (e) {
                  form.raw.filter(function (f) { return f.ack_code === e.ack_code })[0].doc_codes = e.dae_document;
                  app_data.getData(url_prm, e.dae_document);
                });
              }
              if (c !== undefined && c.close === undefined) {
                if (data.text.filter(function (e) { return e.ack_code === c.id }).length === 0) {
                  app_data.list.forEach(function (e) {
                    form.raw.filter(function (f) { return f.ack_code === e.ack_code })[0].doc_codes = e.dae_document;
                    app_data.getData(url_prm, e.dae_document);
                  });
                  app_data.addChecklist(c.id, ock_code, c.org);
                }
                else {
                  app_data.list.forEach(
                    function (e) {
                      form.raw.filter(function (f) { return f.ack_code === e.ack_code })[0].doc_codes = e.dae_document;
                      if (c !== undefined && c.id === e.ack_code) {
                        app_data.getData(url_prm, e.dae_document, {
                          id: e.ack_code,
                          checklist: e.ock_code,
                          org: e.ock_org
                        })
                      }
                      else { app_data.getData(url_prm, e.dae_document) }
                    });
                }
              }
              else {
                app_data.list.forEach(function (e) {
                  form.raw.filter(function (f) { return f.ack_code === e.ack_code })[0].doc_codes = e.dae_document;
                  app_data.getData(url_prm, e.dae_document)
                });
              }
            }
            else {
              if (c !== undefined && c.close !== undefined) {
                document.getElementById('photo_close_btn').click();
              }
              if (c !== undefined && c.close === undefined) { app_data.addChecklist(c.id, ock_code, c.org) }
            }
          }
          else {
            app_data.list = [];
            if (c !== undefined) { app_data.addChecklist(c.id, ock_code, c.org) }
          }
        });
    },
    getData(param, doc_id, c) {
      var app_data = this;
      var p = {
        'process': 'download_doc_attachment',
        'tenant': param.tenant,
        'doc_id': doc_id
      }

      var data_request = new Request(updateUrl(gas, p), {
        redirect: "follow",
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });
      fetch(data_request)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.status) {
            var node_list = app_data.list.filter(function (e) { return e.dae_document == data.text.doc_id });
            if (node_list.length === 1 && data.text.base !== '' && data.text.base !== undefined) {

              node_list[0].src = 'data:image/jpeg;base64,' + data.text.base;

              if (c !== undefined) {
                app_data.addChecklist(c.id, c.checklist, c.org)
              }
            }
            else {
              if (c !== undefined) {
                app_data.addChecklist(c.id, c.checklist, c.org)
              }
            }
          }
          else {
            console.log(data.text);
            if (c !== undefined) { app_data.addChecklist(c.id, c.checklist, c.org) }
          }
        });
    },
    addChecklist(id, checklist, org) {
      var app_data = this;
      app_data['data']['checklistcode'] = checklist;
      app_data['data']['checklistid'] = id;
      app_data['data']['org'] = org;
      app_data['data']['loaded'] = true;
      app_data.loaded = true;
      if (app_data['list'] === false) { app_data.updateList(param, checklist, { 'id': id, 'org': org }) }
      else {
        var getData = app_data['list'].filter(function (e) { return e.ack_code === id });
        if (getData.length === 1
          && getData[0].src !== undefined
          && getData[0].src !== '') {
          app_data['data']['photoid'] = getData[0].dae_document;
          app_data['data']['src'] = getData[0].src;
          app_data['data']['loaded'] = false;
        }
        else if (getData.length === 1
          && (getData[0].src === undefined || getData[0].src == '')
          && getData[0].dae_document !== undefined) {
          app_data.getData(param, getData[0].dae_document, { 'id': id, 'org': org })
        }
        else {
          app_data['data']['photoid'] = '';
          app_data['data']['src'] = '';
          app_data['data']['loaded'] = false;
        }
      }
    },
    getChecklistStatus() {
      return form.data.status
    },
    closeModal() {
      this['data']['checklistcode'] = '';
      this['data']['checklistid'] = '';
      this['data']['org'] = '';
      this['data']['photoid'] = '';
      this['data']['src'] = '';
      this['data']['loaded'] = false;
      this.loaded = false;
    },
    resizeImg(img, maxWidth) {
      var width = img.width;
      var height = img.height;
      if (width >= height) {
        var maxVal = {
          l: width,
          a: 'x',
          r: height / width
        }
      }
      else {
        var maxVal = {
          l: height,
          a: 'y',
          r: width / height
        }
      }
      if (maxVal.l >= maxWidth) {
        if (maxVal.a == 'x') {
          width = maxWidth;
          height = maxVal.r * maxWidth
        }
        else {
          height = maxWidth;
          width = maxVal.r * maxWidth
        }
      }
      return [width, height];
    },
    processImg(event) {
      var app_data_ = this;
      if (!app_data_.getChecklistStatus()) {
        var old_ = app_data_.data.src;
        var file = event.target.files[0];
        app_data_.data.loaded = true;
        var blobURL = URL.createObjectURL(file);
        var img = new Image();
        img.src = blobURL;
        img.onerror = function () {
          URL.revokeObjectURL(this.src);
          app_data_.data.src = old_;
          app_data_.data.loaded = false;
        };
        img.onload = function () {
          URL.revokeObjectURL(this.src);
          var [newWidth, newHeight] = app_data_.resizeImg(img, 1600);
          var canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          app_data_.data.src = canvas.toDataURL('image/jpeg', 0.8);
          app_data_.data.loaded = false;
        }
      }
    },
    openFile() { if (!this.getChecklistStatus()) { document.getElementById('new_photo_btn').click() } },
    uploadPhoto() {
      var app_data = this;
      app_data['data']['loaded'] = true;
      if (app_data['data']['photoid'] === '') {
        var p = {
          'process': 'create_photo_record',
          'tenant': param.tenant,
          'userid': param.userid,
          'organization': app_data['data']['org'],
          'checklist': app_data['data']['checklistid']
        }
      }
      else {
        var p = {
          'process': 'update_photo_attachment',
          'tenant': param.tenant,
          'userid': param.userid,
          'doc_id': app_data['data']['photoid']
        }
      }
      var file = { 'file': app_data['data']['src'] }
      var data_request = new Request(updateUrl(gas, p), {
        redirect: "follow",
        method: 'POST',
        body: JSON.stringify(file),
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });
      fetch(data_request)
        .then(function (response) { return response.json() })
        .then(function (data) {
          if (p['process'] === 'create_photo_record') {
            app_data.updateList(param, app_data['data']['checklistcode'], { 'close': true })
          }
          else {
            app_data.getData(param, app_data['data']['photoid']);
            document.getElementById('photo_close_btn').click();
          }
        });
    },
    deletePhoto() {
      var app_data = this;
      app_data['data']['loaded'] = true;
      if (app_data['data']['photoid'] !== '' && app_data['data']['checklistid'] !== '') {
        var p = {
          'process': 'delete_photo',
          'tenant': param.tenant,
          'userid': param.userid,
          'doc_id': app_data['data']['photoid'],
          'checklist': app_data['data']['checklistid']
        };
        var data_request = new Request(updateUrl(gas, p), {
          redirect: "follow",
          method: 'POST',
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
        });
        fetch(data_request)
          .then(function (response) { return response.json() })
          .then(function (data) {
            form.raw.filter(
              function (f) { return f.ack_code === app_data['data']['checklistid'] })[0].doc_codes = '';
            app_data.updateList(param, app_data['data']['checklistcode'], { 'close': true });
          });
      }
      else {
        document.getElementById('photo_close_btn').click();
      }
    }
  }
}

var past_dvr_mod = {
  data() {
    return {
      data: [],
      loaded: false,
    }
  },
  methods: {
    addItems(input) {
      this.data.push(input);
      var count = this.data.length;
      document.getElementById('pastdvrmodalcount').innerHTML = count;
      var doc_id = input.dae_document;
      var doc_req = new Request(gas + '?process=download_doc_attachment&tenant=' + param.tenant +
        '&doc_id=' + input.dae_document, {
        redirect: "follow",
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      });
      fetch(doc_req)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.status != undefined && data.status === false) {
            alert.add({
              text: data.text,
              type: 'error'
            })
          }
          else {
            var fetch = dvr_mgmt.getData().filter(function (e) { return e.dae_document == data.text.doc_id });
            if (fetch.length === 1) {
              fetch[0].url = 'data:application/pdf;base64,' + data.text.base;
            }
          }
        });
    },
    closeModal() { this.loaded = false },
    get_days(item) {
      var fetch = this.data.filter(function (e) { return e['dae_document'] === item['dae_document'] });
      if (fetch.length === 1) {
        var target_date = new Date(fetch[0].ock_startdate);
        return Math.ceil((new Date() - target_date) / (1000 * 60 * 60 * 24))
      }
      else { return 0 }
    },
    getData() {
      var data = this.data;
      return data
    },
    download(item) {
      var fetch = this.data.filter(function (e) { return e['dae_document'] === item['dae_document'] });
      if (fetch.length === 1) {
        var input = fetch[0];
        if (input.url !== undefined) {
          var container = document.getElementById('FRAME_' + item['dae_document']);
          if (container.childElementCount > 0) { container.innerHTML = '' }
          else {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'w-100 rounded min-vh-100');
            iframe.src = input.url + '#zoom=FitW';
            container.appendChild(iframe);
          }
        }
      }
    },
    downloadfile(item) {
      var fetch = this.data.filter(function (e) { return e['dae_document'] === item['dae_document'] });
      if (fetch.length === 1) {
        var input = fetch[0];
        if (input.url !== undefined) {
          var link = document.createElement('a');
          link.setAttribute('href', input.url);
          link.setAttribute('download', input.doc_filename);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
        }
      }
    },
    isMob() { return isMobile() }
  }
}

var checklist_mod = {
  data() {
    return {
      data: {},
      raw: [],
      broken: false,
      loaded: false
    }
  },
  methods: {
    addItems(input) {
      input['updated'] = false;
      input['process'] = false;
      input['wo'] = 'WO' + input['ock_code'];
      if (input['ack_completed'] == undefined) { input['ack_completed'] = '' }
      if (input['ack_finding'] == undefined) { input['ack_finding'] = '' }
      if (input['ack_possiblefindings'] == undefined) { input['ack_possiblefindings'] = '' }
      else {
        input['ack_possiblefindings'] = input['ack_possiblefindings'].split(',').map(
          function (e) {
            return {
              value: e, text: findings.filter(
                function (f) { return f.fnd_code == e }).pop().fnd_desc
            }
          }
        )
      }
      if (input['ack_yes'] == undefined) { input['ack_yes'] = '' }
      if (input['ack_no'] == undefined) { input['ack_no'] = '' }
      if (input['ack_yes'] == '0' && input['ack_no'] == '0') { input['ack_yes'] = ''; input['ack_no'] = '' }
      if (input['ack_ok'] == undefined) { input['ack_ok'] = '' }
      if (input['ack_adjusted'] == undefined) { input['ack_adjusted'] = '' }
      if (input['ack_ok'] == '-' && input['ack_adjusted'] == '-') { input['ack_ok'] = ''; input['ack_adjusted'] = '' }
      if (input['ack_not_applicable'] == undefined) { input['ack_not_applicable'] = '' }
      if (input['ack_possible_na_options'] == undefined) { input['ack_possible_na_options'] = '' }
      if (input['ack_notes'] == undefined) { input['ack_notes'] = '' }
      if (input['ack_freetext'] == undefined) { input['ack_freetext'] = '' }
      if (input['ack_checklistdate'] == undefined) { input['ack_checklistdate'] = '' }
      if (input['ack_checklistdatetime'] == undefined) { input['ack_checklistdatetime'] = '' }
      else { input['ack_checklistdatetime'] = (new Date(input['ack_checklistdatetime'])).toJSON().substring(0, 16) }
      if (input['ack_value'] == undefined) { input['ack_value'] = '' }
      else { input['ack_value'] = parseInt(input['ack_value'], 10) }
      if (input['ack_uom'] == undefined) { input['ack_uom'] = '' }
      if (input['ack_taskchecklistcode_comments'] == undefined) { input['ack_taskchecklistcode_comments'] = '' }
      if (input['ack_reference'] == 'PRE') { input['activity'] = 'Pre Start' }
      if (input['ack_reference'] == 'FAULTS') { input['activity'] = 'Faults' }
      if (input['ack_reference'] == 'POST') { input['activity'] = 'Post Trip' }
      this.raw.push(input)
      if (Object.keys(this.data).length == 0) {
        var header = {
          id: input['wo'],
          org: input['obj_org'],
          wo: input['ock_code'],
          desc: input['obj_desc'],
          reference: input['ack_reference'],
          status: ['U'].indexOf(input['ock_status']) == -1,
          activities: [{
            id: input['wo'] + '-' + input['ack_reference'],
            act_note: input['tsk_desc'] + ' (' + input['activity'] + ')',
            parentid: input['wo'],
            groups: [{
              id: input['wo'] + '-' + input['ack_reference'] + '-' + input['ack_group_label'],
              group_code: input['ack_group_label'],
              group_label: input['ack_group_label_desc'],
              parentid: input['wo'] + '-' + input['ack_reference'],
              items: [{
                updated: input['updated'],
                process: input['process'],
                ack_code: input['ack_code'],
                ack_desc: input['ack_desc'],
                ack_taskchecklistcode_comments: input['ack_taskchecklistcode_comments'],
                ack_requiredtoclose: input['ack_requiredtoclose'],
                ack_type: input['ack_type'],
                ack_notes: input['ack_notes'],
                ack_completed: input['ack_completed'],
                ack_finding: input['ack_finding'],
                ack_possiblefindings: input['ack_possiblefindings'],
                ack_ok: input['ack_ok'],
                ack_adjusted: input['ack_adjusted'],
                ack_yes: input['ack_yes'],
                ack_no: input['ack_no'],
                ack_value: input['ack_value'],
                ack_uom: input['ack_uom'],
                ack_not_applicable: input['ack_not_applicable'],
                ack_possible_na_options: input['ack_possible_na_options'],
                ack_freetext: input['ack_freetext'],
                ack_checklistdate: input['ack_checklistdate'],
                ack_checklistdatetime: input['ack_checklistdatetime'],
                ack_sequence: input['ack_sequence'],
                ack_reference: input['ack_reference'],
                ack_group_label_desc: input['ack_group_label_desc'],
                ack_group_label: input['ack_group_label'],
                parentid: input['wo'] + '-' + input['ack_reference'] + '-' + input['ack_group_label'],
              }],
            }],
          }],
        };
        this.data = header;
      }
      else {
        if (this.data.activities.filter(function (e) {
          return e.id == input['wo'] + '-' + input['ack_reference']
        }).length == 0) {
          this.data.activities.push({
            id: input['wo'] + '-' + input['ack_reference'],
            act_note: input['tsk_desc'] + ' (' + input['activity'] + ')',
            parentid: input['wo'],
            groups: []
          });
        }
        var activity = this.data.activities.findIndex(function (e) {
          return e.id == input['wo'] + '-' + input['ack_reference']
        });
        if (this.data.activities[activity].groups.filter(function (e) {
          return e.id == input['wo'] + '-' + input['ack_reference'] + '-' + input['ack_group_label']
        }).length == 0) {
          this.data.activities[activity].groups.push({
            id: input['wo'] + '-' + input['ack_reference'] + '-' + input['ack_group_label'],
            group_code: input['ack_group_label'],
            group_label: input['ack_group_label_desc'],
            parentid: input['wo'] + '-' + input['ack_reference'],
            items: []
          });
        }
        var group = this.data.activities[activity].groups.findIndex(function (e) {
          return e.id == input['wo'] + '-' + input['ack_reference'] + '-' + input['ack_group_label']
        });
        this.data.activities[activity].groups[group].items.push({
          updated: input['updated'],
          process: input['process'],
          ack_code: input['ack_code'],
          ack_desc: input['ack_desc'],
          ack_taskchecklistcode_comments: input['ack_taskchecklistcode_comments'],
          ack_requiredtoclose: input['ack_requiredtoclose'],
          ack_type: input['ack_type'],
          ack_notes: input['ack_notes'],
          ack_completed: input['ack_completed'],
          ack_finding: input['ack_finding'],
          ack_possiblefindings: input['ack_possiblefindings'],
          ack_ok: input['ack_ok'],
          ack_adjusted: input['ack_adjusted'],
          ack_yes: input['ack_yes'],
          ack_no: input['ack_no'],
          ack_value: input['ack_value'],
          ack_uom: input['ack_uom'],
          ack_not_applicable: input['ack_not_applicable'],
          ack_possible_na_options: input['ack_possible_na_options'],
          ack_freetext: input['ack_freetext'],
          ack_checklistdate: input['ack_checklistdate'],
          ack_checklistdatetime: input['ack_checklistdatetime'],
          ack_sequence: input['ack_sequence'],
          ack_reference: input['ack_reference'],
          ack_group_label_desc: input['ack_group_label_desc'],
          ack_group_label: input['ack_group_label'],
          parentid: input['wo'] + '-' + input['ack_reference'] + '-' + input['ack_group_label'],
        });
      }
    },
    getOptionHTML(option) {
      if (option === 'Z028') { return '<i class="bi bi-check-lg"></i>' }
      if (option === 'Z029') { return '<i class="bi bi-x-lg"></i>' }
      if (option === 'Z030') { return '<i class="bi bi-slash-lg"></i>' }
    },
    expandTextArea(event) {
      var target = event.target;
      if (target.tagName != 'button') { target = target.closest('button') }
      var id = target.getAttribute('aria-controls');
      var text_area = document.getElementById(id).querySelector('textarea');
      text_area.style.height = 'auto';
      text_area.style.height = (text_area.scrollHeight) + 'px'
    },
    getStartReading(item) {
      if (item.ack_desc.search(new RegExp('Odometer/Hub', 'gi')) === -1
        && item.ack_desc.search(new RegExp('Hour Meter', 'gi')) === -1) {
        return ''
      }
      else {
        var wo = this.data.wo;
        if (item.ack_desc.search(new RegExp('start', 'gi')) === -1) {
          if (item.ack_desc.search(new RegExp('Odometer/Hub', 'gi')) !== -1) {
            return payload.filter(
              function (e) {
                return e.ock_code == wo
                  && e.ack_desc.search(new RegExp('Odometer/Hub', 'gi')) !== -1
                  && e.ack_desc.search(new RegExp('start', 'gi')) !== -1
              })[0].ack_value
          }
          else {
            return payload.filter(
              function (e) {
                return e.ock_code == wo
                  && e.ack_desc.search(new RegExp('Hour Meter', 'gi')) !== -1
                  && e.ack_desc.search(new RegExp('start', 'gi')) !== -1
              })[0].ack_value
          }
        }
        else {
          return ''
        }
      }
    },
    openPhoto(item) { photo_mgmt.addChecklist(item.ack_code, this.data.wo, this.data.org) },
    snycItems(item, event) {
      if (event != undefined) {
        if (event.target.nodeName == 'TEXTAREA') {
          event.target.style.height = 'auto'
          event.target.style.height = (event.target.scrollHeight) + 'px'
        }
      }
      var id = this.raw.findIndex(function (e) { return e['ack_code'] == item['ack_code'] });
      var raw = this.raw[id];
      if (item['ack_desc'] === 'Registration No' && item['ack_freetext'] !== raw['obj_udfchar39']) {
        item['ack_freetext'] = raw['obj_udfchar39'];
      }
      if (item['ack_desc'] === 'Unit/Fleet No' && item['ack_freetext'] !== raw['obj_udfchar16']) {
        item['ack_freetext'] = raw['obj_udfchar16'];
      }
      if (item['ack_desc'] === 'Worker Name' && item['ack_freetext'] !== user_details['usr_desc']) {
        item['ack_freetext'] = user_details['usr_desc'];
      }
      raw['ack_notes'] = item['ack_notes'];
      raw['ack_not_applicable'] = item['ack_not_applicable'];
      raw['ack_freetext'] = item['ack_freetext'];
      raw['ack_checklistdate'] = item['ack_checklistdate'];
      raw['ack_checklistdatetime'] = item['ack_checklistdatetime'];
      if (isNaN(parseInt(item['ack_value'], 10))) { item['ack_value'] = ' ' }
      raw['ack_value'] = item['ack_value'];
      raw['ack_yes'] = item['ack_yes'];
      if (item['ack_yes'] == '-') { item['ack_no'] = '+' }
      if (item['ack_yes'] == '+') { item['ack_no'] = '-' }
      raw['ack_no'] = item['ack_no'];
      raw['ack_completed'] = item['ack_completed'];
      raw['ack_finding'] = item['ack_finding'];
      raw['ack_ok'] = item['ack_ok'];
      if (item['ack_ok'] == '-') { item['ack_adjusted'] = '+' }
      if (item['ack_ok'] == '+') { item['ack_adjusted'] = '-' }
      raw['ack_adjusted'] = item['ack_adjusted'];
      item['updated'] = raw['updated'] = true;
      item['process'] = raw['process'] = false;
      item['lastupdate'] = raw['lastupdate'] = Date.now();
      setTimeout(function (item) { form.processItems(item) }, 3000, item)
    },
    resetItems(item, event) {

      if (item['ack_type'] == '01') { item['ack_completed'] = '' }
      if (item['ack_type'] == '02') { item['ack_yes'] = ''; item['ack_no'] = '' }
      if (item['ack_type'] == '03') { item['ack_finding'] = '' }
      if (item['ack_type'] == '04') { item['ack_value'] = '' }
      if (item['ack_type'] == '09') { item['ack_ok'] = ''; item['ack_adjusted'] = '' }
      if (item['ack_type'] == '13') { item['ack_checklistdate'] = '' }
      if (item['ack_type'] == '14') { item['ack_checklistdatetime'] = '' }
      if (item['ack_type'] == '15') { item['ack_freetext'] = '' }
      item['ack_notes'] = '';
      item['ack_not_applicable'] = '';
      var parent = event.target.closest('div.accordion-body');
      event.target = parent.querySelector('textarea')
      form.snycItems(item, event)
    },
    getItemCompleted(item) {
      if ((item.ack_completed == '' || item.ack_completed == '-')
        && item.ack_checklistdatetime == ''
        && item.ack_checklistdate == ''
        && item.ack_freetext == ''
        && item.ack_finding == ''
        && item.ack_value == ''
        && item.ack_ok == ''
        && item.ack_adjusted == ''
        && item.ack_yes == ''
        && item.ack_no == ''
        && item.ack_not_applicable == '') {
        return false
      }
      else { return true }
    },
    getPhotoId(itemid) {
      var id = this.raw.filter(function (e) {
        return e.ack_code == itemid
      });
      if (id[0].doc_codes !== undefined && id[0].doc_codes !== '') { return id[0].doc_codes }
      else { return '' }
    },
    getdisplay(item) {
      if (item.ack_type === '14') { return false }
      if (item.ack_type === '01'
        && item.ack_group_label === 'F-200105'
        && this.raw.filter(
          function (e) {
            return e.ack_group_label === 'F-200105'
              && e.ack_desc === item.ack_desc
              && e.ack_completed === '+'
          }).map(function (e) { return e.ack_code }).indexOf(item.ack_code) !== -1) { return true }
      if (item.ack_type === '01'
        && item.ack_group_label === 'F-200105'
        && this.raw.filter(
          function (e) {
            return e.ack_group_label === 'F-200105'
              && e.ack_desc === item.ack_desc
              && (e.ack_completed === '' || e.ack_completed === '-')
          }).map(function (e) { return e.ack_code }).indexOf(item.ack_code) !== -1) { return false }
      return true
    },
    hasTextArea(item) {
      if (item.ack_type === '01' && item.ack_group_label === 'F-200105') { return true }
      return false
    },
    openFaults() {
      return this.raw.filter(
        function (e) {
          return e.ack_group_label === 'F-200105'
            && e.ack_notes === ''
        }).filter(
          function (e, i, a) {
            return e.ack_code === a.filter(
              function (f) { return f.ack_desc === e.ack_desc })[0].ack_code
          }).map(
            function (e) { return { 'text': e.ack_desc, 'value': e.ack_code } })
    },
    showFaultRequired(id) {
      if (id.search('FAULTS') === -1) { return true }
      else {
        return this.raw.filter(
          function (e) {
            return e.ack_possiblefindings !== '' && e.ack_finding !== ''
          }).length > 0
      }
    },
    selectFault(event) {
      var target = event.target;
      var selected = target.value;
      if (selected !== ''
        && this.raw.filter(function (e) { return e.ack_code === selected && e.ack_completed !== '+' }).length > 0) {
        document.getElementById('FREE' + selected).click();
        this.raw.filter(
          function (e) {
            return e.ack_group_label === 'F-200105'
              && e.ack_notes === '' && e.ack_completed === '+' && e.ack_code !== selected
          }).forEach(function (e) {
            document.getElementById('FREE' + e.ack_code).click();
          })
      }
      target.value = '';
    },
    submitForm() {
      var input = {}; input.reference = this.data.reference; input.ock_code = this.data.wo; send_form(input)
    },
    cancelForm() {
      var input = {}; input.reference = this.data.reference; input.ock_code = this.data.wo; cancel_form(input)
    },
    loadMeta() { var input = {}; input.reference = this.data.reference; input.ock_code = this.data.wo; loadmetadata(input) },
    getGroupCompleted(group) {
      return group.items.filter(function (item) {
        return !((item.ack_completed == '' || item.ack_completed == '-')
          && item.ack_checklistdatetime == ''
          && item.ack_checklistdate == ''
          && item.ack_freetext == ''
          && item.ack_finding == ''
          && item.ack_value == ''
          && item.ack_ok == ''
          && item.ack_adjusted == ''
          && item.ack_yes == ''
          && item.ack_no == ''
          && item.ack_not_applicable == '')
      }).length
    },
    getAllCompleted() {
      var collection = [];
      this.data.activities.forEach(
        function (e) {
          e.groups.forEach(
            function (f) {
              f.items.forEach(
                function (g) {
                  var data = !((g.ack_completed == '' || g.ack_completed == '-')
                    && g.ack_checklistdatetime == ''
                    && g.ack_checklistdate == ''
                    && g.ack_freetext == ''
                    && g.ack_finding == ''
                    && g.ack_value == ''
                    && g.ack_ok == ''
                    && g.ack_adjusted == ''
                    && g.ack_yes == ''
                    && g.ack_no == ''
                    && g.ack_not_applicable == '');
                  if ((g.updated === true && g.process === true) || (g.updated === false && g.process === false)) { var updated = true } else { var updated = false }
                  collection.push({ res: data && updated, ack_code: g.ack_code })
                }
              )
            }
          )
        }
      );
      var min_req = this.raw.filter(
        function (j) { return j.ack_requiredtoclose === 'YES' || (j.ack_requiredtoclose === 'NO' && j.updated === true) }
      ).map(function (j) { return j.ack_code });
      return collection.filter(function (e) { return e.res && min_req.indexOf(e.ack_code) !== -1 }).length === min_req.length
    },
    processItems(item) {
      if (item['process'] == false && (Date.now() - item['lastupdate']) >= 3000) {
        console.log('sending ' + item['ack_code'])
        var one = '';
        var two = '';
        if (item['ack_type'] == '01') { one = item['ack_completed'] }
        if (item['ack_type'] == '02') {
          if (item['ack_yes'] == '' && item['ack_no'] == '') {
            one = '0';
            two = '0';
          }
          else {
            one = item['ack_yes'];
            two = item['ack_no'];
          }
        }
        if (item['ack_type'] == '03') { one = item['ack_finding'] }
        if (item['ack_type'] == '04') { one = item['ack_value'] }
        if (item['ack_type'] == '09') {
          if (item['ack_yes'] == '' && item['ack_no'] == '') {
            one = '-';
            two = '-';
          }
          else {
            one = item['ack_ok'];
            two = item['ack_adjusted'];
          }
        }
        if (item['ack_type'] == '13') { one = item['ack_checklistdate'] }
        if (item['ack_type'] == '14') { one = item['ack_checklistdatetime'].replace("T", " ") }
        if (item['ack_type'] == '15') { one = item['ack_freetext'] }
        var payload = {
          'tenant': param.tenant,
          'chkcode': item['ack_code'],
          'chktype': item['ack_type'],
          'chkdataone': one,
          'chkdatatwo': two,
          'chkdatanot': item['ack_not_applicable'],
          'chkdatanotes': item['ack_notes'],
          'userid': param.userid
        }

        var checklist_req = new Request(gas + '?process=upd_checklist', {
          redirect: "follow",
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
        });

        fetch(checklist_req)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data.status != undefined && data.status === false) {
              alert.add({
                text: data.text,
                type: 'error'
              })
            }
            else {
              var id = form.raw.findIndex(function (e) { return e['ack_code'] == item['ack_code'] });
              var raw = form.raw[id];
              item['process'] = raw['process'] = true;
            }
          });
      }
    }
  }

}