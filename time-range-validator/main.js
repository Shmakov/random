let total_minutes = 0;

$(document).ready(function () {
    $('#data').on('input', function f() {
        process_data();
    })
    process_data();
})

function process_data() {
    total_minutes = 0;

    const text = $('#data').val();
    const lines = text.split(/\r?\n/);
    const results = new Array(lines.length);

    let prev_from = null;
    let prev_to = null;
    lines.forEach(function (item, index) {
        [prev_from, prev_to, results[index]] = process_line(lines[index], [prev_from, prev_to]);
    });

    let html = results.join('');
    if (total_minutes > 0) {
        html += '<div class="total">Total: ' + convert_minutes_to_hours_minutes(total_minutes) + ' (' + total_minutes + ' minutes)</div>';
    }

    $('#results').html(html);
}

function process_line(line, prev) {
    [prev_from, prev_to] = prev;
    line = line.trim();
    if (line.length === 0) {
        return [prev_from, prev_to, '<div>&nbsp;</div>'];
    }
    const res = line.match(/([0-9]{4})[\s\-–]+([0-9]{4})[\s]*:/);
    if (!is_numeric(line[0]) || res === null || res.length !== 3) {
        return [prev_from, prev_to, '<div><span class="incorrect-format">Incorrect Line Format</span></div>'];
    }
    const from = res[1];
    const to = res[2];
    let return_from = from;
    let return_to = to;
    let val_class = '';
    let validation_message = '';
    let minutes = '';
    if (prev_to !== null && parseInt(from) < parseInt(prev_to)) {
        val_class+= ' incorrect-range ';
        return_from = prev_from;
        return_to = prev_to;
    } else if (parseInt(from) > parseInt(to)) {
        val_class+= ' incorrect-range ';
        validation_message = '`To` must be smaller than `From`';
    } else if (from === to) {
        val_class+= ' incorrect-range from-to-equal ';
        validation_message = '`From` cannot be equal to `To`';
    } else if (!validate_time_format(from) || !validate_time_format(to)) {
        val_class+= ' incorrect-range ';
        validation_message = 'Incorrect hours/minutes format';
    } else {
        val_class+= ' correct ';
        minutes = calculate_minutes(from, to) + ' minute(s)';
    }

    const html = '<div>' +
        '<span class="' + val_class + '">' + from + ' - ' + to + '</span>' +
        '<span class="minutes">' + minutes + '</span>' +
        '<span class="validation-message">' + validation_message + '</span>' +
        '</div>';

    return [
        return_from,
        return_to,
        html
    ];
}

function calculate_minutes(_from, _to) {
    const from = moment()
        .add(_from.substr(0, 2), 'hours')
        .add(_from.substr(2, 2), 'minutes');
    const to = moment()
        .add(_to.substr(0, 2), 'hours')
        .add(_to.substr(2, 2), 'minutes');

    let minutes = to.diff(from, 'minutes');
    total_minutes+= minutes;

    return minutes;
}

function is_numeric(str) {
    return /^\d+$/.test(str);
}

function validate_time_format(str) {
    return str.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3])[0-5][0-9]$/) !== null;
}

function convert_minutes_to_hours_minutes(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;

    return h + ':' + m;
}