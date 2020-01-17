window.onload = function () {
    document.getElementById('ct_button').addEventListener('click', function () {
        fetchTable(8, 0, '', '');
    });
};

function fetchTable(lim, off, col, dir) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var obj = JSON.parse(this.responseText);
            var table = unescape(obj.table).replace(/\+/g, ' ');
            var x;
            x = document.getElementById('ct_switchable');
            x.innerHTML = (off === 0) ? table : x.innerHTML.replace('</table>', table + '</table>');
            if (obj.count > off + lim)
                fetchTable(lim, off + lim, col, dir);
        }
    };

    if (col === '') col = document.getElementById('ct_select_column').value;
    if (dir === '') dir = document.getElementById('ct_select_direction').value;

    var url = 'http://ai.org.au/data/public_view.php?';
    url += 't=' + Math.random();
    url += '&col=' + col;
    url += '&dir=' + dir;
    url += '&lim=' + lim;
    url += '&off=' + off;
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}