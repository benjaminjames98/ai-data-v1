var _URL = 'http://ai.org.au/data/private_access.php?';

window.onload = function () {
    document.getElementById('sec_button').addEventListener('click', passwordCheck);
    document.getElementById('sec_input').onkeydown = function (event) {
        var e = event || window.event;
        if (e.keyCode === 13) passwordCheck();
    };

    function addFetchTable(el, type) {
        document.getElementById(el).addEventListener('click', function () {
            fetchTable(type, 8, 0, '', '');
        });
    }

    function addGetInfo(btn, ipt, type) {
        document.getElementById(btn).addEventListener('click', function () {
            fetchInfo(type, document.getElementById(ipt).value);
        });
        document.getElementById(ipt).onkeydown = function (event) {
            var e = event || window.event;
            if (e.keyCode === 13) fetchInfo(type, document.getElementById(ipt).value);
        };
    }

    function primaryButtons(pre, type) {
        document.getElementById(pre + '_close_button').addEventListener('click', function () {
            accordion(pre + '_new_accordion', false);
            accordion(pre + '_accordion', false);
            if (pre === 'c') accordion(pre + '_pe_new_accordion', false);
            if (pre === 'p') accordion(pre + '_ch_new_accordion', false);
            accordion(pre + '_ph_new_accordion', false);
            accordion(pre + '_em_new_accordion', false);
            accordion(pre + '_we_new_accordion', false);
            accordion(pre + '_ad_new_accordion', false);
        });
        document.getElementById(pre + '_new_button').addEventListener('click', function () {
            accordion(pre + '_new_accordion', true);
            if (pre === 'c') {
                document.getElementById('c_new_name').value = '';
                document.getElementById('c_new_denomination').value = '';
            }
            if (pre === 'p') {
                document.getElementById('p_new_first_name').value = '';
                document.getElementById('p_new_last_name').value = '';
            }
        });
        document.getElementById(pre + '_new_cancel').addEventListener('click', function () {
            accordion(pre + '_new_accordion', false);
        });
        document.getElementById(pre + '_new_confirm').addEventListener('click', function () {
            if (pre === 'c') createNew(type, [
                document.getElementById('c_new_name').value,
                document.getElementById('c_new_denomination').value
            ]);
            if (pre === 'p') createNew(type, [
                document.getElementById('p_new_first_name').value,
                document.getElementById('p_new_last_name').value
            ]);
        });
    }

    function addPhWeEm(type, subtype, nBtn, nIpt1, nIpt2, nAcc, nCanBtn, nConBtn, nIdIpt, rBtn, rIpt, rAcc,
                       rCanBtn, rConBtn) {
        document.getElementById(rCanBtn).addEventListener('click', function () {
            accordion(rAcc, false);
        });
        document.getElementById(rBtn).addEventListener('click', function () {
            accordion(nAcc, false);
            accordion(rAcc, true);
            document.getElementById(rIpt).value = '';
        });
        document.getElementById(rConBtn).addEventListener('click', function () {
            if (confirm('delete this data?'))
                removeFrom(type, subtype, document.getElementById(rIpt).value, null);
        });

        document.getElementById(nBtn).addEventListener('click', function () {
            accordion(rAcc, false);
            accordion(nAcc, true);
            document.getElementById(nIpt1).value = '';
            document.getElementById(nIpt2).value = '';
        });
        document.getElementById(nCanBtn).addEventListener('click', function () {
            accordion(nAcc, false);
        });

        document.getElementById(nConBtn).addEventListener('click', function () {
            attachTo(type, subtype, [
                document.getElementById(nIpt1).value,
                document.getElementById(nIpt2).value
            ], document.getElementById(nIdIpt).value);
        });
    }

    function addAd(pre, type, idIpt) {
        document.getElementById(pre + '_ad_remove_button').addEventListener('click', function () {
            accordion(pre + '_ad_new_accordion', false);
            accordion(pre + '_ad_remove_accordion', true);
            document.getElementById(pre + '_ad_remove_input').value = '';
        });
        document.getElementById(pre + '_ad_remove_cancel').addEventListener('click', function () {
            accordion(pre + '_ad_remove_accordion', false);
        });
        document.getElementById(pre + '_ad_remove_confirm').addEventListener('click', function () {
            if (confirm('delete this data?'))
                removeFrom(type, 'address', document.getElementById(pre + '_ad_remove_input').value, null);
        });

        document.getElementById(pre + '_ad_new_button').addEventListener('click', function () {
            accordion(pre + '_ad_remove_accordion', false);
            accordion(pre + '_ad_new_accordion', true);
            document.getElementById(pre + '_ad_new_line_1').value = '';
            document.getElementById(pre + '_ad_new_line_2').value = '';
            document.getElementById(pre + '_ad_new_suburb').value = '';
            document.getElementById(pre + '_ad_new_state').value = '';
            document.getElementById(pre + '_ad_new_post_code').value = '';
            document.getElementById(pre + '_ad_new_type').value = '';
        });
        document.getElementById(pre + '_ad_new_cancel').addEventListener('click', function () {
            accordion(pre + '_ad_new_accordion', false);
        });
        document.getElementById(pre + '_ad_new_confirm').addEventListener('click', function () {
            attachTo(type, 'address', [
                document.getElementById(pre + '_ad_new_line_1').value,
                document.getElementById(pre + '_ad_new_line_2').value,
                document.getElementById(pre + '_ad_new_suburb').value,
                document.getElementById(pre + '_ad_new_state').value,
                document.getElementById(pre + '_ad_new_post_code').value,
                document.getElementById(pre + '_ad_new_type').value
            ], document.getElementById(idIpt).value);
        });
    }

    function addRoles(type, idIpt, rBtn, rCon, rCan, rAcc, rIpt, nBtn, nCon, nCan, nAcc, nIpt1, nIpt2) {
        document.getElementById(rBtn).addEventListener('click', function () {
            accordion(nAcc, false);
            accordion(rAcc, true);
            document.getElementById(rIpt).value = '';
        });
        document.getElementById(rCan).addEventListener('click', function () {
            accordion(rAcc, false);
        });
        document.getElementById(rCon).addEventListener('click', function () {
            if (type === 'church')
                removeFrom(type, 'role', document.getElementById(rIpt).value,
                    document.getElementById(idIpt).value);
            if (type === 'person')
                removeFrom(type, 'role', document.getElementById(idIpt).value,
                    document.getElementById(rIpt).value);
        });
        document.getElementById(nBtn).addEventListener('click', function () {
            accordion(rAcc, false);
            accordion(nAcc, true);
            document.getElementById(nIpt1).value = '';
            document.getElementById(nIpt2).value = '';
        });
        document.getElementById(nCan).addEventListener('click', function () {
            accordion(nAcc, false);
        });
        document.getElementById(nCon).addEventListener('click', function () {
            attachTo(type, 'role', [
                document.getElementById(nIpt1).value,
                document.getElementById(nIpt2).value
            ], document.getElementById(idIpt).value);
        });
    }

    ////////////////////////////////////////////////////////////////////
    //---- c ----
    addFetchTable('ct_button', 'church');
    addGetInfo('c_search_button', 'c_search_input', 'church');
    primaryButtons('c', 'church');
    //---- c_ch ----
    document.getElementById('c_ch_cancel').addEventListener('click', function () {
        fetchInfo('church');
    });
    document.getElementById('c_ch_save').addEventListener('click', function () {
        attachTo('church', 'church', [
            document.getElementById('c_ch_name_input').value,
            document.getElementById('c_ch_denomination_input').value,
            document.getElementById('c_ch_visibility_select').value,
            document.getElementById('c_ch_note_input').value
        ], document.getElementById('c_ch_id_input').value);
    });
    //---- c_pe ----
    addRoles('church', 'c_ch_id_input', 'c_pe_remove_button', 'c_pe_remove_confirm', 'c_pe_remove_cancel',
        'c_pe_remove_accordion', 'c_pe_remove_input', 'c_pe_new_button', 'c_pe_new_confirm', 'c_pe_new_cancel',
        'c_pe_new_accordion', 'c_pe_new_id', 'c_pe_new_type');
    //---- c_ph ----
    addPhWeEm('church', 'phone', 'c_ph_new_button', 'c_ph_new_phone', 'c_ph_new_type', 'c_ph_new_accordion',
        'c_ph_new_cancel', 'c_ph_new_confirm', 'c_ch_id_input', 'c_ph_remove_button', 'c_ph_remove_input',
        'c_ph_remove_accordion', 'c_ph_remove_cancel', 'c_ph_remove_confirm');
    //---- c_em ----
    addPhWeEm('church', 'email', 'c_em_new_button', 'c_em_new_email', 'c_em_new_type', 'c_em_new_accordion',
        'c_em_new_cancel', 'c_em_new_confirm', 'c_ch_id_input', 'c_em_remove_button', 'c_em_remove_input',
        'c_em_remove_accordion', 'c_em_remove_cancel', 'c_em_remove_confirm');
    //---- c_we ----
    addPhWeEm('church', 'website', 'c_we_new_button', 'c_we_new_url', 'c_we_new_type', 'c_we_new_accordion',
        'c_we_new_cancel', 'c_we_new_confirm', 'c_ch_id_input', 'c_we_remove_button', 'c_we_remove_input',
        'c_we_remove_accordion', 'c_we_remove_cancel', 'c_we_remove_confirm');
    //---- c_ad ----
    addAd('c', 'church', 'c_ch_id_input');
    //---- c_br ----
    document.getElementById('c_br_cancel').addEventListener('click', function () {
        fetchInfo('church');
    });
    document.getElementById('c_br_save').addEventListener('click', function () {
        attachTo('church', 'bread', [
            document.getElementById('c_br_participating_select').value,
            document.getElementById('c_br_time_input').value,
            document.getElementById('c_br_add_line_1').value,
            document.getElementById('c_br_add_line_2').value,
            document.getElementById('c_br_add_suburb').value,
            document.getElementById('c_br_add_state').value,
            document.getElementById('c_br_add_post_code').value,
            document.getElementById('c_br_note_input').value
        ], document.getElementById('c_ch_id_input').value);
    });
    ////////////////////////////////////////////////////////////////////
    //---- p ----
    addFetchTable('pt_button', 'person');
    addGetInfo('p_search_button', 'p_search_input', 'person');
    primaryButtons('p', 'person');
    //---- p_pe ----
    document.getElementById('p_pe_cancel').addEventListener('click', function () {
        fetchInfo('person');
    });
    document.getElementById('p_pe_save').addEventListener('click', function () {
        attachTo('person', 'person', [
            document.getElementById('p_pe_first_name_input').value,
            document.getElementById('p_pe_last_name_input').value,
            document.getElementById('p_pe_note_input').value
        ], document.getElementById('p_pe_id_input').value);
    });
    //---- p_ch ----
    addRoles('person', 'p_pe_id_input', 'p_ch_remove_button', 'p_ch_remove_confirm', 'p_ch_remove_cancel',
        'p_ch_remove_accordion', 'p_ch_remove_input', 'p_ch_new_button', 'p_ch_new_confirm', 'p_ch_new_cancel',
        'p_ch_new_accordion', 'p_ch_new_id', 'p_ch_new_type');
    //---- p_ph ----
    addPhWeEm('person', 'phone', 'p_ph_new_button', 'p_ph_new_phone', 'p_ph_new_type', 'p_ph_new_accordion',
        'p_ph_new_cancel', 'p_ph_new_confirm', 'p_pe_id_input', 'p_ph_remove_button', 'p_ph_remove_input',
        'p_ph_remove_accordion', 'p_ph_remove_cancel', 'p_ph_remove_confirm');
    //---- p_em ----
    addPhWeEm('person', 'email', 'p_em_new_button', 'p_em_new_email', 'p_em_new_type', 'p_em_new_accordion',
        'p_em_new_cancel', 'p_em_new_confirm', 'p_pe_id_input', 'p_em_remove_button', 'p_em_remove_input',
        'p_em_remove_accordion', 'p_em_remove_cancel', 'p_em_remove_confirm');
    //---- p_we ----
    addPhWeEm('person', 'website', 'p_we_new_button', 'p_we_new_url', 'p_we_new_type', 'p_we_new_accordion',
        'p_we_new_cancel', 'p_we_new_confirm', 'p_pe_id_input', 'p_we_remove_button', 'p_we_remove_input',
        'p_we_remove_accordion', 'p_we_remove_cancel', 'p_we_remove_confirm');
    //---- p_ad ----
    addAd('p', 'person', 'p_pe_id_input');
    //*/
};

