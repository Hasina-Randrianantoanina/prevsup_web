var _listVars, _id, _name, _type;
function getExportVars(data) {
    _listVars = [];
    if (data.hasOwnProperty('Datas')) {
        $(data.Datas).each((k, v) => { _listVars.push(v.RealName); });
    } else {
        $(data.scen1).each((k, v) => { _listVars.push(v.RealName); });
        $(data.scen2).each((k, v) => { _listVars.push(v.RealName); });
    }
}
function loadExport(id, name, type) {
    _id = id; _name = name, _type = type;
    /*code = ""; idx = 0;
    $(_listVars).each((k, v) => {
        idi = "cb-"+(idx++);
    code += `<input type="checkbox" id="${idi}" name="exp_var[]" value="${v}"/><label for="${idi}">${v}</label><br/>`;
    });
    $('#exportVars').html(code);*/
    // Export();
}

function export_vars_check_all() {
    $('#exportVars input[type=checkbox]').prop('checked', true);
}

function export_vars_uncheck_all() {
    $('#exportVars input[type=checkbox]').prop('checked', false);
}
