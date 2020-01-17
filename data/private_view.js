var _URL = 'http://ai.org.au/data/private_view.php?';

window.onload = function () {
    document.getElementById('sec_button').addEventListener('click', passwordCheck);
    document.getElementById('sec_input').onkeydown = function (event) {
        var e = event || window.event;
        if (e.keyCode === 13) passwordCheck();
    };

    document.getElementById('ct_button').addEventListener('click', function () {
        fetchTable('church', 10, 0, '', '');
    });
    document.getElementById('pt_button').addEventListener('click', function () {
        fetchTable('person', 10, 0, '', '');
    });

    document.getElementById('ct_email').addEventListener('click', function () {
        accordion('ct_email_accordion', true);
    });
    document.getElementById('ct_email_cancel').addEventListener('click', function () {
        accordion('ct_email_accordion', false);
    });
    document.getElementById('ct_email_confirm').addEventListener('click', function () {
        getEmailList();
    });
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
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}


function getEmailList() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            var emails = unescape(obj.emails).replace(/\+/g, ' ');
            alert(emails);
        }
    };

    var url = _URL;
    url += 't=' + Math.random();
    url += '&q=' + 'fetch_emails';
    url += '&pw=' + document.getElementById('sec_input').value;
    url += '&pcs=' + document.getElementById('ct_email_input').value;
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}