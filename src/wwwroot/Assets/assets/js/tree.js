var affichage = new Array();
var lastClick = new Array();
var ListConstat = {}; var ListScenario = {};
var TreeConstat = {}; var TreeScenario = {};
var TreeConstat1 = {}; var TreeScenario1 = {};
function VerificationCoherence(id, name, type) {
	try {
		var formData = new FormData();
		formData.append("id", id);
		formData.append("degre", $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val());
		loading(true);

		$.ajax({
			type: "POST",
			url: "../Scenario/VerificationCoherence",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,

			success: function (result) {

				var Datas = JSON.parse(result);
				if (Datas.hasOwnProperty('Error')) {
					$.alert({
						icon: 'fa fa-warning',
						title: 'Prevsup web',
						content: Datas.msg,
						escapeKey: 'cancel',

					});
					loading(false);
					return;
				}
				$(`#modalcontentµ${type}µ${name}µ${id}`).text("");
				var text = '<div class="row><div class="col-12">';
				if (Datas != null) {
					text += '<ul class="list-group list-group-flush">'
					$.each(Datas, (k, v) => {
						text += '<li class="list-group-item">' + v + '</li>';
					});
					text += '</ul></div></div>';
				} else {
					text += '<p>Le scenario est cohérent</p></div></div>';
				}
				loading(false);
				$(`#modalcontentµ${type}µ${name}µ${id}`).append(text);
				$(`#modalµ${type}µ${name}µ${id}`).modal('show');

			},
			error: function (x, e) {
				_alert("Erreur", 'Erreur : (tree) ' + errorManager(e));
				loading(false);
			}
		});
	} catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}


}

function ChangeDeg(id, name, type, degre) {
	try {
		// console.log('click degre' +degre+"."+id+"."+name+"."+type)
		// ProprieteVariable(variable, nametype, label, i, j, deg, indice, checked);
		ProprieteVariable(null, name+'µ'+type, null, null, null, null, null, false);
        goToChart(null, type, name, id);
		var formData = new FormData();
		formData.append("id", id);
		formData.append("degre", degre);
		loading(true);
		$.ajax({
			type: "POST",
			url: "../../Scenario/ChangeDegre",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			timeout: 300000,

			success: function (result) {
				var Datas = JSON.parse(result);

				if (Datas.hasOwnProperty('Error')) {
					$.alert({
						icon: 'fa fa-warning',
						title: 'Prevsup web',
						content: Datas.msg,
						escapeKey: 'cancel',
					});
					loading(false);
					return;
				}
				else if (type == "Scenario") {
					// console.log(Datas);
					
                    getExportVars(Datas);
					CreateTreeScenario(id, name, type, "", Datas, false);
					$.each(Datas.YearsCount, (k, v) => {
						if (Datas.LastYear >= k)
							$(`#list-anneeµ${type}µ${name}µ${id}`).append(`<option value="${v}">${v}</option>`);
					});
					
				}
				ongletActive(`${type}µ${name}µ${id}`);

				var fil = $(`#filiereµ${type}µ${name}µ${id}`).find("div.selected");
				if (fil.length > 0) {
					fil.removeClass("selected");
				}
				$(`#filiereµ${type}µ${name}µ${id}`).find("div").first().addClass("selected");



			},
			error: function (xhr, error) {
				_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr, error));
				loading(false);
			}
		}).done(() => {
			loading(false);
			// INFO: Apply filters
			if (type == "Scenario") {
				var filters = localStorage.getItem(`${type}µ${name}µ${id}µ${degre}`);
				if(!filters) filters= {};
				else  filters = JSON.parse(filters);
                
				// Apply filiere
                apply_filiere(type, name, id, filters.parent, false);
				// Apply Hypo and Res filter
                apply_hyp_res(type, name, id, filters['Hypo'], filters['Res']);
			}
		})
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		loading(false);
	}
}

function apply_filiere(type, name, id, parent, shouldOpen= true) {
    if(parent) {
        $divp=$(`#filiereµ${type}µ${name}µ${id}`);
        $divp.find('div.selected').removeClass('selected')
        $(`#filiereµ${type}µ${name}µ${id} [data-value="${parent}"]`).addClass('selected');
        GetFirstFiliereTree(id, name, type, '', false, '', parent, shouldOpen);
    }
}

function apply_hyp_res(type, name, id, hyp, res) {
    if(hyp) {
        filterScenario(`${id}`, `${name}`, `${type}`, hyp, 'H');
        $(`#menuHypµ${type}µ${name}µ${id}`).css({ "left": "-250px" });
    }
    if(res) {
        filterScenario(`${id}`, `${name}`, `${type}`, res, 'V');
        $(`#menuResµ${type}µ${name}µ${id}`).css({ "left": "-250px" });
    }
}

//filtre hypothese et resultat, TODO: This is a copy from Constat.js
function filterScenario(id, name, type, label, tree) {
	if (label == "Tous") {
		$(`#tree${tree}-${name}µ${type}`).find(`tr`).each((k, v) => {
			if (v.classList.contains("filterHide")) v.classList.remove("filterHide");
		});
	} else {
		if(label) {
			let lastUnderscore = label.lastIndexOf("_");
			label = label.split("").splice(0,lastUnderscore).join("");
		}
		$(`#tree${tree}-${name}µ${type}`).find(`tr[data-name^="${label}"]`).each((k, v) => {
			if (v.classList.contains("filterHide")) v.classList.remove("filterHide");
		});
		$(`#tree${tree}-${name}µ${type}`).find(`tr:not([data-name^="${label}"])`).each((k, v) => {
			if (!v.classList.contains("years")) if (!v.classList.contains("filterHide")) v.classList.add("filterHide");
		});
	}
}



function ReopenVariables(type, name, id) {
	console.log("reopen");
	let degre = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val();
	let filters = getFilters(type, name, id, degre);
    $.each(filters['openVars'], (k, v) => {
        var xtr = $(`tr[data-id^="${v}"] td:first-child`);
        if (xtr.length > 0) xtr[0].click();
	});
}

