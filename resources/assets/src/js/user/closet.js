/* global MSP */

'use strict';

var selectedTextures = [];

$(document).ready(async function () {
    if (! window.location.pathname.includes('/user/closet'))
        return;

    $('input[name=q]').on('input', debounce(() => {
        let category = $('#skin-category').hasClass('active') ? 'skin' : 'cape';
        reloadCloset(category, 1, $('input[name=q]').val());
    }, 350));

    try {
        const { items, category, total_pages } = await fetch({
            type: 'GET',
            url: url('/user/closet-data'),
            dataType: 'json'
        });

        renderCloset(items, category);
        
        $('#closet-paginator').jqPaginator($.extend({}, $.defaultPaginatorConfig, {
            totalPages: total_pages,
            onPageChange: page => reloadCloset(
                $('#skin-category').hasClass('active') ? 'skin' : 'cape',
                page, $('input[name=q]').val()
            )
        }));
    } catch (error) {
        showAjaxError(error);
    }
});

$('body').on('click', '.item-body', async function () {
    $('.item-selected').parent().removeClass('item-selected');
    let $item = $(this).parent();

    $item.addClass('item-selected');

    let tid = parseInt($item.attr('tid'));

    try {
        const { type, hash } = await fetch({
            type: 'POST',
            url: url(`skinlib/info/${tid}`),
            dataType: 'json'
        });

        if (type == 'cape') {
            MSP.changeCape(url(`textures/${hash}`));
            selectedTextures['cape'] = tid;
        } else {
            MSP.changeSkin(url(`textures/${hash}`));
            selectedTextures['skin'] = tid;
        }

        let skin = selectedTextures['skin'],
            cape = selectedTextures['cape'];

        let $indicator = $('#textures-indicator');

        if (skin !== undefined && cape !== undefined) {
            $indicator.text(`${trans('general.skin')} & ${trans('general.cape')}`);
        } else if (skin != undefined) {
            $indicator.text(trans('general.skin'));
        } else if (cape != undefined) {
            $indicator.text(trans('general.cape'));
        }
    } catch (error) {
        showAjaxError(error);
    }
});

$('body').on('click', '.category-switch', () => {
    let category = $('a[href="#skin-category"]').parent().hasClass('active') ? 'cape' : 'skin';
    let search = $('input[name=q]').val();
    let page = parseInt($('#closet-paginator').attr(`last-${category}-page`));

    reloadCloset(category, page, search);
});

function renderClosetItemComponent(item) {
    return `
    <div class="item" tid="${item.tid}" data-texture-type="${item.type}">
    <div class="item-body">
        <img src="${url('/')}preview/${item.tid}.png">
    </div>
    <div class="item-footer">
        <p class="texture-name">
            <span title="${item.name}">${item.name} <small>(${item.type})</small></span>
        </p>

        <a href="${url('/')}skinlib/show/${item.tid}" title="${trans('user.viewInSkinlib')}" class="more" data-toggle="tooltip" data-placement="bottom"><i class="fa fa-share"></i></a>
        <span title="${trans('general.more')}" class="more" data-toggle="dropdown" aria-haspopup="true" id="more-button"><i class="fa fa-cog"></i></span>

        <ul class="dropup dropdown-menu" aria-labelledby="more-button">
            <li><a href="javascript:renameClosetItem(${item.tid}, '${item.name}');">${trans('user.renameItem')}</a></li>
            <li><a href="javascript:removeFromCloset(${item.tid});">${trans('user.removeItem')}</a></li>
            <li><a href="javascript:setAsAvatar(${item.tid});">${trans('user.setAsAvatar')}</a></li>
        </ul>
    </div>
</div>`;
}

/**
 * Render closet with giving items & category.
 *
 * @param {array} items
 * @param {string} category
 */
function renderCloset(items, category) {
    let search = $('input[name=q]').val();
    let container = $(`#${category}-category`).html('');

    if (items.length === 0) {
        $('#closet-paginator').hide();

        if (search === '') {
            container.html('<div class="empty-msg">' +
                trans('user.emptyClosetMsg', { url: url(`skinlib?filter=${category}`) }) +
            '</div>');
        } else {
            container.html(`<div class="empty-msg">${trans('general.noResult')}</div>`);
        }

    } else {
        $('#closet-paginator').show();

        for (let item of items) {
            container.append(renderClosetItemComponent(item));
        }
    }
}

