{
  "targets": [
    {
      "target_name": "metadata_utils",
      "sources": [ "cpp-src/metadata_utils.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "msvs_settings": {
        "VCCLCompilerTool": { "ExceptionHandling": 1 }
      },
      "conditions": [
        ["OS=='win'", {
          "defines": [ "_HAS_EXCEPTIONS=1" ]
        }]
      ]
    }
  ]
}
