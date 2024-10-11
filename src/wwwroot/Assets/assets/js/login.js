$(document).ready(()=>{
	$(`#login_user`).click(() => {
		$(`#login_username`).focus();
    });
	$(`#login_pass`).click(()=>{
		$(`#login_password`).focus();
    });


	$(`#login_submit`).click(() => {
		Login_submit();
	});
	$(window).keypress((evt) => {
		if (evt.keyCode == 13) {
			Login_submit();
		}
	});
});

function DisableElement(test) {
	if (test) {
		if ($(`#login_submit`).hasClass("btn-disabled")) return false;
		else $(`#login_submit`).addClass("btn-disabled");
		return true;
	} else {
		if ($(`#login_submit`).hasClass("btn-disabled")) $(`#login_submit`).removeClass("btn-disabled");
		return true;
	}
}

var userId;
var academyId;

function Login_submit() {
	try {
		if (!DisableElement(true)) return false;
		if (!$("#login_error").hasClass("visually-hidden")) $("#login_error").addClass("visually-hidden");
	
		var formData = new FormData();
		formData.append("username", $("#login_username").val());
		formData.append("password", $("#login_password").val());
		$.ajax({
			type: "POST",
			url: "../../User/Login",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
	
			success: function (result) {
				if (result != "null") {
					var Datas = JSON.parse(result);
	
					sessionStorage.setItem("user", result);
	
					if (Datas.Id.length > 0 /* && Datas.Academy.Id.length > 0*/ ) window.location = "../Main/Index/";
	
					else {
						if ($("#login_error").hasClass("visually-hidden")) $("#login_error").removeClass("visually-hidden");
						DisableElement(false);
					}
				} else {
					if ($("#login_error").hasClass("visually-hidden")) $("#login_error").removeClass("visually-hidden");
					DisableElement(false);
				}
			},
	
			error: function (xhr, status, error) {
				alert(xhr.responseText);
				// loading(false);
				DisableElement(false);
			}
		});
	} catch(err) {
        _alert("Erreur", 'Erreur: ' + errorManager(err));
    }
}