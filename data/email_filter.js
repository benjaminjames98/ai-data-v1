var _URL = 'http://ai.org.au/data/email_filter.php?';

window.onload = function () {

    // These cover the security box
    document.getElementById('sec_button').addEventListener('click', passwordCheck);
    document.getElementById('sec_input').onkeydown = function (event) {
        var e = event || window.event;
        if (e.keyCode === 13) passwordCheck();
    };

    // This loads/refreshes denomination checkboxes when the selector is changed
    document.getElementById('select_denomination').value = 'any';
    document.getElementById('select_denomination').onchange = function () {
        var selectedText = this[this.selectedIndex].text;
        if (selectedText === 'any') {
            document.getElementById('switchable_den').innerHTML = '';
            return;
        }
        // if choose is selected, load denomination buttons

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var obj = JSON.parse(this.responseText);
                document.getElementById('switchable_den').innerHTML = obj.html;
            }
        };

        var url = _URL;
        url += 't=' + Math.random();
        url += '&q=' + 'den';
        url += '&pw=' + document.getElementById('sec_input').value;
        xmlhttp.open('GET', url, true);
        xmlhttp.send();
    };

    // When the confirm button is pressed, fetches emails
    document.getElementById('confirm').onclick = function () {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var obj = JSON.parse(unescape(this.responseText).replace(/\+/g, ' '));
                document.getElementById('emails').innerText = obj.emails;
            }
        };

        var dn = '';
        if (document.getElementById('select_denomination').value === 'any')
            dn = 'any';
        else {
            // find all checked boxes on page
            kids = document.getElementById('switchable_den').children;
            for (i = 0; i < kids.length; i++)
                if (kids[i].checked === true)
                    dn += kids[i].value;
        }
        if (dn === '') {
            alert('Please select at least one denomination, or \'any\'');
            return;
        }


        var url = _URL;
        url += 't=' + Math.random();
        url += '&q=' + 'ema';
        url += '&pw=' + document.getElementById('sec_input').value;
        url += '&pc=' + document.getElementById('input_postcode').value;
        url += '&vi=' + document.getElementById('select_visibility').value;
        url += '&bb=' + document.getElementById('select_participating').value;
        url += '&sc=' + document.getElementById('select_scope').value;
        url += '&dn=' + dn;
        xmlhttp.open('GET', url, true);
        xmlhttp.send();

    };
}
;

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