function CalculContexte(id, name, type) {
	
	//loading(true);
	try {
		var formData = new FormData();
		formData.append("id", id);
		formData.append("degre", $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val());

		nextnum = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).attr("data-num");
		nextnum = parseInt(nextnum) + 1;

        /*var table = $(`#treeH-${name}µ${type}`),
        tr = table.find('tr');
        let lastConstat = parseInt($(tr).find('td.table-separator').first().attr("data-column"));
        while ($(`.list-anneeµ${type}µ${name}µ${id} ul.dual-listbox__selected li:contains("${lastConstat}")`).length) {

            lastConstat = lastConstat - 1;
        }
        formData.append("vcopie", lastConstat);*/
		formData.append("newdeg", nextnum);
		$.ajax({
			type: "POST",
			url: "../../Scenario/CalculContexte",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			timeout: 300000,

			success: function (result) {
                b_modif_contexte = false;
				var Datas = JSON.parse(result);

				if (Datas.hasOwnProperty('Error')) {
					$.alert({
						icon: 'fa fa-warning',
						title: 'Prevsup web',
						content: Datas.msg,
						escapeKey: 'cancel',

					});
					loading(false);
					return;
				}
				else if (type == "Scenario") {
					//CreateTreeScenario(id, name, type, "", Datas);
					$.each(Datas.YearsCount, (k, v) => {
						if (Datas.LastYear >= k)
							$(`#list-anneeµ${type}µ${name}µ${id}`).append(`<option value="${v}">${v}</option>`);
					});
					/*
					var dlb1 = new DualListbox(`.select1µ${type}µ${name}µ${id}`, {
						availableTitle: '',
						selectedTitle: '',
						addButtonText: '<i class="fa fa-chevron-right"></i>',
						removeButtonText: '<i class="fa fa-chevron-left"></i>',
						addAllButtonText: '<i class="fa fa-angle-double-right"></i>',
						removeAllButtonText: '<i class="fas fa-angle-double-left"></i>',
						searchPlaceholder: 'Rechercher...'
					});*/
					formuleChange(id, name, type);
				}
				ongletActive(`${type}µ${name}µ${id}`);
                
                $('.change-val').first().prop('checked', 'checked');

				nextInput = "";
				$(`[name="radioµ${type}µ${name}µ${id}"]`).each((k, v) => {
                    // if ($(v).attr("data-num") <= nextnum) $(v).closest("div").find("label").removeClass("DegreRouge");
                    var label = $(v).closest("div").find("label");
                    if (Datas.degres_modifies && Datas.degres_modifies[$(v).attr("data-num")]) label.addClass("DegreRouge"); else label.removeClass("DegreRouge");
					if ($(v).attr("data-num") == nextnum) {
						$(v).removeAttr("disabled");
					} else if ($(v).attr("data-num") > nextnum) {
                        // $(v).attr("disabled", "disabled");
                    }
				});
                
				clearChart(name, type, id);
				var fil = $(`#filiereµ${type}µ${name}µ${id}`).find("div.selected");
				if (fil.length > 0) {
					fil.removeClass("selected");
				}
				$(`#filiereµ${type}µ${name}µ${id}`).find("div").first().addClass("selected");
			},
			error: function (xhr, e) {
				_alert("Erreur", 'Erreur : ' + errorManager(xhr.responseText, e));
				loading(false);
			}
		}).done(() => {
			loading(false);
			if(type === 'Scenario') {
				//ReopenVariables();
				// INFO: Apply filters
				let degre  = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val();
				let filters = localStorage.getItem(`${type}µ${name}µ${id}µ${degre}`);
				if(!filters) filters= {};
				else  filters = JSON.parse(filters);
				if(!filters['parent']) filters.parent = 'J900';

				// Apply filiere
				apply_filiere(type, name, id, filters.parent);
				// Apply Hypo and Res filter
				apply_hyp_res(type, name, id, filters['Hypo'], filters['Res']);
				
			}
		});
	}
	catch (err) {
		console.log(err);
		_alert("Erreur", 'Erreur : ' + errorManager(err));
		// Kaky - 10/06/2022 - Cacher le loading s il y a erreur
		loading(false);
	}
}
function GetFirstFiliereTree(id, name, type, newYears, isNew, idConstat, parent, shouldOpen) {
	try {
		loading(true);
		var formData = new FormData();
		var degre = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).attr("value");
		formData.append("id", id);
		formData.append("name", name);
		if (newYears == 'undefined') newYears = "";
		formData.append("newYears", newYears);
		formData.append("isNew", isNew);
		formData.append("parent", parent);
		formData.append("degre", degre);
		formData.append("filtre", true);
		let filters = localStorage.getItem(`${type}µ${name}µ${id}µ${degre}`);
		if(!filters) filters = {};
		else filters = JSON.parse(filters);
		let hypoVars = resVars = "";
		if(filters.Hypo) hypoVars = filters.Hypo;
		if(filters.Res) resVars = filters.Res;
		formData.append("hypoVars", hypoVars);
		formData.append("resVars", resVars);
		if (type == "Scenario") formData.append("idConstat", idConstat);
		
        $.ajax({
			type: "POST",
			url: "../../"+type+"/GetFirstTree" + type,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,

			success: function (result) {
                loading(true);
				var Datas = JSON.parse(result);
				if (Datas.hasOwnProperty('Error')) { // TODO: Remove this
					$.alert({
						icon: 'fa fa-warning',
						title: 'Prevsup web',
						content: Datas.msg,
						escapeKey: 'cancel',

					});
					loading(false);
					return;
				}

				if (type == "Constat") CreateConstatTree(id, name, type, Datas);
				else if (type == "Scenario") {

					CreateTreeScenario(id, name, type, newYears, Datas, shouldOpen);
                    
				}
				ongletActive(`${type}µ${name}µ${id}`);
			},

			error: function (xhr, e) {
				_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr.responseText));
				loading(false);
			}
		}).done(() => {
			loading(false);		
			apply_hyp_res_filters(type, name, id, degre);
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		loading(false);
	}
}

function apply_hyp_res_filters(type, name, id, degre)  {
    let key = `${type}µ${name}µ${id}`;
	var filters = localStorage.getItem(`${key}µ${degre}`);
	if(!filters) filters= {};
	else  filters = JSON.parse(filters);

    apply_hyp_res(type, name, id, filters['Hypo'], filters['Res']);
}

