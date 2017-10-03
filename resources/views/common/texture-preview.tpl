<div class="box-header with-border">
    <h3 class="box-title" style="width: 100%;">{{ trans('general.texture-preview') }}
        <span id="textures-indicator" data-toggle="tooltip" title="" class="badge bg-light-blue"></span>
        <div class="operations">
            <i data-toggle="tooltip" data-placement="bottom" title="{{ trans('general.walk') }}" class="fa fa-pause"></i>
            <i data-toggle="tooltip" data-placement="bottom" title="{{ trans('general.run') }}" class="fa fa-forward"></i>
            <i data-toggle="tooltip" data-placement="bottom" title="{{ trans('general.rotation') }}" class="fa fa-repeat"></i>
        </div>
    </h3>
</div><!-- /.box-header -->
<div class="box-body">
    <!-- Container for 3D skin preview -->
    <div id="skinpreview">
        @if (isset($enable_2d_preview) && $enable_2d_preview)
        <div id="preview-2d">
            <p>{{ trans('user.player.textures.steve') }}<a href=""><img id="steve" class="skin2d" /></a>
                <span class="skin2d">{{ trans('user.player.textures.empty') }}</span>
            </p>

            <p>{{ trans('user.player.textures.alex') }}<a href=""><img id="alex" class="skin2d" /></a>
                <span class="skin2d">{{ trans('user.player.textures.empty') }}</span>
            </p>

            <p>{{ trans('user.player.textures.cape') }}<a href=""><img id="cape" class="skin2d" /></a>
                <span class="skin2d">{{ trans('user.player.textures.empty') }}</span>
            </p>
        </div>
        @endif
    </div>
</div><!-- /.box-body -->

<!-- Load dependencies for 3D skin preview -->
<script type="text/javascript" src="{{ assets('js/three.min.js') }}"></script>
<script type="text/javascript" src="{{ assets('js/skinview3d.babel.js') }}"></script>

{{-- <script>
    var dskin = "data:image/png;base64,{{ App\Http\Controllers\TextureController::getDefaultSkin() }}";
    // MSP.changeSkin(dskin);

    TexturePreview.init3dPreview;
    MSP.skinUrl = dskin;

    console.log('[3D Preview] Default skin rendered.');
</script> --}}
