
  function loadRoleTypes()
  {
	  try {
		  loading(true);

		  var formData = new FormData();
		  formData.append("userId", User.Id);
		  formData.append("academyId", User.Academy.Id);

		  $.ajax({
			  type: "POST",
			  url: "../../Scenario/ListScenario",
			  data: formData,
			  cache: false,
			  contentType: false,
			  processData: false,
			  async: true,

			  success: function (result) {
				  var Datas = JSON.parse(result);
				  //populate selectbox scenario
				  $("#nr_list option").remove();
				  $.each(Datas, (k, v) => {
					  $("#nr_list").append(`<option value="${v.Id}">${v.Name}</option>`);
				  });
				  loading(false);
			  },

			  error: function (x, e) {
				  _alert('Erreur : (Recap) ' + errorManager(e));
				  loading(false);
			  }
		  });
	  }
	  catch (err) {
		  _alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	  }
}
$('#nr_nom').keypress(function (e) {
	var txt = String.fromCharCode(e.which);
	if (!txt.match(/[a-zA-Z0-9_-]/)) {
		return false;
	}


});
function loadRecap() {
	try {
		loading(true);

		var formData = new FormData();
		formData.append("userId", User.Id);
		formData.append("academyId", User.Academy.Id);

		$.ajax({
			type: "POST",
			url: "../../Recap/ListRecap",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			async: true,

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
				//populate selectbox scenario
				$("#nr_recap option").remove();
				$.each(Datas, (k, v) => {
					$("#nr_recap").append(`<option value="${v.Name}">${v.Name}</option>`);
				});
				loading(false);
			},

			error: function (x, e) {
				_alert("Erreur", 'Erreur : (Recap) ' + errorManager(e));
				loading(false);
			}
		});
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}

function new_recap(suff) {
	try {
		loading(true);
		if ($('#needs-validation')[0].checkValidity()) {
			var name = $(`#${suff}nom`).val();
			var scenario = $(`#${suff}list`).val();

			var formData = new FormData();
			formData.append("userId", User.Id);
			formData.append("academyId", User.Academy.Id);
			formData.append("name", name);
			formData.append("idscenario", scenario);
			$('#newRecap').modal('hide');
			$.ajax({
				type: "POST",
				url: "../../Recap/CreateRecap",
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				async: true,

				success: function (result) {
					var Datas = JSON.parse(result);
					var res = Datas.hasOwnProperty('result');
					if (res) {
						if (Datas.result == 'existe') {
							loading(false);
							$.alert({
								title: 'Prevsup web',
								content: 'Le tableau récapitulatif [' + name + '] existe!\n, Souhaitez-vous continuer ?',
								escapeKey: 'cancel',
								buttons: {
									confirm: {
										text: 'Oui',
										btnClass: 'btn-blue',
										action: function () {
											$(`#${suff}nom`).val('');
											$('#newRecap').modal('show');
										}
									},
									cancel: {
										text: 'Non',
										action: function () {
											$(`#${suff}nom`).val('');
											$("#nr_list option").remove();
										}
									}
								}
							});
						}
						else
							if (Datas.result == 'error') {
								$.confirm({
									icon: 'fa fa-warning',
									title: 'Error!',
									content: result.msg
								});
							}
					}
					else {

						//create tab recap
						var id = 0;
						$("#onglet").append(CreateOnglet(id, name, 'recap'))
						$("#ongletContent").append(CreateInterfaceRecap(id, name, 'recap', Datas));
						ongletActive(`recapµ${name}µ${id}`);
						loading(false);
					}
				},

				error: function (xhr, e) {
					_alert("Erreur", 'Erreur : (Recap) ' + errorManager(xhr.responseText));
					loading(false);
				}
			}).done(() => {
				loading(false);
			});
		} else {
			loading(false);
			$('#needs-validation')[0].reportValidity();
		}
	} catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}