function active(tr, nametype) {
	try {
		if (lastClick[nametype]) {
			lastClick[nametype].classList.remove("activeVariable");
			var td = $(lastClick[nametype]).find('td');
			td.each((k, v) => {
				if (v.classList.contains("activeVariable")) v.classList.remove("activeVariable");
			});
		}
		lastClick[nametype] = tr;
		if (!tr.classList.contains("activeVariable")) {
			tr.classList.add("activeVariable");
			var td = $(tr).find('td');
			td.each((k, v) => {
				if (!v.classList.contains("activeVariable")) v.classList.add("activeVariable");
			});
		}

		//affichage Variable
		var variable = tr.getAttribute("data-id");

		var x = variable.split("_");

		label = tr.getAttribute("data-id");
		variable = x[0];
		for (var i = 1; i < x.length - 3; i++) {
			variable += "_" + x[i];
		}

		var deg = x[x.length - 3];

		var indice = x[x.length - 2];
		var ij = x[x.length - 1];
		var i = "", j = "";
		if (indice == "IJ") {
			i = "I" + ij.split(",")[0];
			j = "J" + ij.split(",")[1];
		} else if (indice == "I") {
			i = "I" + ij;
		} else if (indice == "JI") {
			i = "I" + ij.split(",")[1];
			j = "J" + ij.split(",")[0];
		} else if (indice == "JA") {
			variable += "_JA";
			j = "J" + ij.split(",")[0];
		}
        
        checked = $(tr).find(':checked').length > 0;

		ProprieteVariable(variable, nametype, label, i, j, deg, indice, checked);
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}

function ProprieteVariable(variable, nametype, label, i, j, deg, indice, checked) {
	try {
		$(`#varnameµ${nametype}`).text("");
        if (!checked) return;

		var varDetail = ListAide.$values.filter(x => x.Variable.includes(variable));
		if (varDetail.length == 0) return;
		varDetail = varDetail[0];

		var detail = varDetail.Definition

		variable = variable + "_" + deg;

		var formule = ListFormule.$values.filter(x => x.Variable.includes(variable));
		if (formule.length == 0) return;
		formule = formule[0];

		if (detail.includes("{0}")) detail = detail.replaceAll("{0}", deg[1]);
		if (detail.includes("{0} + 1")) detail = detail.replaceAll("{0} + 1", parseInt(deg[1]) + 1);

		var code = ``;
		code += `
		<div class="colonne" >
						<div class="ligne" >
							<div><p class="bold cl">${variable}</p></div><div><p class="cl">&nbsp;: ${detail} </p></div>
						</div>
	`;
		if (i != "") {
			code += `<div class="ligne " >
						<div><p class="bold cl">${i}</p></div><div><p class="cl">&nbsp;: ${ListFiliere.$values.filter(x => x.indice == i)[0].description} </p></div>
					</div>`
		}
		if (j != "") {
			code += `<div class="ligne " >
						<div><p class="bold cl">${j}</p></div><div><p class="cl">&nbsp;: ${ListFiliere.$values.filter(x => x.indice == j)[0].description} </p></div>
					</div>`
		}

		if (formule != undefined) {
			if (formule.FConstat != "") formule = formule.FConstat;
			else formule = formule.FScenario;

			code += `<div class="ligne" >
						<p class="cl">${formule}</p>
					</div>`;
		}

		code += `<div class="ligne" >
				    <a href="/../../Aide/${variable}_IJ.html" target="_blank">Aide HTML sur la variable ${variable}_${indice}</a>
					</div>`;
		code += `</div>`;
		$(`#varnameµ${nametype}`).append(code);
	}
	catch (err) {
		//_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		_alert("Erreur", 'Erreur : tree | ' + "Propriétés de la variable non présente.");
	}
}

function GetFirstTree(id, name, type, newYears, isNew, idConstat, parent) {
	try {
		loading(true);
		var formData = new FormData();
		formData.append("id", id);
		formData.append("name", name);
		if (newYears == 'undefined') newYears = "";
		formData.append("newYears", newYears);
		formData.append("isNew", isNew);
		formData.append("parent", parent);
		if (type == "Scenario") formData.append("idConstat", idConstat);
		var degre = -1;
		$.ajax({
			type: "POST",
			url: "../../"+type+"/GetFirstTree" + type,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,

			success: function (result) {
				var Datas = JSON.parse(result);
                getExportVars(Datas);

				if (Datas.hasOwnProperty('Error')) {
					$.alert({
						icon: 'fa fa-warning',
						title: 'Prevsup web',
						content: Datas.msg,
						escapeKey: 'cancel',

					});
					loading(false);
					return;
				}

				if (type == "Constat") CreateConstatTree(id, name, type, Datas);
				else if (type == "Scenario") {
					var deg = parseInt(Datas.deg);
					degre = deg;

                   let trueDegre = degre.toString();
                   if(degre == 8) trueDegre = "Academie";
                   else if(degre == 7) trueDegre = "Diplome";
                   else if(degre == 0) trueDegre = "Entrant";
                   var filters = localStorage.getItem(`${type}µ${name}µ${Datas.Id}µ${trueDegre}`);
                   if(!filters) filters= {};
                   else  filters = JSON.parse(filters);

                   if(!filters['parent']) filters.parent = 'J900';

                   // CreateTreeScenario(id, name, type, newYears, Datas); // TODO: No longer needed, apply_filiere calls this

					$.each(Datas.YearsCount, (k, v) => {
						if (Datas.LastYear >= k)
							$(`#list-anneeµ${type}µ${name}µ${id}`).append(`<option value="${v}">${v}</option>`);
					});
					var dlb1 = new DualListbox(`.select1µ${type}µ${name}µ${id}`, {
						availableTitle: '',
						selectedTitle: '',
						addButtonText: '<i class="fa fa-chevron-right"></i>',
						removeButtonText: '<i class="fa fa-chevron-left"></i>',
						addAllButtonText: '<i class="fa fa-angle-double-right"></i>',
						removeAllButtonText: '<i class="fas fa-angle-double-left"></i>',
						searchPlaceholder: 'Rechercher...'
					});
					formuleChange(id, name, type);

					//application degree

                    var bWarnContexte = false;
					$(`[name="radioµ${type}µ${name}µ${id}"]`).each((k, v) => {
						var num = parseInt($(v).attr("data-num"));
						if (num <= deg) {
							$(v).removeAttr("disabled");
    						$(v).attr("checked", "checked");
                    	}
                        if (Datas.degres_modifies[num]) {
                            $(v).closest("div").find("label").addClass("DegreRouge");
                            bWarnContexte = true;
                        }
					});
                    
                    // INFO: Apply filters
                   // Apply filiere
                   apply_filiere(type, name, Datas.Id, filters.parent, false);
                   // Apply Hypo and Res filter
                   apply_hyp_res(type, name, Datas.Id, filters['Hypo'], filters['Res']);

                    // if (bWarnContexte) _alert("Contexte calculé", "Modification d'un contexte qui n'est pas le dernier calculé.");
				}
				ongletActive(`${type}µ${name}µ${id}`);
			},

			error: function (xhr, e) {
				_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr.responseText));
				loading(false);
			}
		}).done(() => {
			if (type !== "Scenario") loading(false);
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}
function CreateConstatTree(id, name, type, datas) {
	try {


		$(`#affµ${type}µ${name}µ${id}`).append(CreateHeaderMenu(id, name, type));
		affichage[`${name}µ${type}`] = "valeur";
		var years = "";
		$.each(datas.YearsCount, function (m, l) {
			years += l + 'µ';
		});
		var code = `<div class="table-container">
		<table id="tree-${name}µ${type}" class="table  table-tree table-hover table-responsive" data-id="${id}" data-name="${name}" data-type="Constat" data-years="${years}" data-years="${years}"><thead>
			<th width="25%" style="z-index : 1; left : -10px" colspan="3">Constat</th>`;

		$.each(datas.YearsCount, function (k, v) {
			code += `<th>${v}</th>`;
		});
		code += `</thead><tbody class="table-body-container">`;

		//#region UXD
		$.each(datas.Datas, function (k, v) {
			var ji = v.RealName.endsWith('JI') ? 1 : 0;
			code += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-ji="${ji}" data-name="${v.RealName}" data-level="${v.Level}" data-child="${v.child}" onclick="active(this, '${name}µ${type}')">
					<td class="colPlus" onclick="deplier(this, '${v.Id}', '${id}', '${type}', '${name}µ${type}', '${name}')" data-unfold="false"><i class="fa fa-plus"></i></td>
					<td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${id}" onclick="goToChart(this,'${type}','${name}','${id}')" class="checkrow"/></td>
					<td data-column="name" data-value="${v.Name}" class="sticky-col"><div class="var-container">${v.RealName}</div></td>`;
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

				code += `<td class="affichage" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false">
				${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}
			${pourc}</td>`;
				lastval = val;

				isFirst = false;
			});
			code += `</tr>`;
		});
		//#endregion UXD
		code += `</tbody> </table></div >`;
		code += `<script>
				$('#tree-${name}µ${type}').on('click','tr td[data-column="name"]', function(e) {
					chargedata(e,'${name}µ${type}');
				});
				/*
				$('#tree-${name}µ${type}').on('click','tr', function(e) {
					 active(e, '${name}µ${type}')
				});
				*/
				modeliseTable('#tree-${name}µ${type}');
				
            </script>
    `;
		$(`#listµ${type}µ${name}µ${id}`).append(code);
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}
//#region hide
//#region CalculeAffichagePar
function ToValeur(value, isFloat) {
	try {
		value = ParseFloat2(value);
		value = parseFloat(value);
		if (isFloat) return new Intl.NumberFormat("fr-FR").format(value.toFixed(2));
		else return new Intl.NumberFormat("fr-FR").format(value.toFixed(0));
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		return 0;
	}
}

function ToDifference(val, lastvaleur, isFirst, isFloat) {
	try {
		val = ParseFloat2(val);
		lastvaleur = ParseFloat2(lastvaleur);

		if (isFirst) return "";
		let value = parseFloat(val) - parseFloat(lastvaleur);

		if (isFloat) return new Intl.NumberFormat("fr-FR").format(value.toFixed(2));
		else return new Intl.NumberFormat("fr-FR").format(value.toFixed(0));
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		return 0;
	}
}

function ToTaux(val, lastvaleur, isFirst) {
	try {
		val = ParseFloat2(val);
		lastvaleur = ParseFloat2(lastvaleur);

		if (isFirst) return "";
		let value = 0;
		if (val == 0 && lastvaleur == 0) value = 0;
		else value = (parseFloat(val) - parseFloat(lastvaleur)) * 100 / parseFloat(lastvaleur);


		return new Intl.NumberFormat("fr-FR").format(value.toFixed(2)) + "%";
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		return 0;
	}
}
//#endregion

//#region AffichagePar
function ValChange(id, name, type) {
	try {
		affichage[`${name}µ${type}`] = "valeur";

		if (type == "Constat") {
			$(`#tree-${name}µ${type}`).find(".affichage").each((k, v) => {
				if (v.getAttribute("data-isTaux") == "true") v.innerText = v.getAttribute("data-valeur") + "%";
				else v.innerText = v.getAttribute("data-valeur");

				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", true);

			});
		}
		else if (type == "Scenario") {
			$(`#treeH-${name}µ${type}`).find(".affichage").each((k, v) => {
				if (v.getAttribute("data-isTaux") == "true") v.innerText = v.getAttribute("data-valeur") + "%";
				else v.innerText = v.getAttribute("data-valeur");

				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", true);

			});
			$(`#treeV-${name}µ${type}`).find(".affichage").each((k, v) => {
				if (v.getAttribute("data-isTaux") == "true") v.innerText = v.getAttribute("data-valeur") + "%";
				else v.innerText = v.getAttribute("data-valeur");

				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);

			});
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}

function DiffChange(id, name, type) {
	try {
		affichage[`${name}µ${type}`] = "difference";

		if (type == "Constat") {
			$(`#tree-${name}µ${type}`).find(".affichage").each((k, v) => {
				if (v.getAttribute("data-difference") == "") v.innerText = "";
				else {
					if (v.getAttribute("data-isTaux") == "true") v.innerText = v.getAttribute("data-difference") + "%";
					else v.innerText = v.getAttribute("data-difference");
				}


				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);
			});
		}
		else if (type == "Scenario") {
			$(`#treeH-${name}µ${type}`).find(".affichage").each((k, v) => {
				if (v.getAttribute("data-difference") == "") v.innerText = "";
				else {
					if (v.getAttribute("data-isTaux") == "true") v.innerText = v.getAttribute("data-difference") + "%";
					else v.innerText = v.getAttribute("data-difference");
				}


				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);
			});
			$(`#treeV-${name}µ${type}`).find(".affichage").each((k, v) => {
				if (v.getAttribute("data-difference") == "") v.innerText = "";
				else {
					if (v.getAttribute("data-isTaux") == "true") v.innerText = v.getAttribute("data-difference") + "%";
					else v.innerText = v.getAttribute("data-difference");
				}


				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);
			});
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}

function TauxChange(id, name, type) {
	try {
		affichage[`${name}µ${type}`] = "taux";

		if (type == "Constat") {
			$(`#tree-${name}µ${type}`).find(".affichage").each((k, v) => {
				v.innerText = v.getAttribute("data-taux");
				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);
			});
		} else if (type == "Scenario") {
			$(`#treeH-${name}µ${type}`).find(".affichage").each((k, v) => {
				v.innerText = v.getAttribute("data-taux");
				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);
			});
			$(`#treeV-${name}µ${type}`).find(".affichage").each((k, v) => {
				v.innerText = v.getAttribute("data-taux");
				if (v.hasAttribute("contentEditable")) v.setAttribute("contentEditable", false);
			});
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}
//#endregion

function GetList(id, name, type, newYears, isNew, idConstat) {
	try {
		var url = "../Get";

		if (isNew == "false" && type == 'Constat') {
			GetFirstTree(id, name, type, newYears, isNew, idConstat);
			return;
		}
		if (isNew == "false" && type == "Scenario") {
			GetFirstTree(id, name, type, newYears, isNew, idConstat, "J900");
			//call listFiliere
			HeaderTreeScenario(id, name, type, newYears, isNew, idConstat, "J900");
			GetFiliere(id, name, type, idConstat);

			return;
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}

var scrollBusy = false;
function ScrollTree(id, name, type) {
	if (!scrollBusy) {
		scrollBusy = true;
		let last = TreeConstat[`${id}µ${name}`].last;
		last = TreeConstat1[`${id}µ${name}`].last;
		
		var v = TreeConstat[`${id}µ${name}`][1].$values;
		let count = 0;
		var code = ``;

		for (let i = last; i < v.length; i++) {
			code += TreeModel(id, name, v[i], TreeConstat[`${id}µ${name}`][2], type, "", "");

			count++;

			if (count == 25) {
				break;
			}
		}
		
		$(`#listµ${type}µ${name}µ${id}`).append(code);

		scrollBusy = false;
	}
	
}

function changeTreeIcon(vid, id, name) {
	var element = $(`#iconµ${vid}µ${name}µ${id}`);
	if (element.hasClass("fa-chevron-right")) {
		element.removeClass("fa-chevron-right");
		element.addClass("fa-chevron-down");
	} else {
		element.removeClass("fa-chevron-down");
		element.addClass("fa-chevron-right");
	}
}

function OpenTree(vid, id, name, type, sepYear) {
	changeTreeIcon(vid, id, name);

	if (!$(`#${vid}µ${name}µ${id}`).hasClass("created")) {
		$(`#${vid}µ${name}µ${id}`).addClass("created");
		$(`#${vid}µ${name}µ${id}`).addClass("showChild");

		var list;
		var code = ``;
		if (type == "Constat") {
			list = TreeConstat[`${id}µ${name}`][0].$values;
			
			list = list.filter(x => x.IdParent == vid);

			$.each(list, (k, v) => {
				code += TreeModel(id, name, v, TreeConstat[`${id}µ${name}`][2], type, "", "");
			});
		}
		else if (type == "Scenario") {
			var tree2 = "_" + vid.split("_")[1];

			if (tree2 == "_first") {
				list = TreeScenario[`${id}µ${name}`][0].$values[0].$values;
				list = list.filter(x => x.IdParent == vid.split("_")[0]);

				$.each(list, (k, v) => {
					code += TreeModel(id, name, v, TreeScenario[`${id}µ${name}`][0].$values[2], type, sepYear, tree2);
				});
			} else {
				list = TreeScenario[`${id}µ${name}`][1].$values[0].$values;
				list = list.filter(x => x.IdParent == vid.split("_")[0]);

				$.each(list, (k, v) => {
					code += TreeModel(id, name, v, TreeScenario[`${id}µ${name}`][1].$values[2], type, sepYear, tree2);
				});
			}
		}

		$(`#${vid}µ${name}µ${id}`).after(code);

	} else {
		var tree2 = "_" + vid.split("_")[1];
		var divId = `${vid}µ${name}µ${id}`;

		if ($(`#${divId}`).hasClass("showChild")) {
			$(`#${divId}`).removeClass("showChild");
			hideChild(divId, true, type, tree2);
		} else {
			$(`#${divId}`).addClass("showChild");
			hideChild(divId, false, type, tree2);
		}
	}
}

function hideChild(divId, hide, type, tree2) {
	var ids = divId.split("µ");
	var childs = $(`#${divId}`).attr("data-childs").split("#");

	if ($(`#${divId}`).attr("data-childs") == "null") return false;

	for (var i = 0; i < childs.length - 1; i++) {
		var cdivId;
		if(type =="Constat") cdivId = `${childs[i]}µ${ids[1]}µ${ids[2]}`;
		else if (type == "Scenario") cdivId = `${childs[i] + tree2}µ${ids[1]}µ${ids[2]}`;

		if ($(`#${cdivId}`).length) {
			if (hide) {
				if (!$(`#${cdivId}`).hasClass("visually-hidden")) $(`#${cdivId}`).addClass("visually-hidden");
			}
			else {
				if ($(`#${cdivId}`).hasClass("visually-hidden")) $(`#${cdivId}`).removeClass("visually-hidden");
				if ($(`#${cdivId}`).hasClass("created")) {
					if (!$(`#${cdivId}`).hasClass("showChild")) $(`#${cdivId}`).addClass("showChild");
					if ($(`#iconµ${cdivId}`).hasClass("fa-chevron-right")) {
						$(`#iconµ${cdivId}`).addClass("fa-chevron-down");
						$(`#iconµ${cdivId}`).removeClass("fa-chevron-right");
					}
				}
			}
			hideChild(cdivId, hide, type, tree2);
		}
	}
}


//# region Reconduire variable

var clicked;

function activedown(vid/*variable id*/, id, name, type) {
	if (clicked) {
		if ($(`#${clicked.vid}µ${clicked.name}µ${clicked.id}`).length) {
			if ($(`#${clicked.vid}µ${clicked.name}µ${clicked.id}`).hasClass("active")) $(`#${clicked.vid}µ${clicked.name}µ${clicked.id}`).removeClass("active");
		}
	}
	
	clicked = {
		vid: vid,
		id: id,
		name: name,
		type: type
	}
	if (!$(`#${vid}µ${name}µ${id}`).hasClass("active")) $(`#${clicked.vid}µ${clicked.name}µ${clicked.id}`).addClass("active");
}
var values = ``;
function reconduirevariable(id, name, type, many) {
	try {
		loading(true);

		if (many == false) {

			var table = $(`#treeH-${name}µ${type}`),
				tr = table.find('tr.activeVariable'),
				varname = $(tr).attr("data-id");

			if (varname == null) {
				loading(false);

				$.alert({
					icon: 'fa fa-warning',
					title: 'Prevsup web',
					content: 'Veuillez sélectionner une variable à reconduire!',
					escapeKey: 'cancel',

				});

				return false;
			}
			let lastConstat = parseInt($(tr).find('td.table-separator').first().attr("data-column"));
			while ($(`.list-anneeµ${type}µ${name}µ${id} ul.dual-listbox__selected li:contains("${lastConstat}")`).length) {

				lastConstat = lastConstat - 1;
			}
			if ($(`.list-anneeµ${type}µ${name}µ${id} ul.dual-listbox__available li`).length > 1) {
				var formData = new FormData();
				formData.append("id", id);
				formData.append("name", varname);
				formData.append("vcopie", lastConstat);
				formData.append("degre", $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val());
				$.ajax({
					type: "POST",
					url: "../../Scenario/ReconduireVariable",
					data: formData,
					cache: false,
					contentType: false,
					processData: false,
					timeout: 300000,

					success: function (result) {
						var Datas = JSON.parse(result);

						if (Datas.hasOwnProperty('Error')) {
							$.alert({
								icon: 'fa fa-warning',
								title: 'Prevsup web',
								content: Datas.msg,
								escapeKey: 'cancel',

							});
							loading(false);
							return;
						}

						if (type == "Constat") CreateConstatTree(id, name, type, Datas);
						else if (type == "Scenario") {
							//CreateTreeScenario(id, name, type, "", Datas);
						}
						ongletActive(`${type}µ${name}µ${id}`);
                        
                        clearChart(name, type, id);
                        var fil = $(`#filiereµ${type}µ${name}µ${id}`).find("div.selected");
                        if (fil.length > 0) {
                            fil.removeClass("selected");
                        }
                        $(`#filiereµ${type}µ${name}µ${id}`).find("div").first().addClass("selected");
					},

					error: function (xhr, error) {
						_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr.responseText, error));
						loading(false);
					}
				}).done(() => {
					loading(false);
					if (type == "Scenario") {
						//ReopenVariables();					
						let degre = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val();

						var filters = localStorage.getItem(`${type}µ${name}µ${id}µ${degre}`);
						if(!filters) filters= {};
						else  filters = JSON.parse(filters);
						if(!filters['parent']) filters.parent = 'J900';

						// INFO: Apply filters
						// Apply filiere
						apply_filiere(type, name, id, filters.parent);
						// Apply Hypo and Res filter
						apply_hyp_res(type, name, id, filters['Hypo'], filters['Res']);
					}
				});
			}
			else {
				//Pas d'année à copier
				loading(false);
				$.alert({
					icon: 'fa fa-warning',
					title: 'Prevsup web',
					content: 'Année à copier non définie',
					escapeKey: 'cancel',

				});
			}
		}
		else {

			var table = $(`#treeH-${name}µ${type}`);
			let lastConstat = parseInt($(table).find('td.table-separator').first().attr("data-column"));
			while ($(`.list-anneeµ${type}µ${name}µ${id} ul.dual-listbox__selected li:contains("${lastConstat}")`).length) {

				lastConstat = lastConstat - 1;
			}
			if ($(`.list-anneeµ${type}µ${name}µ${id} ul.dual-listbox__available li`).length > 1) {

				var formData = new FormData();
				formData.append("id", id);
				formData.append("vcopie", lastConstat);
				formData.append("degre", $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val());
				$.ajax({
					type: "POST",
					url: "../../Scenario/ReconduireVariables",
					data: formData,
					cache: false,
					contentType: false,
					processData: false,
					timeout: 300000,

					success: function (result) {

						var Datas = JSON.parse(result);
						if (type == "Constat") CreateConstatTree(id, name, type, Datas);
						else if (type == "Scenario") {
							//CreateTreeScenario(id, name, type, "", Datas);

						}
						ongletActive(`${type}µ${name}µ${id}`);

                        clearChart(name, type, id);
                        var fil = $(`#filiereµ${type}µ${name}µ${id}`).find("div.selected");
                        if (fil.length > 0) {
                            fil.removeClass("selected");
                        }
                        $(`#filiereµ${type}µ${name}µ${id}`).find("div").first().addClass("selected");


					},

					error: function (xhr, error) {
						_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr.responseText, error));
						loading(false);
					}
				}).done(() => {
					loading(false);
					if (type == "Scenario") {
						//ReopenVariables();					
						let degre = $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val();

						var filters = localStorage.getItem(`${type}µ${name}µ${id}µ${degre}`);
						if(!filters) filters= {};
						else  filters = JSON.parse(filters);
						if(!filters['parent']) filters.parent = 'J900';

						// INFO: Apply filters
						// Apply filiere
						apply_filiere(type, name, id, filters.parent);
						// Apply Hypo and Res filter
						apply_hyp_res(type, name, id, filters['Hypo'], filters['Res']);
					}
				});


			}
			else {
				//Pas d'année à copier
				loading(false);
				$.alert({
					icon: 'fa fa-warning',
					title: 'Prevsup web',
					content: 'Année à copier non définie',
					escapeKey: 'cancel',

				});
			}

		}

	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}

	
}

function getTopMother(vid, id, name, type) {
	try {
		var element = $(`#${vid}µ${name}µ${id}`);
		var parentId = element.attr("data-parent");
		var testpatern = element.attr("data-parent");
		if (parentId == 0) return vid.split("_")[0];
		var sep = "";
		if (vid.includes("_")) sep = "_" + vid.split("_")[1];

		while (testpatern != "0") {
			parentId = testpatern;
			element = $(`#${testpatern + sep}µ${name}µ${id}`);
			testpatern = element.attr("data-parent");


		}
		return parentId;
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		return null;
	}

}
//#endregion Reconduire variable

function CreateTreeHeader(first, last, id, name, type, sepYear) {
	var header = ``;
	for (var i = parseInt(first); i <= parseInt(last); i++) {
		if (i - 1 == sepYear) header += `<div class="col-1 bg-danger" style="width : 5px; height:100%; padding:0;"></div>`;
		header += `<div class="col-2 flex-nowrap" style="text-align:end">${i}</div>`;
	}
	return header;
}

function CreateTreeConstat(id, name, type) {
	try {
		var tree = ListConstat[`${id}µ${name}`];

		var formData = new FormData();
		formData.append("id", id);
		formData.append("name", name);
		formData.append("table", JSON.stringify(tree));

		$.ajax({
			type: "POST",
			url: "../../Constat/InitTreeConstat",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			timeout: 300000,

			success: function (result) {
				let Datas = JSON.parse(result);
				if (Datas.hasOwnProperty('Error')) {
					$.alert({
						icon: 'fa fa-warning',
						title: 'Prevsup web',
						content: Datas.msg,
						escapeKey: 'cancel',

					});
					loading(false);
					return;
				}
				TreeConstat[`${id}µ${name}`] = JSON.parse(JSON.stringify(Datas));
				TreeConstat1[`${id}µ${name}`] = JSON.parse(JSON.stringify(Datas));

				var code = ``;
				var count = 0;
				TreeConstat[`${id}µ${name}`].last = count;
				TreeConstat1[`${id}µ${name}`].last = count;
				$.each(Datas[1].$values, (k, v) => {
					code += TreeModel(id, name, v, Datas[2], type, "", "");

					count++;

					if (count == 25) {
						return false;
					}
				});
				$(`#affµ${type}µ${name}µ${id}`).append(CreateHeaderMenu(id, name, type));

				$(`#listµ${type}µ${name}µ${id}`).append(code);

				$(`#tb-headerµ${type}µ${name}µ${id}`).append(CreateTreeHeader(Datas[2], Datas[3], id, name, type));

			},

			error: function (xhr, error) {
				_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr, error));
				loading(false);
			}
		}).done(() => {
			loading(false);
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		loading(false);
	}
}
function HeaderTreeScenario(id, name, type, newYears, Datas) {
	
	
	$(`#affµ${type}µ${name}µ${id}`).append(CreateHeaderMenu(id, name, type));

	
	

	

	code = `<option value="0">Tous</option>`;
	code1 = `<option value="0">Tous</option>`;

	$.each(Datas.scen1, (k, v) => {
		code += `<option value="${v.label}">${v.RealName}</option>`;
	});

	$.each(Datas.scen2, (k, v) => {
		code1 += `<option value="${v.label}">${v.RealName}</option>`;
	});

	$(`#listHypµ${type}µ${name}µ${id}`).append(code);
	$(`#listResµ${type}µ${name}µ${id}`).append(code1);
}
function CreateTreeScenario(id, name, type, newYears, Datas, shouldOpen = true) {
	try {
		loading(true);
		console.log("Begin creation of scenario tree");

		$(`#list1µ${type}µ${name}µ${id}`).children().remove();
		$(`#list2µ${type}µ${name}µ${id}`).children().remove();
		$(`#list-anneeµ${type}µ${name}µ${id}`).children().remove();
		var years = "";
		$.each(Datas.YearsCount, function (m, l) {
			years += l + 'µ';
		});
		var code1 = ``;
		affichage[`${name}µ${type}`] = "valeur";
		//Hypothese
		var code = `<div class="table-container">
		<table id="treeH-${name}µ${type}" class="table table-tree table-hover table-responsive" data-id="${id}" data-name="${name}" data-ids="${Datas.Id}" data-type="Scenario" data-tree="${Datas.Type1}" data-years="${years}"><thead><tr class="years">
			<th width="25%" style="z-index : 1; left : -10px" colspan="3">Hypothèses</th>`;

		$.each(Datas.YearsCount, function (k, v) {
			code += `<th>${v}</th>`;
		});
		code += `</tr></thead><tbody class="table-body-container">`;
		$.each(Datas.scen1, function (k, v) {
			fa_plus = v.Id != "EFF" ? `<i class="fa fa-plus"></i>` : ``;
            var ji = v.RealName.endsWith('JI') ? 1 : 0;
			code += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-ji="${ji}" data-name="${v.RealName}" data-level="${v.Level}" data-child="${v.child}" onclick="active(this, '${name}µ${type}')">
						<td class="colPlus" onclick="deplier(this, '${v.Id}', '${id}', '${type}', '${name}µ${type}', '${name}')" data-unfold="false">${fa_plus}</i></td>
						<td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${id}" onclick="goToChart(this,'${type}','${name}','${id}')" class="checkrow"/></td>
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

				if (Datas.LastYear == b)
					code += `<td class="affichage table-separator ${ChildExist ? "constat-Child-back" : "table-constat-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${Datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="constat">${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}</td>`;
				else
					if (Datas.LastYear > b)
						code += `<td class="affichage ${ChildExist ? "constat-Child-back" : "table-constat-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${Datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="constat">${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}</td>`;
					else
						if (Datas.LastYear < b)
							code += `<td class="affichage  ${ChildExist ? "scenario-Child-back" : "table-scenario-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${Datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="scenario">${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}</td>`;

				lastval = val;
				isFirst = false;
			});
			code += `</tr>`;
		});


		code += `</tbody> </table></div >`;
		code += `<script>
				$('#treeH-${name}µ${type}').on('click','tr td[data-column="name"]', function(e) {
				   chargedata(e,'${name}µ${type}','${type}', '${name}', '${id}' );
				});
				/*
				$('#treeH-${name}µ${type}').on('click','tr', function(e) {
					 active(e, '${name}µ${type}')
				});
				*/
				modeliseTable('#treeH-${name}µ${type}');
				
            </script>
    `;

		//Resultats
		var code1 = `<div class="table-container">
		<table id="treeV-${name}µ${type}" class="table table-tree table-hover table-responsive noeditable" data-id="${id}" data-name="${name}" data-ids="${Datas.Id}" data-type="Scenario" data-tree="${Datas.Type2}" data-years="${years}"><thead><tr class="years">
			<th width="25%" style="z-index : 1; left : -10px" colspan="3">Résultats</th>`;

		$.each(Datas.YearsCount, function (k, v) {
			code1 += `<th>${v}</th>`;
		});
		code1 += `</tr></thead><tbody class="table-body-container">`;
		$.each(Datas.scen2, function (k, v) {
			var idString = v.Id.toString();
			idString = idString.split("_")[0];
			//if (idString == "IND") return; // TODO: Devrait-on vraiment cacher les IND_ ?
			fa_plus = v.Id != "EFF" ? `<i class="fa fa-plus"></i>` : ``;

            var ji = v.RealName.endsWith('JI') ? 1 : 0;
			code1 += `<tr data-id="${v.Id}" data-parent="${v.Parent}" data-ji="${ji}" data-name="${v.RealName}" data-level="${v.Level}" data-child="${v.child}" onclick="active(this, '${name}µ${type}')">
						<td class="colPlus" onclick="deplier(this, '${v.Id}', '${id}', '${type}', '${name}µ${type}', '${name}')" data-unfold="false">${fa_plus}</td>
						<td class="colCheck"><input type="checkbox" id="checkµ${v.Id}µ${name}µ${id}" onclick="goToChart(this,'${type}','${name}','${id}')" class="checkrow"/></td>
						<td data-column="name"  data-value="${v.Name}" class="sticky-col"><div class="var-container">${v.RealName}</div></td>`;
			lastval = 0;
			isFirst = true;

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

				if (Datas.LastYear == b)
					code1 += `<td class="affichage table-separator ${ChildExist ? "constat-Child-back" : "table-constat-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${Datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="constat">${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}</td>`;
				else
					if (Datas.LastYear > b)
						code1 += `<td class="affichage ${ChildExist ? "constat-Child-back" : "table-constat-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${Datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="constat">${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}</td>`;
					else
						if (Datas.LastYear < b)
							code1 += `<td class="affichage ${ChildExist ? "scenario-Child-back" : "table-scenario-back" }" data-isFloat="${isFloat}" data-isTaux="${isTaux}" data-isFirst="${isFirst}" data-column="${Datas.YearsCount[b]}"  data-value="${val}" data-newvalue="${val}" data-valeur="${ToValeur(val, isFloat)}" data-difference="${diff}" data-taux="${taux}" data-state="false" data-source="scenario">${isFloat ? new Intl.NumberFormat("fr-FR").format(val.toFixed(2)) : new Intl.NumberFormat("fr-FR").format(val)}${pourc}</td>`;

				lastval = val;
				isFirst = false;
			});
			code1 += `</tr>`;
		});


		code1 += `</tbody> </table></div >`;
		code1 += `<script>
				$('#treeV-${name}µ${type}').on('click','tr td[data-column="name"]', function(e) {
					chargedata(e,'${name}µ${type}','${type}', '${name}', '${id}' );
				});
				/*
				$('#treeV-${name}µ${type}').on('click','tr', function(e) {
					 active(e, '${name}µ${type}')
				});
				*/
				modeliseTable('#treeV-${name}µ${type}');
				
            </script>
    `;


		$(`#list1µ${type}µ${name}µ${id}`).append(code);
		$(`#list2µ${type}µ${name}µ${id}`).append(code1);

		
		$(`#listHypµ${type}µ${name}µ${id}`).children().remove();
		$(`#listResµ${type}µ${name}µ${id}`).children().remove();
		var codeb = `<option value=""></option>`;
		codeb += `<option value="Tous">Tous</option>`;
		var code1b = `<option value=""></option>`;
		code1b += `<option value="Tous">Tous</option>`;

		$.each(Datas.scen1, (k, v) => {
			//codeb += `<option value="${v.label}">${v.RealName}</option>`;
			if(v.RealName != "EFF")
			codeb += `<option value="${v.RealName}">${v.RealName}</option>`;
		});

		$.each(Datas.scen2, (k, v) => {
			//code1b += `<option value="${v.label}">${v.RealName}</option>`;
			if(v.RealName != "EFF")
			code1b += `<option value="${v.RealName}">${v.RealName}</option>`;
		});

		$(`#listHypµ${type}µ${name}µ${id}`).append(codeb);
		$(`#listResµ${type}µ${name}µ${id}`).append(code1b);

		$(`#list1µ${type}µ${name}µ${id}`).find("tr:not(.years)").each((k, v) => {
			modeliseFilter(v, `'${name}µ${type}`, Datas.hypo);
		});
		$(`#list2µ${type}µ${name}µ${id}`).find("tr:not(.years)").each((k, v) => {
			modeliseFilter(v, `'${name}µ${type}`, Datas.hypo);
		});
		if(shouldOpen) ReopenVariables(type, name, id);

		console.log("End creation of scenario tree");		
		loading(false); 
	}
	catch (err) {
		loading(false);
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}	
	

