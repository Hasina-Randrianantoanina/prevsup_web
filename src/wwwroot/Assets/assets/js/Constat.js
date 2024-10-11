var fillConstat = false

//#region Document ready

$(document).ready(() => {
    $("#oc_list").select2();
	$("#nc_list").select2();

	$("#os_list").select2();
	$("#ns_list").select2();
	$("#ns_listc").select2();

	//user
	$("#ou_list").select2();
	$("#ou_list_delete").select2();
});

//#endregion

//#region ShowNewSelect

//Constat
$("#nc_selectNew").change(() => {
	var select = $("#nc_selectNew").find("option:selected").val();
	if (select == 1) {
		Show($("#nc_constats"), true);
		Show($("#nc_academies"), false);
		if (!$("#nc_depAnnee").attr("disabled")) !$("#nc_depAnnee").attr("disabled", "disabled");
		if (!$("#nc_finAnnee").attr("disabled")) !$("#nc_finAnnee").attr("disabled", "disabled");

		select = $("#nc_list").find("option:selected").val();
		$("#nc_depAnnee").val(Constats[select].First_year);
		$("#nc_finAnnee").val(Constats[select].Last_year);
	}
	else {
		Show($("#nc_constats"), false);
		Show($("#nc_academies"), true);
		if ($("#nc_depAnnee").attr("disabled")) $("#nc_depAnnee").removeAttr("disabled");
		if ($("#nc_finAnnee").attr("disabled")) $("#nc_finAnnee").removeAttr("disabled");
	}
});

//Scenario
$("#ns_selectNew").change(() => {
	var select = $("#ns_selectNew").find("option:selected").val();
	if (select == 1) {
		Show($("#ns_conatainerList"), true);
		Show($("#ns_conatainerList1"), false);
		if (!$("#ns_depAnnee").attr("disabled")) !$("#ns_depAnnee").attr("disabled", "disabled");
		if (!$("#ns_finAnnee").attr("disabled")) !$("#ns_finAnnee").attr("disabled", "disabled");

		select = $("#ns_list").find("option:selected").val();
		var first_year;
		$.each(Constats, (k, v) => {
			if (v.Seq == Scenarios[select].Observation) {
				first_year = v.Last_year
				return true;
			}
		});

		$("#ns_depAnnee").val(parseInt(first_year)+1);
		$("#ns_finAnnee").val(Scenarios[select].Last_year);
	}
	else {
		Show($("#ns_conatainerList"), false);
		Show($("#ns_conatainerList1"), true);
		if (!$("#ns_depAnnee").attr("disabled")) !$("#ns_depAnnee").attr("disabled", "disabled");
		if ($("#ns_finAnnee").attr("disabled")) $("#ns_finAnnee").removeAttr("disabled");

		select = $("#ns_listc").find("option:selected").val();
		$("#ns_depAnnee").val(parseInt(Constats[select].Last_year)+1);
	}
});

//#endregion

//#region selectNewConstat
$("#nc_list").change(() => {
	var select = $("#nc_list").find("option:selected").val();
	$("#nc_depAnnee").val(Constats[select].First_year);
	$("#nc_finAnnee").val(Constats[select].Last_year);
});
//#endregion

//#region selectNewConstat
	select = $("#ns_list").find("option:selected").val();
	var first_year;
	$.each(Constats, (k, v) => {
		if (v.Seq == Scenarios[select].Observation) {
			first_year = v.Last_year
			return false;
		}
	});
//});

$("#ns_listc").change(() => {
	select = $("#ns_listc").find("option:selected").val();
	$("#ns_depAnnee").val(parseInt(Constats[select].Last_year) + 1);
	$("#ns_finAnnee").val(parseInt(Constats[select].Last_year) + 2);
});
//#endregion

//#region eventAction

function open_submit(type, suff) {
	try {
		var id = $(`#${suff}list`).val();
		var name = $(`#${suff}list option:selected`).text();

		if (name.includes(" ")) name = name.replace(" ", "_");

		if (TypeExist(id, name, type, suff, true)) return false;
		//if (!VerifySelectedType(id, type)) return false;

		$("#onglet").append(CreateOnglet(id, name, type));
		$("#ongletContent").append(CreateInterface(id, name, type, "", false));
		ongletActive(`${type}µ${name}µ${id}`);
	} catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}

var idNew = 0;
function new_submit(type, suff) {
	try {
		var name = $(`#${suff}nom`).val();
		var first = $(`#${suff}depAnnee`).val();
		var last = $(`#${suff}finAnnee`).val();
        var niveau = $(`#${suff}nivdet`).val();

		var select = $(`#${suff}selectNew`).find("option:selected").val();

        const regex = /[^A-Za-z0-9_\-]/g;
        name = name.replace(regex, ""); //.replace(/&/, '');
		if (!TestValidation(name, first, last, type)) return false;
		if (name.includes(" ")) name = name.replace(" ", "_");

		var id = 0;
		var isNew = false;

		if (select == 1) {
			id = $(`#${suff}list`).val();
			if (TypeExist(id, name, type, suff, false)) return false;

			loading(true);

			// Création
			var formData = new FormData();
			formData.append("id", id);
			formData.append("name", name);
			formData.append("newYears", "");
			formData.append("isNew", true);
			formData.append("userId", User.Id);
			formData.append("academyId", User.Academy.Id);

			if (type == "Scenario" && isNew) formData.append("idConstat", idConstat);

			$.ajax({
				type: "POST",
				url: "../../"+type+"/Get" + type,
				data: formData,
				cache: false,
				contentType: false,
				processData: false,

				success: function (result) {

					var Datas = JSON.parse(result);

					

					
					if (type == "Constat") {
						$("#onglet").append(CreateOnglet(Datas.Id, name, type))
					$("#ongletContent").append(CreateInterface(Datas.Id, name, type, "", true));
						CreateConstatTree(Datas.Id, name, type, Datas);
						ongletActive(`${type}µ${name}µ${Datas.Id}`);
					} 
					else if (type == "Scenario") {
						_alert("Information", "Le scénario a été dupliqué");
						/*CreateTreeScenario(Datas.Id, name, type, newYears, Datas);
						HeaderTreeScenario(Datas.Id, name, type, newYears, isNew, '', "J900");
						GetFiliere(Datas.Id, name, type, '');
						//ongletActive(`${type}µ${name}µ${Datas.Id}`);
						$.each(Datas.YearsCount, (k, v) => {
							if (Datas.LastYear >= k)
								$(`#list-anneeµ${type}µ${name}µ${Datas.Id}`).append(`<option value="${v}">${v}</option>`);
						});
						var dlb1 = new DualListbox(`.select1µ${type}µ${name}µ${Datas.Id}`, {
							availableTitle: '',
							selectedTitle: '',
							addButtonText: '<i class="fa fa-chevron-right"></i>',
							removeButtonText: '<i class="fa fa-chevron-left"></i>',
							addAllButtonText: '<i class="fa fa-angle-double-right"></i>',
							removeAllButtonText: '<i class="fas fa-angle-double-left"></i>',
							searchPlaceholder: 'Rechercher...'
						});
						formuleChange(Datas.Id, name, type);


						//application degree
						var deg = parseInt(Datas.deg);
						var bWarnContexte = false;
						$(`[name="radioµ${type}µ${name}µ${Datas.Id}"]`).each((k, v) => {
							var num = parseInt($(v).attr("data-num"));
							if (num <= deg) {
								$(v).removeAttr("disabled");
								$(v).attr("checked", "checked");
							}
							if (Datas.degres_modifies[num]) {
								$(v).closest("div").find("label").addClass("DegreRouge");
								bWarnContexte = true;
							}
						});*/
					};
					
				},

				error: function (xhr, error) {
					_alert("Erreur", 'Erreur : (Constat) ' + errorManager(xhr.responseText, error));
					loading(false);
				}
			}).done(() => {
				loading(false);
			});
			//fin création

			//ongletActive(`${type}µ${name}µ${id}`);
		} else {
			if (type == "Constat") {
				id = "newId" + idNew++;
				if (TypeExist(id, name, type, suff, false)) return false;

				loading(true);

				//Create By Seq;
				var formData = new FormData();
				formData.append("id", id);
				formData.append("name", name);
				formData.append("newYears", first + "_" + last);
				formData.append("isNew", true);
				formData.append("userId", User.Id);

				var list = $("#nc_list_aca").find("option").length;
				if (list == 0) formData.append("academyId", User.Academy.Id);
				else formData.append("academyId", $("#nc_list_aca").find("option:selected").val());

				$.ajax({
					type: "POST",
					url: "../../"+type + "/Get" + type,
					data: formData,
					cache: false,
					contentType: false,
					processData: false,

					success: function (result) {

						if (result == 'limit') {
							$.alert({
								icon: 'fa fa-warning',
								title: 'Prevsup web',
								content: "Intervalle des années de prévision trop grande. Veuillez réduire l’année de fin de prévision.",
								escapeKey: 'cancel',

							});
							loading(false);
							return;
						}

						var Datas = JSON.parse(result);

						$("#onglet").append(CreateOnglet(Datas.Id, name, type))
						$("#ongletContent").append(CreateInterface(Datas.Id, name, type, "", true));
						if (type == "Constat") CreateConstatTree(Datas.Id, name, type, Datas);
						else if (type == "Scenario") ListScenario[`${id}µ${name}`] = JSON.parse(result);
						ongletActive(`${type}µ${name}µ${Datas.Id}`);
					},

					error: function (xhr, error) {
						_alert("Erreur", 'Erreur : (Constat) ' + errorManager(xhr.responseText, error));

						loading(false);
					}
				}).done(() => {
					loading(false);
				});

			} else if (type == "Scenario") {
				idConstat = $("#ns_listc").find("option:selected").val();
				id = "newId" + idNew++;
				if (TypeExist(id, name, type, suff, false)) return false;

				loading(true);

				var niveau = $(`#${suff}nivdet`).find("option:selected").val();
				var formData = new FormData();
				formData.append("id", id);
				formData.append("name", name);
				var newYears = first + "_" + last;
				if (newYears == 'undefined') newYears = "";
				formData.append("newYears", newYears);
				formData.append("isNew", true);
				formData.append("parent", "J900");
				formData.append("idConstat", idConstat);
				formData.append("isEasy", niveau == 0 ? false : true);
				$.ajax({
					type: "POST",
					url: "../../"+type+"/GetFirstTree" + type,
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

						$("#onglet").append(CreateOnglet(Datas.Id, name, type))
						$("#ongletContent").append(CreateInterface(Datas.Id, name, type, newYears, true, idConstat));
						CreateTreeScenario(Datas.Id, name, type, newYears, Datas);
						HeaderTreeScenario(Datas.Id, name, type, newYears, isNew, idConstat, "J900");
						GetFiliere(Datas.Id, name, type, idConstat);
						ongletActive(`${type}µ${name}µ${Datas.Id}`);
						$.each(Datas.YearsCount, (k, v) => {
							if (Datas.LastYear >= k)
								$(`#list-anneeµ${type}µ${name}µ${Datas.Id}`).append(`<option value="${v}">${v}</option>`);
						});
						var dlb1 = new DualListbox(`.select1µ${type}µ${name}µ${Datas.Id}`, {
							availableTitle: '',
							selectedTitle: '',
							addButtonText: '<i class="fa fa-chevron-right"></i>',
							removeButtonText: '<i class="fa fa-chevron-left"></i>',
							addAllButtonText: '<i class="fa fa-angle-double-right"></i>',
							removeAllButtonText: '<i class="fas fa-angle-double-left"></i>',
							searchPlaceholder: 'Rechercher...'
						});

						
					},

					error: function (xhr, e) {
						_alert("Erreur", 'Erreur : (Constat) ' + errorManager(xhr.responseText));
						loading(false);
					}
				}).done(() => {
					loading(false);
				});

			}

		}

	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}

