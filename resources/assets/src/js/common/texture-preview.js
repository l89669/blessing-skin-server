/* global MSP, skinview3d */

class TexturePreview {
    constructor(type, tid, preference) {
        this.tid               = tid;
        this.type              = type;
        this.selector          = $(`#${type}`);
        this.preference        = (type == 'steve') ? 'default' : 'slim';
        this.playerPreference  = preference;
    }

    change2dPreview() {
        this.selector
            .attr('src', url(`preview/200/${this.tid}.png`))
            .show()
            .parent().attr('href', url(`skinlib/show/${this.tid}`))
            .next().hide();

        return this;
    }

    change3dPreview() {
        if (this.playerPreference == this.preference || this.type == 'cape') {
            fetch({
                type: 'GET',
                url: url(`skinlib/info/${this.tid}`),
                dataType: 'json'
            }).then(({ hash }) => {
                let textureUrl = url(`textures/${hash}`);

                if (this.type == 'cape') {
                    MSP.changeCape(textureUrl);
                } else {
                    MSP.changeSkin(textureUrl);
                }
            }).catch(showAjaxError);
        }

        return this;
    }

    showNotUploaded() {
        this.selector.hide().parent().next().show();

        // clear 3D preview of cape
        if (this.type == 'cape') {
            MSP.changeCape('');
        }

        return this;
    }
}

TexturePreview.previewType = '3D';

TexturePreview.skinViewer = null;

TexturePreview.defaultSkinUrl = url('resources/assets/dist/images/steve.png');

TexturePreview.init3dPreview = (slim = false) => {
    if (TexturePreview.previewType == '2D')
        return;

    $('#preview-2d').hide();

    if (TexturePreview.skinViewer === null) {
        console.log('[3D Preview] Trying to init preview');

        let skinViewer = new skinview3d.SkinViewer({
            domElement: document.getElementById('skinpreview'),
            slim: slim,
            width: $('#skinpreview').width(),
            height: 350,
            skinUrl: TexturePreview.defaultSkinUrl,
            animation: skinview3d.WalkAnimation
        });

        TexturePreview.skinViewer = skinViewer;

        console.log('[3D Preview] Preview initialized');
    }
};

TexturePreview.resize3dPreview = () => {
    TexturePreview.init3dPreview();

    let size = {
        width: $('#skinpreview').width(),
        height: 350
    };

    TexturePreview.skinViewer.width = size.width;
	TexturePreview.skinViewer.height = size.height;

    console.log('[3D Preview] Canvas resized', size);
};

TexturePreview.changeSkin = url => {
    TexturePreview.skinViewer.skinUrl = url;
};

TexturePreview.changeCape = url => {
    TexturePreview.skinViewer.capeUrl = url;
};

TexturePreview.changeModel = (model = 'steve') => {
    let currentModel = TexturePreview.skinViewer.slim ? 'alex' : 'steve';

    if (model !== currentModel) {
        // init 3d preview with new model
        TexturePreview.destorySkinViewer();
        TexturePreview.init3dPreview(model === 'alex');

        console.log('[3D Preview] Preview re-rendered with model', model);
    }
};

TexturePreview.destorySkinViewer = () => {
    TexturePreview.skinViewer.dispose();
    TexturePreview.skinViewer = null;
};

TexturePreview.show3dPreview = () => {
    TexturePreview.previewType = '3D';

    TexturePreview.init3dPreview();
    $('#preview-2d').hide();
    $('.operations').show();
    $('#preview-switch').html(trans('user.switch2dPreview'));
};

TexturePreview.show2dPreview = () => {
    TexturePreview.previewType = '2D';

    $('#canvas3d').remove();
    $('.operations').hide();
    $('#preview-2d').show();
    $('#preview-switch').html(trans('user.switch3dPreview')).attr('onclick', 'show3dPreview();');
};

// change 3D preview status
$('.fa-pause').click(function () {
    MSP.setStatus('rotation',  ! MSP.getStatus('rotation'));
    MSP.setStatus('movements', ! MSP.getStatus('movements'));

    $(this).toggleClass('fa-pause').toggleClass('fa-play');
});

$('.fa-forward').click(() => MSP.setStatus('running',  ! MSP.getStatus('running')));
$('.fa-repeat' ).click(() => MSP.setStatus('rotation', ! MSP.getStatus('rotation')));

if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    module.exports = TexturePreview;
}
