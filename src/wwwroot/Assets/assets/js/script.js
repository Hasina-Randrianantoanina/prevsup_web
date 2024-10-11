var User;
var Constats, Scenarios, TabRecaps;
var thread;
var checkF5 = true;

$(document).ready(() => {
	User = JSON.parse(sessionStorage.getItem("user"));
	if (!User) {
		//alert("temps de plus"); //popup => form modal +heure si heure fin => login

		window.location = "../";
	}
	setCSS(User.ColorUI);
	if (User.Login == 'admin') {
		$('.admin-menu').show();
		$('.academie-menu').hide();
	} else {
		// $('.admin-menu').hide();
    }

	InitData();
	GetAllData();

    /*window.onbeforeunload = function() {
       if (checkF5) {
          return "Les opérations en cours seront annulées si vous quitter cette page !";
       }
    }*/
});

$("#logout").click((e) => { 
	e.preventDefault();
	let user = sessionStorage.getItem("user");

	var formData = new FormData();
	if (user) {
		user = JSON.parse(user);
    }
	formData.append("login", user.Login);
	$.ajax({
		type: "POST",
		url: "../../User/Logout",
		data: formData,
		cache: false,
		contentType: false,
		processData: false,

		success: function (result) {
			sessionStorage.setItem("user", null); 
			window.location = "../";
		},

		error: function (xhr, e) {
			alert(xhr.responseText);
			loading(false);
		}
	}).done(() => {
		loading(false);
	});
});

var ListFiliere = {};
var ListAide = {};
var ListFormule = {};
function GetAllData() {
	$.ajax({
		type: "POST",
		url: "../GetAllData",
		data: "",
		cache: false,
		contentType: false,
		processData: false,
		async: true,

		success: function (result) {
			var Datas = JSON.parse(result);
			ListFiliere = Datas[0];
			ListAide = Datas[1];
			ListFormule = Datas[2];
		},

		error: function (x, e) {
			_alert("Erreur", 'Erreur : (script) ' + errorManager(e));
		}
	});
}

function InitData() {
	loading(true);

	var formData = new FormData();
	formData.append("userId", User.Id);
	formData.append("academyId", User.Academy.Id);	
	/*try {
		var val = 0;
		
		alert('eto'+ra);
	} catch (err) {
		_alert("Erreur", 'Erreur : (script) ' + errorManager(err));
	}*/
	$.ajax({
		type: "POST",
		url: "../InitData",
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

			/*
			 if (Object.keys(Constats).length == 0) {
				if (!$("#oc_valider").hasClass("disabled")) $("#oc_valider").addClass("disabled");
				if (!$("#ns_valider").hasClass("disabled")) $("#ns_valider").addClass("disabled");
				if (!$("#os_valider").hasClass("disabled")) $("#os_valider").addClass("disabled");
			}
			*/

			/* Pour TabRecaps*/
			/*TabRecaps = {};
			for (var i = 0; i < Datas.Constats.length; i++) {
				Scenarios[`${Datas.TabRecaps[i].Id}`] = Datas.TabRecaps[i];
			}*/

			/* Pour Utilisateurs*/
			Utilisateurs = {};
			for (var i = 0; i < Datas.Utilisateurs.length; i++) {
				Utilisateurs[`${Datas.Utilisateurs[i].Id}`] = Datas.Utilisateurs[i];
			}
			UtilisateursDetails(Utilisateurs);

			/* Pour Académies */
			Academies = {};
			for (var i = 0; i < Datas.Academies.length; i++) {
				Academies[`${Datas.Academies[i].Id}`] = Datas.Academies[i];
			}
			AcademiesDetails(Academies);

			loading(false);
		},

		error: function (xhr, e) {
			_alert("Erreur", 'Erreur : ' + errorManager(xhr.responseText));
			loading(false);
		}
	});/*.done(() => {
		InitTree();
	});*/
}