function accordion(id, open) {
    var x = document.getElementById(id);
    if (open) {
        if (x.className.indexOf('w3-show') === -1)
            x.className += ' w3-show';
    } else
        x.className = x.className.replace(' w3-show', '');
}

function passwordCheck() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            if (obj.pass !== true) {
                alert('Password is incorrect.');
                return;
            }
            accordion('sec_div', false);
            accordion('initially_hidden', true);
        }
    };

    if (document.getElementById('sec_input').value.length < 8) {
        alert('Password must be at least 8 chars in length');
        return;
    }

    var url = _URL;
    url += 't=' + Math.random();
    url += '&q=' + 'pw_check';
    url += '&pw=' + document.getElementById('sec_input').value;
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function fetchTable(ent, lim, off, col, dir) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            var table = unescape(obj.table).replace(/\+/g, ' ');
            var x;
            if (ent === 'church') x = document.getElementById('ct_switchable');
            if (ent === 'person') x = document.getElementById('pt_switchable');
            x.innerHTML = (off === 0) ? table : x.innerHTML.replace('</table>', table + '</table>');
            if (obj.count > off + lim)
                fetchTable(ent, lim, off + lim, col, dir);
        }
    };

    if (ent === 'church') {
        if (col === '') col = document.getElementById('ct_select_column').value;
        if (dir === '') dir = document.getElementById('ct_select_direction').value;
    }
    if (ent === 'person') {
        if (col === '') col = document.getElementById('pt_select_column').value;
        if (dir === '') dir = document.getElementById('pt_select_direction').value;
    }

    var url = _URL;
    url += 't=' + Math.random();
    url += '&q=' + 'fetch_table';
    url += '&pw=' + document.getElementById('sec_input').value;
    url += '&ent=' + ent;
    url += '&col=' + col;
    url += '&dir=' + dir;
    url += '&lim=' + lim;
    url += '&off=' + off;
    //alert(url);
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function fetchInfo(ent, id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(unescape(this.responseText).replace(/\+/g, ' '));

            function insertTable(arr, col, element) {
                var html = '<table class=\'w3-table w3-striped w3-hoverable\'><thead><tr class=\'w3-theme-l1\'>';
                for (var i = 0; i < col.length; i++) {
                    html += '<th>' + col[i] + '</th>';
                }

                html += '</tr></thead>';
                for (i = 0; i < arr.length; i++) {
                    html += '<tr>';
                    for (var j = 0; j < arr[i].length; j++) {
                        html += arr[i][j] === 'null' || arr[i][j] === '' ? '<td>-</td>' : '<td>' + arr[i][j] + '</td>';
                    }
                    html += '</tr>';
                }
                html += '</table>';
                document.getElementById(element).innerHTML = html;
            }

            var arr1 = obj.info_1;
            if (arr1[1] === null && arr1[2] === null && arr1[3] === null) {
                if (ent === 'church')
                    alert('We can\'t seem to find that church in our records');
                if (ent === 'person')
                    alert('We can\'t seem to find that person in our records');
                return;
            }

            if (ent === 'church') {
                var i = 0;
                document.getElementById('c_ch_id_input').value = arr1[i++];
                document.getElementById('c_ch_name_input').value = arr1[i++];
                document.getElementById('c_ch_denomination_input').value = arr1[i++];
                document.getElementById('c_ch_visibility_select').value = arr1[i++];
                document.getElementById('c_ch_note_input').value = arr1[i++];
                document.getElementById('c_br_participating_select').value = arr1[i++];
                document.getElementById('c_br_time_input').value = arr1[i++];
                document.getElementById('c_br_note_input').value = arr1[i++];
                document.getElementById('c_br_add_line_1').value = arr1[i++];
                document.getElementById('c_br_add_line_2').value = arr1[i++];
                document.getElementById('c_br_add_suburb').value = arr1[i++];
                document.getElementById('c_br_add_state').value = arr1[i++];
                document.getElementById('c_br_add_post_code').value = arr1[i];
                insertTable(obj.info_2, ['id', 'first', 'last', 'type'], 'c_pe_switchable');
                insertTable(obj.ph_info, ['id', 'phone', 'type'], 'c_ph_switchable');
                insertTable(obj.em_info, ['id', 'email', 'type'], 'c_em_switchable');
                insertTable(obj.we_info, ['id', 'url', 'type'], 'c_we_switchable');
                insertTable(obj.ad_info, ['id', 'line 1', 'line 2', 'suburb', 'state', 'post_code', 'type'],
                    'c_ad_switchable');
            }

            if (ent === 'person') {
                document.getElementById('p_pe_id_input').value = arr1[0];
                document.getElementById('p_pe_first_name_input').value = arr1[1];
                document.getElementById('p_pe_last_name_input').value = arr1[2];
                document.getElementById('p_pe_note_input').value = arr1[3];
                insertTable(obj.info_2, ['id', 'name', 'denomination', 'type'], 'p_ch_switchable');
                insertTable(obj.ph_info, ['id', 'phone', 'type'], 'p_ph_switchable');
                insertTable(obj.em_info, ['id', 'email', 'type'], 'p_em_switchable');
                insertTable(obj.we_info, ['id', 'url', 'type'], 'p_we_switchable');
                insertTable(obj.ad_info, ['id', 'line 1', 'line 2', 'suburb', 'state', 'post_code', 'type'],
                    'p_ad_switchable');
            }


            if (ent === 'church') accordion('c_accordion', true);
            if (ent === 'person') accordion('p_accordion', true);
        }
    };

    if (id === undefined && ent === 'church') id = document.getElementById('c_ch_id_input').value;
    if (id === undefined && ent === 'person') id = document.getElementById('p_pe_id_input').value;
    if (id === undefined) return;

    var url = _URL;
    url += 't=' + Math.random();
    url += '&q=' + 'fetch_info';
    url += '&pw=' + document.getElementById('sec_input').value;
    url += '&ent=' + ent;
    url += '&id=' + id;
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function attachTo(ent, type, contents, id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            if (obj.success !== true) alert('we were unable to complete that request');
            if (ent === 'church') {
                fetchInfo('church');
                if (type === 'role') accordion('c_pe_new_accordion', false);
                if (type === 'phone') accordion('c_ph_new_accordion', false);
                if (type === 'email') accordion('c_em_new_accordion', false);
                if (type === 'website') accordion('c_we_new_accordion', false);
                if (type === 'address') accordion('c_ad_new_accordion', false);
            }
            if (ent === 'person') {
                fetchInfo('person');
                if (type === 'role') accordion('p_ch_new_accordion', false);
                if (type === 'phone') accordion('p_ph_new_accordion', false);
                if (type === 'email') accordion('p_em_new_accordion', false);
                if (type === 'website') accordion('p_we_new_accordion', false);
                if (type === 'address') accordion('p_ad_new_accordion', false);
            }
        }
    }
    ;

    var res = 't=' + Math.random();
    res += '&q=' + 'put_info';
    res += '&pw=' + document.getElementById('sec_input').value;
    res += '&ent=' + ent;
    res += '&type=' + type;
    res += '&con=' + contents;
    res += '&id=' + id;
    xmlhttp.open('POST', _URL, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(res);
}