function open_recap(suff) {
	try {
		loading(true);
		if ($('#needs-validation-recap')[0].checkValidity()) {
			var name = $(`#nr_recap`).val();
			var formData = new FormData();
			formData.append("userId", User.Id);

			formData.append("academyId", User.Academy.Id);
			formData.append("recapit", name);
			$.ajax({
				type: "POST",
				url: "../../Recap/OpenRecap",
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				async: true,

				success: function (result) {
					var Datas = JSON.parse(result);
					var res = Datas.hasOwnProperty('result');
					if (res) {
						if (Datas.result == 'existe') {
							loading(false);
							$.alert({
								title: 'Prevsup web',
								content: 'Le tableau récapitulatif [' + name + '] existe!\n, Souhaitez-vous continuer ?',
								escapeKey: 'cancel',
								buttons: {
									confirm: {
										text: 'Oui',
										btnClass: 'btn-blue',
										action: function () {
											$(`#${suff}nom`).val('');
											$('#newRecap').modal('show');
										}
									},
									cancel: {
										text: 'Non',
										action: function () {
											$(`#${suff}nom`).val('');
											$("#nr_list option").remove();
										}
									}
								}
							});
						}
						else
							if (Datas.result == 'error') {
                                loading(false);
								$.confirm({
									icon: 'fa fa-warning',
									title: 'Error!',
									content: result.msg
								});
							}
					}
					else {

						//create tab recap
						var id = 0;
						$("#onglet").append(CreateOnglet(id, name, 'recap'))
						$("#ongletContent").append(CreateInterfaceRecap(id, name, 'recap', Datas));
						ongletActive(`recapµ${name}µ${id}`);
						loading(false);
					}
				},

				error: function (x, e) {
					alert('Erreur : (Recap) ' + errorManager(e));
					loading(false);
				}
			});
		} else {
			loading(false);
			$('#needs-validation')[0].reportValidity();
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}
function CreateInterfaceRecap(id, name, type, datas) {
	try {
		var code = `<style>i{padding-right: 10px;}</style>`;
		code += `
            <div class="row p-2 collapse onglet" id="cµ${type}µ${name}µ${id}" style="height:100%">
				<div class="col-md-12" id="tableµ${type}µ${name}µ${id}" style="height:100%">
				    
	`;
		if (type == "recap") {
			code += ` 
				<div class="tab-content" id="pills-tabContent">
					<div class="tab-pane fade show active" id="pills-eff-${name}" role="tabpanel" aria-labelledby="pills-home-tab">
					
					<div class="row col-sm-5 mb-1">
						<div class="col-1"></div>
						<button type="button" class="col-3 float-end btn btn-sm btn-dark" onclick="exporter('eff','${name}')"><i class="fa fa-file-export"></i><span class="lbl-btn">Exporter</span></button>
						<div class="col-1"></div>
						<button type="button" class="col-3 float-end btn btn-sm btn-danger" onclick="delete_recap('eff','${name}')"><i class="fa fa-trash"></i><span class="lbl-btn">Supprimer</span></button>
					</div>
						<div class=" p-2" id="tableauµ${type}µ${name}µ${id}" style="min-height:50vh;height:50vh; resize:vertical; overflow: auto"><div class="table-container">
				<table id="tree-Effect-${name}" class="table  table-tree table-hover table-responsive"><thead><th width="25%" style="z-index : 1" colspan="3">Projection Effectifs LMD</th>`;
			$.each(datas.YearsEff, function (k, v) {
				code += `<th>${v}</th>`;
			});
			code += `</thead><tbody class="table-body-container">`;
			$.each(datas.EffectifLMD, function (k, v) {
				var realname = v.Name.toString();
				if (realname.includes("_IJ_1:9,")) realname = realname.replace("_IJ_1:9,", "_J_");

				code += `<tr data-id="${v.id}" data-parent="${v.parentid}" data-level="${v.Level}" data-child="${v.Child}" data-realname="${realname}">
								<td></td>
								<td></td>
								<td class="VariableCol" data-column="name"  data-value="${v.Name}" data-realname="${realname}"><div class="var-container">${v.displayLabel}</div></td>`;
				$.each(v._data, function (b, n) {
					if (b == datas.IndexLastYearEff)
						code += `<td class="table-separator" data-column="${datas.YearsEff[b]}" data-value="${n}" data-years="${datas.YearsEff[b]}">${parseFloat(n).toFixed(0)}</td>`;
					else
						code += `<td data-column="${datas.YearsEff[b]}"  data-value="${n}" data-years="${datas.YearsEff[b]}">${parseFloat(n).toFixed(0)}</td >`;
				});
				code += `</tr>`;
			});


			code += `</tbody> </table></div></div> </div>
					<div class="tab-pane fade" id="pills-dip-${name}" role="tabpanel" aria-labelledby="pills-profile-tab">
					<div class="row col-sm-5 mb-1">
						<div class="col-1"></div>
						<button type="button" class="col-3 float-end btn btn-sm btn-dark" onclick="exporter('dip','${name}')"><i class="fa fa-file-export"></i><span class="lbl-btn">Exporter</span></button>
						<div class="col-1"></div>
						<button type="button" class="col-3 float-end btn btn-sm btn-danger" onclick="delete_recap('dip','${name}')"><i class="fa fa-trash"></i><span class="lbl-btn">Supprimer</span></button>
					</div>
			<div class=" p-2" id="tableauµ${type}µ${name}µ${id}" style="min-height:50vh;height:50vh; resize:vertical; overflow: auto"><div class="table-container">
				<table id="tree-Dip-${name}" class="table  table-tree table-hover table-responsive"><thead><th width="25%"  style="z-index : 1" colspan="3">Projection Diplômés LMD</th>`;

			$.each(datas.YearsDip, function (k, v) {
				code += `<th>${v}</th>`;
			});
			code += `</thead><tbody class="table-body-container">`;
			$.each(datas.DiplomeLMD, function (k, v) {
				var realname = v.Name.toString();
				if (realname.includes("_IJ_1:9,")) realname = realname.replace("_IJ_1:9,", "_J_");

				code += `<tr data-id="${v.id}" data-parent="${v.parentid}" data-level="${v.Level}" data-child="${v.Child}" data-realname="${realname}">
								<td></td>
								<td></td>
								<td class="VariableCol" data-column="name"  data-value="${v.Name}" data-realname="${realname}"><div class="var-container">${v.displayLabel}</div></td>`;
				$.each(v._data, function (b, n) {
					if (b == datas.IndexLastYearDip)
						code += `<td class="table-separator" data-column="${datas.YearsDip[b]}" data-value="${n}"  data-years="${datas.YearsDip[b]}">${parseFloat(n).toFixed(0)}</td>`;
					else
						code += `<td data-column="${datas.YearsDip[b]}"  data-value="${n}"  data-years="${datas.YearsDip[b]}">${parseFloat(n).toFixed(0)}</td>`;
				});
				code += `</tr>`;
			});

			// console.log(datas.isNational);
			if (datas.isNational == true) {
				code += `</tbody> </table></div></div> </div>
						<div class="tab-pane fade" id="pills-acc-${name}" role="tabpanel" aria-labelledby="pills-contact-tab">
						<div class="row col-sm-5 mb-1">
							<div class="col-1"></div>
							<button type="button" class="col-3 float-end btn btn-sm btn-dark" onclick="exporter('acc','${name}')"><i class="fa fa-file-export"></i><span class="lbl-btn">Exporter</span></button>
							<div class="col-1"></div>
							<button type="button" class="col-3 float-end btn btn-sm btn-danger" onclick="delete_recap('acc','${name}')"><i class="fa fa-trash"></i><span class="lbl-btn">Supprimer</span></button>
						</div>
						<div class=" p-2" id="tableauµ${type}µ${name}µ${id}" style="min-height:50vh;height:50vh; resize:vertical; overflow: auto"><div class="table-container">
						<table id="tree-Accad-${name}" class="table  table-tree table-hover table-responsive"><thead><th width="25%"  style="z-index : 1" colspan="3">Projection Académie LMD</th>`;

				$.each(datas.YearsAca, function (k, v) {
					code += `<th>${v}</th>`;
				});
				code += `</thead><tbody class="table-body-container">`;
				$.each(datas.AccademieLMD, function (k, v) {
					var realname = v.Name.toString();
					if (realname.includes("_IJ_1:9,")) realname = realname.replace("_IJ_1:9,", "_J_");

					code += `<tr data-id="${v.id}" data-parent="${v.parentid}" data-level="${v.Level}" data-child="${v.Child}" data-realname="${realname}">
									<td></td>
									<td></td>
									<td class="VariableCol" data-column="name"  data-value="${v.Name}" data-realname="${realname}"><div class="var-container">${v.displayLabel}</div></td>`;
					$.each(v._data, function (b, n) {
						if (b == datas.IndexLastYearAca)
							code += `<td class="table-separator" data-column="${datas.YearsAca[b]}" data-value="${n}"  data-years="${datas.YearsAca[b]}">${parseFloat(n).toFixed(0)}</td>`;
						else
							code += `<td data-column="${datas.YearsAca[b]}" data-value="${n}"  data-years="${datas.YearsAca[b]}">${parseFloat(n).toFixed(0)}</td>`;
					});
					code += `</tr>`;
				});
			}

			code += `</tbody> </table></div></div> </div>
				</div>`;
			code += `
				<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
				  <li class="nav-item" role="presentation">
					<button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-eff-${name}" type="button" role="tab" aria-controls="#pills-eff-${name}" aria-selected="true">Projection Effectifs LMD</button>
				  </li>
				  <li class="nav-item" role="presentation">
					<button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-dip-${name}" type="button" role="tab" aria-controls="pills-dip-${name}" aria-selected="false">Projection Diplômés LMD</button>
				  </li>`;
			if (datas.isNational == true)
				code +=
				 `<li class="nav-item" role="presentation">
					<button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-acc-${name}" type="button" role="tab" aria-controls="pills-acc-${name}" aria-selected="false">Projection Académie LMD</button>
				  </li>
				`;

			code += `</ul>`;

		}
		code += `
				    </div>
					<div class="footer">
						<div class="c-varinfo">
							<div id="display-var"></div>
						</div>
						<div style="width:100%; height: 100%;" class="c-chart">
							<canvas id="myChartrecap"></canvas>
						</div>
					</div>
			    </div>
            </div>

            

            <script>
				$(document).on("click", "#tree-Effect-${name} tbody tr", function(event) {
					$(this).addClass('selected');
					if(event.ctrlKey){
						$(this).addClass('selected');
					}
					else
					{
						 $('#tree-Effect-${name} tbody tr').removeClass("selected");
						 $(this).addClass('selected');
					}
					$('#display-var').empty().html("Le scénario parent est :<b>${datas.scenarioname}</b>")
					var id=$(this).attr("date-id");
					ValidateChart(id,$(this));
				});
				$(document).on("click", "#tree-Dip-${name} tbody tr", function(event) {
					$(this).addClass('selected');
					if(event.ctrlKey){
						$(this).addClass('selected');
					}
					else
					{
						 $('#tree-Dip-${name} tbody tr').removeClass("selected");
						 $(this).addClass('selected');
					}
					$('#display-var').empty().html("Le scénario parent est :<b>${datas.scenarioname}</b>")
					var id=$(this).attr("date-id");
					ValidateChart(id,$(this));
				});
				$(document).on("click", "#tree-Accad-${name} tbody tr", function(event) {
					$(this).addClass('selected');
					if(event.ctrlKey){
						$(this).addClass('selected');
					}
					else
					{
						 $('#tree-Accad-${name} tbody tr').removeClass("selected");
						 $(this).addClass('selected');
					}
					$('#display-var').empty().html("Le scénario parent est :<b>${datas.scenarioname}</b>")
					var id=$(this).attr("date-id");
					ValidateChart(id,$(this));
				});
				$(document).ready(function () {
                    
					
					$("#tableauµ${type}µ${name}µ${id}").scroll(function () {
		                var w = $("#tableauµ${type}µ${name}µ${id}").prop("scrollHeight");

		                var a = $("#tableauµ${type}µ${name}µ${id}").height();

		                if (a + 1 > w - $("#tableauµ${type}µ${name}µ${id}").scrollTop()) {
			                ScrollTree('${id}', '${name}', '${type}');
		                }
	                });
                });
				$('#tree-Effect-${name}').on('click','tr td[data-column="name"]', function(e) {
					chargedata(e,'${name}µ${type}');
				});
				$('#tree-Dip-${name}').on('click','tr td[data-column="name"]', function(e) {
					chargedata(e,'${name}µ${type}');
				});
				$('#tree-Accad-${name}').on('click','tr td[data-column="name"]', function(e) {
					chargedata(e,'${name}µ${type}');
				});
				modeliseTableRecap('#tree-Effect-${name}');
				modeliseTableRecap('#tree-Dip-${name}');
				modeliseTableRecap('#tree-Accad-${name}');
            </script>
    `;
		return code;
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
		return '';
	}
}
//Chart
function getRandomColor() {
	var letter = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++)
		color += letter[Math.floor(Math.random() * 16)];
	return color;
}


var ctxRec = "";

var ChartGraphRec = new Chart();
var saveChartRec = new Array();
function ValidateChart(id, tr) {
	try {
		var ctxRec = "";

		ChartGraphRec = new Chart();
		saveChartRec = new Array();
		$(`#myChartrecap`).replaceWith($(`<canvas id="myChartrecap"></canvas>`));
		ctxRec = document.getElementById(`myChartrecap`).getContext('2d');

		var annees = [];
		var label = "";
		var chart = {
			id: id,
			label: "",
			datas: new Array()
		};
		if ($(tr).hasClass('selected')) {
			$(tr).find('td').each(function (v, k) {
				if (v >= 3) {
					chart.datas.push($(this).attr("data-value"));
					annees.push($(this).attr("data-years"));
				}
				else {
					chart.label = $(this).attr("data-realname");
				}

			});

			createChartRecap(chart, ctxRec, annees);
		} else {
			let index = saveChartRec.findIndex(element => {
				if (element.id == id) {
					return true;
				}
			});
			saveChartRec.shift(index, 1);
			updateChart(ctxRec);
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}

//const ctxRec = document.getElementById('myChart').getContext('2d');
var annees;
function createChartRecap(chart, ctxRec, annees) {
	try {
		/*TO DO*/
		/*var annee = () => {
			for (var i = 0; i < length; i++) {
				UXD
			}
		};*/

		/*FIN TO DO*/

		const color = ["red", "blue", "orange", "brown", "#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"];
		var rColor = Math.floor(Math.random() * color.length);




		var graph = {
			id: chart.id,
			label: chart.label,
			data: chart.datas,
			borderWidth: 1,
			borderColor: color[rColor]
		}

		saveChartRec.push(graph);


		updateChartRecap(ctxRec, annees);
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}

function updateChartRecap(ctxRec, annees) {
	try {
		ChartGraphRec.destroy();

		if (saveChartRec.length > 0) {
			ChartGraphRec = new Chart(ctxRec, {
				type: 'line',
				data: {
					labels: annees,
					datasets: saveChartRec
				},
				plugins: {
					legend: {
						position: 'right',
						align: 'center'
					}
				}

			});
		}
	}
	catch (err) {
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}

function delete_recap(type, name) {
	var conf = confirm("Voulez-vous vraiment supprimer " + name + "?");
	if(conf) {

		try {
			loading(true);
			$.ajax({
				type: "DELETE",
				url: `../../Recap/DeleteRecap/?name=${name}`,
				cache: false,
				contentType: false,
				processData: false,
				async: false,
				success: function(result) {
					loading(false);
					if(result) {
						result = JSON.parse(result);
						let alert = $.alert({
							icon: 'fa fa-info',
							title: 'Suppression récapitulatif',
							content: result.msg,
							escapeKey: 'cancel',
						});
						// TODO: Remove
						setTimeout(() => location.reload(), 1000);
					} else {
						// Error
						alert("Erreur : (Recap) Une erreur inconnue s'est produite.");
					}
				},
				error: function (x, e) {
					alert('Erreur : (Recap) ' + errorManager(e));
					loading(false);
				}
			})
		} catch(err) {
			loading(false);
			_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
		}
	}

}

function exporter(type, name) {
	try {
		loading(true);
		var formData = new FormData();
		formData.append("name", name);
		formData.append("userId", User.Id);
		formData.append("academyId", User.Academy.Id);
		formData.append("type", type);
		$.ajax({
			type: "POST",
			url: "../../Recap/downloadFile",
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
								content: " Le fichier tab recap n'existe pas! ",
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
						content: " Le fichier tab recap n'existe pas! ",
						escapeKey: 'cancel',

					});
					loading(false);
					return;
				}
				loading(false);
				checkF5 = false;
				window.location = '/Main/GetFile?file=' + Datas.Path;
				$.alert({ title: 'Prevsup web', content: `Le tableau récapitulatif [${name}] a été bien exporté`, escapeKey: 'cancel', });
				setTimeout(function() { checkF5 = true; }, 3000);
			},
			error: function (x, e) {
				alert('Erreur : (Recap) ' + errorManager(e));
				loading(false);
			}
		});
	}
	catch (err) {
		loading(false);
		_alert("Erreur", 'Erreur : (Recap) ' + errorManager(err));
	}
}

function modeliseTableRecap(tree) {
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
				$div = $columnName.find('div'),
				$allCol = $row.find('td');
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
				if (!$columnName.hasClass("noexpandable")) {
					$columnName.addClass("noexpandable");
					$columnName.removeClass("expandable");
				}
				$allCol.each((k, v)=>{
					if (!$(v).hasClass("bg-child")) {
						$(v).addClass("bg-child");
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
					'<i class="treegrid-indent" style="width:' + 12 * (level - 1) + 'px"></i>' +
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