/**
 * Reload and render closet.
 *
 * @param {string} category
 * @param {number} page
 * @param {string} search
 */
async function reloadCloset(textureCategory, page, search) {
    try {
        const { items, category, total_pages } = await fetch({
            type: 'GET',
            url: url('user/closet-data'),
            dataType: 'json',
            data: {
                category: textureCategory,
                page: page,
                perPage: getCapacityOfCloset(),
                q: search
            }
        });

        renderCloset(items, category);
        
        let paginator = $('#closet-paginator');
        
        paginator.attr(`last-${category}-page`, page);
        paginator.jqPaginator('option', {
            currentPage: page,
            totalPages: total_pages
        });
    } catch (error) {
        showAjaxError(error);
    }
}

/**
 * Get the capacity of closet.
 *
 * @returns {number}
 */
function getCapacityOfCloset() {
    return ~~(
        $('#skin-category').width() /
        ($('.item').width() + parseFloat($('.item').css('margin-right')))
    ) * 2;
}

async function renameClosetItem(tid, oldName) {
    let newTextureName = '';

    try {
        newTextureName = await swal({
            title: trans('user.renameClosetItem'),
            input: 'text',
            inputValue: oldName,
            showCancelButton: true,
            inputValidator: value => (new Promise((resolve, reject) => {
                value ? resolve() : reject(trans('skinlib.emptyNewTextureName'));
            }))
        });
    } catch (error) {
        return;
    }

    try {
        const { errno, msg } = await fetch({
            type: 'POST',
            url: url('user/closet/rename'),
            dataType: 'json',
            data: { tid: tid, new_name: newTextureName }
        });

        if (errno == 0) {
            const type = $(`[tid=${tid}]`).data('texture-type');
            $(`[tid=${tid}]>.item-footer>.texture-name>span`).html(
                newTextureName +
                ` <small>(${type})</small>`
            );
            toastr.success(msg);
        } else {
            toastr.warning(msg);
        }
    } catch (error) {
        showAjaxError(error);
    }
}

async function removeFromCloset(tid) {
    try {
        await swal({
            text: trans('user.removeFromClosetNotice'),
            type: 'warning',
            showCancelButton: true
        });
    } catch (error) {
        return;
    }

    try {
        const { errno, msg } = await fetch({
            type: 'POST',
            url: url('user/closet/remove'),
            dataType: 'json',
            data: { tid: tid }
        });

        if (errno == 0) {
            swal({ type: 'success', html: msg });

            $(`div[tid=${tid}]`).remove();

            ['skin', 'cape'].forEach(type => {
                let container = $(`#${type}-category`);

                if ($.trim(container.html()) == '') {
                    let msg = trans('user.emptyClosetMsg', { url: url(`skinlib?filter=${type}`) });
                    container.html(`<div class="empty-msg">${msg}</div>`);
                }
            });
        } else {
            toastr.warning(msg);
        }
    } catch (error) {
        showAjaxError(error);
    }
}

async function setAsAvatar(tid) {
    try {
        await swal({
            title: trans('user.setAvatar'),
            text: trans('user.setAvatarNotice'),
            type: 'question',
            showCancelButton: true
        });
    } catch (error) {
        return;
    }

    try {
        const { errno, msg } = await fetch({
            type: 'POST',
            url: url('user/profile/avatar'),
            dataType: 'json',
            data: { tid: tid }
        });

        if (errno == 0) {
            toastr.success(msg);

            // Refersh avatars
            $('[alt="User Image"]').each(function () {
                $(this).prop('src', $(this).attr('src') + '?' + new Date().getTime());
            });
        } else {
            toastr.warning(msg);
        }
    } catch (error) {
        showAjaxError(error);
    }
}

if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    module.exports = {
        setAsAvatar,
        renderCloset,
        reloadCloset,
        getCapacityOfCloset,
        renameClosetItem,
        removeFromCloset,
    };
}