function GetFiliere(id, name, type) {
	try {
		var formData = new FormData();
		formData.append("type", type);
		
		$.ajax({
			type: "POST",
			url: "../../Scenario/GetTreeFiliere",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,

			success: function (result) {
				let Datas = JSON.parse(result);
				$.each(Datas, (k, v) => {
					if (k == 0)
						$(`#filiereµ${type}µ${name}µ${id}`).append(`<div style="margin-left:${v.Level * 15}px" data-level="${v.Level}" data-value="${v.indice}" class="selected"><span class="f-focusable">(${v.indice}) ${v.description}</span></div>`);
					else
						$(`#filiereµ${type}µ${name}µ${id}`).append(`<div style="margin-left:${v.Level * 15}px" data-level="${v.Level}" data-value="${v.indice}"><span class="f-focusable">(${v.indice}) ${v.description}</span></div>`);

				});
				var code = `<script>
				$('#filiereµ${type}µ${name}µ${id}').on('click',function(e) {
					let degre= $('[name="radioµ${type}µ${name}µ${id}"]:checked').attr("value");
					console.log("INFO: GetTreeeFiliere");
					//localStorage.removeItem('${type}µ${name}µ${id}µ' + degre);

					$divcurrent=$(e.target).closest('div');
					if(!$divcurrent.hasClass('selected')){
						$divp=$('#filiereµ${type}µ${name}µ${id}');
						$parts=$divcurrent.attr("data-value");
						$divp.find('div.selected').removeClass('selected')
						$divcurrent.addClass('selected');
						//console.log($parts);

                        // INFO: Set Parent
                        let filters = localStorage.getItem('${type}µ${name}µ${id}µ' + degre);
                        if(!filters) filters = {};
                        else filters = JSON.parse(filters);
                        filters['parent'] = $parts;
                        localStorage.setItem('${type}µ${name}µ${id}µ' + degre, JSON.stringify(filters));
                        // INFO: End set Parent

						GetFirstFiliereTree('${id}', '${name}', '${type}', '', false, '',$parts);
					}
					
				});
			</script>`;

				$(`#filiereµ${type}µ${name}µ${id}`).append(code);
			},
			error: function (xhr, error) {
				_alert("Erreur", 'Erreur : (tree) ' + errorManager(xhr, error));
			}
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}
function save(id, name, type, Alert) {
	try {
		var Id = `${id}µ${name}`;
		var table = ``;
		if (type == 'Constat') {
			var table = `#tree-${name}µ${type}`;
			var Serie = new Array();
			$table = $(table);
			var children = $table.find('tr[data-state="true"]');

			children.each(function (index, row) {

				var $tr = $(row);
				var serie = {};


				serie.Variable = $tr.data('id');
				var value = new Array();
				$tr.find("td.affichage").each(function (k, v) { // "td:not(:first)"
					val = parseFloat($(v).attr('data-newvalue'));
					$(v).attr('data-isTaux') == "true" ? value.push(val / 100) : value.push(val);
					$(v).attr('data-value', $(v).attr('data-newvalue'));
					$(v).attr('data-state', false);

					//value.push($(v).attr('data-newvalue'));
				});

				$tr.attr('data-state', false);
				serie.Values = value;
				Serie.push(serie);
			});
			var formData = new FormData();
			formData.append("id", id);
			formData.append("serie", JSON.stringify(Serie));
			formData.append("save", Alert);

			loading(true);
			$.ajax({
				type: "POST",
				url: "../../"+type+"/SaveTree" + type,
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				timeout: 300000,

				success: function (result) {
					var Datas = JSON.parse(result);

					if (Alert) {
						loadCons();
						loading(false);
						$.alert({
							title: 'Prevsup web',
							content: Datas.msg,
							escapeKey: 'cancel',

						});
					}

				},

				error: function (xhr, e, message) {
					_alert("Erreur", 'Erreur : ' + errorManager(xhr.responseText, e));
					loading(false);
				}
			}).done(() => {
				loading(false);
			});
		}
		else if (type == 'Scenario') {
			var table = `#treeV-${name}µ${type}`;
			var Serie = new Array();
			$table = $(table);
			var children = $table.find('tr[data-state="true"]');

			children.each(function (index, row) {

				var $tr = $(row);
				var serie = {};

				serie.Variable = $tr.data('id');
				var value = new Array();
				$tr.find('td[data-source="scenario"]').each(function (k, v) {
					val = parseFloat($(v).attr('data-newvalue'));
					$(v).attr('data-isTaux') == "true" ? value.push(val / 100) : value.push(val);
					$(v).attr('data-value', $(v).attr('data-newvalue'));
					$(v).attr('data-state', false);
				});

				$tr.attr('data-state', false);
				serie.Values = value;
				Serie.push(serie);
			});

			table = `#treeH-${name}µ${type}`;
			$table = $(table);
			children = $table.find('tr[data-state="true"]');

			children.each(function (index, row) {

				var $tr = $(row);
				var serie = {};

				serie.Variable = $tr.data('id');
				var value = new Array();
				$tr.find('td[data-source="scenario"]').each(function (k, v) {
					val = parseFloat($(v).attr('data-newvalue'));
					$(v).attr('data-isTaux') == "true" ? value.push(val / 100) : value.push(val);
					$(v).attr('data-value', $(v).attr('data-newvalue'));
					$(v).attr('data-state', false);
				});

				$tr.attr('data-state', false);
				serie.Values = value;
				Serie.push(serie);
			});
			var formData = new FormData();
			formData.append("id", id);
			formData.append("serie", JSON.stringify(Serie));
			formData.append("save", Alert);

			loading(true);
			$.ajax({
				type: "POST",
				url: "../../"+type+"/SaveTree" + type,
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				timeout: 300000,

				success: function (result) {
					var Datas = JSON.parse(result);



					if (Alert) {
						loadCons();
						loading(false);
						$.alert({
							title: 'Prevsup web',
							content: Datas.msg,
							escapeKey: 'cancel',

						});

					}
				},

				error: function (xhr, error) {
					_alert("Erreur", 'Erreur : ' + errorManager(xhr.responseText, error));
					loading(false);
				}
			}).done(() => {
				if (!Alert) CalculContexte(id, name, type);
				else loading(false);
			});;


		}

	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
		loading(false);
	}
}

//#region Chart


function goToChart(e, type, name, id) {
	try {
		var saveChart = new Array();
		$(`#myChartµ${type}µ${name}µ${id}`).replaceWith($(`<canvas id="myChartµ${type}µ${name}µ${id}"></canvas>`));
		ctx = document.getElementById(`myChartµ${type}µ${name}µ${id}`).getContext('2d');
        // e == null if ChangDeg
		var table = e ? $(e).closest('table') : null;
		var annees = e ? table.attr("data-years").split('µ').filter(function (a) { return a != null && a != ''; }) : null;


		const color = ["red", "blue", "orange", "brown", "#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"];

		//var graph = {
		//	id: chart.id,
		//	label: chart.label,
		//	data: chart.datas,
		//	borderWidth: 1,
		//	borderColor: color[rColor]
		//}
		table && $(table).find('input[type="checkbox"]:checked').each(function () {
			var rColor = "#" + ((1 << 24) * Math.random() | 0).toString(16);
			var tr = $(this).closest('tr');

			var chart = {
				id: tr.attr("data-id"),
				label: tr.attr("data-id"),
				datas: new Array()
			}
			$.each(annees, (k, v) => {

				var td = tr.find('td[data-column="' + v + '"]');
				var value = td.attr("data-newvalue").replaceAll(" ", "");
				chart.datas.push(parseFloat(value).toFixed(2));
			});
			var graph = {
				id: chart.id,
				label: chart.label,
				data: chart.datas,
				borderWidth: 1,
				backgroundColor: rColor,
				borderColor: rColor
			}
			saveChart.push(graph);
		});


		var myDoughnutChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: annees,
				datasets: saveChart
			},
			options: {
				legend: {
					position: 'left',
					labels: {
						boxWidth: 12
					}
				},
				plugins: {
					legend: {
						position: 'right',
						align: 'center'
					}
				}
			}
		});
		myDoughnutChart.update();
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}

function clearChart(name, type, id) {
	try {
		var saveChart = new Array();
		$(`#myChartµ${type}µ${name}µ${id}`).replaceWith($(`<canvas id="myChartµ${type}µ${name}µ${id}"></canvas>`));
		ctx = document.getElementById(`myChartµ${type}µ${name}µ${id}`).getContext('2d');
		var myDoughnutChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: annees,
				datasets: saveChart
			},
			options: {
				legend: {
					position: 'left',
					labels: {
						boxWidth: 12
					}
				},
				plugins: {
					legend: {
						position: 'right',
						align: 'center'
					}
				}
			}
		});
		myDoughnutChart.update();
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}