//#endregion

//#region Onglet

function CreateOnglet(id, name, type) {
	return `
        <li class="nav-item" id="liµ${type}µ${name}µ${id}">
            <button class="nav-link active active_top menu_onglet" id="menuµ${type}µ${name}µ${id}" targetId="${type}µ${name}µ${id}" onclick="ongletActive('${type}µ${name}µ${id}')" data-type="${type}">${name}<i class="fa fa-times" onclick="closeOnglet('${type}µ${name}µ${id}')"></i></button>
		</li>
    `;
}

function CreateInterface(id, name, type, newYears, isNew, idConstat) {
	var code = ``;
	try {
		code += `
            <div class="row p-2 collapse onglet" id="cµ${type}µ${name}µ${id}" style="height:100%" type="${type}">
				<div class="row" id="affµ${type}µ${name}µ${id}">
				</div>`;

		if (type == "Archive") {
			code += CreateInterfaceArchive(id, name, type) + `</div>`;
		} else {
			code + `<hr class="mt-2 mb-2" style="margin:auto; width:90%">`;
		}
		if (type == "Constat") {
			code += `
				<div class="col-md-12" id="tableµ${type}µ${name}µ${id}" style="height:100%">
				    <div class=" p-2" id="tableauµ${type}µ${name}µ${id}" style="min-height:50vh;height:30vh; resize:vertical; overflow: auto;">
					    <div class="row fw-bold flex-nowrap" id="tb-headerµ${type}µ${name}µ${id}">
						    <div class="col-1"></div>
						    <div class="col-4"></div>

					    </div>

					    <div class="" id="listµ${type}µ${name}µ${id}">
                           
					    </div>
				    </div>
		`;
		} else if (type == "Scenario") {
			if (User.Academy.Is_Whole)
				onglet_academie = `
						<div class="form-check form-check-inline col bt degre">
							<input class="form-check-input radio-degre" type="radio" id="rad8µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="Academie" data-num="8" data-name="Academie" onchange="ChangeDeg('${id}', '${name}', '${type}', 'Academie')" disabled="disabled">
							<label class="form-check-label" for="rad8µ${type}µ${name}µ${id}">Académie</label>
						</div>`;
			else
				onglet_academie = ``;
				
			code += `
				<div class="col-md-8" id="tableµ${type}µ${name}µ${id}" style="height:100%">
					
				    <div class=" p-2" id="tableau1µ${type}µ${name}µ${id}" style="min-height:20vh;height:30vh; resize:vertical; overflow: auto">
					   <div class="" id="list1µ${type}µ${name}µ${id}">
                           
					    </div>
				    </div>
					<hr class="mt-2 mb-2" style="margin:auto; width:90%">
					
					<div class="p-2" id="tableau2µ${type}µ${name}µ${id}" style="min-height:20vh;height:30vh; resize:vertical; overflow: auto">
					   <div class="" id="list2µ${type}µ${name}µ${id}">

					    </div>
				    </div>

					<div class="row p-3">
						<div class="form-check form-check-inline col bt degre 1">
							<input class="form-check-input radio-degre" type="radio" id="rad0µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="Entrant" data-num="0" onchange="ChangeDeg('${id}', '${name}', '${type}', 'Entrant')"  checked="checked">
							<label class="form-check-label" for="rad0µ${type}µ${name}µ${id}">Entrant</label>
						</div>
						<div class="form-check form-check-inline col bt degre 2">
							<input class="form-check-input radio-degre" type="radio" id="rad1µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="1" data-num="1" onchange="ChangeDeg('${id}', '${name}', '${type}', '1')" disabled="disabled">
							<label class="form-check-label" for="rad1µ${type}µ${name}µ${id}">Degré 1</label>
						</div>
						<div class="form-check form-check-inline col bt degre 3">
							<input class="form-check-input radio-degre" type="radio" id="rad2µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="2" data-num="2" onchange="ChangeDeg('${id}', '${name}', '${type}', '2')" disabled="disabled">
							<label class="form-check-label" for="rad2µ${type}µ${name}µ${id}">Degré 2</label>
						</div>
						<div class="form-check form-check-inline col bt degre">
							<input class="form-check-input radio-degre" type="radio" id="rad3µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="3" data-num="3" onchange="ChangeDeg('${id}', '${name}', '${type}', '3')" disabled="disabled">
							<label class="form-check-label" for="rad3µ${type}µ${name}µ${id}">Degré 3</label>
						</div>
						<div class="form-check form-check-inline col bt degre">
							<input class="form-check-input radio-degre" type="radio" id="rad4µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="4" data-num="4" onchange="ChangeDeg('${id}', '${name}', '${type}', '4')" disabled="disabled">
							<label class="form-check-label" for="rad4µ${type}µ${name}µ${id}">Degré 4</label>
						</div>
						<div class="form-check form-check-inline col bt degre">
							<input class="form-check-input radio-degre" type="radio" id="rad5µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="5" data-num="5" onchange="ChangeDeg('${id}', '${name}', '${type}', '5')" disabled="disabled">
							<label class="form-check-label" for="rad5µ${type}µ${name}µ${id}">Degré 5</label>
						</div>
						<div class="form-check form-check-inline col bt degre">
							<input class="form-check-input radio-degre" type="radio" id="rad6µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="6" data-num="6" onchange="ChangeDeg('${id}', '${name}', '${type}', '6')" disabled="disabled">
							<label class="form-check-label" for="rad6µ${type}µ${name}µ${id}">Degré 6</label>
						</div>
						<div class="form-check form-check-inline col bt degre">
							<input class="form-check-input radio-degre" type="radio" id="rad7µ${type}µ${name}µ${id}" name="radioµ${type}µ${name}µ${id}" value="Diplome" data-num="7" data-name="Diplome" onchange="ChangeDeg('${id}', '${name}', '${type}', 'Diplome')" disabled="disabled">
							<label class="form-check-label" for="rad7µ${type}µ${name}µ${id}">Diplomés</label>
						</div>
						${onglet_academie}
					</div>
		`;
		}
		if (type == "Scenario") {
			
			code += `
					<div class="filter-nav" id="menuHypµ${type}µ${name}µ${id}" style="top: 20vh; z-index:1;">
						<select class="form-select" style="width:250px; padding:5px;" id="listHypµ${type}µ${name}µ${id}">

						</select>
						<div class="filter-button" id="filterHypµ${type}µ${name}µ${id}"><span class="filter-text">Hypotheses</span></div>
					</div>

					<div class="filter-nav" id="menuResµ${type}µ${name}µ${id}" style="top: 60vh;z-index:1;">
						<select class="form-select" style="width:250px; padding:5px;" id="listResµ${type}µ${name}µ${id}">

						</select>
						<div class="filter-button" id="filterResµ${type}µ${name}µ${id}"><span class="filter-text">Resultats</span></div>
					</div>

					<script>
						$("#listResµ${type}µ${name}µ${id}").select2({ placeholder: "Variables Résultats"});
						$("#listHypµ${type}µ${name}µ${id}").select2({ placeholder: "Variables Résultats"});


						$("#listHypµ${type}µ${name}µ${id}").change(()=>{
                            
                            // INFO: Save Hypo Filter
							let degre = $('[name="radioµ${type}µ${name}µ${id}"]:checked').val();
							var filters = localStorage.getItem('${type}µ${name}µ${id}µ' + degre);
							if(!filters) filters = {};
							else filters = JSON.parse(filters);
                            let curr = $("#listHypµ${type}µ${name}µ${id}").find("option:selected").val();
							filters['Hypo'] = curr ? curr: 'Tous';

							filters['openVars'] = [];

                            localStorage.setItem('${type}µ${name}µ${id}µ' + degre, JSON.stringify(filters));
                            // INFO: End save Hypo Filter
							console.log("ato");

							filterScenario_for_variables('${id}', '${name}', '${type}', $("#listHypµ${type}µ${name}µ${id}").find("option:selected").text(), 'H');
							console.log("ato1");

                            $("#menuHypµ${type}µ${name}µ${id}").css({ "left": "-250px" });
						});
						$("#listResµ${type}µ${name}µ${id}").change(()=>{

                            // INFO: Save Res Filter
							let degre = $('[name="radioµ${type}µ${name}µ${id}"]:checked').val();
							var filters = localStorage.getItem('${type}µ${name}µ${id}µ' + degre);
							if(!filters) filters = {};
							else filters = JSON.parse(filters);

							filters['openVars'] = [];

                            let curr = $("#listResµ${type}µ${name}µ${id}").find("option:selected").val();
							filters['Res'] = curr ? curr: 'Tous';
                            localStorage.setItem('${type}µ${name}µ${id}µ' + degre, JSON.stringify(filters));
                            // INFO: End save Res Filter
							
							filterScenario_for_variables('${id}', '${name}', '${type}', $("#listResµ${type}µ${name}µ${id}").find("option:selected").text(), 'V');
                            $("#menuResµ${type}µ${name}µ${id}").css({ "left": "-250px" });
						});

						$("#filterHypµ${type}µ${name}µ${id}").click(() => {
							if ($("#menuHypµ${type}µ${name}µ${id}").css("left") =="0px"){
								$("#menuHypµ${type}µ${name}µ${id}").css({ "left": "-250px" });
								//$("#filterHypµ${type}µ${name}µ${id}").css({"writing-mode":"vertical-rl"});
							}
							else {
								$("#menuHypµ${type}µ${name}µ${id}").css({ "left": "0px" });
								//$("#filterHypµ${type}µ${name}µ${id}").css({"writing-mode":"horizontal-tb"});
							}
						});

						$("#filterResµ${type}µ${name}µ${id}").click(() => {
							if ($("#menuResµ${type}µ${name}µ${id}").css("left") =="0px"){
								$("#menuResµ${type}µ${name}µ${id}").css({ "left": "-250px" });
								//$("#filterResµ${type}µ${name}µ${id}").css({"writing-mode":"vertical-rl"});
							}
							else {
								$("#menuResµ${type}µ${name}µ${id}").css({ "left": "0px" });
								//$("#filterResµ${type}µ${name}µ${id}").css({"writing-mode":"horizontal-tb"});
							}
						});
					</script>
		`;
		}



		if (type == "Constat") {
			code += `
					<div class="row" style="margin-top:1rem">
						<div class="col-4">
						    <p class="prop">Propriétés</p>
							<div id="varnameµ${name}µ${type}"></div>
						</div>
						<div class="col-8">
							<canvas id="myChartµ${type}µ${name}µ${id}"></canvas>
						</div>
					</div>
			    </div>
            </div>
		`;
		} else if (type == "Scenario") {
			code += `
					<div class="row" style="margin-top:1rem">
						<div class="col-4">
							<p class="prop">Propriétés</p>
							<div id="varnameµ${name}µ${type}"></div>
						</div>
						<div class="col-8">
							<canvas id="myChartµ${type}µ${name}µ${id}"></canvas>
						</div>
					</div>
			    </div>
		`;
		}
		if (type == "Scenario") {
			code += `
			<div class="col-md-4" id="outilsµ${type}µ${name}µ${id}">
				<div class="accordion p-2" id="accordionµ${type}µ${name}µ${id}">
					<div class="accordion-item">
						<h2 class="accordion-header" id="panelshead1µ${type}µ${name}µ${id}">
							<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsCollapse1µ${type}µ${name}µ${id}" aria-expanded="true" aria-controls="panelsCollapse1µ${type}µ${name}µ${id}">
								Aide à la prévision
							</button>
						</h2>
						<div id="panelsCollapse1µ${type}µ${name}µ${id}" class="accordion-collapse collapse show" aria-labelledby="panelshead1µ${type}µ${name}µ${id}">
							<div class="accordion-body">
								<div class="row mb-3">
									<div class="btn btn-outline-secondary btn-sm col m-2" onclick="reconduirevariable('${id}', '${name}', '${type}', false)">Reconduire la variable</div>
									<div class="btn btn-outline-secondary btn-sm col m-2" onclick="reconduirevariable('${id}', '${name}', '${type}', true)">Reconduire les variables</div>
									
								</div>

								<hr>

								<table class="table table-borderless">
									<tr>
										<td class="cmethode-title small mb-3">Méthode de calcul :</td>
										<td>
											<select class="form-select form-select-sm" aria-label="Formule" onchange="formuleChange('${id}', '${name}', '${type}')" id="formuleµ${type}µ${name}µ${id}">
												<option value="lastValue" selected>Dernière valeur observée</option>
												<option value="moyenneA">Moyenne arithmétique</option>
												<option value="Tglobal">Taux d’évolution globale</option>
												<option value="Tannuel">Taux d’évolution annuel</option>
												<option value="moyenneG">Moyenne glissante pondéré</option>
												<option value="Regr">Régression linéaire paramétrée</option>
												<option value="exp">Modèle exponentiel</option>
												<option value="log">Modèle logarithmique</option>
												<option value="pol">Modèle polynomial</option>
												<option value="pow">Modèle en puissance</option>
											</select>
										</td>
									</tr>
								<table>

								<hr>

								<table class="table table-borderless caption-top" id="formuleDetailµ${type}µ${name}µ${id}">
								</table>

								<script id="formuleScriptµ${type}µ${name}µ${id}">

								</script>
	
								<div class="btn btn-primary btn-sm" style="width:100%" onclick="CalculeHypothese('${id}', '${name}', '${type}')">Calculer hypothèses</div>
							</div>
						</div>
					</div>
					<div class="accordion-item">
						<h2 class="accordion-header" id="panelshead2µ${type}µ${name}µ${id}">
							<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsCollapse2µ${type}µ${name}µ${id}" aria-expanded="false" aria-controls="panelsCollapse2µ${type}µ${name}µ${id}">
								Années atypiques
							</button>
						</h2>
						<div id="panelsCollapse2µ${type}µ${name}µ${id}" class="accordion-collapse collapse" aria-labelledby="panelshead2µ${type}µ${name}µ${id}">
							<div class="accordion-body" id="atypiqueµ${type}µ${name}µ${id}">
								<select class="select1µ${type}µ${name}µ${id}" multiple id="list-anneeµ${type}µ${name}µ${id}">

								</select>
							</div>
						</div>
					</div>

					<div class="accordion-item">
						<div class="accordion-header row ps-3 pe-3 mt-2 mb-2">
							<div class="btn btn-primary btn-sm col m-2" onclick="save('${id}', '${name}', '${type}', false)">Calcul contexte</div>
							
						</div>
					</div>

					<div class="accordion-item">
						<h2 class="accordion-header" id="panelshead3µ${type}µ${name}µ${id}">
							<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsCollapse3µ${type}µ${name}µ${id}" aria-expanded="false" aria-controls="panelsCollapse3µ${type}µ${name}µ${id}">
								Zoom sur une filière
							</button>
						</h2>
						<div id="panelsCollapse3µ${type}µ${name}µ${id}" class="accordion-collapse collapse" aria-labelledby="panelshead3µ${type}µ${name}µ${id}">
							<div class="accordion-body c-filiere" id="filiereµ${type}µ${name}µ${id}">

							</div>
						</div>
					</div>

				</div>
			</div>
		</div>
		<div class="modal fade" id="modalµ${type}µ${name}µ${id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
			 <div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					 <div class="modal-header">
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
				<div class="modal-body">
						<div id="modalcontentµ${type}µ${name}µ${id}"></div>
				</div>
			 </div>
		  </div>
		</div>


		`;
		}

		if (type == "Constat") {
			code += `
				<script>
					$(document).ready(function () {
						GetList('${id}', '${name}', '${type}', '${newYears}', '${isNew}');

						$("#tableauµ${type}µ${name}µ${id}").scroll(function () {
							var w = $("#tableauµ${type}µ${name}µ${id}").prop("scrollHeight");

							var a = $("#tableauµ${type}µ${name}µ${id}").height();

							if (a + 1 > w - $("#tableauµ${type}µ${name}µ${id}").scrollTop()) {
								ScrollTree('${id}', '${name}', '${type}');
							}
						});
					});
				</script>
		`;
		} else if (type == "Scenario") {
			code += `
				<script>
					$(document).ready(function () {
						GetList('${id}', '${name}', '${type}', '${newYears}', '${isNew}', '${idConstat}');
						
						$("#tableau1µ${type}µ${name}µ${id}").scroll(function () {
							$("#tableau2µ${type}µ${name}µ${id}").scrollLeft($("#tableau1µ${type}µ${name}µ${id}").scrollLeft());
						});
						$("#tableau2µ${type}µ${name}µ${id}").scroll(function () {
							$("#tableau1µ${type}µ${name}µ${id}").scrollLeft($("#tableau2µ${type}µ${name}µ${id}").scrollLeft());
						});
						/*$("#tableauµ${type}µ${name}µ${id}").scroll(function () {
							var w = $("#tableauµ${type}µ${name}µ${id}").prop("scrollHeight");

							var a = $("#tableauµ${type}µ${name}µ${id}").height();

							if (a + 1 > w - $("#tableauµ${type}µ${name}µ${id}").scrollTop()) {
								ScrollTree('${id}', '${name}', '${type}');
							}
						});*/
					});
				</script>
		`;
		}

	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
	return code;
}

/*
	GetConstat => GetList
*/

function CreateHeaderMenu(id, name, type) {
	return `
		<div class="col-1"></div>
		<div class="row col-sm-5">
			<button class="col-3 btn btn-sm btn-primary float-end" onclick="save('${id}', '${name}', '${type}', true)"><i class="fa fa-save"></i> <span class="lbl-btn">Enregistrer</span></button>
			<div class="col-1"></div>
			<button class="col-3 btn btn-sm btn-danger float-end" onclick="Delete('${id}', '${name}', '${type}')"><i class="fa fa-trash"></i> <span class="lbl-btn">Supprimer</span></button>
			<div class="col-1"></div>
			<button class="col-3 btn btn-sm btn-dark float-end" data-bs-toggle="modal" data-bs-target="#openExport" onclick="loadExport('${id}', '${name}', '${type}')"><i class="fa fa-file-export"></i> <span class="lbl-btn">Exporter</span></button>
		</div>
		<div class="row col-sm-6">
			<div class="col-sm-2">Affichage par :</div>
			<div class="col-sm-10 btn-group btn-group-sm" role="group" aria-label="button group">
				<input type="radio" class="btn-check change-val" name="affRadioµ${type}µ${name}µ${id}" id="radio_valµ${type}µ${name}µ${id}" onchange="ValChange('${id}', '${name}', '${type}')" checked="checked" />
				<label class="btn btn-outline-dark" for="radio_valµ${type}µ${name}µ${id}">Valeurs</label>

				<input type="radio" class="btn-check" name="affRadioµ${type}µ${name}µ${id}" id="radio_diffµ${type}µ${name}µ${id}" onchange="DiffChange('${id}', '${name}', '${type}')" />
				<label class="btn btn-outline-dark" for="radio_diffµ${type}µ${name}µ${id}">Différence</label>

				<input type="radio" class="btn-check" name="affRadioµ${type}µ${name}µ${id}" id="radio_tauxµ${type}µ${name}µ${id}" onchange="TauxChange('${id}', '${name}', '${type}')"/>
				<label class="btn btn-outline-dark" for="radio_tauxµ${type}µ${name}µ${id}">Taux d'évolution</label>
			</div>
		</div>
	`;
}

//#endregion

function Export() {
	try {
        
        var list = []
        $('#exportVars :checked').each((k, v) => {
            list.push(v.value);
        });
        if (list.length == 0) {
            $.alert({
                icon: 'fa fa-warning',
                title: 'Prevsup web',
                content: 'Aucune variable sélectionnée',
                escapeKey: 'cancel',
            });
            return;
        }

		loading(true);
        id = _id; type = _type; name = _name;

		var conf = confirm("Voulez-vous vraiment Exporter le " + _type + "?");
		if (conf) {
			var formData = new FormData();
			formData.append("id", _id);
			formData.append("name", _name);
			formData.append("type", _type);
            formData.append("vars", list.join(";"));

			if (type == "Scenario") {
				formData.append("degre", $(`[name="radioµ${type}µ${name}µ${id}"]:checked`).val());
			}

			$.ajax({
				type: "POST",
				url: "../../"+type+"/Export" + type + "CSV",
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				async: true,

				success: function (result) {
					var Datas = JSON.parse(result);
                    if (Datas.Error) {
                        $.alert({
                            icon: 'fa fa-warning',
                            title: 'Prevsup web',
                            content: Datas.msg,
                            escapeKey: 'cancel',
                        });
                        loading(false);
                        return;
                    }

					var res = Datas.hasOwnProperty('result');
					if (res) {
						if (Datas.result == 'existe') {
							if (Datas.hasOwnProperty('Error')) {
								$.alert({
									icon: 'fa fa-warning',
									title: 'Prevsup web',
									content: " Le fichier n'existe pas !",
									escapeKey: 'cancel',

								});
								loading(false);
								return;
							}
						}
					}
					if (Datas.Path == '') {
						$.alert({
							icon: 'fa fa-warning',
							title: 'Prevsup web',
							content: " Le fichier n'existe pas !",
							escapeKey: 'cancel',

						});
						loading(false);
						return;
					}

					checkF5 = false;
					window.location = '/Main/DownloadFileClient?file=' + Datas.Path + '&filename=' + Datas.Filename;
					if (type == "Constat") $.alert({ title: 'Prevsup web', content: `Le constat [${name}] a été bien exporté`, escapeKey: 'cancel', });
					else if (type == "Scenario") $.alert({ title: 'Prevsup web', content: `Le scénario [${name}] a été bien exporté`, escapeKey: 'cancel', });
					setTimeout(function() { checkF5 = true; }, 3000);

					loading(false);
				},

				error: function (xhr, e) {
					_alert("Erreur", 'Erreur:' + errorManager(xhr.responseText));
					loading(false);
				}
			});
		}
		else loading(false);
	} catch (err) {
		_alert("Erreur", 'Erreur:' + errorManager(err));
	}
}

function Delete(id, name, type) {
	try {
		var conf = confirm("Voulez-vous vraiment supprimer?");
		if (conf) {
			loading(true);

			var formData = new FormData();
			formData.append("id", id);
			formData.append("name", name);
			formData.append("type", type);

			$.ajax({
				type: "POST",
				url: "../../"+type+"/Supprimer",
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				async: true,

				success: function (result) {

					loading(false);
					if (result == "true") {
						if (type == "Constat")
							$.alert({ title: 'Prevsup web', content: `Constat [${name}] a été supprimé`, escapeKey: 'cancel', });
						else if (type == "Scenario")
							$.alert({ title: 'Prevsup web', content: `Scénario [${name}] a été supprimé`, escapeKey: 'cancel', });

						closeOnglet(`${type}µ${name}µ${id}`);
						loadCons();
					} else {
						if (type == "Constat")
							$.alert({ title: 'Prevsup web', content: `Vous ne pouvez pas supprimer ce Constat car il est lié avec un ou plusieurs Scénarios`, escapeKey: 'cancel', });
						else if (type == "Scenario")
							$.alert({ title: 'Prevsup web', content: `Vous ne pouvez pas supprimer ce Scénario car il est lié avec un ou plusieurs Récapitulatifs`, escapeKey: 'cancel', });
					}


				},

				error: function (x, e) {
					_alert("Erreur", 'Erreur : (Constat) ' + errorManager(e));
					loading(false);
				}
			});
		}
	} catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
		loading(false);
	}
}


