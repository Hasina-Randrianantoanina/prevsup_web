// var openedVars = [];
var b_modif_contexte = false;
function testdata(id, name, type) {
    try {
        formData = new FormData();
        formData.append("id", id);
        formData.append("name", name);
        formData.append("type", type);
        $.ajax({
            type: "POST",
            url: "../ChangeValue",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
    
            success: function (result) {
                
            },
    
            error: function (x, e) {
                _alert("Erreur", 'Erreur : (jtree) ' + errorManager(e));
                loading(false);
            }
        });
    } catch(err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
		loading(false);
    }
    
}

function modeliseTable(tree) {
    try {
        var
            $table = $(tree),
            rows = $table.find('tr');

        rows.each(function (index, row) {
            var
                $row = $(row),
                level = $row.data('level'),
                id = $row.data('id'),
                $columnName = $row.find('td[data-column="name"]'),
                child = $row.data('child'),
                children = $table.find('tr[data-parent="' + id + '"]'),
                $span = $columnName.find('span'),
                $is = $columnName.find('i'),
                $div = $columnName.find('div');
            if (child > 0 || id == "EFF") {
                if (!$columnName.hasClass("expandable")) {
                    $columnName.addClass("expandable");
                    $columnName.removeClass("noexpandable");
                }
                if ($span.length == 0 && id != "EFF") {
                    var expander = $div.prepend('' +
                        '<span class="treegrid-expander fa fa-chevron-right"></span>' +
                        '');
                }
                
                children.show();


            }
            else {
                if (!$columnName.hasClass("noexpandable")) {
                    $columnName.addClass("noexpandable");
                    $columnName.removeClass("expandable");
                }
                if ($span.length == 0) {
                    $div.prepend('' +
                        '<span class="gg-corner-down-right"></span>' +
                        '');
                }
            }
            if ($is.length == 0) {
                $div.prepend('' +
                    '<i class="treegrid-indent" style="width:' + 15 * level + 'px"></i>' +
                    '');
            }

        });

        // Reverse hide all elements
        reverseHide = function (table, element) {
            var
                $element = $(element),
                id = $element.data('id'),
                children = table.find('tr[data-parent="' + id + '"]');

            if (children.length) {
                children.each(function (i, e) {
                    reverseHide(table, e);
                });

                $element
                    .find('.fa-chevron-down')
                    .removeClass('fa-chevron-down')
                    .addClass('fa-chevron-right');

                children.hide();
            }
        };
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
    }
}

function getFilters(type, name, id, degre) {
    let filters = localStorage.getItem(`${type}µ${name}µ${id}µ${degre}`);
    if(!filters) filters= {};
    else  filters = JSON.parse(filters);
    if(!filters['parent']) filters.parent = 'J900';

    if(!filters['openVars']) filters['openVars'] = [];

    return filters;
}

function saveFilters(filters, type, name, id, degre) {
    localStorage.setItem(`${type}µ${name}µ${id}µ` + degre, JSON.stringify(filters));
}