function createChart(chart, ctx, first_year, last_year) {
	try {
		const color = ["red", "blue", "orange", "brown", "#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"];
		var rColor = Math.floor(Math.random() * color.length);

		var annees = [];
		for (var i = first_year; i < last_year; i++) {
			annees.push(i);
		}

		var graph = {
			id: chart.id,
			label: chart.label,
			data: chart.datas,
			borderWidth: 1,
			borderColor: color[rColor]
		}

		saveChart.push(graph);

		updateChart(ctx, annees);
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}

function updateChart(ctx, annees) {
	try {
		ChartGraph.destroy();

		if (saveChart.length > 0) {
			ChartGraph = new Chart(ctx, {
				type: 'line',
				data: {
					labels: annees,
					datasets: saveChart
				},
				options: {
					legend: {
						position: 'right',
						align: 'left'
					}
				}
			});
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (tree) ' + errorManager(err));
	}
}
//#endregion

//#region Utils Function
function ChiffreSpace(value) {
	//value = value.toString().replaceAll(" ", "").replaceAll(" ", "").replaceAll(".", ",");
	const nf = new Intl.NumberFormat("fr");
	return nf.format(value);
}

function TauxFormat(label) {
	if (label.split("_")[0] == "T" || label.split("_")[0] == "P") return `%`;
	return ``;
}

function validate(evt, vid, id, name, annee, type) {
	var theEvent = evt || window.event;
	if (evt.keyCode == 13 || evt.keyCode == 9) {
		calcule(vid, id, name, annee, type);
	}
	if (theEvent.type === 'paste') {
		key = event.clipboardData.getData('text/plain');
	} else {
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
	}
	var regex = /[0-9]|\.|\-|\ /;
	if (!regex.test(key)) {
		theEvent.returnValue = false;
		if (theEvent.preventDefault) theEvent.preventDefault();
	}
}

function ParseFloat2(number) {
	while (number.toString().includes(",")) {
		number = number.toString().replace(",", ".");
	}
	number = parseFloat(number);

	if (number.toString().includes(".")) return parseFloat(number).toFixed(2);
	else return parseFloat(number);
}

function normalNumber(number) {
	while (number.toString().include(" ")) {
		number = number.toString().replace(" ", "");
	}
	number = parseFloat(number);

	return number;
}
//#endregion