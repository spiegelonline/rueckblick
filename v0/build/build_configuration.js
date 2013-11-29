({
    baseUrl: '../dev/js',
    mainConfigFile: '../dev/js/main.js',
    name: 'main',
    out: '../dev/js/main-concatenated.js',
    exclude: [
        'jquery', 'tweenmax'
    ],
    optimize: 'none',
	//optimize: "uglify",
    perserveLicenceComments: false
})