function chargedata(e, nametype, type = "", name ="", id = "") {
    try {
        const idFilter = id;
        let degre_filter = $(`[name="radioµ${type}µ${name}µ${idFilter}"]:checked`).val();
        let filters = getFilters(type, name, idFilter, degre_filter);
        
        console.log(`${type}µ${name}µ${idFilter}µ${degre_filter}`);

        var $row = $(e.target).closest('tr'),
            $table = $(e.target).closest('table'),
            level = $row.data('level'),
            id = $row.data('id'),
            $columnName = $row.find('td[data-column="name"]'),
            child = $row.data('child'),
            children = $table.find('tr[data-parent="' + id + '"]'),
            $target = $columnName.find('span');
            $variable = $row.attr('data-id');
            $indexOV = filters['openVars'].indexOf($variable);
        if ($target.hasClass('fa-chevron-right')) {
            if (level == 0 && $indexOV == -1) filters['openVars'].push($variable);
            $target
                .removeClass('fa-chevron-right')
                .addClass('fa-chevron-down');
            children.show();
        }
        else if ($target.hasClass('fa-chevron-down')) {
            if (level == 0 && $indexOV > -1) {
                filters['openVars'].splice($indexOV, 1);
                var icon = $row.find('i');
                if ($(icon).hasClass("fa-minus")) $(icon).removeClass('fa-minus').addClass('fa-plus');
            }
            $target
                .removeClass('fa-chevron-down')
                .addClass('fa-chevron-right');

            reverseHide($table, $row);
        }

        saveFilters(filters, type, name, idFilter, degre_filter);

        if (child > 0 && children.length == 0) {
            loading(true);
            var name = $table.attr("data-name");
            var type = $table.attr("data-type");
            var detail = $table.attr("data-tree");
            var Id = $table.attr("data-id");
            var formData = new FormData();
            formData.append("id", id);
            formData.append("name", Id);
            formData.append("detail", detail);
           
            var degre = $(`[name="radioµ${type}µ${name}µ${Id}"]:checked`).attr("value");
            let filters = localStorage.getItem(`${type}µ${name}µ${Id}µ${degre}`);
            if(!filters) filters = {};
            else filters = JSON.parse(filters);
            let hypoVars = resVars = parent = "";
            if(filters.Hypo) hypoVars = filters.Hypo;
            if(filters.Res) resVars = filters.Res;
            if(filters.parent) parent  = filters.parent;
            formData.append("hypoVars", hypoVars);
            formData.append("resVars", resVars);
            formData.append("child", parent);


            $.ajax({
                type: "POST",
                url: "../../"+type+"/OpenRowChild" + type,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,

                success: function (result) {
                    var datas = JSON.parse(result);
                    var code = '';
                    var env = ($($row).data('level'));
                    env++;
                    if (type == 'Scenario') {

                        $.each(datas.Datas, function (k, v) {
                            code += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-level="${env}" data-child="${v.child}" onclick="active(this, '${nametype}')">
                                <td class="colPlus"></td>
					            <td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${Id}" onclick="goToChart(this,'${type}','${name}','${Id}')" class="checkrow"/></td>
								<td data-column="name"  data-value="${v.Name}" class="sticky-col"><div class="var-container">${v.RealName}</div></td>`;

                            lastval = 0;
                            isFirst = true;

                            var idString = v.Id.toString();
                            idString = idString.split("_")[0];
                            var pourc = "";
                            var isTaux = false;
                            if (idString == "T" || idString == "P") {
                                pourc = "%";
                                isTaux = true;
                            }

                            var isFloat = false;
                            if (idString == "T" || idString == "P" || idString == "ANCINSC" || idString == "ANCBAC") {
                                isFloat = true;
                            }

                            var ChildExist = false;
                            if (v.child == 0) {
                                ChildExist = true;
							}

                            $.each(v.serie, function (b, n) {
                                //var val = parseFloat(n);
                                var val = isTaux ? parseFloat(n) * 100 : parseFloat(n);
                                val = isFloat ? parseFloat(val).toFixed(2) : parseFloat(val).toFixed(0);
                                val = parseFloat(val);
                                if (!isFinite(val)) val = parseFloat(0);
                                diff = ToDifference(val, lastval, isFirst, isFloat);
                                taux = ToTaux(val, lastval, isFirst);

                                if (b < datas.LastYear)
                                    code += `<td class="affichage ${ChildExist ? "constat-Child-back" : "table-constat-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false"  data-source="constat">`;
                                else
                                    if (b > datas.LastYear)
                                        code += `<td class="affichage ${ChildExist ? "scenario-Child-back" : "table-scenario-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="scenario">`;
                                    else
                                        if (datas.LastYear == b)
                                            code += `<td class="affichage table-separator ${ChildExist ? "constat-Child-back" : "table-constat-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="constat">`;

                                switch (affichage[nametype]) {
                                    case "valeur": code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}`; break;
                                    case "difference":
                                        if (isFirst) { code += ""; break; }
                                        code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(2)) : new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(0))}${pourc}`; break;
                                    case "taux":
                                        if (isFirst) { code += ""; break; }
                                        if (taux.includes("∞")) { code += `${taux}`; }
                                        else { code += `${new Intl.NumberFormat("fr-FR").format(parseFloat(taux).toFixed(2))}%`; }
                                        break;
                                    default: code += ""; break;
                                }

                                code += `</td>`
                                lastval = val;
                                isFirst = false;
                            });
                            code += `</tr>`;
                        });
                    } else {
                        //#region UXD
                        $.each(datas.Datas, function (k, v) {
                            code += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-level="${env}" data-child="${v.child}" onclick="active(this, '${nametype}')">
                                <td class="colPlus"></td>
					            <td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${Id}" onclick="goToChart(this,'${type}','${name}','${Id}')" class="checkrow"/></td>
								<td data-column="name"  data-value="${v.Name}" class="sticky-col"><div class="var-container">${v.RealName}</div></td>`;
                            lastval = 0;
                            isFirst = true;

                            var idString = v.Id.toString();
                            idString = idString.split("_")[0];
                            var pourc = "";
                            var isTaux = false;
                            if (idString == "T" || idString == "P") {
                                pourc = "%";
                                isTaux = true;
                            }

                            var isFloat = false;
                            if (idString == "T" || idString == "P" || idString == "ANCINSC" || idString == "ANCBAC") {
                                isFloat = true;
                            }

                            $.each(v.serie, function (b, n) {
                                //var val = parseFloat(n);
                                var val = isTaux ? parseFloat(n) * 100 : parseFloat(n);
                                val = isFloat ? parseFloat(val).toFixed(2) : parseFloat(val).toFixed(0);
                                val = parseFloat(val);
                                if (!isFinite(val)) val = parseFloat(0);
                                diff = ToDifference(val, lastval, isFirst, isFloat);
                                taux = ToTaux(val, lastval, isFirst);

                                code += `<td class="affichage" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false">`;

                                switch (affichage[nametype]) {
                                    case "valeur": code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}`; break;
                                    case "difference":
                                        if (isFirst) { code += ""; break; }
                                        code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(2)) : new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(0))}${pourc}`; break;
                                    case "taux":
                                        if (isFirst) { code += ""; break; }
                                        if (taux.includes("∞")) { code += `${taux}`; }
                                        else { code += `${new Intl.NumberFormat("fr-FR").format(parseFloat(taux).toFixed(2))}%`; }
                                        break;
                                    default: code += ""; break;
                                }

                                code += `</td >`;
                                lastval = val;

                                isFirst = false;
                            });
                            code += `</tr>`;
                        });
                        //#endregion UXD
                    }
                    var newRow = $(code);
                    newRow.insertAfter($row);
                    $($row).addClass("loaded");
                    if (type == "Scenario") modeliseChild($($row), affichage[nametype], datas.hypo);
                    else modeliseChild($($row), affichage[nametype]);
                    loading(false);

                },
                error: function (xhr, e) {
                    _alert("Erreur", 'Erreur : (jtree) ' + errorManager(xhr.responseText));
                    loading(false);
                }
            });
        }
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
    }
}

