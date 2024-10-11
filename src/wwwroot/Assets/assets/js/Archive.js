function CreateInterfaceArchive(id, name, type) {
    try {
        loading(true);
        var formData = new FormData();
        formData.append("id", id);
        formData.append("name", name);
        formData.append("type", type);
        formData.append("user", User.Id);
        formData.append("academy", User.Academy.Id);
        $.ajax({
            type: "POST",
            url: "../../Archive/GetInterfaceArchive",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,

            success: function (result) {
                loading(false);
                $(`#` + id).html(result);
            },

            error: function (x, e) {
                alert("Erreur lors du chargement de l'interface archive");
                loading(false);
            }
        }).done(() => {
            loading(false);
        });
        return `<div id="` + id + `" class="archive"></div>`
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (Archive) ' + errorManager(err));
        return null;
    }

}

function archiver(e) {
    try {
        var arch = $(e).closest('.archive');
        var type = $(e).closest('table').attr('type');

        var selectedOpts = arch.find('select.list1 option:selected');
        if (selectedOpts.length == 0) {
            alert("Aucun élément sélectionné.");
            return false;
        }

        arch.find('select.list2').append($(selectedOpts).clone());
        $(selectedOpts).remove();
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (Archive) ' + errorManager(err));
    }

}

function Conf_archive(e) {
    try {
        var type = $(e).closest('table').attr("data-type");
        var arch = $(e).closest('.archive');
        var listArchive = arch.find('select.list1 option');
        var listDesarchive = arch.find('select.list2 option');

        var archiveList = [];

        listArchive.each((k, v) => {

            var archiveItem = {};
            archiveItem.Id = v.value;
            archiveItem.Is_archive = false;
            archiveList.push(archiveItem);
        });
        listDesarchive.each((k, v) => {

            var archiveItem = {};
            archiveItem.Id = v.value;
            archiveItem.Is_archive = true;
            archiveList.push(archiveItem);
        });

        loading(true);
        var formData = new FormData();
        formData.append("ListArchive", JSON.stringify(archiveList));
        formData.append("type", type);
        $.ajax({
            type: "POST",
            url: "../../Archive/ArchiveSave",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,

            success: function (result) {
                loading(false);
                $.alert("Enregistrement effectué.")
            },

            error: function (x, e) {
                _alert("Erreur", 'Erreur : (Archive) ' + errorManager(e));
                loading(false);
            }
        }).done(() => {
            loading(false);
            if (type == "Constat") loadCons();
            else if (type == "Scenario") loadSCen();
        });
    }
    catch (err) {
        _alert("Erreur", 'Erreur : (Archive) ' + errorManager(err));
    }
}

function desarchiver(e) {
    var arch = $(e).closest('.archive');
    var type = $(e).closest('table').attr('type');
    var selectedOpts = arch.find('select.list2 option:selected');
    if (selectedOpts.length == 0) {
        alert("Aucun élément sélectionné.");
    }
    arch.find('select.list1').append($(selectedOpts).clone());
    $(selectedOpts).remove();
}

/*$(document).ready(function () {
	$('.btnRight').on('click', function (e) {
		alert('right');
        var arch = $(this).closest('.archive')
        var selectedOpts = arch.find('select.list1 option:selected');
        if (selectedOpts.length == 0) {
            alert("Aucun élément sélectionné.");
            e.preventDefault();
        }

        arch.find('select.list2').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });

    $('.btnLeft').on('click', function (e) {
        var arch = $(this).closest('.archive')
        var selectedOpts = arch.find('select.list2 option:selected');
        if (selectedOpts.length == 0) {
            alert("Aucun élément sélectionné.");
            e.preventDefault();
        }

        arch.find('select.list1').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });
});*/
