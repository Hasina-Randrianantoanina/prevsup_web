function _alert(titre, message) {
    $.alert({
        icon: 'fa fa-warning',
        title: titre,
        content: message
    });

}


function newUser()
{
    try {
        loading(true);
        $('#nu_nom').text('');

        var formData = new FormData();

        $.ajax({
            type: "POST",
            url: "../ListAcademy",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                var Datas = JSON.parse(result);
                $("#nu_academy").empty();
                var code = '';
                $.each(Datas, (k, v) => {
                    code += `
                    <option value="${v.Id}">${v.Name}</option>
                `;
                });
                $("#nu_academy").append(code);
                $(".dual-listbox.nu_academy").remove();

                var dlb1 = new DualListbox(`#nu_academy`, {
                    availableTitle: '',
                    selectedTitle: '',
                    addButtonText: '<i class="fa fa-chevron-right"></i>',
                    removeButtonText: '<i class="fa fa-chevron-left"></i>',
                    addAllButtonText: '<i class="fa fa-angle-double-right"></i>',
                    removeAllButtonText: '<i class="fas fa-angle-double-left"></i>',
                    searchPlaceholder: 'Rechercher...'
                });


                loading(false);
            },

            error: function (xhr, e) {
                _alert("Erreur", 'Erreur : (User) ' + errorManager(xhr.responseText));
                loading(false);
            }
        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (User) ' + errorManager(err) + ' ' + err);
        loading(false);
    }
}
$('#nu_login').keypress(function (e) {
    var txt = String.fromCharCode(e.which);
    if (!txt.match(/[a-zA-Z0-9_-]/)) {
        return false;
    }


});
function loadUser() {
    try {
        loading(true);

        var formData = new FormData();
        formData.append("userId", User.Id);
        formData.append("academyId", User.Academy.Id);

        $.ajax({
            type: "POST",
            url: "../../User/ListUsers",
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
                loading(false);
            },

            error: function (xhr, e) {
                _alert("Erreur", 'Erreur : (User) ' + errorManager(xhr.responseText));
                loading(false);
            }
        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (User) ' + errorManager(err) + ' ' + err);
        loading(false);
    }
}

function new_user(e) {
    try {
        var login = $(`#nu_login`).val().trim();
        var nom = $(`#nu_nom`).val().trim();
        var password = $(`#nu_password`).val().trim();
        var password2 = $(`#nu_password2`).val().trim();
        var academy = $(`#nu_academy`).val();
        var profile = $(`#nu_profile`).val();
        var aca = new Array();
        $(`.dual-listbox.nu_academy .dual-listbox__selected`).find("li").each((k, v) => {
            aca.push(v.getAttribute("data-id"));
        });
        var academies = aca.join();

        if (login.length == 0) {
            _alert('Création utilisateur', 'Le login est obligatoire.');
            return;
        }
        if (nom.length == 0) {
            _alert('Création utilisateur', 'Le nom est obligatoire.');
            return;
        }
        if (password.length == 0) {
            _alert('Création utilisateur', 'Le mot de passe est obligatoire.');
            return;
        }
        if (password != password2) {
            _alert('Création utilisateur', 'Le mot de passe de confirmation n\'est pas identique.');
            return;
        }
        if (aca.length == 0) {
            _alert('Création utilisateur', 'Sélectionner au moins une académie.');
            return;
        }
        loading(true);

        var formData = new FormData();
        formData.append("login", login);
        formData.append("nom", nom);
        formData.append("password", password), $(`nu_pass`).val();
        // formData.append("academy", academy);
        formData.append("profile", profile);
        formData.append("academies", academies);
        $('#newUser').modal('hide');
        $.ajax({
            type: "POST",
            url: "../../User/CreateUser",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                loading(false);
                var data = JSON.parse(result);
                if (data.hasOwnProperty('message')) {
                    _alert('Création utilisateur', data.message);
                }
                if (data.hasOwnProperty('error')) {
                    _alert('Création utilisateur', data.msg);
                } else {
                    var usr = data.user;
                    Utilisateurs[usr.Id] = usr;
                    $('#ou_list').append(`<option value="${usr.Id}">${usr.Name}</option>`);
                    $('#ou_list_delete').append(`<option value="${usr.Id}">${usr.Name}</option>`);
                    sortlist('ou_list');
                    sortlist('ou_list_delete');
                }
            },
            error: function (xhr, e) {
                _alert("Erreur", 'Erreur : (User) ' + errorManager(xhr.responseText));
                loading(false);
            }
        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (User) ' + errorManager(err) + ' ' + err);
        loading(false);
    }
}

var edit_user;


function open_delete_user() {

    try {

        // TODO: confirmation dialog
        
        let delete_user = Utilisateurs[$('#ou_list_delete').val()];
    	var conf = confirm("Voulez-vous vraiment supprimer " + delete_user.Login + " ?");
        if(conf) {
            loading(true);
            let formData = new FormData();
            formData.append("id", delete_user.Id);
            
            $.ajax({
                type: "POST",
                url: "../../User/DeleteUser",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                async: true,
                success: function(result) {
                    loading(false);
                    $.alert({
                        icon: 'fa fa-warning',
                        title: 'Suppression utilisateur',
                        content: 'Utilisateur supprimé !',
                    });
                    location.reload();
                },
                error: function(xhr, e) {
                    _alert("Erreur", 'Erreur : (User) ' + errorManager(xhr.responseText));
                }
            });
        }

    } catch(err) {
        _alert("Erreur", 'Erreur : (Suppression utilisateur) ' + errorManager(err) + ' ' + err);
        return true;
    }
}

function open_update_user(e) {
    $('#updateUser').modal('show');
    edit_user = Utilisateurs[$('#ou_list').val()];
    $('#uu_login').val(edit_user.Login);
    $('#uu_nom').val(edit_user.Name);
    $('#uu_password').val(edit_user.Password);
    $(".dual-listbox.uu_academies").remove();
    $("#uu_academies").empty();
    uacas = edit_user.Academies;
    user_academies = uacas && uacas.length > 0 ? edit_user.Academies.split(',') : [];
    var code = ''; $.each(Academies, (k, v) => {
        var selected = user_academies.includes(v.Id) ? 'selected' : '';
        code += `<option value="${v.Id}" ${selected}>${v.Name}</option>`;
    });
    $("#uu_academies").append(code);

    var dlb1 = new DualListbox(`#uu_academies`, {
        availableTitle: '',
        selectedTitle: '',
        addButtonText: '<i class="fa fa-chevron-right"></i>',
        removeButtonText: '<i class="fa fa-chevron-left"></i>',
        addAllButtonText: '<i class="fa fa-angle-double-right"></i>',
        removeAllButtonText: '<i class="fas fa-angle-double-left"></i>',
        searchPlaceholder: 'Rechercher...'
    });
    setTimeout(() => { $('.dual-listbox.uu_academies .dual-listbox__item').show(); }, 1000);
}

function sortlist(id) {
    var sel = $('#'+id);
    var selected = sel.val();
    var opts_list = sel.find('option');
    opts_list.sort(function (a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
    sel.html('').append(opts_list);
    sel.val(selected);
}

function update_user(form) {
    try {
        var formData = new FormData();
        var nom = $('#uu_nom').val().trim();
        var password = $('#uu_password').val().trim();
        var academies = $('#uu_academies').val().join(',');

        if (nom.length == 0) {
            _alert('Modification utilisateur', 'Le nom est obligatoire.');
            return false;
        }
        if (academies.length == 0) {
            _alert('Modification utilisateur', 'Sélectionner au moins une académie.');
            return false;
        }
        formData.append("login", edit_user.Login);
        formData.append("nom", nom);
        formData.append("password", password);
        formData.append("academies", academies);
        Utilisateurs[$('#ou_list').val()].Academies = academies;
        $.ajax({
            type: "POST",
            url: "../../User/UpdateUser",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                loading(false);
                $.alert({
                    icon: 'fa fa-warning',
                    title: 'Modification utilisateur',
                    content: 'Informations modifiées !',
                });
                $(form).modal('hide');
                window.location.reload();
            },
            error: function (xhr, e) {
                loading(false);
                _alert("Erreur", 'Erreur : (User) ' + errorManager(xhr.responseText));
            }
        });
        return true;
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (User) ' + errorManager(err));
        loading(false);
        return true;
    }
}

function update_user_pass() {
    try {
        var formData = new FormData();
        var old_password = $('#pu_old_password').val().trim();
        var new_password = $('#pu_new_password').val().trim();
        var new_password2 = $('#pu_new_password2').val().trim();

        if (old_password.length == 0) {
            _alert('Modification mot de passe', 'Ancien mot de passe obligatoire.');
            return;
        }

        if (old_password != User.Password) {
            _alert('Modification mot de passe', 'Ancien mot de passe incorrect.');
            return;
        }

        if (new_password.length == 0) {
            _alert('Modification mot de passe', 'Nouveau mot de passe obligatoire.');
            return;
        }

        if (new_password.length == 0) {
            _alert('Modification mot de passe', 'Mot de passe de confirmation obligatoire.');
            return;
        }

        if (new_password != new_password2) {
            _alert('Modification mot de passe', 'Les mots de passe ne sont pas identiques.');
            return;
        }

        formData.append("login", User.Login);
        formData.append("password", new_password);
        $.ajax({
            type: "POST",
            url: "../../User/UpdateUserPassword",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: true,

            success: function (result) {
                loading(false);
                User.Password = new_password;
                $.alert({
                    icon: 'fa fa-warning',
                    title: 'Modification mot de passe',
                    content: 'Mot de passe modifié !',
                });
                $('#changeUserPassword').modal('hide');
            },
            error: function (xhr, e) {
                loading(false);
                _alert("Erreur", 'Erreur : (User) ' + errorManager(xhr.responseText));
            }
        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (User) ' + errorManager(err));
        loading(false);
    }
}

function changeUserPassword() {
    $(`#pu_login`).val(User.Login);
}