function modeliseChild(rowz, aff, hypo) {
    try {
        var $rows = $(rowz), $table = $($rows).closest('table');
        var level = $rows.data('level'), id = $rows.data('id'), children = $table.find('tr[data-parent="' + id + '"]');
        level = level + 1;
        children.each(function (index, row) {
            var $tr = $(row);
            $columnName = $tr.find('td[data-column="name"]'),
                child = $tr.data('child'),
                $span = $tr.find('span'),
                $is = $tr.find('i'),
                $div = $tr.find('div');

            if (child > 0) {
                if (!$columnName.hasClass("expandable")) {
                    $columnName.addClass("expandable");
                    $columnName.removeClass("noexpandable");
                }
                if ($span.length == 0) {
                    var expander = $div.prepend('' +
                        '<span class="treegrid-expander fa fa-chevron-right"></span>' +
                        '');
                }
                children.show();


            }
            else {
                //Editable line
                $tr.addClass("bg-child");
                var table = $tr.closest('table');
                var b = $(table).hasClass('noeditable');

                var test = false;
                var isEdit = true;
				var lab = $(row).attr("data-id");
                if (hypo !== null && typeof hypo !== "undefined") {
                    var splt = lab.split("_");
                    lab = "";

                    for (var i = 0; i < splt.length - 2; i++) {
                        if (i == splt.length - 3) lab += splt[i];
                        else lab += splt[i] + "_";
                    }

                    $(hypo).each((k, v) => {
                        if (v.startsWith(lab)) {
                            test = true;
                            return;
                        }
                    });
                    if (!test) isEdit = false;
                }
				// if (lab.substring(0, 5) == "P_ACA") isEdit = true;
                var degre = $(`input.radio-degre:checked`).val();
                if (degre == 'Diplome' && (lab.substring(0, 5) == "EFF_N" || lab.substring(0, 3) == "DIP")) b = true;

                $(row).find("td:not(:nth-child(-n+3))").each(function (k, v) {
                    $('selector').attr('value', 'value');



                    if ($(v).attr('data-source') != "constat") {
                        if (aff == "valeur" && b != true) $(v).attr('contentEditable', 'true');
                        else $(v).attr('contentEditable', 'false');

                        if (!isEdit) $(v).attr('contentEditable', 'false');
                    }
                    v.addEventListener('keydown', function (e) {
                        if (e.keyCode === 13) {
                            $(this).blur();
                            e.preventDefault();
                        }
                    });
                    v.addEventListener("blur", function (e) {
                        var newval = parseFloat($(this).attr('data-newvalue')),
                            oldval = parseFloat($(this).attr('data-value')),

                            $table = $(this).closest('table'),
                            years = $(this).attr('data-column');



                        var tr = $(this).closest('tr');
                        var id = $(tr).attr('data-id');

                        /*$(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()));*/

                        //#region UXD
                        var isFloat = false;
                        if ($(this).attr('data-isFloat') == "true") isFloat = true;
                        else isFloat = false;

                        if (isFloat) newval = parseFloat(newval);
                        else newval = parseFloat(newval).toFixed(0);


                        $(this).attr('data-newvalue', newval);

                        var Toval = ToValeur(newval, isFloat)
                        $(this).attr('data-valeur', Toval);

                        //before
                        prevYears = parseInt(years) - 1;
                        var before = $(tr).find('td[data-column="' + prevYears + '"]');
                        if (before.length > 0) {
                            var lastval = $(before).attr('data-newvalue');
                            $(this).attr('data-difference', ToDifference($(this).attr("data-newvalue"), lastval, false, isFloat));
                            $(this).attr('data-taux', ToTaux($(this).attr("data-newvalue"), lastval, false));
                        }
                        //after
                        nextYears = parseInt(years) + 1;
                        var after = $(tr).find('td[data-column="' + nextYears + '"]');
                        if (after.length > 0) {
                            var nextval = $(after).attr('data-newvalue');
                            $(after).attr('data-difference', ToDifference(nextval, $(this).attr("data-newvalue"), false, isFloat));
                            $(after).attr('data-taux', ToTaux(nextval, $(this).attr("data-newvalue"), false));
                        }


                        newval = parseFloat(newval);

                        if ($(this).attr('data-isTaux') == "true") $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()) + "%");
                        else {
                            if (isFloat) $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()));
                            else $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(0).toString()));
                        }

                        //#endregion

                        $(this).attr('data-state', (newval != oldval));
                        var $ischanged = $(tr).find('td[data-state="true"]');
                        $(tr).attr('data-state', ($ischanged.length > 0));


                        var splt = id.split("_");
                        var deg = splt[splt.length - 3];


                        //calculMere

                        /*
                        if (splt[0] == "T" || splt[0] == "P" || splt[0].startsWith("ANC")) CalcMoy(table, tr, id, years, deg);
                        else CalcSum(tr, id, years);
                        */

                        CalculMere(table, tr, years, newval);
                        
                    });
                    v.addEventListener("focus", function (e) {
                        var val = parseFloat($(this).attr('data-newvalue'));
                        $(this).text(val.toFixed(2));
                    });
                    v.addEventListener('keypress', function (e) {
                        var x = event.charCode || event.keyCode;
                        if (isNaN(String.fromCharCode(e.which)) && (x != 46 && x != 45) || x === 32 || x === 13 || (x === 46 && event.currentTarget.innerText.includes('.')) || (x === 45 && event.currentTarget.innerText.includes('-'))) e.preventDefault();
                    });
                    v.addEventListener('input', (e) => {
                        $(this).attr('data-newvalue', ($(this).text()));
                    });
                    if (!$(v).hasClass('single-line'))
                        $(v).addClass('single-line')
                    if (!$columnName.hasClass("noexpandable")) {
                        $columnName.addClass("noexpandable");
                        $columnName.removeClass("expandable");
                    }
                });


                if ($span.length == 0) {
                    $div.prepend('' +
                        '<span class="gg-corner-down-right"></span>' +
                        '');

                }
            }
            if ($is.length == 0) {
                $div.prepend('' +
                    '<i class="treegrid-indent" style="width:' + 15 * level + 'px"></i>' +
                    '');
            }

        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
    }
 }
function CalcSum(tr, id, years) {
    try {
        var $table = $(tr).closest('table');
        var $row = $(tr).find('td[data-column= "' + years + '"]');
        var parent = $(tr).data('parent');

        while (parent != 'Hypothèses') {
            var res = 0;
            var trp = $table.find('tr[data-id="' + parent + '"]');
            if ($(trp).length == 0) break;
            var tdp = $(trp).find('td[data-column="' + years + '"]');

            //#region UXD
            var count = 0;
            $table.find('tr[data-parent= "' + parent + '"]').each(function (index, row) {
                count++;
                var
                    $row = $(row),
                    $td = $row.find('td[data-column="' + years + '"]');
                res += parseFloat($td.attr('data-newvalue'));
            });

            var isFloat = false;
            if ($(tdp).attr('data-isFloat') == "true") isFloat = true;
            else isFloat = false;


            if (isFloat) res = parseFloat(res);
            else res = parseFloat(res).toFixed(0);

            $(tdp).attr('data-newvalue', res);

            $(tdp).attr('data-valeur', ToValeur(res, isFloat));

            //before
            prevYears = parseInt(years) - 1;
            var before = $(trp).find('td[data-column="' + prevYears + '"]');
            if (before.length > 0) {
                var lastval = $(before).attr('data-newvalue');
                $(tdp).attr('data-difference', ToDifference($(tdp).attr("data-newvalue"), lastval, false, isFloat));
                $(tdp).attr('data-taux', ToTaux($(tdp).attr("data-newvalue"), lastval, false));
            }
            //after
            nextYears = parseInt(years) + 1;
            var after = $(trp).find('td[data-column="' + nextYears + '"]');
            if (after.length > 0) {
                var nextval = $(after).attr('data-newvalue');
                $(after).attr('data-difference', ToDifference(nextval, $(tdp).attr("data-newvalue"), false, isFloat));
                $(after).attr('data-taux', ToTaux(nextval, $(tdp).attr("data-newvalue"), false));
            }

            res = parseFloat(res);

            $(tdp).text(res);
            var newval = parseFloat($(tdp).attr('data-newvalue')),
                oldval = parseFloat($(tdp).attr('data-value'));

            res = new Intl.NumberFormat("fr-FR").format(res.toFixed(2).toString());

            if ($(tdp).attr('data-isTaux') == "true") $(tdp).text(res + "%");
            else $(tdp).text(res);
            //#endregion

            $(tdp).attr('data-state', (newval != oldval));
            var $ischanged = $(trp).find('td[data-state="true"]');
            $(trp).attr('data-state', ($ischanged.length > 0));

            parent = $(trp).data('parent');
        }
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
    }

}

