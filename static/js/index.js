window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
var ABLATION_CONFIGS = {
  'vjepa-best': {
    nds: '0.431',
    latency: '~230 ms',
    mave: 'TODO',
    percent: 83.5,
    caption: '83.5% of the BEVFormer reference NDS at 43% of its latency.',
    tagline: 'Best V-JEPA configuration after adapter, resolution, and BEV temporal attention improvements.'
  },
  'dino-best': {
    nds: '0.466',
    latency: '~230 ms',
    mave: '0.461',
    percent: 90.1,
    caption: '90.1% of the BEVFormer reference NDS at 43% of its latency.',
    tagline: 'Best frozen-backbone configuration, showing the value of stronger spatial features.'
  },
  'dino-no-temporal': {
    nds: '0.286',
    latency: '~230 ms',
    mave: '1.109',
    percent: 55.3,
    caption: 'A 0.180 NDS drop versus DINOv3 with BEV temporal attention.',
    tagline: 'Single-frame BEV projection fails badly on dynamic attributes, especially velocity.'
  },
  'multitask-det-track-ego': {
    nds: '0.405',
    latency: '~230 ms',
    mave: 'TODO',
    percent: 78.3,
    caption: 'Only 0.026 NDS below V-JEPA detection-only while adding motion heads.',
    tagline: 'Tracking and ego-trajectory gradients are comparatively aligned with detection.'
  },
  'multitask-seg': {
    nds: '0.360',
    latency: '~230 ms',
    mave: 'TODO',
    percent: 69.6,
    caption: '0.071 NDS below V-JEPA detection-only, exposing detection-segmentation conflict.',
    tagline: 'Map segmentation favours semantic boundaries, while detection favours geometric localisation.'
  }
};

var BEV_MAP_CONFIGS = {
  dino: {
    modelImage: './static/images/bevmap_dino_compare.png',
    modelAlt: 'DINOv3 BEV map qualitative output.',
    modelCaption: '<strong>DINOv3.</strong> BEV map prediction with spatially pretrained frozen features.',
    bevformerImage: './static/images/bevmap_bevformer_dino_compare.png',
    bevformerCaption: '<strong>BEVFormer.</strong> Baseline BEV map prediction on the same DINOv3 comparison scene.'
  },
  vjepa: {
    modelImage: './static/images/bevmap_vjepa_compare.jpeg',
    modelAlt: 'V-JEPA BEV map qualitative output.',
    modelCaption: '<strong>V-JEPA.</strong> BEV map prediction with video-pretrained frozen features.',
    bevformerImage: './static/images/bevmap_bevformer_vjepa_compare.jpeg',
    bevformerCaption: '<strong>BEVFormer.</strong> Baseline BEV map prediction on the same V-JEPA comparison scene.'
  }
};

function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setAblationConfig(key) {
  var config = ABLATION_CONFIGS[key];
  if (!config) return;

  $('#ablation-nds').text(config.nds);
  $('#ablation-latency').text(config.latency);
  $('#ablation-mave').text(config.mave);
  $('#ablation-tagline').text(config.tagline);
  $('#ablation-progress').val(config.percent).text(config.percent + '%');
  $('#ablation-progress-caption').text(config.caption);
}

function setMultitaskView(view) {
  var panes = $('.multitask-pane');
  panes.removeClass('is-hidden-view is-full');

  if (view === 'detection' || view === 'segmentation') {
    panes.addClass('is-hidden-view');
    $('.multitask-pane[data-pane="' + view + '"]').removeClass('is-hidden-view').addClass('is-full');
  }
}

function setVideoView(view) {
  $('.video-pane').addClass('is-hidden-view');
  $('.video-pane[data-video-pane="' + view + '"]').removeClass('is-hidden-view');

  $('.toggle-video').each(function() {
    this.pause();
  });
}

function setupVideoSlider(slider) {
  var video = document.getElementById($(slider).data('video-target'));
  if (!video) return;

  function syncSliderBounds() {
    if (!video.duration) return;
    slider.max = video.duration;
    slider.step = 1 / 30;
  }

  function seekToSlider() {
    video.pause();
    video.currentTime = Number(slider.value);
  }

  $(slider).on('input', function() {
    seekToSlider();
  });

  $(slider).on('change', function() {
    seekToSlider();
  });

  video.addEventListener('timeupdate', function() {
    if (!video.duration || document.activeElement === slider) return;
    slider.value = video.currentTime;
  });

  video.addEventListener('loadedmetadata', syncSliderBounds);
  syncSliderBounds();
}

function setBevMapComparison(key) {
  var config = BEV_MAP_CONFIGS[key];
  if (!config) return;

  $('#bev-map-model-image').attr('src', config.modelImage).attr('alt', config.modelAlt);
  $('#bev-map-model-caption').html(config.modelCaption);
  $('#bev-map-bevformer-image').attr('src', config.bevformerImage);
  $('#bev-map-bevformer-caption').html(config.bevformerCaption);
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    $('.ablation-button').on('click', function() {
      $('.ablation-button').removeClass('is-active is-dark');
      $(this).addClass('is-active is-dark');
      setAblationConfig($(this).data('config'));
    });

    $('.multitask-button').on('click', function() {
      $('.multitask-button').removeClass('is-active is-dark');
      $(this).addClass('is-active is-dark');
      setMultitaskView($(this).data('view'));
    });

    $('.video-frame-slider').each(function() {
      setupVideoSlider(this);
    });

    $('.video-toggle-button').on('click', function() {
      $('.video-toggle-button').removeClass('is-active is-dark');
      $(this).addClass('is-active is-dark');
      setVideoView($(this).data('video'));
    });

    $('.bev-map-button').on('click', function() {
      $('.bev-map-button').removeClass('is-active is-dark');
      $(this).addClass('is-active is-dark');
      setBevMapComparison($(this).data('map'));
    });

    bulmaSlider.attach();

})