// cid is usually null, only used for type = 'role'
function removeFrom(ent, type, id, cid) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            if (obj.success !== true) alert('we were unable to complete that request');
            if (ent === 'church') {
                fetchInfo('church');
                if (type === 'role') accordion('c_pe_remove_accordion', false);
                if (type === 'phone') accordion('c_ph_remove_accordion', false);
                if (type === 'email') accordion('c_em_remove_accordion', false);
                if (type === 'website') accordion('c_we_remove_accordion', false);
                if (type === 'address') accordion('c_ad_remove_accordion', false);
            }
            if (ent === 'person') {
                fetchInfo('person');
                if (type === 'role') accordion('p_ch_remove_accordion', false);
                if (type === 'phone') accordion('p_ph_remove_accordion', false);
                if (type === 'email') accordion('p_em_remove_accordion', false);
                if (type === 'website') accordion('p_we_remove_accordion', false);
                if (type === 'address') accordion('p_ad_remove_accordion', false);
            }
        }
    };

    var url = _URL;
    url += 't=' + Math.random();
    url += '&q=' + 'del_info';
    url += '&pw=' + document.getElementById('sec_input').value;
    url += '&type=' + type;
    url += '&id=' + id;
    url += '&cid=' + cid;
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}

function createNew(ent, con) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            if (obj.success !== true) alert('we were unable to complete that request');
            if (ent === 'church') {
                accordion('c_new_accordion', false);
                fetchInfo('church', obj.id);
            }
            if (ent === 'person') {
                accordion('p_new_accordion', false);
                fetchInfo('person', obj.id);
            }
        }
    }
    ;

    var res = 't=' + Math.random();
    res += '&q=' + 'create_new';
    res += '&pw=' + document.getElementById('sec_input').value;
    res += '&ent=' + ent;
    res += '&con=' + con;
    xmlhttp.open('POST', _URL, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(res);
}