//#region details
function ConstatsDetails(constats) {
	if (constats.length == 0) return false;
	var code = ``;
	$(`#oc_list`).empty();
	$(`#nc_list`).empty();
	$(`#ns_listc`).empty();

	$.each(constats, (k, v) => {
		code += `
                    <option value="${v.Id}">${v.Name}</option>
				`;

	});

	$("#oc_list").append(code);
	$("#nc_list").append(code);
	$("#ns_listc").append(code);

	if (Object.keys(Constats).length > 0) {
		$.each(constats, (k, v) => {
			$("#ns_depAnnee").val(parseInt(v.Last_year) + 1);
			return false;
		})
	}
}

function ScenariosDetails(scenarios) {
	if (scenarios.length == 0) return false;
	var code = ``;
	$(`#os_list`).empty();
	$(`#ns_list`).empty();

	$.each(scenarios, (k, v) => {
		code += `
                    <option value="${v.Id}">${v.Name}</option>
				`;

	});

	$("#os_list").append(code);
	$("#ns_list").append(code);
}

function UtilisateursDetails(utilisateurs) {
	// TODO
	if (utilisateurs.length == 0) return false;
	var code = ``;
	$(`#ou_list`).empty();
	$("#ou_list_delete").empty();

	$.each(utilisateurs, (k, v) => {
		code += `
                    <option value="${v.Id}">${v.Login}</option>
				`;

	});

	$("#ou_list").append(code);
	$("#ou_list_delete").append(code);
}

function AcademiesDetails(academies) {
	if (academies.length == 0) return false;
	if (!User.Academies || User.Academies.length == 0) return false;
	var acas = User.Academies ? User.Academies.split(",") : [ User.Academy.Id ];
	var code = ``;
	$(`#nc_list_aca`).empty();
	$.each(acas, (k, v) => {
		try {
			code += `
                    <option value="${v}">${Academies[v].Name}</option>
				`;
		} catch (e)  {
			_alert('Erreur : Veuillez contacter l\'administrateur pour vous spécifier une ou des académies.');
        }

	});

	$("#nc_list_aca").append(code);
}
//#endregion

function loading(test) {
	if (test) {
		if (!$("#loading").hasClass("show")) {
			$("#loading").removeClass("hide");
			$("#loading").addClass("show");
		}
	} else {
		if ($("#loading").hasClass("show")) {
			$("#loading").removeClass("show");
			$("#loading").addClass("hide");
		}
	}
}

function Show(element, test) {
	if (test) {
		if (element.hasClass("visually-hidden")) { element.removeClass("visually-hidden"); }
	} else {
		if (!element.hasClass("visually-hidden")) { element.addClass("visually-hidden"); }
	}
}

function normalizes(evt) {
	var theEvent = evt || window.event;

	if (theEvent.type === 'paste') {
		key = event.clipboardData.getData('text/plain');
	} else {
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
	}
	var regex = /[a-zA-Z0-9_-]/;
	if (!regex.test(key)) {
		theEvent.returnValue = false;
		if (theEvent.preventDefault) theEvent.preventDefault();
	}
}
function errorManager(e, errorType = null) {
	// TODO: Refactoring
	if(errorType != null) {
		if (errorType === "timeout") {
			return "La connexion au serveur a pris trop de temps. Veuillez vérifier qu'il est en ligne.";
		}
	}

	if(e!= null && typeof e == 'object') {
		return JSON.stringify(e);
	}
	if(e!= null && Array.isArray(e)) {
		return e.toString();
	}

	
	return e;
	/*
	if (e instanceof TypeError) return 'Type de variable ou paramètre invalide (' + e.message + ')';
	else if (e instanceof RangeError) return 'Paramètre en dehors de la plage de validité (' + e.message+')';
	else if (e instanceof ReferenceError) return 'Référence invalide (' + e.message+')' ;
	else if (e instanceof SyntaxError) return 'Erreur de syntaxe (' + e.message + ')';
	//else if (e instanceof InternalError) return 'Erreur interne de JavaScript (' + e.message + ')';
	else if (e instanceof Error) return 'Erreur de permission (' + e.message + ')';
	else if (e instanceof URIError) return 'Erreur encodage ou décodage URI (' + e.message + ')';
	else if (typeof e === "string") {
		if (e === "timeout") return 'Réseau indisponible';
		else return 'Erreur interne';
	}
	else return 'Autres erreur (' + e.message + ')';
	*/
}