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
      var data = this.datas;
      setTimeout(function (data, info) {
        data = data.filter((t) => t !== info);
      }, 200, data, info);
    }
  },
};

var checklist_mod = {
  data() {
    return {
      data: {},
      raw: [],
      broken: false,
    }
  },
  methods: {
    addItems(input) {
      input['updated'] = false;
      input['process'] = false;
      input['wo'] = 'WO' + input['ack_event'];
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
      if (input['ack_value'] == undefined) { input['ack_value'] = '' }
      else { input['ack_value'] = parseInt(input['ack_value'].replace(/[^\d.]/g,''), 10) }
      if (input['ack_uom'] == undefined) { input['ack_uom'] = '' }
      if (input['ack_taskchecklistcode_comments'] == undefined) { input['ack_taskchecklistcode_comments'] = '' }
      this.raw.push(input)
      if (Object.keys(this.data).length == 0) {
        var header = {
          id: input['wo'],
          org: input['evt_org'],
          url: dux + input['ack_event'],
          wo: input['ack_event'],
          desc: input['evt_desc'],
          status_desc: input['evt_status_desc'],
          status: ['21PQ', '25TP', '35SB', '39QS', '55CA'].indexOf(input['evt_status']) != -1,
          activities: [{
            id: input['wo'] + '-' + input['ack_act'],
            act: input['ack_act'],
            act_note: input['act_note'],
            parentid: input['wo'],
            groups: [{
              id: input['wo'] + '-' + input['ack_act'] + '-' + input['ack_group_label'],
              group_code: input['ack_group_label'],
              group_label: input['ack_group_label_desc'],
              parentid: input['wo'] + '-' + input['ack_act'],
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
                ack_sequence: input['ack_sequence'],
                parentid: input['wo'] + '-' + input['ack_act'] + '-' + input['ack_group_label'],
              }],
            }],
          }],
        };
        this.data = header;
      }
      else {
        if (this.data.activities.filter(function (e) {
          return e.id == input['wo'] + '-' + input['ack_act']
        }).length == 0) {
          this.data.activities.push({
            id: input['wo'] + '-' + input['ack_act'],
            act: input['ack_act'],
            act_note: input['act_note'],
            parentid: input['wo'],
            groups: []
          });
        }
        var activity = this.data.activities.findIndex(function (e) {
          return e.id == input['wo'] + '-' + input['ack_act']
        });
        if (this.data.activities[activity].groups.filter(function (e) {
          return e.id == input['wo'] + '-' + input['ack_act'] + '-' + input['ack_group_label']
        }).length == 0) {
          this.data.activities[activity].groups.push({
            id: input['wo'] + '-' + input['ack_act'] + '-' + input['ack_group_label'],
            group_code: input['ack_group_label'],
            group_label: input['ack_group_label_desc'],
            parentid: input['wo'] + '-' + input['ack_act'],
            items: []
          });
        }
        var group = this.data.activities[activity].groups.findIndex(function (e) {
          return e.id == input['wo'] + '-' + input['ack_act'] + '-' + input['ack_group_label']
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
          ack_sequence: input['ack_sequence'],
          parentid: input['wo'] + '-' + input['ack_act'] + '-' + input['ack_group_label'],
        });
      }
    },
    expandTextArea(event) {
      var target = event.target;
      if (target.tagName != 'button') { target = target.closest('button') }
      var id = target.getAttribute('aria-controls');
      var text_area = document.getElementById(id).querySelector('textarea');
      text_area.style.height = 'auto';
      text_area.style.height = (text_area.scrollHeight) + 'px'
    },
    snycItems(item, event) {
      if (event != undefined) {
        if (event.target.nodeName == 'TEXTAREA') {
          event.target.style.height = 'auto'
          event.target.style.height = (event.target.scrollHeight) + 'px'
        }
      }
      var id = this.raw.findIndex(function (e) { return e['ack_code'] == item['ack_code'] });
      var raw = this.raw[id];
      raw['ack_notes'] = item['ack_notes'];
      raw['ack_not_applicable'] = item['ack_not_applicable'];
      raw['ack_freetext'] = item['ack_freetext'];
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
      if (item['ack_type'] == '15') { item['ack_freetext'] = '' }
      item['ack_notes'] = '';
      item['ack_not_applicable'] = '';
      var parent = event.target.closest('div.accordion-body');
      event.target = parent.querySelector('textarea')
      form.snycItems(item, event)
    },
    getItemCompleted(item) {
      if ((item.ack_completed == '' || item.ack_completed == '-') && item.ack_freetext == '' && item.ack_finding == '' && item.ack_value == '' && item.ack_ok == '' && item.ack_adjusted == '' && item.ack_yes == '' && item.ack_no == '' && item.ack_not_applicable == '') {
        return false
      }
      else { return true }
    },
    getGroupCompleted(group) {
      return group.items.filter(function (item) {
        return !((item.ack_completed == '' || item.ack_completed == '-') && item.ack_freetext == '' && item.ack_finding == '' && item.ack_value == '' && item.ack_ok == '' && item.ack_adjusted == '' && item.ack_yes == '' && item.ack_no == '' && item.ack_not_applicable == '')
      }).length
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