$(document).ajaxStart(function () { 
	loading(true);
	console.log("initialized");
  }); 
  $(document).ajaxStop(function () { 
	loading(false);
	console.log("completed");

  });


function CalculMere(table, tr, years, newval) {
    try {
        //loading(true);

        var formData = new FormData();

        var type = $(table).attr("data-type");
        var name = $(table).attr("data-name");
        var id = $(table).attr("data-id");
        var variable = $(tr).attr("data-id");

        formData.append("id", id);
        formData.append("year", years);
        formData.append("valStr", parseFloat(newval));
        formData.append("variable", variable);
        formData.append("parent", $(tr).attr("data-parent"));

        if (type == "Scenario") {
            formData.append("degre", $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val());

            var bWarnContexte = false;
            
            var deg_last = 0;
            $(`[name="radioµ${type}µ${name}µ${id}"]`).each((k, v) => {
                var num = parseInt($(v).attr("data-num"));
                if (!$(v).is(':disabled')) deg_last = num;
            });
            var deg_modif = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).attr('data-num');
            if (deg_modif < deg_last && !b_modif_contexte) {
                _alert("Contexte calculé", "Modification d'un contexte qui n'est pas le dernier calculé.");
                b_modif_contexte = true;
            }
            $(`[name="radioµ${type}µ${name}µ${id}"]`).each((k, v) => {
                var num = parseInt($(v).attr("data-num"));
                if (num >= deg_modif && !$(v).is(':disabled')) {
                    $(v).closest("div").find("label").addClass("DegreRouge");
                    // if (num > deg_modif) $(v).attr("disabled", "disabled");
                    bWarnContexte = true;
                }
            });
            // if (bWarnContexte) _alert("Contexte calculé", "Modification d'un contexte qui n'est pas le dernier calculé.");

            var newvar = variable.split("_")[0];
            if (newvar == "T" || newvar == "P" || newvar.includes("ANC")) {
                $.ajax({
                    type: "POST",
                    url: "../../"+type+"/CalculMeres" + type,
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    async: true,

                    success: function (result) {
                    },
                    error: function (xhr, e) {
                        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(xhr.responseText));
                        loading(false);
                    }
                }).done(() => {
                    //loading(false);
                })
                return;
            }
        }
        //loading(true);
        $.ajax({
            type: "POST",
            url: "../../"+type+"/CalculMeres" + type,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                var Datas = JSON.parse(result);
				if (Datas.error) {
					_alert("Erreur", Datas.error);
					loading(false);
					return;
				}

                $.each(Datas, (k, v) => {
                    var newtr = $(table).find('tr[data-id="' + v.Variable + '"]');

                    if (typeof newtr === "undefined") return true;
                    var td = $(newtr).find('td[data-column= "' + years + '"]');



                    var isFloat = false;
                    if ($(td).attr('data-isFloat') == "true") isFloat = true;
                    else isFloat = false;

                    var newval = ToValeur(v.Value, isFloat);
                    $(td).attr('data-newvalue', isFloat ? v.Value.toFixed(2) : v.Value);
                    $(td).attr('data-value', newval);

                    var isTaux = false;
                    if ($(td).attr('data-istaux') == "true") isTaux = true;

                    if (isTaux) $(td).text(newval + "%");
                    else $(td).text(newval);

                    prevYears = parseInt(years) - 1;
                    var before = $(newtr).find('td[data-column="' + prevYears + '"]');
                    if (before.length > 0) {
                        var lastval = $(before).attr('data-newvalue');
                        $(td).attr('data-difference', ToDifference($(td).attr("data-newvalue"), lastval, false, isFloat));
                        $(td).attr('data-taux', ToTaux($(td).attr("data-newvalue"), lastval, false));
                    }
                    //after
                    nextYears = parseInt(years) + 1;
                    var after = $(newtr).find('td[data-column="' + nextYears + '"]');
                    if (after.length > 0) {
                        var nextval = $(after).attr('data-newvalue');
                        $(after).attr('data-difference', ToDifference(nextval, $(td).attr("data-newvalue"), false, isFloat));
                        $(after).attr('data-taux', ToTaux(nextval, $(td).attr("data-newvalue"), false));
                    }
                });
                // ARR 03/08/2022 Correction #8450
                /*$(".colCheck :checked").each((k, v) => {
                    v.click();
                    v.click();
                });*/
            },

            error: function (xhr, error) {
                _alert("Erreur", 'Erreur : (jtree) ' + errorManager(xhr.responseText, error));
                loading(false);
            }
        }).always(function(data){
            //loading(false);
        }).done(() => {
            // loading(false);
        });

    } catch(err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
        loading(false);
    }
}
function CalcMoy(table, tr, id, years, deg) {
    try {
        var formData = new FormData();

        formData.append("id", $(table).attr("data-id"));
        formData.append("type", $(table).attr("data-type"));
        formData.append("year", years);
        formData.append("deg", deg);

        var splt = id.split("_");
        if (id[id.length - 2] == "I") formData.append("isI", true);

        loading(true);

        $.ajax({
            type: "POST",
            url: "../CalculMere",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                var Datas = JSON.parse(result);


                var $table = $(tr).closest('table');
                var $row = $(tr).find('td[data-column= "' + years + '"]');
                var parent = $(tr).data('parent');

                while (parent != 'Hypothèses') {
                    var res = 0;
                    var trp = $table.find('tr[data-id="' + parent + '"]');
                    if ($(trp).length == 0) break;
                    var tdp = $(trp).find('td[data-column="' + years + '"]');

                    //#region UXD
                    var count = 0;

                    tr = $table.find('tr[data-id= "' + parent + '"]');
                    var eff = "";

                    $table.find('tr[data-parent= "' + parent + '"]').each(function (index, row) {
                        count++;
                        var $row = $(row);
                        var $td = $row.find('td[data-column="' + years + '"]');
                        var indice = $(row).attr("data-id");
                        indice = indice.split("_");
                        indice = indice[indice.length - 1];

                        eff = Datas.filter(x => x.Variable.includes(indice))[0];

                        if (typeof eff !== "undefined") res += parseFloat(parseFloat($td.attr('data-newvalue')) * parseFloat(eff.Value));
                    });

                    indice = parent.split("_");
                    indice = indice[indice.length - 1];
                    eff = Datas.filter(x => x.Variable.includes(indice))[0];

                    if (typeof eff !== "undefined") res = parseFloat(res / parseFloat(eff.Value));
                    else res = parseFloat(0);

                    if (res.toString() == "NaN") res = parseFloat(0);

                    var isFloat = false;
                    if ($(tdp).attr('data-isFloat') == "true") isFloat = true;
                    else isFloat = false;


                    if (isFloat) res = parseFloat(res);
                    else res = parseFloat(res).toFixed(0);

                    $(tdp).attr('data-newvalue', res);

                    $(tdp).attr('data-valeur', ToValeur(res, isFloat));

                    //before
                    prevYears = parseInt(years) - 1;
                    var before = $(trp).find('td[data-column="' + prevYears + '"]');
                    if (before.length > 0) {
                        var lastval = $(before).attr('data-newvalue');
                        $(tdp).attr('data-difference', ToDifference($(tdp).attr("data-newvalue"), lastval, false, isFloat));
                        $(tdp).attr('data-taux', ToTaux($(tdp).attr("data-newvalue"), lastval, false));
                    }
                    //after
                    nextYears = parseInt(years) + 1;
                    var after = $(trp).find('td[data-column="' + nextYears + '"]');
                    if (after.length > 0) {
                        var nextval = $(after).attr('data-newvalue');
                        $(after).attr('data-difference', ToDifference(nextval, $(tdp).attr("data-newvalue"), false, isFloat));
                        $(after).attr('data-taux', ToTaux(nextval, $(tdp).attr("data-newvalue"), false));
                    }

                    res = parseFloat(res);

                    $(tdp).text(res);
                    var newval = parseFloat($(tdp).attr('data-newvalue')),
                        oldval = parseFloat($(tdp).attr('data-value'));

                    res = new Intl.NumberFormat("fr-FR").format(res.toFixed(2).toString());

                    if ($(tdp).attr('data-isTaux') == "true") $(tdp).text(res + "%");
                    else $(tdp).text(res);
                    //#endregion

                    $(tdp).attr('data-state', (newval != oldval));
                    var $ischanged = $(trp).find('td[data-state="true"]');
                    $(trp).attr('data-state', ($ischanged.length > 0));

                    parent = $(trp).data('parent');
                }
                loading(false);
            },

            error: function (xhr, e) {
                _alert("Erreur", 'Erreur : (jtree) ' + errorManager(xhr.responseText));
                loading(false);
            }
        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
        loading(false);
    }
}

function deplier(e, idm, idType, type, nametype, name= "") {
    var icon = $(e).find('i');

    let degre = $(`[name="radioµ${type}µ${name}µ${idType}"]:checked`).val();
    let filters = getFilters(type, name, idType, degre);

    const $indexOV = filters['openVars'].indexOf(idm);
    if ($(icon).hasClass("fa-plus")) {
        if ($indexOV == -1) filters['openVars'].push(idm);
        $(icon).removeClass('fa-plus').addClass('fa-minus');
        if ($(e).attr('data-unfold') == "false") {
            $(e).attr('data-unfold', "true");
            doUnfold(e, idm, idType, type, nametype);
        } else {
            reUnfold(e, idm);
		}
    }
    else if ($(icon).hasClass("fa-minus")) {
        if ($indexOV > -1) filters['openVars'].splice($indexOV, 1);

        var tr = $(e).closest('tr');
        var td = $(tr).find('td[data-column="name"]');

        var $row = $(e).closest('tr');
        $columnName = $row.find('td[data-column="name"]'),
            $target = $columnName.find('span');

        if ($target.hasClass('fa-chevron-down')) {
            $(td).click();
        }

        $(icon).removeClass('fa-minus').addClass('fa-plus');
    }
    saveFilters(filters, type, name, idType, degre);
}
function reUnfold(e, idm, nametype) {
    var $row = $(e).closest('tr');
    var $table = $(e).closest('table');
    var Id = $table.data('id');
    var ji = $row.data('ji');
    var level = $row.data('level');
    $columnName = $row.find('td[data-column="name"]'),
        $target = $columnName.find('span');

    if ($target.hasClass('fa-chevron-right')) {
        $target
            .removeClass('fa-chevron-right')
            .addClass('fa-chevron-down');
    }

    var spl = idm.split('_');
    var variable = "";
    for (var i = 0; i < spl.length - 1; i++) {
        variable += spl[i] + "_";
    }

    var list = $table.find(`tr[data-parent^=${variable}][data-ji=${ji}]`);
    list.each(function (k, v) {
        ChangeIcoTree(v, ji);
    });

}
function ChangeIcoTree(row, ji) {
    $columnName = $(row).find('td[data-column="name"]'),
        $target = $columnName.find('span');

    if ($target.hasClass('fa-chevron-right')) {
        $target
            .removeClass('fa-chevron-right')
            .addClass('fa-chevron-down');
    }

    $(row).show();
}

function removeChildren(idm) {
    let children = $(`tr[data-parent='${idm}']`);
        
    $.each(children, function(i, value) {
        removeChildren($(value).attr("data-id"));
    });
    children.remove();
}

function doUnfold(e, idm, idType, type, nametype) {
    var formData = new FormData();

    var $row = $(e).closest('tr');
    var $table = $(e).closest('table');
    var name = $table.attr("data-name");
    var Id = $table.data('id');
    var level = $row.data('level');
    $columnName = $row.find('td[data-column="name"]'),
        $target = $columnName.find('span');

    if ($target.hasClass('fa-chevron-right')) {
        $target
            .removeClass('fa-chevron-right')
            .addClass('fa-chevron-down');
    }

    loading(true);
    formData.append("id", idm);
    formData.append("name", idType);
    formData.append("detail", $table.attr("data-tree"));
    $.ajax({
        type: "POST",
        url: "../../"+type+"/Depliage" + type,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            var datas = JSON.parse(result);

            // Kaky - 15/06/2022 - Pour éviter les doublons dans les child de chaque élément parent
            removeChildren(idm);

            var code = ``;

            if (type == "Constat") {
                var cc = 0;
                var nbVars = datas.Datas.length;
                $.each(datas.Datas, function (k, v) {
                    var ji = v.Parent.indexOf('JI') > 0 ? 1 : 0;
                    cc++; if (ji == 0 && cc > nbVars) return;
                    if ($table.find(`tr[data-id="${v.Id}"][data-ji="${ji}"]`).length > 0) {
                        $row = $table.find(`tr[data-id="${v.Id}"][data-ji="${ji}"]`);
                        $columnName = $row.find('td[data-column="name"]'),
                            $target = $columnName.find('span');

                        if ($target.hasClass('fa-chevron-right')) {
                            $target
                                .removeClass('fa-chevron-right')
                                .addClass('fa-chevron-down');
                        }
                        return;
                    }

                    code = ``;

                    code += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-ji="${ji}" data-level="${level}" data-child="${v.child}" onclick="active(this, '${nametype}')">
                                <td class="colPlus"></td>
					            <td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${Id}" onclick="goToChart(this,'${type}','${name}','${Id}')" class="checkrow"/></td>
								<td data-column="name"  data-value="${v.Name}" class="sticky-col"><div class="var-container">${v.RealName}</div></td>`;
                    lastval = 0;
                    isFirst = true;

                    var idString = v.Id.toString();
                    idString = idString.split("_")[0];
                    var pourc = "";
                    var isTaux = false;
                    if (idString == "T" || idString == "P") {
                        pourc = "%";
                        isTaux = true;
                    }

                    var isFloat = false;
                    if (idString == "T" || idString == "P" || idString == "ANCINSC" || idString == "ANCBAC") {
                        isFloat = true;
                    }

                    $.each(v.serie, function (b, n) {
                        //var val = parseFloat(n);
                        var val = isTaux ? parseFloat(n) * 100 : parseFloat(n);
                        val = isFloat ? parseFloat(val).toFixed(2) : parseFloat(val).toFixed(0);
                        val = parseFloat(val);
                        if (!isFinite(val)) val = parseFloat(0);
                        diff = ToDifference(val, lastval, isFirst, isFloat);
                        taux = ToTaux(val, lastval, isFirst);

                        code += `<td class="affichage" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false">`;

                        switch (affichage[nametype]) {
                            case "valeur": code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}`; break;
                            case "difference":
                                if (isFirst) { code += ""; break; }
                                code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(2)) : new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(0))}${pourc}`; break;
                            case "taux":
                                if (isFirst) { code += ""; break; }
                                if (taux.includes("∞")) { code += `${taux}`; }
                                else { code += `${new Intl.NumberFormat("fr-FR").format(parseFloat(taux).toFixed(2))}%`; }
                                break;
                            default: code += ""; break;
                        }

                        code += `</td >`;
                        lastval = val;

                        isFirst = false;
                    });

                    code += `</tr>`;

                    $(code).insertAfter($row);
                    $row = $table.find(`tr[data-id="${v.Id}"][data-ji="${ji}"]`);
                });
            } else {
                var cc = 0;
                var nbVars = datas.Datas.length;
                // console.log(datas.Datas[0].Id + " " + datas.Datas.length);
                $.each(datas.Datas, function (k, v) {
                    var ji = v.Parent.indexOf('JI') > 0 ? 1 : 0;
                    cc++; if (ji == 0 && cc > nbVars) return;
                    // if (cc > nbVars) console.log('>>' + cc + ' ' + v.Id + ' ' + v.Parent);
                    if ($table.find(`tr[data-id="${v.Id}"][data-ji="${ji}"]`).length > 0) {
                        $row = $table.find(`tr[data-id="${v.Id}"][data-ji="${ji}"]`);
                        $columnName = $row.find('td[data-column="name"]'),
                            $target = $columnName.find('span');

                        if ($target.hasClass('fa-chevron-right')) {
                            $target
                                .removeClass('fa-chevron-right')
                                .addClass('fa-chevron-down');
                        }
                        return;
                    }

                    code = ``;
                    code += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-ji="${ji}" data-level="${level}" data-child="${v.child}" onclick="active(this, '${nametype}')">
                                <td class="colPlus"></td>
					            <td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${Id}" onclick="goToChart(this,'${type}','${name}','${Id}')" class="checkrow"/></td>
								<td data-column="name"  data-value="${v.Name}" class="sticky-col"><div class="var-container">${v.RealName}</div></td>`;

                    lastval = 0;
                    isFirst = true;

                    var idString = v.Id.toString();
                    idString = idString.split("_")[0];
                    var pourc = "";
                    var isTaux = false;
                    if (idString == "T" || idString == "P") {
                        pourc = "%";
                        isTaux = true;
                    }

                    var isFloat = false;
                    if (idString == "T" || idString == "P" || idString == "ANCINSC" || idString == "ANCBAC") {
                        isFloat = true;
                    }

                    var ChildExist = false;
                    if (v.child == 0) {
                        ChildExist = true;
                    }

                    $.each(v.serie, function (b, n) {
                        //var val = parseFloat(n);
                        var val = isTaux ? parseFloat(n) * 100 : parseFloat(n);
                        val = isFloat ? parseFloat(val).toFixed(2) : parseFloat(val).toFixed(0);
                        val = parseFloat(val);
                        if (!isFinite(val)) val = parseFloat(0);
                        diff = ToDifference(val, lastval, isFirst, isFloat);
                        taux = ToTaux(val, lastval, isFirst);

                        if (b < datas.LastYear)
                            code += `<td class="affichage" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false"  data-source="constat">`;
                        else
                            if (b > datas.LastYear)
                                code += `<td class="affichage ${ChildExist ? "scenario-Child-back" : "table-scenario-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="scenario">`;
                            else
                                if (datas.LastYear == b)
                                    code += `<td class="affichage table-separator" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="constat">`;

                        switch (affichage[nametype]) {
                            case "valeur": code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}`; break;
                            case "difference":
                                if (isFirst) { code += ""; break; }
                                code += `${isFloat ? new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(2)) : new Intl.NumberFormat("fr-FR").format(parseFloat(diff).toFixed(0))}${pourc}`; break;
                            case "taux":
                                if (isFirst) { code += ""; break; }
                                if (taux.includes("∞")) { code += `${taux}`; }
                                else { code += `${new Intl.NumberFormat("fr-FR").format(parseFloat(taux).toFixed(2))}%`; }
                                break;
                            default: code += ""; break;
                        }

                        code += `</td>`
                        lastval = val;
                        isFirst = false;
                    });
                    code += `</tr>`;

                    $(code).insertAfter($row);
                    $row = $table.find(`tr[data-id="${v.Id}"][data-ji="${ji}"]`);
                });
            }

            var spl = idm.split('_');
            var variable = "";
            for (var i = 0; i < spl.length - 1; i++) {
                variable += spl[i] + "_";
            }
            if (variable == "EFF_TOT_") variable = "EFF_";
            
            // INFO: Ajout des variables équivalentes
            let arrVarEquivalence = {
                "DIP_LP_N3_" : "LICPRO_N3_J_",
                "DIP_LI_N3_" : "LICENCE_N3_J_",
                "DIP_M_N6_J_": "MASTER_N6_J_",
                "DIP_D_N6_J_": "DOC_N6_J_",
                "DIP_M_N5_J_": "MASTER_N5_J_",
            };
            let varEquiv = arrVarEquivalence[variable];
            var list = null;
            if(varEquiv) list = $table.find(`tr[data-id^=${variable}], tr[data-id^=${varEquiv}]`);
            else list = $table.find(`tr[data-id^=${variable}]`);;

            if (type == "Scenario") {
                list.each(function (k, v) {
                    ChildTree(v, affichage[nametype], datas.hypo);
                });
            }
            else {
                list.each(function (k, v) {
                    ChildTree(v, affichage[nametype])
                });
            }
        },

        error: function (xhr, e) {
            _alert("Erreur", 'Erreur : (jtree) ' + errorManager(xhr.responseText));
            loading(false);
        }
    }).done(() => {
        loading(false);
    });
}
function ChildTree(rowz, aff, hypo) {
    try {
        var $rows = $(rowz), $table = $($rows).closest('table');
        var level = $rows.data('level'), id = $rows.data('id'), children = $table.find('tr[data-parent="' + id + '"]');
        level = level + 1;
        children.each(function (index, row) {
            var $tr = $(row);
            $tr.data('level', level);
            $columnName = $tr.find('td[data-column="name"]'),
                child = $tr.data('child'),
                $span = $tr.find('span'),
                $is = $tr.find('i'),
                $div = $tr.find('div');

            if (child > 0) {
                if (!$columnName.hasClass("expandable")) {
                    $columnName.addClass("expandable");
                    $columnName.removeClass("noexpandable");
                }
                if ($span.length == 0) {
                    var expander = $div.prepend('' +
                        '<span class="treegrid-expander fa fa-chevron-down"></span>' +
                        '');
                }
                children.show();


            }
            else {
                $tr.addClass("bg-child");
                var table = $tr.closest('table');
                var b = $(table).hasClass('noeditable');

                var test = false;
                var isEdit = true;
                if (hypo !== null && typeof hypo !== "undefined") {
                    var lab = $tr.attr("data-id");
                    var splt = lab.split("_");
                    var newlab = ""

                    for (var i = 0; i < splt.length - 2; i++) {
                        if (i == splt.length - 3) newlab += splt[i];
                        else newlab += splt[i] + "_";
                    }

                    $(hypo).each((k, v) => {
                        if (v.startsWith(newlab)) {
                            test = true;
                            return;
                        }
                    });
                    if (!test) isEdit = false;
                }
                var degre = $(`input.radio-degre:checked`).val();
                if (degre == 'Diplome' && (lab.substring(0, 5) == "EFF_N" || lab.substring(0, 3) == "DIP")) b = true;

                var type = $(row).closest("div.onglet").attr('type');
                $(row).find("td:not(:nth-child(-n+3))").each(function (k, v) {
                    $('selector').attr('value', 'value');

                    var editable = true;
                    if (type == "Constat") {
                        var lab = $tr.attr("data-id");
                        editable = !(lab.startsWith("T_") || lab.startsWith("P_")); //|| lab.startsWith("ANC"));
                    }
                    if (type == "Scenario") {
                        editable = $(v).attr('data-source') != "constat";
                    }
                    if (editable) {
                        if (aff == "valeur" && b != true) $(v).attr('contentEditable', 'true');
                        else $(v).attr('contentEditable', 'false');

                        if (!isEdit) $(v).attr('contentEditable', 'false');
                    }
                    v.addEventListener('keydown', function (e) {
                        if (e.keyCode === 13) {
                            $(this).blur();
                            e.preventDefault();
                        }
                    });
                    v.addEventListener("blur", function (e) {
                        var newval = parseFloat($(this).attr('data-newvalue')),
                            oldval = parseFloat($(this).attr('data-value')),

                            $table = $(this).closest('table'),
                            years = $(this).attr('data-column');


                        var tr = $(this).closest('tr');
                        var id = $(tr).attr('data-id');


                        //#region UXD
                        var isFloat = false;
                        if ($(this).attr('data-isFloat') == "true") isFloat = true;
                        else isFloat = false;

                        if (isFloat) newval = parseFloat(newval);
                        else newval = parseFloat(newval).toFixed(0);


                        $(this).attr('data-newvalue', newval);

                        var Toval = ToValeur(newval, isFloat)
                        $(this).attr('data-valeur', Toval);

                        //before
                        prevYears = parseInt(years) - 1;
                        var before = $(tr).find('td[data-column="' + prevYears + '"]');
                        if (before.length > 0) {
                            var lastval = $(before).attr('data-newvalue');
                            $(this).attr('data-difference', ToDifference($(this).attr("data-newvalue"), lastval, false, isFloat));
                            $(this).attr('data-taux', ToTaux($(this).attr("data-newvalue"), lastval, false));
                        }
                        //after
                        nextYears = parseInt(years) + 1;
                        var after = $(tr).find('td[data-column="' + nextYears + '"]');
                        if (after.length > 0) {
                            var nextval = $(after).attr('data-newvalue');
                            $(after).attr('data-difference', ToDifference(nextval, $(this).attr("data-newvalue"), false, isFloat));
                            $(after).attr('data-taux', ToTaux(nextval, $(this).attr("data-newvalue"), false));
                        }


                        newval = parseFloat(newval);

                        if ($(this).attr('data-isTaux') == "true") $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()) + "%");
                        else {
                            if (isFloat) $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()));
                            else $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(0).toString()));
                        }

                        //#endregion

                        $(this).attr('data-state', (newval != oldval));
                        var $ischanged = $(tr).find('td[data-state="true"]');
                        $(tr).attr('data-state', ($ischanged.length > 0));


                        var splt = id.split("_");
                        var deg = splt[splt.length - 3];


                        //calculMere
                        CalculMere(table, tr, years, newval);
                        
                        $(".colCheck :checked").each((k, v) => {
                            v.click();
                            v.click();
                        });

                    });
                    v.addEventListener("focus", function (e) {
                        var val = parseFloat($(this).attr('data-newvalue'));
                        $(this).text(val.toFixed(2));
                    });
                    v.addEventListener('keypress', function (e) {
                        var x = event.charCode || event.keyCode;
                        if (isNaN(String.fromCharCode(e.which)) && (x != 46 && x != 45) || x === 32 || x === 13 || (x === 46 && event.currentTarget.innerText.includes('.')) || (x === 45 && event.currentTarget.innerText.includes('-'))) e.preventDefault();
                    });
                    v.addEventListener('input', (e) => {
                        $(this).attr('data-newvalue', ($(this).text()));
                    });
                    if (!$(v).hasClass('single-line'))
                        $(v).addClass('single-line')
                    if (!$columnName.hasClass("noexpandable")) {
                        $columnName.addClass("noexpandable");
                        $columnName.removeClass("expandable");
                    }
                });


                if ($span.length == 0) {
                    $div.prepend('' +
                        '<span class="gg-corner-down-right"></span>' +
                        '');

                }
            }
            if ($is.length == 0) {
                $div.prepend('' +
                    '<i class="treegrid-indent" style="width:' + 15 * level + 'px"></i>' +
                    '');
            }

        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
    }
}

function modeliseFilter(rowz, aff, hypo) {
    try {
        var $rows = $(rowz), $table = $($rows).closest('table');
        var level = $rows.data('level'), id = $rows.data('id'), children = $table.find('tr[data-parent="' + id + '"]');
        level = level + 1;

        var $tr = $rows;
        $columnName = $tr.find('td[data-column="name"]'),
            child = $tr.data('child'),
            $span = $tr.find('span'),
            $is = $tr.find('i'),
            $div = $tr.find('div');
        var isEff = $columnName.attr("data-value") == "EFF";
        if (child > 0 || isEff) {
            if (!$columnName.hasClass("expandable")) {
                $columnName.addClass("expandable");
                $columnName.removeClass("noexpandable");
            }
            if ($span.length == 0 && !isEff) {
                var expander = $div.prepend('' +
                    '<span class="treegrid-expander fa fa-chevron-right"></span>' +
                    '');
            }
            children.show();


        }
        else {
            //Editable line
            $tr.addClass("bg-child");
            var table = $tr.closest('table');
            var b = $(table).hasClass('noeditable');

            var test = false;
            var isEdit = true;
			var lab = $rows.attr("data-id");
            if (hypo !== null && typeof hypo !== "undefined") {
                var splt = lab.split("_");
                lab = "";

                for (var i = 0; i < splt.length - 2; i++) {
                    if (i == splt.length - 3) lab += splt[i];
                    else lab += splt[i] + "_";
                }

                $(hypo).each((k, v) => {
                    if (v.startsWith(lab)) {
                        test = true;
                        return;
                    }
                });
                if (!test) isEdit = false;
            }
			// if (lab == "EFF") isEdit = false;
            var degre = $(`input.radio-degre:checked`).val();
            if (degre == 'Diplome' && (lab.substring(0, 5) == "EFF_N" || lab.substring(0, 3) == "DIP")) b = true;

            $rows.find("td:not(:nth-child(-n+3))").each(function (k, v) {
                $('selector').attr('value', 'value');



                if ($(v).attr('data-source') != "constat") {
                    if (aff == "valeur" && b != true) $(v).attr('contentEditable', 'true');
                    else $(v).attr('contentEditable', 'false');

                    if (!isEdit) $(v).attr('contentEditable', 'false');
                    else $(v).attr('contentEditable', 'true');
                }
                v.addEventListener('keydown', function (e) {
                    if (e.keyCode === 13) {
                        $(this).blur();
                        e.preventDefault();
                    }
                });
                v.addEventListener("blur", function (e) {
                    var newval = parseFloat($(this).attr('data-newvalue')),
                        oldval = parseFloat($(this).attr('data-value')),

                        $table = $(this).closest('table'),
                        years = $(this).attr('data-column');



                    var tr = $(this).closest('tr');
                    var id = $(tr).attr('data-id');

                    /*$(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()));*/

                    //#region UXD
                    var isFloat = false;
                    if ($(this).attr('data-isFloat') == "true") isFloat = true;
                    else isFloat = false;

                    if (isFloat) newval = parseFloat(newval);
                    else newval = parseFloat(newval).toFixed(0);


                    $(this).attr('data-newvalue', newval);

                    var Toval = ToValeur(newval, isFloat)
                    $(this).attr('data-valeur', Toval);

                    //before
                    prevYears = parseInt(years) - 1;
                    var before = $(tr).find('td[data-column="' + prevYears + '"]');
                    if (before.length > 0) {
                        var lastval = $(before).attr('data-newvalue');
                        $(this).attr('data-difference', ToDifference($(this).attr("data-newvalue"), lastval, false, isFloat));
                        $(this).attr('data-taux', ToTaux($(this).attr("data-newvalue"), lastval, false));
                    }
                    //after
                    nextYears = parseInt(years) + 1;
                    var after = $(tr).find('td[data-column="' + nextYears + '"]');
                    if (after.length > 0) {
                        var nextval = $(after).attr('data-newvalue');
                        $(after).attr('data-difference', ToDifference(nextval, $(this).attr("data-newvalue"), false, isFloat));
                        $(after).attr('data-taux', ToTaux(nextval, $(this).attr("data-newvalue"), false));
                    }


                    newval = parseFloat(newval);

                    if ($(this).attr('data-isTaux') == "true") $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()) + "%");
                    else {
                        if (isFloat) $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(2).toString()));
                        else $(this).text(new Intl.NumberFormat("fr-FR").format(newval.toFixed(0).toString()));
                    }

                    //#endregion

                    $(this).attr('data-state', (newval != oldval));
                    var $ischanged = $(tr).find('td[data-state="true"]');
                    $(tr).attr('data-state', ($ischanged.length > 0));


                    var splt = id.split("_");
                    var deg = splt[splt.length - 3];


                    //calculMere

                    /*
                    if (splt[0] == "T" || splt[0] == "P" || splt[0].startsWith("ANC")) CalcMoy(table, tr, id, years, deg);
                    else CalcSum(tr, id, years);
                    */

                    CalculMere(table, tr, years, newval);


                });
                v.addEventListener("focus", function (e) {
                    var val = parseFloat($(this).attr('data-newvalue'));
                    $(this).text(val.toFixed(2));
                });
                v.addEventListener('keypress', function (e) {
                    var x = event.charCode || event.keyCode;
                    if (isNaN(String.fromCharCode(e.which)) && (x != 46 && x != 45) || x === 32 || x === 13 || (x === 46 && event.currentTarget.innerText.includes('.')) || (x === 45 && event.currentTarget.innerText.includes('-'))) e.preventDefault();
                });
                v.addEventListener('input', (e) => {
                    $(this).attr('data-newvalue', ($(this).text()));
                });
                if (!$(v).hasClass('single-line'))
                    $(v).addClass('single-line')
                if (!$columnName.hasClass("noexpandable")) {
                    $columnName.addClass("noexpandable");
                    $columnName.removeClass("expandable");
                }
            });


            if ($span.length == 0) {
                $div.prepend('' +
                    '<span class="gg-corner-down-right"></span>' +
                    '');

            }
        }
        if ($is.length == 0) {
            $div.prepend('' +
                '<i class="treegrid-indent" style="width:' + 15 * level + 'px"></i>' +
                '');
        }
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (jtree) ' + errorManager(err));
    }
}
