function open_user_ui() {
	formData = new FormData();
	formData.append("userid", User.Id);
	$.ajax({
		type: "POST",
		url: "../../User/GetColorUI",
		data: formData,
		cache: false,
		contentType: false,
		processData: false,

		success: function (result) {
			data = JSON.parse(result);
			if (data.color) {
				var color = data.color;
				$("#ui_separator").val(color.separator);
				$("#ui_back").val(color.back);
				$("#ui_calcback").val(color.calcback);
				$("#ui_constatdata").val(color.constatdata);
				$("#ui_calcconst").val(color.calcconst);
				$("#ui_calcscen").val(color.calcscen);
				$("#ui_scenback").val(color.scenback);
				$("#ui_scendata").val(color.scendata);
				$("#ui_active").val(color.active);
			}
		},

		error: function (x, e) {
			_alert("Erreur", 'Erreur : (Open user UI) ' + errorManager(e));
		}
	});
}

var colorUI = {
	separator: "#f00",
};
var DefaultUI = {
	separator: "#ff0a11",
	back: "#ffffff",
	calcback: "#dbb9b9",
	constatdata: "#000000",
	calcconst: "#000000",
	calcscen: "#000000",
	scenback: "#dbb9b9",
	scendata: "#000000",
	active: "#0db4ea",
}

function setCSS(ColorUI) {
	if (ColorUI == null) ColorUI = DefaultUI;
	style = `

		.table-separator{border-right-color : ${ColorUI.separator} !important;}

		.table-body-container{background-color : ${ColorUI.back} !important;}
		td.sticky-col{background-color : ${ColorUI.back} !important;}
		.VariableCol{background-color : ${ColorUI.back} !important;}
		.table-tree td.expandable:nth-child(3){background-color : ${ColorUI.back} !important;}

		.table-tree td.noexpandable:nth-child(n-3){background-color:${ColorUI.calcback} !important;}
	    td[contenteditable="true"].single-line {background-color:${ColorUI.scenback}; !important;}
		.bg-child{background-color:${ColorUI.calcback} !important;}

		.table-constat-back {color: ${ColorUI.constatdata} !important}
		.constat-Child-back {color: ${ColorUI.calcconst} !important}

		.scenario-Child-back {color: ${ColorUI.scendata} !important}
		.table-scenario-back {color: ${ColorUI.calcscen} !important}

		.activeVariable{background-color:${ColorUI.active} !important;}
	


	`;

	$("#styleCss").empty();
	$("#styleCss").append(style);

}

function usercolor(reset) {
	if (reset) {
		var ColorUI = DefaultUI;
	} else {
		var ColorUI = {
			separator: $("#ui_separator").val(),
			back: $("#ui_back").val(),
			calcback: $("#ui_calcback").val(),
			constatdata: $("#ui_constatdata").val(),
			calcconst: $("#ui_calcconst").val(),
			calcscen: $("#ui_calcscen").val(),
			scenback: $("#ui_scenback").val(),
			scendata: $("#ui_scendata").val(),
			active: $("#ui_active").val(),
		}
	}
	setCSS(ColorUI)

	formData = new FormData();
	//formData.append("color", ColorUI);
	formData.append("separator", ColorUI.separator);
	formData.append("back", ColorUI.back);
	formData.append("calcback", ColorUI.calcback);
	formData.append("constatdata", ColorUI.constatdata);
	formData.append("calcconst", ColorUI.calcconst);
	formData.append("calcscen", ColorUI.calcscen);
	formData.append("scenback", ColorUI.scenback);
	formData.append("scendata", ColorUI.scendata);
	formData.append("active", ColorUI.active);
	formData.append("user", User.Id);
	//formData.append("user", User);
	$.ajax({
		type: "POST",
		url: "../../User/ChangeColorUI",
		data: formData,
		cache: false,
		contentType: false,
		processData: false,

		success: function (result) {
			$('#InterfaceUI').modal('hide');
		},

		error: function (x, e) {
			_alert("Erreur", 'Erreur : (User color) ' + errorManager(e));
		}
	});
}