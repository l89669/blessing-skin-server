/* global current_skin:true */

'use strict';

$('#layout-skins-list [data-skin]').click(function (e) {
    e.preventDefault();
    let skin_name = $(this).data('skin');
    $('body').removeClass(current_skin).addClass(skin_name);
    current_skin = skin_name;
});

async function submitColor() {
    try {
        const { errno, msg } = await fetch({
            type: 'POST',
            url: url('admin/customize?action=color'),
            dataType: 'json',
            data: { color_scheme: current_skin }
        });
        errno == 0 ? toastr.success(msg) : toastr.warning(msg);
    } catch (error) {
        showAjaxError(error);
    }
}

$('#color-submit').click(submitColor);

if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    module.exports = submitColor;
}