//#region function

function VerifySelectedType(id, type) {
	if (Constats[id]) return true;
	else if (Scenarios[id]) return true;
	return false;
}

function TypeExist(id, nom, type, suff, isOption) {
	var test = false;

	if (!isOption) {
		$(`#${suff}list`).find("option").each((k, v) => {
			name = $(v).text();
			if (name == nom) {
				test = true;
				alert("Le nom existe déjà !");
				return false;
			}
		});

		if (test) return true;
	}

	$("#onglet").find("li").each(function (i, li) {
		var but = li.children[0];

		var name = $(`#${but.id}`).text();
		var data_type = $(`#${but.id}`).attr("data-type");
		if (name == nom && data_type == type) {
			test = true;
			alert("Le nom existe déjà !");
			return false;
		}
	});

	if (test) return true;


	return false;
}

function ongletActive(id) {
	try {
		$("#onglet").find("li").each(function (i, li) {
			var but = li.children[0];

			if (but.id == "menuµ" + id) {
				if ($(`#cµ${id}`).hasClass("collapse")) $(`#cµ${id}`).removeClass("collapse");

				if (!but.classList.contains("active")) {
					but.classList.add("active");
					but.classList.add("active_top");

				}
                
				code = ""; idx = 0;
				// Kaky - 10/06/2022 - Sélectionner seulement les variables mères
                $(`#cµ${id} tr[data-id][data-parent="Constat"],tr[data-id][data-parent="Hypotheses"],tr[data-id][data-parent="Resultats"]`).each((k, v) => {
					var idi = "cb-" + (idx++);
					var name = $(v).data('name');
                    code += `<input type="checkbox" id="${idi}" name="exp_var[]" value="${name}"/><label for="${idi}">${name}</label><br/>`;
                });
                $('#exportVars').html(code);

				//saveChart = new Array();
				//ChartGraph.destroy();
				$(`.listTree`).find(`input[type="checkbox"]`).each((k, v) => {
					v.checked = false;
				});
			} else {
				var attr = $(`#${but.id}`).attr("targetId");
				if (!$(`#cµ${attr}`).hasClass("collapse")) $(`#cµ${attr}`).addClass("collapse");

				if (but.classList.contains("active")) {
					but.classList.remove("active");
					but.classList.remove("active_top");
				}
			}
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}

function closeOnglet(id) {
	$(`#liµ${id}`).remove();
	$(`#cµ${id}`).remove();
	//if (Constats[id]) delete Constats[id];
}


function TestValidation(name, first, last, type) {
	if (!name || name == "") {
		alert("Veuillez vérifier le nom du " + type);
		return false;
	}

	first = parseInt(first);
	last = parseInt(last);

	if (first > last || first < 2010) {
		alert("Veuillez vérifier la date de début et la date de fin");
		return false;
	}

	return true;
}

//#endregion

//#region filter

//filtre hypothese et resultat
function filterScenario_for_variables(id, name, type, label, tree) {
	if (label == "Tous") {
		$(`#tree${tree}-${name}µ${type}`).find(`tr`).each((k, v) => {
			if (v.classList.contains("filterHide")) v.classList.remove("filterHide");
		});
	} else {
		if(label) {
			let lastIndex=label.lastIndexOf("_");
			label = label.split("").slice(0,lastIndex).join("");
		}

		$(`#tree${tree}-${name}µ${type}`).find(`tr[data-id^="${label}"]`).each((k, v) => {
			if (v.classList.contains("filterHide")) v.classList.remove("filterHide");
		});

		$(`#tree${tree}-${name}µ${type}`).find(`tr:not([data-id^="${label}"])`).each((k, v) => {
			if (!v.classList.contains("years")) if (!v.classList.contains("filterHide")) v.classList.add("filterHide");
		});
	}
}

//filtre zoom filiere
/*function filterFiliere(indice, id, name, type) {
	var i = 0, j = 0;

	if (indice[0] == "J") j = indice.split(indice[0])[1];
	else if (indice[0] == "I") i = indice.split(indice[0])[1];
	else return false;

	var tree = getListVariable(id, name, type);

	
}

function getListVariable(id, name, type) {
	var tree = {
		H: new Array(),
		V: new Array()
	};
	
	$(`#listHypµ${type}µ${name}µ${id}`).find("option").each((k, v) => {
		if (v.innerText()!="Tous") H.push(v.innerText());
	});
	$(`#listResµ${type}µ${name}µ${id}`).find("option").each((k, v) => {
		if (v.innerText() != "Tous") V.push(v.innerText());
	});

	return tree;
}*/
//#endregion

//#region Interface
function formuleChange(id, name, type) {
	try {
		var value = $(`#formuleµ${type}µ${name}µ${id}`).val();

		var $table = $(`#treeH-${name}µ${type}`);

		let lastConstat = parseInt($table.find('td.table-separator').first().attr("data-column"));
		let firstConstat = parseInt($table.find('td.affichage').first().attr("data-column"));
		let lastPrevision = parseInt($table.find('td.affichage').last().attr("data-column"));

		if($table.length <= 0) {

			lastConstat = "";
			firstConstat = "";
			lastPrevision = "";
		}

		switch (value) {
			case "lastValue": applyToView(id, name, type, IlastVal, firstConstat, lastConstat, lastPrevision); break;
			case "moyenneA": applyToView(id, name, type, ImoyenneA, firstConstat, lastConstat, lastPrevision); break;
			case "Tglobal": applyToView(id, name, type, ITglobal, firstConstat, lastConstat, lastPrevision); break;
			case "Tannuel": applyToView(id, name, type, ITannuel, firstConstat, lastConstat, lastPrevision); break;
			case "moyenneG": applyToView(id, name, type, ImoyenneG, firstConstat, lastConstat, lastPrevision); break;
			case "Regr": applyToView(id, name, type, IRegr, firstConstat, lastConstat, lastPrevision); break;
			case "exp": applyToView(id, name, type, Iexp, firstConstat, lastConstat, lastPrevision); break;
			case "log": applyToView(id, name, type, Ilog, firstConstat, lastConstat, lastPrevision); break;
			case "pol": applyToView(id, name, type, Ipol, firstConstat, lastConstat, lastPrevision); break;
			case "pow": applyToView(id, name, type, Ipow, firstConstat, lastConstat, lastPrevision); break;
			default: break;
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}

function applyToView(id, name, type, fonction, firstConstat, lastConstat, lastPrevision) {
	$(`#formuleDetailµ${type}µ${name}µ${id}`).text("");
	var code = fonction(id, name, type, firstConstat, lastConstat, lastPrevision);
	//title
	$(`#formuleDetailµ${type}µ${name}µ${id}`).append(`<caption class="small text-decoration-underline">${code.caption}</caption>`);
	//decalage
	$(`#formuleDetailµ${type}µ${name}µ${id}`).append(IDecalage(id, name, type, code.source));
	//details
	$(`#formuleDetailµ${type}µ${name}µ${id}`).append(code.details);

	//script
	/*$(`#formuleScriptµ${type}µ${name}µ${id}`).empty();
	$(`#formuleScriptµ${type}µ${name}µ${id}`).append(code.script);*/
}
function IDecalage(id, name, type, target) {
	return `
		<tr>
			<td><label for="decalageµ${type}µ${name}µ${id}">Décalage : </label></td>
			<td><input class="form-control form-control-sm" style="width:40px" type="number" onchange="changeDecal(this, '${target}')" name="decalageµ${type}µ${name}µ${id}" id="decalageµ${type}µ${name}µ${id}"  placeholder="0" value="0" min="0" /></td>
		</tr>
	`;
}

function changeDecal(decal, target) {
	target = $(`#${target}`);
	var value = parseInt(target.attr("placeholder"));
	var decal = parseInt(decal.value);
	target.val(value + parseInt(decal));
}

function IlastVal(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Dernière valeur observée`;
	code.details = `
		<tr>
			<td><label for="fy_lastValµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fy_lastValµ${type}µ${name}µ${id}" name="fy_lastValµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="ly_lastValµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="ly_lastValµ${type}µ${name}µ${id}" name="ly_lastValµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
	`;
	code.source = `fy_lastValµ${type}µ${name}µ${id}`;
	return code;
}
function ImoyenneA(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Moyenne arithmétique`;
	code.details = `
		<tr>
			<td><label for="fyc_moyenneAµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_moyenneA${type}µ${name}µ${id}"  name="fyc_moyenneA${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}"  min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_moyenneAµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_moyenneAµ${type}µ${name}µ${id}" name="lyc_moyenneAµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_moyenneAµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_moyenneAµ${type}µ${name}µ${id}" name="lyp_moyenneAµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
	`;
	code.source = `lyc_moyenneAµ${type}µ${name}µ${id}`;
	return code;
}
function ITglobal(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Taux d'évolution global`;
	code.details = `
		<tr>
			<td colspan="2"><label for="lyc_Tglobalµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_Tglobalµ${type}µ${name}µ${id}"  name="lyc_Tglobalµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td colspan="2"><label for="lyp_Tglobalµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_Tglobalµ${type}µ${name}µ${id}" name="lyp_Tglobalµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td colspan="2"><label for="te_Tglobalµ${type}µ${name}µ${id}"><label><input type="radio" name="type_Tglobalµ${type}µ${name}µ${id}" data-fonction="taux" checked/> Taux d'évolution globale (%) : </label></label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="te_Tglobalµ${type}µ${name}µ${id}" name="te_Tglobalµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
		<tr>
			<td colspan="2"><label for="lvp_Tglobalµ${type}µ${name}µ${id}"><label><input type="radio" name="type_Tglobalµ${type}µ${name}µ${id}" data-fonction="valeur"/> Dérnière valeur de prévision : </label></label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lvp_Tglobalµ${type}µ${name}µ${id}" name="lvp_Tglobalµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
	`;
	code.source = `lyc_Tglobalµ${type}µ${name}µ${id}`;
	return code;
}
function ITannuel(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Taux d'évolution global`;
	code.details = `
		<tr>
			<td><label for="fyc_Tannuelµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_Tannuelµ${type}µ${name}µ${id}"  name="fyc_Tannuelµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}"  min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_Tannuelµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_Tannuelµ${type}µ${name}µ${id}"  name="lyc_Tannuelµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_Tannuelµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_Tannuelµ${type}µ${name}µ${id}" name="lyp_Tannuelµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td><label for="te_Tannuelµ${type}µ${name}µ${id}">Taux d'évolution (%) : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="te_Tannuelµ${type}µ${name}µ${id}" name="te_Tannuelµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
	`;
	code.source = `lyc_Tannuelµ${type}µ${name}µ${id}`;
	return code;
}
function ImoyenneG(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Moyenne glissante pondérée`;
	code.details = `
		<tr>
			<td><label for="fyc_moyenneGµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_moyenneGµ${type}µ${name}µ${id}"  name="fyc_moyenneGµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}" min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_moyenneGµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_moyenneGµ${type}µ${name}µ${id}" name="lyc_moyenneGµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_moyenneGµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_moyenneGµ${type}µ${name}µ${id}" name="lyp_moyenneGµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>

		<tr>
			<td colspan="2" class="p-2">
				<span style="font-weight:600; font-size:0.9em">Valeur de pondération :  (p=<span id="n_moyenneGµ${type}µ${name}µ${id}">0</span>)</span>
				<div>
					<ul class="myul" id="listP_moyenneGµ${type}µ${name}µ${id}">
						<li class="row">
							<div class="col-3">p0 :</div>
							<div class="col-6"><input class="form-control form-control-sm" type="number" placeholder="0" value="0"/></div>
						</li>
					</ul>
				</div>
			</td>
		</tr>

		<tr>
			<td colspan="2" class="mb-3">
				<div class="btn p-3"> Pondération :</div>
				<div class="btn btn-sm btn-outline-success p-3" onclick="addToListP('${id}', '${name}', '${type}')"><div class="p-1"><i class="fa fa-plus small"></i> Ajouter </div></div>
				<div class="btn btn-sm btn-outline-danger p-3" onclick="removeToListP('${id}', '${name}', '${type}')"><div class="p-1"><i class="fa fa-minus small"></i> Effacer </div></div>
			</td>
		</tr>
	`;
	code.source = `lyc_moyenneGµ${type}µ${name}µ${id}`;
	return code;
}
function addToListP(id, name, type) {
	var i = $(`#listP_moyenneGµ${type}µ${name}µ${id}`).find('li').length;
	code = `
		<li class="row">
			<div class="col-3">p${i} :</div>
			<div class="col-6"><input class="form-control form-control-sm" type="number" placeholder="0" value="0"/></div>
		</li>
	`;
	$(`#listP_moyenneGµ${type}µ${name}µ${id}`).append(code);

	$(`#n_moyenneGµ${type}µ${name}µ${id}`).text(i);


}
function removeToListP(id, name, type) {
	var i = $(`#listP_moyenneGµ${type}µ${name}µ${id}`).find('li').length;
	if (i > 1) {
		$(`#listP_moyenneGµ${type}µ${name}µ${id}`).find('li')[i - 1].remove();
		$(`#n_moyenneGµ${type}µ${name}µ${id}`).text(i - 2);
	}
}

function IRegr(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Régression linéaire paramétrée`;
	code.details = `
		<tr>
			<td><label for="fyc_Regrµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_Regrµ${type}µ${name}µ${id}"  name="fyc_Regrµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}" min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_Regrµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_Regrµ${type}µ${name}µ${id}" name="lyc_Regrµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_Regrµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_Regrµ${type}µ${name}µ${id}" name="lyp_Regrµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td colspan="2"><input type="radio" id="check1_Regrµ${type}µ${name}µ${id}" name="check_Regrµ${type}µ${name}µ${id}" checked="checked"/><label for="check1_Regrµ${type}µ${name}µ${id}">Classique : y = ax + b</label></td>
		</tr>
		<tr>
			<td colspan="2"><input type="radio" id="check2_Regrµ${type}µ${name}µ${id}" name="check_Regrµ${type}µ${name}µ${id}"/><label for="check2_Regrµ${type}µ${name}µ${id}">Dernière valeur + coeff * a</label></td>
		</tr>
		<tr>
			<td><label for="coeff_Regrµ${type}µ${name}µ${id}">Coefficient pente ([0,1]) : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="coeff_Regrµ${type}µ${name}µ${id}" name="coeff_Regrµ${type}µ${name}µ${id}"  placeholder="1" value="0"/></td>
		</tr>
	`;
	code.source = `lyc_Regrµ${type}µ${name}µ${id}`;
	return code;
}
function Iexp(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Modèle exponentiel`;
	code.details = `
		<tr>
			<td><label for="fyc_expµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_expµ${type}µ${name}µ${id}"  name="fyc_expµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}" min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_expµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_expµ${type}µ${name}µ${id}"  name="lyc_expµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_expµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_expµ${type}µ${name}µ${id}" name="lyp_expµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td colspan="2"><span class="fw-bold">Y = a.e<sup>b.X</sup></span></td>
		</tr>
		<tr>
			<td><label for="a_expµ${type}µ${name}µ${id}">a = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="a_expµ${type}µ${name}µ${id}" name="a_expµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
		<tr>
			<td><label for="b_expµ${type}µ${name}µ${id}">b = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="b_expµ${type}µ${name}µ${id}" name="b_expµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
	`;
	code.source = `lyc_expµ${type}µ${name}µ${id}`;
	return code;
}
function Ilog(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Modèle logarithmique`;
	code.details = `
		<tr>
			<td><label for="fyc_logµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_logµ${type}µ${name}µ${id}"  name="fyc_logµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}" min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_logµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_logµ${type}µ${name}µ${id}"  name="lyc_logµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_logµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_logµ${type}µ${name}µ${id}" name="lyp_logµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td colspan="2"><span class="fw-bold">Y = a.log(X) + b</span></td>
		</tr>
		<tr>
			<td><label for="a_logµ${type}µ${name}µ${id}">a = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="a_logµ${type}µ${name}µ${id}" name="a_logµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
		<tr>
			<td><label for="b_logµ${type}µ${name}µ${id}">b = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="b_logµ${type}µ${name}µ${id}" name="b_logµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
	`;
	code.source = `lyc_logµ${type}µ${name}µ${id}`;
	return code;
}
function Ipol(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Modèle polynomial`;
	code.details = `
		<tr>
			<td><label for="fyc_polµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_polµ${type}µ${name}µ${id}"  name="fyc_polµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}" min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_polµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_polµ${type}µ${name}µ${id}"  name="lyc_polµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_polµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_polµ${type}µ${name}µ${id}" name="lyp_polµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td colspan="2">
				<span class="fw-bold">
					Y = a<sub>0</sub> + a<sub>1</sub>X + a<sub>2</sub>X<sup>2</sup> + ... + a<sub>n</sub>X<sup>n</sup>
				</span>
			</td>
		</tr>

		<tr>
			<td colspan="2" class="p-2">
				<span style="font-weight:600; font-size:0.9em">Valeur des a[n] : (Degré n=<span id="n_polµ${type}µ${name}µ${id}">0</span>)</span>
				<div  >
					<ul class="myul" id="listA_polµ${type}µ${name}µ${id}">
						<li class="row">
							<div class="col-3">a0 :</div>
							<div class="col-6"><input class="form-control form-control-sm" type="number" placeholder="0" value="0"/></div>
						</li>
					</ul>
				</div>
			</td>
		</tr>

		<tr>
			<td colspan="2" class="mb-3">
				<div class="btn btn-sm btn-outline-success p-3" onclick="addToList('${id}', '${name}', '${type}')"><div class="p-1"><i class="fa fa-plus small"></i> Ajouter "a" </div></div>
				<div class="btn btn-sm btn-outline-danger p-3" onclick="removeToList('${id}', '${name}', '${type}')"><div class="p-1"><i class="fa fa-minus small"></i> Effacer "a" </div></div>
			</td>
		</tr>
	`;

	code.source = `lyc_polµ${type}µ${name}µ${id}`;
	return code;
}

function addToList(id, name, type) {
	var i = $(`#listA_polµ${type}µ${name}µ${id}`).find('li').length;
	code = `
		<li class="row">
			<div class="col-3">a${i} :</div>
			<div class="col-6"><input class="form-control form-control-sm" type="number" placeholder="0" value="0"/></div>
		</li>
	`;
	$(`#listA_polµ${type}µ${name}µ${id}`).append(code);

	$(`#n_polµ${type}µ${name}µ${id}`).text(i);


}
function removeToList(id, name, type) {
	var i = $(`#listA_polµ${type}µ${name}µ${id}`).find('li').length;
	if (i > 1) {
		$(`#listA_polµ${type}µ${name}µ${id}`).find('li')[i - 1].remove();
		$(`#n_polµ${type}µ${name}µ${id}`).text(i - 2);
	}
}

function Ipow(id, name, type, firstConstat, lastConstat, lastPrevision) {
	code = {
		caption: "",
		details: "",
		script: "",
		source: "",
	}
	code.caption = `Modèle en puissance`;
	code.details = `
		<tr>
			<td><label for="fyc_powµ${type}µ${name}µ${id}">Première année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="fyc_powµ${type}µ${name}µ${id}"  name="fyc_powµ${type}µ${name}µ${id}"  placeholder="${firstConstat}" value="${firstConstat}" min="${firstConstat}" max="${lastConstat}" required/></td>
		</tr>
		<tr>
			<td><label for="lyc_powµ${type}µ${name}µ${id}">Dernière année de constat : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyc_powµ${type}µ${name}µ${id}"  name="lyc_powµ${type}µ${name}µ${id}"  placeholder="${lastConstat}" value="${lastConstat}" disabled/></td>
		</tr>
		<tr>
			<td><label for="lyp_powµ${type}µ${name}µ${id}">Dernière année de prévision : </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="lyp_powµ${type}µ${name}µ${id}" name="lyp_powµ${type}µ${name}µ${id}"  placeholder="${lastPrevision}" value="${lastPrevision}" min="${lastConstat + 1}" max="${lastPrevision}" required/></td>
		</tr>
		<tr>
			<td colspan="2"><span class="fw-bold">Y = a.X<sup>p</sup> + b</span></td>
		</tr>
		<tr>
			<td><label for="a_powµ${type}µ${name}µ${id}">a = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="a_powµ${type}µ${name}µ${id}" name="a_powµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
		<tr>
			<td><label for="b_powµ${type}µ${name}µ${id}">b = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="b_powµ${type}µ${name}µ${id}" name="b_powµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
		<tr>
			<td><label for="p_powµ${type}µ${name}µ${id}">p = </label></td>
			<td><input class="form-control form-control-sm" style="width:auto" type="number" id="p_powµ${type}µ${name}µ${id}" name="p_powµ${type}µ${name}µ${id}"  placeholder="0" value="0"/></td>
		</tr>
	`;
	code.source = `lyc_powµ${type}µ${name}µ${id}`;
	return code;
}

//#endregion

//#region Calcul Hypothese

function CalculeHypothese(id, name, type) {
	try {
		if (lastClick[`${name}µ${type}`]) {
			var tr = $(lastClick[`${name}µ${type}`]);
			table = tr.closest("table");
			if (tr.attr("data-child") != "0" || $(table).attr("id").includes("treeV")) return false;

			// loading(true);
			$.ajax({
				type: 'post',
				data: "",
				success: function (response) {
					var value = $(`#formuleµ${type}µ${name}µ${id}`).find("option:selected").val();

					var decalage = $(`#decalageµ${type}µ${name}µ${id}`).val();

					var $table = $(`#treeH-${name}µ${type}`);

					let lastConstat = parseInt($table.find('td.table-separator').first().attr("data-column"));
					let firstConstat = parseInt($table.find('td.affichage').first().attr("data-column"));
					let lastPrevision = parseInt($table.find('td.affichage').last().attr("data-column"));


					var aff = affichage[`${name}µ${type}`];
					var annees = {
						first_year: firstConstat,
						last_year: lastPrevision,
						middle_year: lastConstat
					}

					var anneeA = new Array();
					$(`.list-anneeµ${type}µ${name}µ${id} .dual-listbox__selected`).find("li").each((k, v) => {
						anneeA.push(v.getAttribute("data-id"));
					});

					switch (value) {
						case "lastValue":
							first_year = $(`#fy_lastValµ${type}µ${name}µ${id}`).val();
							last_year = $(`#ly_lastValµ${type}µ${name}µ${id}`).val();

							lastVal(first_year, last_year, decalage, anneeA, tr, annees, aff);
							break;
						case "moyenneA":
							first_yearC = $(`#fyc_moyenneA${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_moyenneAµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_moyenneAµ${type}µ${name}µ${id}`).val();

							moyenneA(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, aff);
							break;
						case "Tglobal":
							last_yearC = $(`#lyc_Tglobalµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_Tglobalµ${type}µ${name}µ${id}`).val();
							taux = $(`#te_Tglobalµ${type}µ${name}µ${id}`).val();
							valeur = $(`#lvp_Tglobalµ${type}µ${name}µ${id}`).val();

							fonction = "";
							$(`[name="type_Tglobalµ${type}µ${name}µ${id}"]`).each((k, v) => {
								if (v.checked == true) {
									fonction = $(v).attr("data-fonction");
									return false;
								}
							});

							if (fonction == "taux") {
								TglobalT(last_yearC, last_yearP, decalage, anneeA, tr, annees, taux, aff);
							} else {
								TglobalV(last_yearC, last_yearP, decalage, anneeA, tr, annees, valeur, aff);
							}

							break;
						case "Tannuel":
							first_yearC = $(`#fyc_Tannuelµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_Tannuelµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_Tannuelµ${type}µ${name}µ${id}`).val();
							taux = $(`#te_Tannuelµ${type}µ${name}µ${id}`).val();

							Tannuel(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, taux, aff);
							break;
						case "moyenneG":
							first_yearC = $(`#fyc_moyenneGµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_moyenneGµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_moyenneGµ${type}µ${name}µ${id}`).val();

							p = []; tot_p = 0;
							$(`#listP_moyenneGµ${type}µ${name}µ${id}`).find("input").each((k, v) => {
								p.push(parseFloat(v.value));
                                tot_p += parseFloat(v.value);
							});
                            if (tot_p == 0) { alert("Total des p est nul. Le calcul a été annulé."); loading(false); return; }

							if (p.length == 0) return false;

							moyenneG(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, p, aff);
							break;
						case "Regr":
							first_yearC = $(`#fyc_Regrµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_Regrµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_Regrµ${type}µ${name}µ${id}`).val();
							coeff = $(`#coeff_Regrµ${type}µ${name}µ${id}`).val();

							var radio = document.getElementById(`check1_Regrµ${type}µ${name}µ${id}`).checked;

							p = RegrP(first_yearC, last_yearC, decalage, anneeA, tr, annees);
							x = RegrX(first_yearC, last_yearC, decalage, anneeA, tr, annees);
							a = RegrA(first_yearC, last_yearC, decalage, anneeA, tr, annees, p, x);
							b = RegrB(p, a, x);

							if (radio) Regr(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, coeff, a, b, aff);
							else Regr2(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, coeff, a, b, aff);

							break;
						case "exp":
							first_yearC = $(`#fyc_expµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_expµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_expµ${type}µ${name}µ${id}`).val();
							a = $(`#a_expµ${type}µ${name}µ${id}`).val();
							b = $(`#b_expµ${type}µ${name}µ${id}`).val();

							exp(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, b, aff);
							break;
						case "log":
							first_yearC = $(`#fyc_logµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_logµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_logµ${type}µ${name}µ${id}`).val();
							a = $(`#a_logµ${type}µ${name}µ${id}`).val();
							b = $(`#b_logµ${type}µ${name}µ${id}`).val();

							log(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, b, aff);
							break;
						case "pol":
							first_yearC = $(`#fyc_polµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_polµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_polµ${type}µ${name}µ${id}`).val();
							a = [];
							$(`#listA_polµ${type}µ${name}µ${id}`).find("input").each((k, v) => {
								a.push(parseFloat(v.value));
							});
							if (a.length == 0) return false;

							pol(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, aff);
							break;
						case "pow":
							first_yearC = $(`#fyc_powµ${type}µ${name}µ${id}`).val();
							last_yearC = $(`#lyc_powµ${type}µ${name}µ${id}`).val();
							last_yearP = $(`#lyp_powµ${type}µ${name}µ${id}`).val();
							a = $(`#a_powµ${type}µ${name}µ${id}`).val();
							b = $(`#b_powµ${type}µ${name}µ${id}`).val();
							p = $(`#p_powµ${type}µ${name}µ${id}`).val();

							pow(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, b, p, aff);
							break;
						default: break;
					}
					$(".colCheck :checked").each((k, v) => {
						v.click();
						v.click();
					});
					// loading(false);
				},
				error: function (xhr, e) {
					_alert("Erreur", 'Erreur : (Constat) ' + errorManager(xhr.responseText));
					loading(false);
				}
			});
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
		loading(false);
	}
}

//#region derniere valeur observée
function lastVal(first_year, last_year, decalage, anneeA, tr, annees, aff) {
	try {
		iFirst_year = first_year - annees.first_year;
		iLast_year = last_year - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;


		decalage = parseInt(first_year) + 1;

		var year = first_year;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}

		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));


		for (let i = decalage; i <= last_year; i++) {
			ChangeValue(value, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region moyenne arithmetique
function moyenneA(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, aff) {
	try {
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;


		var value = 0.0;
		var sum = 0;
		var n = 0;

		for (var i = first_yearC; i <= last_yearC; i++) {
			if (!anneeA.filter(x => x == i).length) {
				sum += parseFloat(tr.find(`td[data-column="${i}"]`).attr("data-newvalue"));

				n++;
			}
		}

		if (n == 0) { alert("error"); return false; }

		value = parseFloat(sum / n);

		for (let i = decalage; i <= last_yearP; i++) {
			ChangeValue(value, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region Taux global Taux
function TglobalT(last_yearC, last_yearP, decalage, anneeA, tr, annees, taux, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = last_yearC;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}

		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));
		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		year = parseInt(last_yearP - last_yearC);

		for (var i = decalage; i <= last_yearP; i++) {
			y = parseFloat(value) * Math.pow((1 + (taux / 100)), 1 / year);
			ChangeValue(y, tr, annees, i, aff);
			value = y;
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region Taux global Valeur
function TglobalV(last_yearC, last_yearP, decalage, anneeA, tr, annees, valeur, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = last_yearC;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}

		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));
		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		year = parseInt(last_yearP - last_yearC);

		cst = valeur / value;

		for (var i = decalage; i <= last_yearP; i++) {
			// 1 + (valeur - get(fy+dec-1)) / get(fy+dec-1) 
			y = parseFloat(value) * Math.pow(cst, 1 / year);
			ChangeValue(y, tr, annees, i, aff);
			value = y;
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region Taux annuel
function Tannuel(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, taux, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = last_yearC;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}
		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));
		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		for (var i = decalage; i <= last_yearP; i++) {
			y = parseFloat(value) * (1 + (taux / 100));
			ChangeValue(y, tr, annees, i, aff);
			value = y;
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region moyenne glissante pondere
function moyenneG(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, p, aff) {
	try {
		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		let year = last_yearC;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}

		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));

		for (let i = decalage; i <= last_yearP; i++) {
			e = 0.0;
			val = 0.0;
			for (var j = parseInt(year); j < i; j++) {
				tmp = (j - year < p.length) ? p[j - year] : 0;
				e += tmp;
				newy = parseInt(j) - 1;

				val += tmp * parseFloat(tr.find(`td[data-column="${newy}"]`).attr("data-newvalue"));

			}

			y = e != 0 ? parseFloat(val / e) : 0;
			value = y;
			ChangeValue(y, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region regression linéaire
function Regr2(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, coeff, a, b, aff) {
	try {
		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		var year = last_yearC;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}

		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));

		for (let i = decalage; i <= last_yearP; i++) {
			y = parseFloat(value) + (parseFloat(coeff) * parseFloat(a));
			ChangeValue(y, tr, annees, i, aff);
			value = y;
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
function Regr(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, coeff, a, b, aff) {
	try {
		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		var year = last_yearC;

		for (let i = year; i >= annees.first_year; i--) {
			if (!anneeA.filter(x => x == i).length) {
				year = i;
				break;
			}
		}

		var value = parseFloat(tr.find(`td[data-column="${year}"]`).attr("data-newvalue"));

		for (let i = decalage; i <= last_yearP; i++) {
			year = parseFloat(i) - parseFloat(first_yearC);
			y = parseFloat(b) + (parseFloat(coeff) * parseFloat(a) * parseFloat(year));
			ChangeValue(y, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
function RegrX(first_yearC, last_yearC, decalage, anneeA, tr, annees) {
	var sum = 0;
	var n = 0;

	for (var i = first_yearC; i <= last_yearC; i++) {
		if (!anneeA.filter(x => x == i).length) {
			sum += parseFloat(i) - parseFloat(first_yearC);
			n++;
		}
	}

	if (n == 0) { alert("error"); return false; }

	return parseFloat(sum / n);
}
function RegrP(first_yearC, last_yearC, decalage, anneeA, tr, annees) {
	var sum = 0;
	var n = 0;

	for (var i = first_yearC; i <= last_yearC; i++) {
		if (!anneeA.filter(x => x == i).length) {
			sum += parseFloat(tr.find(`td[data-column="${i}"]`).attr("data-newvalue"));
			n++;
		}
	}

	if (n == 0) { alert("error"); return false; }

	return parseFloat(sum / n);
}
function RegrA(first_yearC, last_yearC, decalage, anneeA, tr, annees, p, x) {
	try {
		var num = 0, div = 0;

		for (var i = first_yearC; i <= last_yearC; i++) {
			if (!anneeA.filter(x => x == i).length) {
				param1 = parseFloat(i) - parseFloat(first_yearC) - parseFloat(x);
				param2 = parseFloat(tr.find(`td[data-column="${i}"]`).attr("data-newvalue")) - parseFloat(p);
				num += param1 * param2;
				div += Math.pow(param1, 2);
			}
		}

		return parseFloat(num / div);
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
		return 0;
	}
}
function RegrB(p, a, x) {
	return parseFloat(p) - (parseFloat(a) * parseFloat(x));
}
//#endregion
//#region expo
function exp(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, b, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = first_yearC;

		var x = parseInt(annees.middle_year) + parseInt(decalage) - parseInt(year) + 1;

		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		for (var i = decalage; i <= last_yearP; i++) {
			y = parseFloat(a) * Math.exp(parseFloat(b) * x);
			x++;
			ChangeValue(y, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region logarithme
function log(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, b, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = first_yearC;

		var x = parseInt(annees.middle_year) + parseInt(decalage) - parseInt(year) + 1;

		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		for (var i = decalage; i <= last_yearP; i++) {
			y = parseFloat(a) * Math.log10(parseFloat(x)) + b;
			x++;
			ChangeValue(y, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region polynomiale
function pol(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = first_yearC;

		var x = parseInt(annees.middle_year) + parseInt(decalage) - parseInt(year) + 1;

		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		let y = 0;

		for (var i = decalage; i <= last_yearP; i++) {
			y = 0;
			for (var j = 0; j < a.length; j++) {
				y += parseFloat(a[j]) * Math.pow(parseFloat(x), j);
			}
			x++;
			ChangeValue(y, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region puissance
function pow(first_yearC, last_yearC, last_yearP, decalage, anneeA, tr, annees, a, b, p, aff) {
	try {
		iFirst_year = first_yearC - annees.first_year;
		iLast_year = last_yearP - annees.first_year;
		iMiddle_year = annees.middle_year - annees.first_year;

		var year = first_yearC;

		var x = parseInt(annees.middle_year) + parseInt(decalage) - parseInt(year) + 1;

		decalage = parseInt(annees.middle_year) + parseInt(decalage) + 1;

		for (var i = decalage; i <= last_yearP; i++) {
			y = parseFloat(a) * Math.pow(parseFloat(x), parseFloat(p)) + parseFloat(b);
			x++;
			ChangeValue(y, tr, annees, i, aff);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
	}
}
//#endregion
//#region ChangeValue
function ChangeValue(value, tr, annees, i, aff) {
	try {
		td = tr.find(`td[data-column="${i}"]`).first();
	}catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
		}
		if (td.length) {
			td.attr("data-newvalue", value);
			value = parseFloat(value);
			oldval = td.attr("data-value");

			var isFirst = td.attr("data-isFirst");
			var isTaux = td.attr("data-isTaux");

			var isFloat = false;
			if (td.attr("data-isFloat") == "true") isFloat = true;
			else isFloat = false;

			if (isFloat) value = parseFloat(value).toFixed(2);
			else value = parseFloat(value).toFixed(0);

			if (value == "NaN") value = parseFloat(0);

			td.attr("data-valeur", value);

			//before
			prevYears = parseInt(i) - 1;
			var before = tr.find('td[data-column="' + prevYears + '"]');
			if (before.length > 0) {
				var lastval = $(before).attr('data-newvalue');
				td.attr('data-difference', ToDifference(td.attr("data-newvalue"), lastval, false, isFloat));
				td.attr('data-taux', ToTaux(td.attr("data-newvalue"), lastval, false));
			}
			//after
			nextYears = parseInt(i) + 1;
			var after = tr.find('td[data-column="' + nextYears + '"]');
			if (after.length > 0) {
				var nextval = $(after).attr('data-newvalue');
				$(after).attr('data-difference', ToDifference(nextval, td.attr("data-newvalue"), false, isFloat));
				$(after).attr('data-taux', ToTaux(nextval, td.attr("data-newvalue"), false));
			}

			diff = td.attr('data-difference');
			taux = td.attr('data-taux');
			percent = (isTaux == "true") ? "%" : "";

			//toParent
			var id = tr.attr('data-id');

			td.attr('data-state', (value != oldval));
			var $ischanged = $(tr).find('td[data-state="true"]');
			tr.attr('data-state', ($ischanged.length > 0));

			var splt = id.split("_");
			var deg = splt[splt.length - 3];

			//calculMere
			/*
			if (splt[0] == "T" || splt[0] == "P" || splt[0].startsWith("ANC")) CalcMoy(table, tr, id, parseInt(i), deg);
			else CalcSum(tr, id, parseInt(i));
			*/
			CalculMere(table, tr, parseInt(i), value);

			value = parseFloat(value);
			diff = parseFloat(diff);



			switch (aff) {
				case "valeur":
					if (isFirst == "true") break;
					if (isFloat) td.text(new Intl.NumberFormat("fr-FR").format(value.toFixed(2)) + percent);
					else td.text(new Intl.NumberFormat("fr-FR").format(value.toFixed(0)) + percent);
					break;

				case "difference":
					if (isFirst == "true") break;
					if (isFloat) td.text(new Intl.NumberFormat("fr-FR").format(diff.toFixed(2)) + percent);
					else td.text(new Intl.NumberFormat("fr-FR").format(diff.toFixed(0)) + percent);
					break;

				case "taux":
					if (isFirst == "true") break;
					if (taux.includes("∞")) td.text(taux);
					else td.text(new Intl.NumberFormat("fr-FR").format(taux) + "%");
					break;

				default: break;
			}
		}
	/*}
	catch (err) {
		_alert("Erreur", err);
	}*/
}
//#endregion

function ToNormalNumber(value) {
	return parseFloat(value.toString().replaceAll(" ", ""));
}

//#endregion

function loadCons() {
	try {
		loading(true);

		var formData = new FormData();
		formData.append("userId", User.Id);
		formData.append("academyId", User.Academy.Id);

		$.ajax({
			type: "POST",
			url: "../../Constat/ListConstat",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			async: true,

			success: function (result) {
				var Datas = JSON.parse(result);

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
				/* Pour Constats*/
				Constats = {};
				for (var i = 0; i < Datas.Constats.length; i++) {
					Constats[`${Datas.Constats[i].Id}`] = Datas.Constats[i];
				}
				ConstatsDetails(Constats);

				/* Pour Scenarios*/
				Scenarios = {};
				for (var i = 0; i < Datas.Scenarios.length; i++) {
					Scenarios[`${Datas.Scenarios[i].Id}`] = Datas.Scenarios[i];
				}
				ScenariosDetails(Scenarios);

				/*if (Object.keys(Constats).length == 0) {
					if (!$("#oc_valider").hasClass("disabled")) $("#oc_valider").addClass("disabled");
					if (!$("#ns_valider").hasClass("disabled")) $("#ns_valider").addClass("disabled");
					if (!$("#os_valider").hasClass("disabled")) $("#os_valider").addClass("disabled");
				}*/


				loading(false);
			},

			error: function (xhr, e) {
				_alert("Erreur", 'Erreur : (Constat) ' + errorManager(xhr.responseText));
				loading(false);
			}
		});
	}
	catch (err) {	
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
		loading(false);
	}
	
}
function loadSCen() {
	try {
		loading(true);

		var formData = new FormData();
		formData.append("userId", User.Id);
		formData.append("academyId", User.Academy.Id);

		$.ajax({
			type: "POST",
			url: "../../Scenario/ListScen",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			async: true,

			success: function (result) {
				var Datas = JSON.parse(result);

				/* Pour Constats*/
				Constats = {};
				for (var i = 0; i < Datas.Constats.length; i++) {
					Constats[`${Datas.Constats[i].Id}`] = Datas.Constats[i];
				}
				ConstatsDetails(Constats);

				/* Pour Scenarios*/
				Scenarios = {};
				for (var i = 0; i < Datas.Scenarios.length; i++) {
					Scenarios[`${Datas.Scenarios[i].Id}`] = Datas.Scenarios[i];
				}
				ScenariosDetails(Scenarios);

				/*if (Object.keys(Constats).length == 0) {
					if (!$("#oc_valider").hasClass("disabled")) $("#oc_valider").addClass("disabled");
					if (!$("#ns_valider").hasClass("disabled")) $("#ns_valider").addClass("disabled");
					if (!$("#os_valider").hasClass("disabled")) $("#os_valider").addClass("disabled");
				}*/

				loading(false);
			},

			error: function (xhr, e) {
				_alert("Erreur", 'Erreur : (Constat) ' + errorManager(xhr.responseText));
				loading(false);
			}
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Constat) ' + errorManager(err));
		loading(false);
	}
}
